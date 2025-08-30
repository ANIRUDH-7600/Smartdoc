# SmartDoc Frontend-Backend Integration Guide

## Overview
This guide explains how to use the integrated SmartDoc system with the fixed frontend-backend communication.

## Issues Fixed

### 1. PowerShell File Upload Error
**Problem**: The original PowerShell command used `-Form` parameter which doesn't exist in `Invoke-WebRequest`.

**Solution**: Created proper PowerShell scripts that handle multipart form data correctly.

### 2. Frontend-Backend Integration Issues
**Problem**: Frontend was using relative URLs (`/api/...`) instead of absolute URLs to the backend.

**Solution**: Updated all components to use `API_BASE_URL` from AuthContext pointing to `http://localhost:5000/api`.

### 3. Document Selection Routing Issues
**Problem**: Selecting documents was going to upload page instead of chat, and chat button was missing.

**Solution**: Fixed routing logic and added chat buttons in the documents view.

### 4. Backend Serving Frontend Files
**Problem**: Backend was trying to serve frontend static files, causing confusion.

**Solution**: Backend now only serves API endpoints, frontend runs separately.

## How to Use

### Quick Start (Recommended)

1. **Use the startup script:**
   ```cmd
   start-dev.bat
   ```
   This will start both backend and frontend automatically.

### Manual Setup

1. **Start the backend (Terminal 1):**
   ```bash
   cd smartdoc-backend
   python src/main.py
   ```
   You should see:
   ```
   🚀 SmartDoc Backend Server Starting...
   📍 API Server: http://localhost:5000
   🔗 API Base URL: http://localhost:5000/api
   📝 Frontend should run separately on http://localhost:5173
   ==================================================
   ```

2. **Start the frontend (Terminal 2):**
   ```bash
   cd smartdoc-frontend
   npm run dev
   ```

3. **Open your browser to** `http://localhost:5173`

### File Upload Options

#### Option 1: Using the PowerShell Script (Recommended)
```powershell
.\upload-file.ps1 -FilePath "README.md" -Username "testuser2" -Password "Password123"
```

#### Option 2: Using the batch file
```cmd
upload-file.bat "README.md"
```

#### Option 3: Using the Web Interface
1. Login with your credentials
2. Go to Upload tab
3. Drag and drop or select files
4. Files will be processed and indexed

## New Workflow

### Document Management
1. **Upload Documents**: Use the Upload tab to add PDF, DOCX, or TXT files
2. **View Documents**: Go to Documents tab to see all your uploaded files
3. **Select Documents**: Click on documents to select them (single or multiple)
4. **Chat with Documents**: Use the "Start Chat" button to ask questions
5. **Preview Documents**: Use the eye icon to preview document content
6. **Share Documents**: Use the sharing panel to collaborate with others

### Chat Interface
- **Single Document**: Ask questions about a specific document
- **Multiple Documents**: Ask questions across multiple documents
- **Context Aware**: AI understands which documents you're referring to
- **Feedback System**: Rate and provide feedback on AI responses

## API Endpoints

### Authentication
- `POST /api/login` - Login with username/password
- `POST /api/signup` - Create new account
- `GET /api/verify-token` - Verify JWT token
- `POST /api/refresh-token` - Refresh expired token

### Documents
- `POST /api/upload` - Upload and process document
- `GET /api/documents` - List user's documents
- `DELETE /api/documents/{id}` - Delete document
- `GET /api/documents/shared-with-me` - List shared documents

### AI Features
- `POST /api/ask` - Ask questions about documents
- `GET /api/preview/{id}` - Preview document content

### Feedback
- `POST /api/feedback` - Submit feedback on AI responses
- `GET /api/feedback/stats` - Get feedback statistics

### Sharing
- `POST /api/documents/share` - Share document with user
- `GET /api/documents/share` - Get shared documents
- `DELETE /api/documents/shares/{id}` - Remove document share

## File Upload Requirements

### Supported Formats
- PDF (.pdf)
- Microsoft Word (.docx, .doc)
- Plain Text (.txt)

### File Size Limit
- Maximum: 10MB

### Processing
- Documents are automatically chunked into smaller pieces
- Text is extracted and embedded using AI
- Stored in ChromaDB for fast retrieval

## Troubleshooting

### Common Issues

1. **Backend shows signup page**: Make sure you're accessing the frontend at `http://localhost:5173`, not the backend at `http://localhost:5000`
2. **CORS Errors**: Ensure backend is running on port 5000 and frontend on port 5173
3. **Authentication Errors**: Check that JWT tokens are being sent in Authorization headers
4. **File Upload Failures**: Verify file format and size limits
5. **Network Errors**: Ensure both services are running and accessible

### Debug Mode

Enable debug logging in the backend by setting environment variables:
```bash
export FLASK_ENV=development
export FLASK_DEBUG=1
```

### Testing the API

Use the provided PowerShell scripts or test with curl:
```bash
# Check if backend is running
curl http://localhost:5000/

# Login
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser2","password":"Password123"}'

# Upload file (replace TOKEN with actual token)
curl -X POST http://localhost:5000/api/upload \
  -H "Authorization: Bearer TOKEN" \
  -F "file=@README.md"
```

## Development Notes

### Frontend Changes Made
- Updated all API calls to use absolute URLs
- Added proper error handling for network requests
- Improved token management in AuthContext
- Removed Vite proxy configuration
- Fixed document selection routing to go to chat
- Added chat buttons in documents view
- Added preview buttons for documents

### Backend Changes Made
- Enhanced CORS handling for file uploads
- Improved error responses
- Added proper multipart form data support
- Removed static file serving (frontend runs separately)
- Added informative root endpoint

### Security Considerations
- JWT tokens expire after 1 hour
- Refresh tokens valid for 7 days
- All API endpoints require authentication
- File uploads are validated for type and size

## Next Steps

1. **Test the complete workflow** using the startup script
2. **Upload documents** and test the chat functionality
3. **Test document sharing** with other users
4. **Monitor the backend logs** for any errors
5. **Scale the system** by adding more document processing workers if needed

## Quick Commands

```bash
# Start development environment
start-dev.bat

# Test backend API
curl http://localhost:5000/

# Test file upload
.\upload-file.ps1 -FilePath "README.md" -Username "testuser2" -Password "Password123"
```
