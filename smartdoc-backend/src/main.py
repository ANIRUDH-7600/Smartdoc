import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import os
import sys
from flask import Flask, jsonify, request
from flask_cors import CORS
import jwt as pyjwt
from datetime import timedelta
import datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from src.models.user import db, User
from src.models.document import Document
from src.models.feedback import Feedback
from src.models.document_share import DocumentShare
from src.routes.user import user_bp
from src.routes.document import document_bp

app = Flask(__name__)
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "AIzaSyAKvSnvTXGkR9-L6CFg4ArpjY4N32rRwdc")

# Enable CORS for all routes with additional options
CORS(app, resources={r"/api/*": {"origins": "*", "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"], "allow_headers": ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"]}})

# Add CORS preflight response for OPTIONS requests
@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = app.make_default_options_response()
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
        return response

app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(document_bp, url_prefix='/api')

# Register document preview blueprint
from src.routes.document_preview import document_preview_bp
app.register_blueprint(document_preview_bp, url_prefix='/api')

# Register feedback blueprint
from src.routes.feedback import feedback_bp
app.register_blueprint(feedback_bp, url_prefix='/api')

# Register document sharing blueprint
from src.routes.document_share import document_share_bp
app.register_blueprint(document_share_bp, url_prefix='/api')

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# Create database tables
with app.app_context():
    db.create_all()

# Add token verification endpoint
@app.route('/api/verify-token', methods=['GET', 'POST'])
def verify_token():
    try:
        secret = app.config['SECRET_KEY']
        token = None
        
        # GET: read token from Authorization header (Bearer ...)
        if request.method == 'GET':
            print(f"GET Request headers: {request.headers}")
            auth_header = request.headers.get('Authorization', '')
            print(f"Auth header: {auth_header}")
            
            if auth_header and auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
            if not token:
                token = request.cookies.get('access_token')
        else:  # POST
            print(f"POST Request body: {request.get_json()}")
            data = request.get_json() or {}
            token = data.get('token')
        
        if not token:
            return jsonify({'valid': False, 'error': 'No token provided'}), 401
            
        try:
            # Print token header for debugging
            header = token.split('.')[0]
            print(f"Auth debug: header alg= {header}")
            
            decoded = pyjwt.decode(token, secret, algorithms=['HS256'])
            user_id = decoded.get('user_id')
            
            # Ensure user exists
            user = User.query.get(user_id)
            if user_id and user:
                return jsonify({
                    'valid': True,
                    'user_id': user_id,
                    'user': user.to_dict()
                })
            return jsonify({'valid': False, 'error': 'User not found'}), 401
        except pyjwt.ExpiredSignatureError:
            return jsonify({'valid': False, 'error': 'Token has expired', 'expired': True}), 401
        except pyjwt.InvalidTokenError:
            return jsonify({'valid': False, 'error': 'Invalid token'}), 401
    except Exception as e:
        print(f"Verify token error: {str(e)}")
        return jsonify({'valid': False, 'error': str(e)}), 401

# Add refresh token endpoint
@app.route('/api/refresh-token', methods=['POST'])
def refresh_token():
    try:
        # Get the refresh token from request
        data = request.get_json()
        if not data or not data.get('refresh_token'):
            return jsonify({'error': 'Refresh token is required'}), 400
            
        refresh_token = data.get('refresh_token')
        secret = app.config['SECRET_KEY']
        
        # Decode the refresh token
        decoded = pyjwt.decode(refresh_token, secret, algorithms=['HS256'])
        user_id = decoded.get('user_id')
        
        # Ensure user exists
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 401
            
        # Create new access token
        new_access_token = pyjwt.encode(
            {
                'user_id': user.id,
                'username': user.username,
                'exp': datetime.datetime.utcnow() + timedelta(hours=1)
            },
            secret,
            algorithm='HS256'
        )
        
        return jsonify({'access_token': new_access_token}), 200
    except pyjwt.ExpiredSignatureError:
        return jsonify({'error': 'Refresh token has expired'}), 401
    except pyjwt.InvalidTokenError:
        return jsonify({'error': 'Invalid refresh token'}), 401
    except Exception as e:
        return jsonify({'error': str(e)}), 401

# Simple root endpoint to confirm backend is working
@app.route('/')
def root():
    return jsonify({
        'message': 'SmartDoc Backend API Server',
        'status': 'running',
        'api_base': '/api',
        'endpoints': {
            'auth': '/api/login, /api/signup, /api/verify-token',
            'documents': '/api/upload, /api/documents, /api/ask',
            'feedback': '/api/feedback',
            'sharing': '/api/documents/share'
        },
        'note': 'Frontend should run separately on http://localhost:5173'
    })

# Test endpoint to verify backend is working
@app.route('/api/test')
def test_api():
    return jsonify({
        'message': 'Backend API is working!',
        'timestamp': datetime.datetime.utcnow().isoformat(),
        'status': 'success'
    })

if __name__ == '__main__':
    print("🚀 SmartDoc Backend Server Starting...")
    print("📍 API Server: http://localhost:5000")
    print("🔗 API Base URL: http://localhost:5000/api")
    print("📝 Frontend should run separately on http://localhost:5173")
    print("🧪 Test endpoint: http://localhost:5000/api/test")
    print("=" * 50)
    app.run(host='0.0.0.0', port=5000, debug=True)
