from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from .user import db

class DocumentShare(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    document_id = db.Column(db.Integer, db.ForeignKey('document.id'), nullable=False)
    owner_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    shared_with_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    permission_level = db.Column(db.String(20), nullable=False, default='view')  # view, edit, admin
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    document = db.relationship('Document', foreign_keys=[document_id])
    owner = db.relationship('User', foreign_keys=[owner_id])
    shared_with = db.relationship('User', foreign_keys=[shared_with_id])
    
    def __repr__(self):
        return f'<DocumentShare {self.document_id} shared with {self.shared_with_id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'document_id': self.document_id,
            'owner_id': self.owner_id,
            'shared_with_id': self.shared_with_id,
            'permission_level': self.permission_level,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }