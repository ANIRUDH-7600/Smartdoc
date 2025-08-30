from flask import Blueprint, request, jsonify
from datetime import datetime
import uuid
import jwt as pyjwt
from src.models.feedback import Feedback
from src.models.user import User, db
from src.routes.user import token_required

feedback_bp = Blueprint('feedback', __name__)

@feedback_bp.route('/feedback', methods=['POST'])
@token_required
def submit_feedback(current_user):
    """Submit feedback for an answer"""
    try:
        user_id = current_user.id
        
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No input data provided'}), 400
        
        # Validate required fields
        answer_id = data.get('answer_id')
        if not answer_id:
            return jsonify({'error': 'Answer ID is required'}), 400
        
        # Create feedback record
        feedback_id = str(uuid.uuid4())
        created_at = datetime.utcnow().isoformat()
        
        # Create new feedback object
        feedback = Feedback(
            feedback_id=feedback_id,
            user_id=user_id,
            answer_id=answer_id,
            rating=data.get('rating'),  # Can be None
            feedback_type=data.get('feedback_type'),  # 'helpful' or 'not_helpful'
            comment=data.get('comment'),  # Can be None
            created_at=created_at
        )
        
        # Store in database using SQLAlchemy
        db.session.add(feedback)
        db.session.commit()
        
        response = jsonify({
            'message': 'Feedback submitted successfully',
            'feedback_id': feedback_id
        })
        response.headers.add('Content-Type', 'application/json')
        return response, 201
    except Exception as e:
        db.session.rollback()
        print(f"Error in submit_feedback: {str(e)}")
        return jsonify({'error': f'Error submitting feedback: {str(e)}'}), 500

@feedback_bp.route('/feedback/stats', methods=['GET'])
@token_required
def get_feedback_stats(current_user):
    """Get feedback statistics for the current user"""
    try:
        user_id = current_user.id
        print(f"User ID from token: {user_id}")
        
        from sqlalchemy import func
        
        # Get overall stats using SQLAlchemy
        total_feedback = Feedback.query.filter_by(user_id=user_id).count()
        helpful_count = Feedback.query.filter_by(user_id=user_id, feedback_type='helpful').count()
        not_helpful_count = Feedback.query.filter_by(user_id=user_id, feedback_type='not_helpful').count()
        average_rating = db.session.query(func.avg(Feedback.rating)).filter(
            Feedback.user_id == user_id,
            Feedback.rating != None
        ).scalar()
        
        stats = {
            'total_feedback': total_feedback,
            'helpful_count': helpful_count,
            'not_helpful_count': not_helpful_count,
            'average_rating': float(average_rating) if average_rating else None
        }
        
        # Get recent feedback
        recent_feedback = Feedback.query.filter_by(user_id=user_id)\
            .order_by(Feedback.created_at.desc())\
            .limit(5).all()
        
        recent_feedback_list = [{
            'feedback_id': f.feedback_id,
            'answer_id': f.answer_id,
            'rating': f.rating,
            'feedback_type': f.feedback_type,
            'comment': f.comment,
            'created_at': f.created_at if isinstance(f.created_at, str) else (f.created_at.isoformat() if f.created_at else None)
        } for f in recent_feedback]
        
        result = {
            'stats': stats,
            'recent_feedback': recent_feedback_list
        }
        
        return jsonify(result), 200
        
    except Exception as e:
        print(f"Error in get_feedback_stats: {str(e)}")
        return jsonify({'error': f'Error fetching feedback stats: {str(e)}'}), 500

@feedback_bp.route('/feedback/<feedback_id>', methods=['DELETE'])
@token_required
def delete_feedback(current_user, feedback_id):
    """Delete a specific feedback entry"""
    try:
        user_id = current_user.id
        
        # Find the feedback entry
        feedback = Feedback.query.filter_by(feedback_id=feedback_id, user_id=user_id).first()
        
        if not feedback:
            return jsonify({'error': 'Feedback not found or access denied'}), 404
        
        # Delete the feedback
        db.session.delete(feedback)
        db.session.commit()
        
        return jsonify({'message': 'Feedback deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Error in delete_feedback: {str(e)}")
        return jsonify({'error': f'Error deleting feedback: {str(e)}'}), 500