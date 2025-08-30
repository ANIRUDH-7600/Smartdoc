#!/usr/bin/env python3
"""
Quick test script to verify basic functionality
"""

import requests
import json

BASE_URL = "http://localhost:5000"

def quick_test():
    print("🧪 Quick SmartDoc Test")
    print("=" * 40)
    
    # Test 1: Root endpoint
    print("\n1️⃣ Testing root endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"✅ Root: {response.status_code}")
    except Exception as e:
        print(f"❌ Root failed: {e}")
    
    # Test 2: Login
    print("\n2️⃣ Testing login...")
    try:
        response = requests.post(f"{BASE_URL}/api/login", json={
            "username": "ashish",
            "password": "Password123"
        })
        if response.status_code == 200:
            token = response.json().get('access_token')
            print(f"✅ Login successful, token: {token[:20]}...")
            
            headers = {"Authorization": f"Bearer {token}"}
            
            # Test 3: Documents
            print("\n3️⃣ Testing documents endpoint...")
            docs_response = requests.get(f"{BASE_URL}/api/documents", headers=headers)
            print(f"✅ Documents: {docs_response.status_code}")
            
            if docs_response.status_code == 200:
                documents = docs_response.json().get('documents', [])
                if documents:
                    doc_id = documents[0].get('document_id')
                    print(f"📄 Found document: {documents[0].get('filename')}")
                    
                    # Test 4: Preview
                    print("\n4️⃣ Testing preview endpoint...")
                    preview_response = requests.get(f"{BASE_URL}/api/documents/{doc_id}/preview", headers=headers)
                    print(f"✅ Preview: {preview_response.status_code}")
                    if preview_response.status_code == 200:
                        print(f"📋 Preview data: {json.dumps(preview_response.json(), indent=2)}")
                    
                    # Test 5: Ask question
                    print("\n5️⃣ Testing ask endpoint...")
                    ask_response = requests.post(f"{BASE_URL}/api/ask", json={
                        "question": "What is this document about?",
                        "document_id": doc_id
                    }, headers=headers)
                    print(f"✅ Ask: {ask_response.status_code}")
                    if ask_response.status_code == 200:
                        print(f"🤖 Answer: {ask_response.json().get('answer', 'No answer')[:100]}...")
                    
                else:
                    print("⚠️  No documents found")
            
        else:
            print(f"❌ Login failed: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Test failed: {e}")
    
    print("\n" + "=" * 40)
    print("🎯 Quick test completed!")

if __name__ == "__main__":
    quick_test()
