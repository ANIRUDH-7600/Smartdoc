#!/usr/bin/env python3
"""
Test script for document preview endpoint
"""

import requests
import json

BASE_URL = "http://localhost:5000"

def test_preview_endpoint():
    """Test the document preview endpoint"""
    
    # First, login to get a token
    print("🔐 Logging in...")
    login_response = requests.post(f"{BASE_URL}/api/login", json={
        "username": "ashish",
        "password": "Password123"
    })
    
    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.status_code}")
        return False
    
    token = login_response.json().get('access_token')
    if not token:
        print("❌ No access token received")
        return False
    
    print("✅ Login successful")
    
    # Get documents list
    print("\n📄 Getting documents list...")
    headers = {"Authorization": f"Bearer {token}"}
    docs_response = requests.get(f"{BASE_URL}/api/documents", headers=headers)
    
    if docs_response.status_code != 200:
        print(f"❌ Failed to get documents: {docs_response.status_code}")
        return False
    
    documents = docs_response.json().get('documents', [])
    if not documents:
        print("❌ No documents found")
        return False
    
    print(f"✅ Found {len(documents)} documents")
    
    # Test preview for first document
    first_doc = documents[0]
    doc_id = first_doc.get('document_id')
    filename = first_doc.get('filename')
    
    print(f"\n🔍 Testing preview for document: {filename} (ID: {doc_id})")
    
    preview_response = requests.get(
        f"{BASE_URL}/api/documents/{doc_id}/preview", 
        headers=headers
    )
    
    print(f"📊 Preview response status: {preview_response.status_code}")
    
    if preview_response.status_code == 200:
        preview_data = preview_response.json()
        print("✅ Preview successful!")
        print(f"📋 Preview data: {json.dumps(preview_data, indent=2)}")
        return True
    else:
        print(f"❌ Preview failed: {preview_response.text}")
        return False

if __name__ == "__main__":
    print("🧪 Testing Document Preview Endpoint")
    print("=" * 50)
    
    success = test_preview_endpoint()
    
    print("\n" + "=" * 50)
    if success:
        print("🎯 Preview endpoint test PASSED!")
    else:
        print("💥 Preview endpoint test FAILED!")
    
    print("\n📝 Next steps:")
    print("1. If test passed, the preview endpoint is working")
    print("2. If test failed, check backend logs for errors")
    print("3. Restart backend if needed")
