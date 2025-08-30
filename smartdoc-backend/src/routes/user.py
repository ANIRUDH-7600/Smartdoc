from flask import Blueprint, request, jsonify, current_app, make_response
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
import re
from functools import wraps
from src.models.user import User, db

user_bp = Blueprint('user', __name__)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization', None)
        token = None
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            # Treat placeholder values as missing
            if token in (None, '', 'undefined', 'null'):
                token = None
        # Fallback to cookie
        if not token:
            token = request.cookies.get('access_token')
            if token in (None, '', 'undefined', 'null'):
                token = None
        if not token:
            return jsonify({'error': 'Authorization token is missing'}), 401
        
        try:
            # Basic sanity check for JWT format
            if token.count('.') != 2:
                print('Auth error: malformed token (segments != 3). Token preview:', str(token)[:20])
                return jsonify({'error': 'Invalid token'}), 401

            # Optional: inspect header for debugging
            try:
                header = jwt.get_unverified_header(token)
                print('Auth debug: header alg=', header.get('alg'))
            except Exception as _e:
                print('Auth debug: cannot read token header:', str(_e))

            payload = jwt.decode(
                token,
                current_app.config['SECRET_KEY'],
                algorithms=['HS256'],
                options={"require": ["exp"], "verify_exp": True},
                leeway=60
            )
            current_user = User.query.get(payload['user_id'])
            if not current_user:
                print('Auth error: user not found for user_id', payload.get('user_id'))
                return jsonify({'error': 'User not found'}), 401
        except jwt.ExpiredSignatureError:
            print('Auth error: token expired')
            return jsonify({'error': 'Token has expired', 'expired': True}), 401
        except jwt.InvalidTokenError:
            print('Auth error: invalid token. Preview:', str(token)[:30])
            return jsonify({'error': 'Invalid token'}), 401
        except Exception as e:
            print('Auth error:', str(e))
            return jsonify({'error': f'Token verification failed: {str(e)}'}), 401

        return f(current_user, *args, **kwargs)
    return decorated

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    """Validate password strength"""
    if len(password) < 8:
        return False, "Password must be at least 8 characters"
    if not re.search(r'[A-Z]', password):
        return False, "Password needs at least one uppercase letter"
    if not re.search(r'[a-z]', password):
        return False, "Password needs at least one lowercase letter"
    if not re.search(r'\d', password):
        return False, "Password needs at least one digit"
    return True, "Password is valid"

@user_bp.route('/signup', methods=['POST'])
def signup():
    """User registration endpoint"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Validate required fields
        required_fields = ['username', 'email', 'password']
        for field in required_fields:
            if field not in data or not data[field].strip():
                return jsonify({'error': f'{field} is required'}), 400
        
        username = data['username'].strip()
        email = data['email'].strip().lower()
        password = data['password']
        
        # Validate inputs
        if len(username) < 3 or len(username) > 50:
            return jsonify({'error': 'Username must be 3-50 characters'}), 400
        
        if not validate_email(email):
            return jsonify({'error': 'Invalid email format'}), 400
        
        is_valid, message = validate_password(password)
        if not is_valid:
            return jsonify({'error': message}), 400
        
        # Check for existing user
        if User.query.filter_by(username=username).first():
            return jsonify({'error': 'Username taken'}), 409
        
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'Email already registered'}), 409
        
        # Create user
        user = User(username=username, email=email)
        user.set_password(password)
        
        db.session.add(user)
        db.session.commit()
        
        # Generate tokens
        access_token = user.generate_token(expires_in=86400)  # 24 hours
        refresh_token = user.generate_refresh_token()
        
        return jsonify({
            'message': 'User created successfully',
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Registration failed: {str(e)}'}), 500

@user_bp.route('/login', methods=['POST'])
def login():
    """User login endpoint"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Validate required fields
        if 'username' not in data or 'password' not in data:
            return jsonify({'error': 'Username and password are required'}), 400
        
        username = data['username'].strip()
        password = data['password']
        
        if not username or not password:
            return jsonify({'error': 'Username and password cannot be empty'}), 400
        
        # Find user by username or email
        user = User.query.filter(
            (User.username == username) | (User.email == username.lower())
        ).first()
        
        if not user or not user.check_password(password):
            return jsonify({'error': 'Invalid username or password'}), 401
        
        if not user.is_active:
            return jsonify({'error': 'Account is deactivated'}), 401
        
        # Generate tokens
        access_token = user.generate_token(expires_in=86400)  # 24 hours
        refresh_token = user.generate_refresh_token()
        
        resp = make_response(jsonify({
            'message': 'Login successful',
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 200)
        # Set HttpOnly cookie to ease auth in static builds
        resp.set_cookie('access_token', access_token, httponly=True, samesite='Lax')
        return resp
        
    except Exception as e:
        return jsonify({'error': f'Login failed: {str(e)}'}), 500

@user_bp.route('/refresh-token', methods=['POST'])
def refresh_token():
    """Refresh access token using refresh token"""
    try:
        data = request.get_json()
        
        if not data or 'refresh_token' not in data:
            return jsonify({'error': 'Refresh token is required'}), 400
        
        refresh_token = data['refresh_token']
        
        try:
            # Verify refresh token
            payload = jwt.decode(
                refresh_token,
                current_app.config['SECRET_KEY'],
                algorithms=['HS256']
            )
            
            # Check if it's a refresh token
            if payload.get('type') != 'refresh':
                return jsonify({'error': 'Invalid token type'}), 401
            
            user = User.query.get(payload['user_id'])
            
            if not user or not user.is_active:
                return jsonify({'error': 'User not found or inactive'}), 401
            
            # Generate new access token
            new_access_token = user.generate_token(expires_in=86400)  # 24 hours
            
            return jsonify({
                'access_token': new_access_token,
                'message': 'Token refreshed successfully'
            }), 200
            
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Refresh token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid refresh token'}), 401
            
    except Exception as e:
        return jsonify({'error': f'Token refresh failed: {str(e)}'}), 500

@user_bp.route('/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    """Get current user profile"""
    return jsonify({
        'user': current_user.to_dict()
    }), 200

@user_bp.route('/profile', methods=['PUT'])
@token_required
def update_profile(current_user):
    """Update current user profile"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Update username if provided
        if 'username' in data:
            new_username = data['username'].strip()
            if len(new_username) < 3 or len(new_username) > 50:
                return jsonify({'error': 'Username must be between 3 and 50 characters'}), 400
            
            # Check if username is already taken by another user
            existing_user = User.query.filter(
                User.username == new_username,
                User.id != current_user.id
            ).first()
            
            if existing_user:
                return jsonify({'error': 'Username already exists'}), 409
            
            current_user.username = new_username
        
        # Update email if provided
        if 'email' in data:
            new_email = data['email'].strip().lower()
            if not validate_email(new_email):
                return jsonify({'error': 'Invalid email format'}), 400
            
            # Check if email is already taken by another user
            existing_user = User.query.filter(
                User.email == new_email,
                User.id != current_user.id
            ).first()
            
            if existing_user:
                return jsonify({'error': 'Email already registered'}), 409
            
            current_user.email = new_email
        
        db.session.commit()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'user': current_user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Profile update failed: {str(e)}'}), 500

@user_bp.route('/change-password', methods=['PUT'])
@token_required
def change_password(current_user):
    """Change user password"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Validate required fields
        required_fields = ['current_password', 'new_password']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'{field} is required'}), 400
        
        current_password = data['current_password']
        new_password = data['new_password']
        
        # Verify current password
        if not current_user.check_password(current_password):
            return jsonify({'error': 'Current password is incorrect'}), 401
        
        # Validate new password strength
        is_valid, message = validate_password(new_password)
        if not is_valid:
            return jsonify({'error': message}), 400
        
        # Check if new password is different from current password
        if current_user.check_password(new_password):
            return jsonify({'error': 'New password must be different from current password'}), 400
        
        # Update password
        current_user.set_password(new_password)
        db.session.commit()
        
        return jsonify({
            'message': 'Password changed successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Password change failed: {str(e)}'}), 500

@user_bp.route('/verify-token', methods=['POST'])
def verify_token():
    """Verify if a token is valid"""
    try:
        data = request.get_json()
        
        if not data or 'token' not in data:
            return jsonify({'error': 'Token is required'}), 400
        
        token = data['token']
        
        try:
            payload = jwt.decode(
                token,
                current_app.config['SECRET_KEY'],
                algorithms=['HS256']
            )
            user = User.query.get(payload['user_id'])
            
            if not user:
                return jsonify({'valid': False, 'error': 'User not found'}), 401
            
            return jsonify({
                'valid': True,
                'user': user.to_dict()
            }), 200
            
        except jwt.ExpiredSignatureError:
            return jsonify({'valid': False, 'error': 'Token has expired', 'expired': True}), 401
        except jwt.InvalidTokenError:
            return jsonify({'valid': False, 'error': 'Invalid token'}), 401
        
    except Exception as e:
        return jsonify({'valid': False, 'error': f'Token verification failed: {str(e)}'}), 500

@user_bp.route('/logout', methods=['POST'])
@token_required
def logout(current_user):
    """Logout user (client should discard tokens)"""
    return jsonify({
        'message': 'Logged out successfully'
    }), 200

