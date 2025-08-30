#!/usr/bin/env python3
"""
Simple test script for SmartDoc Backend
Run this to verify the backend is working properly
"""

import requests
import json

BASE_URL = "http://localhost:5000"

def test_endpoint(endpoint, method="GET", data=None, headers=None):
    """Test a specific endpoint"""
    url = f"{BASE_URL}{endpoint}"
    
    try:
        if method == "GET":
            response = requests.get(url, headers=headers)
        elif method == "POST":
            response = requests.post(url, json=data, headers=headers)
        else:
            print(f"Unsupported method: {method}")
            return False
            
        print(f"\n🔍 Testing: {method} {endpoint}")
        print(f"📊 Status: {response.status_code}")
        
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
                print(f"❌ Error: {json.dumps(error, indent=2)}")
            except:
                print(f"❌ Error: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print(f"❌ Connection Error: Could not connect to {url}")
        return False
    except Exception as e:
        print(f"❌ Exception: {str(e)}")
        return False

def main():
    print("🧪 SmartDoc Backend Testing Script")
    print("=" * 50)
    
    # Test 1: Root endpoint
    print("\n1️⃣ Testing root endpoint...")
    test_endpoint("/")
    
    # Test 2: API test endpoint
    print("\n2️⃣ Testing API test endpoint...")
    test_endpoint("/api/test")
    
    # Test 3: Login endpoint (should fail without credentials)
    print("\n3️⃣ Testing login endpoint...")
    test_endpoint("/api/login", method="POST", data={
        "username": "testuser",
        "password": "testpass"
    })
    
    # Test 4: Documents endpoint (should fail without auth)
    print("\n4️⃣ Testing documents endpoint...")
    test_endpoint("/api/documents")
    
    # Test 5: Feedback stats endpoint (should fail without auth)
    print("\n5️⃣ Testing feedback stats endpoint...")
    test_endpoint("/api/feedback/stats")
    
    print("\n" + "=" * 50)
    print("🎯 Testing completed!")
    print("\n📝 Next steps:")
    print("1. If all endpoints return proper responses (even errors), the backend is working")
    print("2. If you get connection errors, make sure the backend is running")
    print("3. If you get import errors, check the Python dependencies")
    print("4. Start the frontend and test the full integration")

if __name__ == "__main__":
    main()
