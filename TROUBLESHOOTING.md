# SmartDoc Troubleshooting Guide

## Common Issues and Solutions

### 🚨 Issue 1: White Screen After Clicking Buttons
**Symptoms**: Clicking on chat, feedback, or other buttons shows only a white screen
**Cause**: Frontend routing issues or backend API errors
**Solution**: 
1. Check browser console for JavaScript errors
2. Verify backend is running and accessible
3. Check network tab for failed API calls

### 🚨 Issue 2: Back Button Not Working
**Symptoms**: Back button doesn't navigate to previous page
**Cause**: React state management issues
**Solution**: 
1. Use browser back button instead
2. Navigate using the main navigation menu
3. Check if the component state is properly managed

### 🚨 Issue 3: Backend Shows Signup Page
**Symptoms**: Accessing `http://localhost:5000` shows frontend instead of API
**Cause**: Backend is serving frontend files
**Solution**: 
1. Backend should only serve API endpoints
2. Frontend runs separately at `http://localhost:5173`
3. Use `start-dev.bat` to start both services correctly

### 🚨 Issue 4: 422 Errors in Backend
**Symptoms**: Backend logs show 422 status codes
**Cause**: JWT authentication mismatch
**Solution**: 
1. Backend now uses consistent JWT verification
2. All routes use `@token_required` decorator
3. Frontend sends tokens in Authorization headers

## Step-by-Step Debugging

### Step 1: Test Backend Independently
```bash
# Run the test script
python test-backend.py

# Or test manually with curl
curl http://localhost:5000/
curl http://localhost:5000/api/test
```

**Expected Results**:
- ✅ Root endpoint: Returns API information
- ✅ Test endpoint: Returns success message
- ❌ Protected endpoints: Return 401 (unauthorized) - this is correct

### Step 2: Check Backend Logs
Look for these patterns in backend terminal:
```
✅ Good: "GET /api/verify-token HTTP/1.1" 200
❌ Bad: "GET /api/feedback/stats HTTP/1.1" 422
```

### Step 3: Test Frontend-Backend Communication
1. Open browser developer tools (F12)
2. Go to Network tab
3. Try to login or navigate
4. Look for failed requests (red entries)

### Step 4: Verify Authentication Flow
1. Login should return `access_token`
2. Token should be stored in localStorage
3. All API calls should include `Authorization: Bearer <token>`

## Quick Fixes

### Fix 1: Restart Both Services
```bash
# Stop all running processes
# Then run:
start-dev.bat
```

### Fix 2: Clear Browser Data
1. Clear localStorage: `localStorage.clear()`
2. Clear cookies
3. Hard refresh: Ctrl+F5

### Fix 3: Check Dependencies
```bash
cd smartdoc-backend
pip install -r requirements.txt

cd ../smartdoc-frontend
npm install
```

### Fix 4: Verify Ports
- Backend: `http://localhost:5000`
- Frontend: `http://localhost:5173`
- Make sure no other services use these ports

## API Endpoint Testing

### Test Authentication
```bash
# Login
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser2","password":"Password123"}'

# Extract token from response and use it
curl -H "Authorization: Bearer <TOKEN>" \
  http://localhost:5000/api/documents
```

### Test File Upload
```bash
# Use the PowerShell script
.\upload-file.ps1 -FilePath "README.md" -Username "testuser2" -Password "Password123"
```

## Common Error Messages

### "Authorization token is missing"
- Frontend not sending token
- Token expired
- Check localStorage for token

### "User not found"
- Database issue
- Token contains invalid user_id
- Check user table in database

### "Invalid token"
- Token malformed
- Wrong secret key
- Token expired

### "CORS error"
- Backend not running
- Wrong port
- CORS configuration issue

## Development Workflow

### 1. Start Backend First
```bash
cd smartdoc-backend
python src/main.py
```
**Look for**: "🚀 SmartDoc Backend Server Starting..."

### 2. Start Frontend Second
```bash
cd smartdoc-frontend
npm run dev
```
**Look for**: "Local: http://localhost:5173/"

### 3. Test Backend API
```bash
curl http://localhost:5000/api/test
```

### 4. Test Frontend
- Open `http://localhost:5173`
- Check browser console for errors
- Try to login

## Database Issues

### Check Database
```bash
cd smartdoc-backend
sqlite3 database/app.db
.tables
SELECT * FROM user LIMIT 5;
.quit
```

### Reset Database (if needed)
```bash
cd smartdoc-backend
rm database/app.db
python src/main.py
# This will recreate the database
```

## Environment Variables

### Required Environment Variables
```bash
# Backend
export SECRET_KEY="your-secret-key"
export GEMINI_API_KEY="your-gemini-api-key"

# Frontend
# None required for basic functionality
```

## Still Having Issues?

### 1. Check System Requirements
- Python 3.8+
- Node.js 16+
- Windows 10/11 or Linux/macOS

### 2. Check Dependencies
```bash
# Backend
python --version
pip list | grep -E "(Flask|PyJWT|chromadb)"

# Frontend
node --version
npm list | grep -E "(react|vite)"
```

### 3. Check Logs
- Backend terminal output
- Browser console (F12)
- Network tab for failed requests

### 4. Create New Issue
If nothing works, create a detailed issue with:
- Operating system
- Python/Node versions
- Exact error messages
- Steps to reproduce
- Screenshots if applicable

## Quick Commands Reference

```bash
# Start development environment
start-dev.bat

# Test backend
python test-backend.py

# Test file upload
.\upload-file.ps1 -FilePath "README.md" -Username "testuser2" -Password "Password123"

# Check backend status
curl http://localhost:5000/

# Check frontend
curl http://localhost:5173/
```
