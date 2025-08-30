# SmartDoc Routing Debug Guide

## Current Issues
1. **White screens** after clicking buttons
2. **Back button not working**
3. **Components not rendering properly**

## Debugging Steps

### Step 1: Check Browser Console
1. Open browser developer tools (F12)
2. Go to Console tab
3. Look for JavaScript errors
4. Look for React component errors

### Step 2: Check Network Tab
1. Go to Network tab in developer tools
2. Try to navigate between views
3. Look for failed API calls (red entries)
4. Check if requests are being made

### Step 3: Test Basic Navigation
1. Click on main navigation buttons:
   - Documents
   - Upload
   - Feedback
   - Shared With Me
2. Check if `currentView` state changes
3. Look for the debug info showing current view

### Step 4: Test Document Selection
1. Go to Documents view
2. Click on a document
3. Check if it goes to chat view
4. Look for console logs

### Step 5: Test Chat Functionality
1. Select a document
2. Click "Start Chat" button
3. Check if QuestionAnswer component renders
4. Look for any errors

## Expected Behavior

### Navigation Flow
```
Login → Documents → Select Document → Chat (qa)
                ↓
            Upload, Feedback, Shared
```

### State Changes
- `currentView` should change when clicking navigation
- `selectedDocument` should be set when selecting documents
- Components should render based on `currentView`

## Common Problems & Solutions

### Problem 1: White Screen
**Symptoms**: Clicking buttons shows nothing
**Causes**:
- Component import errors
- Missing dependencies
- JavaScript runtime errors
- Component not rendering

**Solutions**:
1. Check browser console for errors
2. Verify all imports are correct
3. Check if components exist
4. Use the test component to verify routing

### Problem 2: Back Button Not Working
**Symptoms**: Back button doesn't navigate
**Causes**:
- `setCurrentView` not working
- State not updating
- Component not re-rendering

**Solutions**:
1. Check if `setCurrentView` is called
2. Verify state changes in console
3. Use navigation menu instead
4. Check component lifecycle

### Problem 3: Components Not Rendering
**Symptoms**: Views show nothing or errors
**Causes**:
- Missing imports
- Component errors
- Props not passed correctly
- API calls failing

**Solutions**:
1. Check component imports
2. Verify props are correct
3. Check API endpoints
4. Use fallback views

## Debug Commands

### Check Current State
```javascript
// In browser console
console.log('Current view:', currentView)
console.log('Selected document:', selectedDocument)
console.log('Selected documents:', selectedDocuments)
```

### Force Navigation
```javascript
// In browser console
setCurrentView('test')  // Go to test view
setCurrentView('documents')  // Go to documents
```

### Check Component Rendering
```javascript
// In browser console
// Look for React component tree
// Check if components are mounted
```

## Test Component Usage

The test component provides:
- **Navigation buttons** to test routing
- **Current view display** to verify state
- **Simple interface** to isolate routing issues

### How to Use
1. Navigate to test view: `setCurrentView('test')`
2. Click navigation buttons
3. Verify view changes
4. Check if components render

## Quick Fixes

### Fix 1: Clear Browser Cache
```javascript
// In browser console
localStorage.clear()
sessionStorage.clear()
// Then refresh page
```

### Fix 2: Reset State
```javascript
// In browser console
setCurrentView('documents')
setSelectedDocument(null)
setSelectedDocuments([])
```

### Fix 3: Check Imports
Verify all components are imported:
- DocumentList
- DocumentUpload
- QuestionAnswer
- DocumentPreview
- FeedbackDashboard
- SharedDocuments
- DocumentShare

### Fix 4: Verify API Calls
Check if backend is running:
```bash
curl http://localhost:5000/api/test
```

## Still Having Issues?

### 1. Check Component Files
- Verify all component files exist
- Check for syntax errors
- Verify imports are correct

### 2. Check Dependencies
```bash
cd smartdoc-frontend
npm install
npm run build
```

### 3. Check Backend
```bash
cd smartdoc-backend
python test-backend.py
```

### 4. Create Minimal Test
Create a simple component to test:
```jsx
const SimpleTest = () => <div>Simple test works!</div>
```

## Next Steps

1. **Test basic navigation** using the test component
2. **Check console errors** for specific issues
3. **Verify component imports** are working
4. **Test API endpoints** independently
5. **Use fallback views** to isolate problems

## Contact

If issues persist:
1. Share console error messages
2. Share network tab failures
3. Describe exact steps to reproduce
4. Include browser and OS information
