from flask import Blueprint, request, jsonify, current_app
import uuid
from src.models.user import User, db
from src.models.document import Document
from src.models.document_share import DocumentShare
from src.routes.user import token_required
from sqlalchemy.exc import SQLAlchemyError

document_share_bp = Blueprint('document_share', __name__)

@document_share_bp.route('/documents/share', methods=['POST'])
@token_required
def share_document(current_user):
    """Share a document with another user"""
    try:
        data = request.get_json()
        
        if not data or not data.get('document_id') or not data.get('shared_with_email') or not data.get('permission_level'):
            return jsonify({'error': 'Missing required fields'}), 400
            
        document_id = data.get('document_id')
        shared_with_email = data.get('shared_with_email')
        permission_level = data.get('permission_level')
        
        # Validate permission level
        if permission_level not in ['view', 'edit', 'admin']:
            return jsonify({'error': 'Invalid permission level'}), 400
            
        # Get document
        document = Document.query.filter_by(id=document_id).first()
        if not document:
            return jsonify({'error': 'Document not found'}), 404
            
        # Check if user is the owner
        if document.user_id != current_user.id:
            return jsonify({'error': 'You do not have permission to share this document'}), 403
            
        # Get user to share with
        shared_with_user = User.query.filter_by(email=shared_with_email).first()
        if not shared_with_user:
            return jsonify({'error': 'User not found with email: ' + shared_with_email}), 404
            
        # Check if document is already shared with user
        existing_share = DocumentShare.query.filter_by(
            document_id=document.id,
            shared_with_id=shared_with_user.id
        ).first()
        
        if existing_share:
            # Update permission level
            existing_share.permission_level = permission_level
            db.session.commit()
            return jsonify({'message': 'Share updated successfully'}), 200
        
        # Create new share
        new_share = DocumentShare(
            document_id=document.id,
            owner_id=current_user.id,
            shared_with_id=shared_with_user.id,
            permission_level=permission_level
        )
        
        db.session.add(new_share)
        db.session.commit()
        
        # Create a dictionary representation of the share
        share_dict = {
            'id': new_share.id,
            'document_id': new_share.document_id,
            'owner_id': new_share.owner_id,
            'shared_with_id': new_share.shared_with_id,
            'permission_level': new_share.permission_level,
            'created_at': new_share.created_at.isoformat() if new_share.created_at else None
        }
        
        return jsonify({
            'message': 'Document shared successfully',
            'share': share_dict
        }), 201
        
    except SQLAlchemyError as e:
        db.session.rollback()
        current_app.logger.error(f"Database error: {str(e)}")
        return jsonify({'error': 'Database error occurred'}), 500
    except Exception as e:
        current_app.logger.error(f"Error sharing document: {str(e)}")
        return jsonify({'error': 'An error occurred while sharing the document'}), 500

@document_share_bp.route('/documents/shared-with-me', methods=['GET'])
@token_required
def get_shared_documents(current_user):
    """Get documents shared with the current user"""
    try:
        # Get all document shares where the current user is the recipient
        document_shares = DocumentShare.query.filter_by(shared_with_id=current_user.id).all()
        
        # Get the documents
        shared_documents = []
        for share in document_shares:
            document = Document.query.get(share.document_id)
            if document:
                doc_dict = document.to_dict()
                doc_dict['permission_level'] = share.permission_level
                doc_dict['owner'] = User.query.get(share.owner_id).username
                shared_documents.append(doc_dict)
        
        return jsonify({
            'shared_documents': shared_documents
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error getting shared documents: {str(e)}")
        return jsonify({'error': 'An error occurred while getting shared documents'}), 500

@document_share_bp.route('/documents/<document_id>/shares', methods=['GET'])
@token_required
def get_document_shares(current_user, document_id):
    """Get all shares for a specific document"""
    try:
        # Check if user owns the document
        from src.models.document import Document
        document = Document.query.filter_by(
            document_id=document_id, 
            user_id=current_user.id
        ).first()
        
        if not document:
            return jsonify({'error': 'Document not found or access denied'}), 404
        
        # Get all shares for this document
        shares = DocumentShare.query.filter_by(document_id=document_id).all()
        
        shares_list = [{
            'share_id': share.id,
            'shared_with_username': share.shared_with.username,
            'shared_with_email': share.shared_with.email,
            'permission_level': share.permission_level,
            'shared_at': share.shared_at.isoformat() if share.shared_at else None
        } for share in shares]
        
        return jsonify({'shares': shares_list}), 200
        
    except Exception as e:
        print(f"Error getting document shares: {e}")
        return jsonify({'error': 'Failed to get document shares'}), 500

@document_share_bp.route('/documents/shares/<int:share_id>', methods=['DELETE'])
@token_required
def delete_document_share(current_user, share_id):
    """Delete a document share"""
    try:
        # Get the share
        share = DocumentShare.query.get(share_id)
        
        if not share:
            return jsonify({'error': 'Share not found'}), 404
        
        # Check if user owns the document
        from src.models.document import Document
        document = Document.query.filter_by(
            document_id=share.document_id, 
            user_id=current_user.id
        ).first()
        
        if not document:
            return jsonify({'error': 'Access denied'}), 403
        
        # Delete the share
        db.session.delete(share)
        db.session.commit()
        
        return jsonify({'message': 'Share deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting document share: {e}")
        return jsonify({'error': 'Failed to delete share'}), 500