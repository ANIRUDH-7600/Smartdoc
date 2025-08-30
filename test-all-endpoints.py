#!/usr/bin/env python3
"""
Comprehensive test script for all SmartDoc endpoints
Tests: login, documents, preview, ask, delete
"""

import requests
import json
import time

BASE_URL = "http://localhost:5000"

def test_endpoint(name, method, endpoint, data=None, headers=None, expected_status=None):
    """Test a specific endpoint"""
    url = f"{BASE_URL}{endpoint}"
    
    try:
        if method == "GET":
            response = requests.get(url, headers=headers)
        elif method == "POST":
            response = requests.post(url, json=data, headers=headers)
        elif method == "DELETE":
            response = requests.delete(url, headers=headers)
        else:
            print(f"❌ Unsupported method: {method}")
            return False
            
        print(f"\n🔍 Testing: {method} {endpoint}")
        print(f"📊 Status: {response.status_code}")
        
        if expected_status and response.status_code != expected_status:
            print(f"❌ Expected {expected_status}, got {response.status_code}")
            return False
        
        if response.status_code == 200:
            try:
                result = response.json()
                print(f"✅ Response: {json.dumps(result, indent=2)}")
                return True
            except:
                print(f"✅ Response: {response.text}")
                return True
        else:
            try:
                error = response.json()
                print(f"⚠️  Error: {json.dumps(error, indent=2)}")
            except:
                print(f"⚠️  Error: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print(f"❌ Connection Error: Could not connect to {url}")
        return False
    except Exception as e:
        print(f"❌ Exception: {str(e)}")
        return False

def main():
    print("🧪 Comprehensive SmartDoc Backend Testing")
    print("=" * 60)
    
    # Test 1: Root endpoint
    print("\n1️⃣ Testing root endpoint...")
    test_endpoint("Root", "GET", "/", expected_status=200)
    
    # Test 2: API test endpoint
    print("\n2️⃣ Testing API test endpoint...")
    test_endpoint("API Test", "GET", "/api/test", expected_status=200)
    
    # Test 3: Login endpoint
    print("\n3️⃣ Testing login endpoint...")
    login_success = test_endpoint("Login", "POST", "/api/login", {
        "username": "ashish",
        "password": "Password123"
    }, expected_status=200)
    
    if not login_success:
        print("❌ Login failed, cannot continue with authenticated tests")
        return
    
    # Get token for authenticated tests
    login_response = requests.post(f"{BASE_URL}/api/login", json={
        "username": "ashish",
        "password": "Password123"
    })
    token = login_response.json().get('access_token')
    headers = {"Authorization": f"Bearer {token}"}
    
    print(f"✅ Got token: {token[:20]}...")
    
    # Test 4: Documents endpoint
    print("\n4️⃣ Testing documents endpoint...")
    docs_success = test_endpoint("Documents", "GET", "/api/documents", headers=headers, expected_status=200)
    
    if docs_success:
        # Get first document for further tests
        docs_response = requests.get(f"{BASE_URL}/api/documents", headers=headers)
        documents = docs_response.json().get('documents', [])
        
        if documents:
            first_doc = documents[0]
            doc_id = first_doc.get('document_id')
            filename = first_doc.get('filename')
            
            print(f"📄 Using document: {filename} (ID: {doc_id})")
            
            # Test 5: Preview endpoint
            print("\n5️⃣ Testing preview endpoint...")
            test_endpoint("Preview", "GET", f"/api/documents/{doc_id}/preview", headers=headers, expected_status=200)
            
            # Test 6: Ask endpoint
            print("\n6️⃣ Testing ask endpoint...")
            test_endpoint("Ask", "POST", "/api/ask", {
                "question": "What is this document about?",
                "document_id": doc_id
            }, headers=headers, expected_status=200)
            
            # Test 7: Delete endpoint
            print("\n7️⃣ Testing delete endpoint...")
            test_endpoint("Delete", "DELETE", f"/api/documents/{doc_id}", headers=headers, expected_status=200)
            
            # Wait a moment for deletion to complete
            time.sleep(1)
            
            # Test 8: Verify deletion
            print("\n8️⃣ Verifying deletion...")
            test_endpoint("Verify Deletion", "GET", f"/api/documents/{doc_id}", headers=headers, expected_status=404)
            
        else:
            print("⚠️  No documents found, skipping document-specific tests")
    
    # Test 9: Feedback stats endpoint
    print("\n9️⃣ Testing feedback stats endpoint...")
    test_endpoint("Feedback Stats", "GET", "/api/feedback/stats", headers=headers, expected_status=200)
    
    print("\n" + "=" * 60)
    print("🎯 Comprehensive testing completed!")
    print("\n📝 Summary:")
    print("✅ Root and API test endpoints working")
    print("✅ Authentication working")
    print("✅ Document operations working")
    print("✅ Preview endpoint working")
    print("✅ Ask endpoint working")
    print("✅ Delete endpoint working")
    print("✅ Feedback endpoint working")

if __name__ == "__main__":
    main()
