from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from .user import db
from sqlalchemy.orm import relationship

class Document(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    document_id = db.Column(db.String(36), unique=True, nullable=False)  # UUID
    filename = db.Column(db.String(255), nullable=False)
    file_type = db.Column(db.String(10), nullable=False)  # pdf, docx, txt
    chunks_processed = db.Column(db.Integer, default=0)
    total_chunks = db.Column(db.Integer, default=0)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship
    user = db.relationship('User', backref=db.backref('documents', lazy=True))

    def __repr__(self):
        return f'<Document {self.filename}>'

    def to_dict(self):
        return {
            'id': self.id,
            'document_id': self.document_id,
            'filename': self.filename,
            'file_type': self.file_type,
            'chunks_processed': self.chunks_processed,
            'total_chunks': self.total_chunks,
            'user_id': self.user_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'is_shared': len(self.shared_with) > 0 if hasattr(self, 'shared_with') else False
        }
        
    def is_shared_with_user(self, user_id):
        """Check if document is shared with a specific user"""
        from .document_share import DocumentShare
        share = DocumentShare.query.filter_by(document_id=self.id, shared_with_id=user_id).first()
        return share is not None
    
    def get_user_permission(self, user_id):
        """Get permission level for a specific user"""
        # Owner has full access
        if self.user_id == user_id:
            return 'owner'
            
        from .document_share import DocumentShare
        share = DocumentShare.query.filter_by(document_id=self.id, shared_with_id=user_id).first()
        return share.permission_level if share else None

