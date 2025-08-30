from flask import Blueprint, request, jsonify, send_file, Response
import os
import tempfile
import base64
import PyPDF2
from docx import Document as DocxDocument
import fitz  # PyMuPDF for PDF rendering
import io
from werkzeug.utils import secure_filename
from src.models.document import Document, db
from src.routes.user import token_required

document_preview_bp = Blueprint('document_preview', __name__)

@document_preview_bp.route('/documents/<document_id>/preview', methods=['GET'])
@token_required
def get_document_preview(current_user, document_id):
    """Get a preview of the document."""
    try:
        # Find the document in database
        document = Document.query.filter_by(document_id=document_id).first()
        
        if not document:
            return jsonify({'error': 'Document not found'}), 404
            
        # Check if user has access to the document
        if document.user_id != current_user.id:
            # Check if document is shared with the user
            from src.models.document_share import DocumentShare
            share = DocumentShare.query.filter_by(
                document_id=document.id,
                shared_with_id=current_user.id
            ).first()
            
            if not share:
                return jsonify({'error': 'Access denied'}), 403
        
        # Get document path from storage
        # In a production system, you would retrieve from cloud storage or a file system
        # For this example, we'll simulate by creating a temporary file with content
        
        # Get document content from ChromaDB
        # This is a simplified example - in a real system, you'd retrieve the actual file
        from src.routes.document import collection
        
        results = collection.query(
            where={'document_id': document_id},
            limit=100  # Get a reasonable number of chunks
        )
        
        if not results['documents'] or not results['documents'][0]:
            return jsonify({'error': 'Document content not found'}), 404
        
        # Combine all chunks to get the full text
        text_content = "\n\n".join(results['documents'][0])
        
        # For PDF preview, we'll create a data URL
        preview_url = None
        file_extension = document.file_type.lower() if document.file_type else ''
        
        if file_extension == 'pdf':
            # Create a simple PDF with the text content
            pdf_bytes = create_preview_pdf(text_content, document.filename)
            
            # Convert to base64 for data URL
            base64_pdf = base64.b64encode(pdf_bytes).decode('utf-8')
            preview_url = f"data:application/pdf;base64,{base64_pdf}"
        
        return jsonify({
            'textContent': text_content,
            'previewUrl': preview_url,
            'filename': document.filename,
            'fileType': document.file_type
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Error generating preview: {str(e)}'}), 500

@document_preview_bp.route('/documents/<document_id>/download', methods=['GET'])
@token_required
def download_document(current_user, document_id):
    """Download the original document."""
    try:
        # Find the document in database
        document = Document.query.filter_by(document_id=document_id).first()
        
        if not document:
            return jsonify({'error': 'Document not found'}), 404
            
        # Check if user has access to the document
        if document.user_id != current_user.id:
            # Check if document is shared with the user
            from src.models.document_share import DocumentShare
            share = DocumentShare.query.filter_by(
                document_id=document.id,
                shared_with_id=current_user.id
            ).first()
            
            if not share:
                return jsonify({'error': 'Access denied'}), 403
        
        # In a real system, you would retrieve the original file from storage
        # For this example, we'll create a PDF with the document content
        
        # Get document content from ChromaDB
        from src.routes.document import collection
        
        results = collection.query(
            where={'document_id': document_id},
            limit=100
        )
        
        if not results['documents'] or not results['documents'][0]:
            return jsonify({'error': 'Document content not found'}), 404
        
        # Combine all chunks to get the full text
        text_content = "\n\n".join(results['documents'][0])
        
        # Create a PDF with the text content
        pdf_bytes = create_preview_pdf(text_content, document.filename)
        
        # Create a response with the PDF
        return Response(
            pdf_bytes,
            mimetype='application/pdf',
            headers={
                'Content-Disposition': f'attachment; filename={secure_filename(document.filename)}',
                'Content-Type': 'application/pdf'
            }
        )
        
    except Exception as e:
        return jsonify({'error': f'Error downloading document: {str(e)}'}), 500

def create_preview_pdf(text_content, filename):
    """Create a PDF with the given text content."""
    try:
        # Create a PDF document
        pdf_document = fitz.open()
        page = pdf_document.new_page()
        
        # Add text to the page
        page.insert_text((50, 50), f"Document: {filename}", fontsize=16)
        page.insert_text((50, 80), "Content Preview:", fontsize=12)
        
        # Split text into lines and add to page
        y_position = 120
        for line in text_content.split('\n'):
            if y_position > 800:  # Check if we need a new page
                page = pdf_document.new_page()
                y_position = 50
            
            page.insert_text((50, y_position), line, fontsize=10)
            y_position += 12
        
        # Save the PDF to a bytes buffer
        pdf_bytes = pdf_document.tobytes()
        pdf_document.close()
        
        return pdf_bytes
    except Exception as e:
        print(f"Error creating PDF: {e}")
        # Return a simple PDF with error message
        pdf_buffer = io.BytesIO()
        pdf = PyPDF2.PdfWriter()
        pdf.add_blank_page(width=612, height=792)
        pdf.write(pdf_buffer)
        pdf_buffer.seek(0)
        return pdf_buffer.read()