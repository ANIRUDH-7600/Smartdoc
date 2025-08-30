#!/usr/bin/env python3
"""
Test script to verify document context is being passed correctly
"""

import requests
import json

BASE_URL = "http://localhost:5000"

def test_document_context():
    print("🧪 Testing Document Context")
    print("=" * 50)
    
    # Login
    print("\n🔐 Logging in...")
    login_response = requests.post(f"{BASE_URL}/api/login", json={
        "username": "ashish",
        "password": "Password123"
    })
    
    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.status_code}")
        return
    
    token = login_response.json().get('access_token')
    headers = {"Authorization": f"Bearer {token}"}
    print("✅ Login successful")
    
    # Get documents
    print("\n📄 Getting documents...")
    docs_response = requests.get(f"{BASE_URL}/api/documents", headers=headers)
    
    if docs_response.status_code != 200:
        print(f"❌ Failed to get documents: {docs_response.status_code}")
        return
    
    documents = docs_response.json().get('documents', [])
    if not documents:
        print("❌ No documents found")
        return
    
    print(f"✅ Found {len(documents)} documents")
    
    # Test with first document
    doc = documents[0]
    doc_id = doc.get('document_id')
    filename = doc.get('filename')
    
    print(f"\n📋 Testing with document: {filename}")
    print(f"📄 Document ID: {doc_id}")
    
    # Test 1: Ask without document context
    print("\n1️⃣ Testing without document context...")
    ask_response = requests.post(f"{BASE_URL}/api/ask", json={
        "question": "What is this about?"
    }, headers=headers)
    
    print(f"📊 Status: {ask_response.status_code}")
    if ask_response.status_code == 200:
        result = ask_response.json()
        print(f"🤖 Answer: {result.get('answer', 'No answer')[:100]}...")
        print(f"📊 Confidence: {result.get('confidence', 'Unknown')}")
    
    # Test 2: Ask with document context
    print("\n2️⃣ Testing with document context...")
    ask_response = requests.post(f"{BASE_URL}/api/ask", json={
        "question": "What is this document about?",
        "document_id": doc_id
    }, headers=headers)
    
    print(f"📊 Status: {ask_response.status_code}")
    if ask_response.status_code == 200:
        result = ask_response.json()
        print(f"🤖 Answer: {result.get('answer', 'No answer')[:100]}...")
        print(f"📊 Confidence: {result.get('confidence', 'Unknown')}")
        print(f"📊 Context chunks used: {result.get('context_chunks_used', 0)}")
        print(f"📊 Sources: {len(result.get('sources', []))}")
    else:
        print(f"❌ Error: {ask_response.text}")
    
    # Test 3: Check if document has chunks in ChromaDB
    print("\n3️⃣ Checking document chunks in ChromaDB...")
    print("📝 This would require direct ChromaDB access to verify")
    print("📝 If no chunks are found, the document wasn't processed properly")
    
    print("\n" + "=" * 50)
    print("🎯 Document context test completed!")
    print("\n📝 Expected results:")
    print("✅ Without context: General answer, confidence: general")
    print("✅ With context: Document-specific answer, confidence: high/medium")
    print("✅ Context chunks used: > 0 if document was processed")

if __name__ == "__main__":
    test_document_context()
