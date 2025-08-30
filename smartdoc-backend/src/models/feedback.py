from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from src.models.user import db

class Feedback(db.Model):
    __tablename__ = 'feedback'
    
    feedback_id = db.Column(db.String(36), primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    answer_id = db.Column(db.String(36), nullable=False)
    rating = db.Column(db.Integer, nullable=True)
    feedback_type = db.Column(db.String(20), nullable=True)  # 'helpful' or 'not_helpful'
    comment = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.String(30), nullable=False)  # ISO format timestamp
    
    user = db.relationship('User', backref=db.backref('feedback', lazy=True))
    
    def __repr__(self):
        return f'<Feedback {self.feedback_id}>'