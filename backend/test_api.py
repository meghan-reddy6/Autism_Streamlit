import requests
import json
import sys

base_url = "http://localhost:8000/api"

try:
    print("1. Testing GET /questions")
    r1 = requests.get(f"{base_url}/questions", timeout=5)
    print(f"Status: {r1.status_code}")
    if r1.status_code == 200:
        print(f"Loaded {len(r1.json())} sections")

    print("\n2. Testing POST /calculate (stateless)")
    data = {"responses": [{"question_id": f"q{i}", "section": "I. Social Interaction", "score": 2} for i in range(1, 21)]}
    r2 = requests.post(f"{base_url}/calculate", json=data, timeout=5)
    print(f"Status: {r2.status_code}")
    if r2.status_code == 200:
        print(r2.json())

    print("\n3. Testing POST /assessment (stateful)")
    assessment_data = {
        "child_name": "Test Child",
        "child_age": "5",
        "child_gender": "Male",
        "parent_name": "Test Parent",
        "contact_number": "555-0100",
        "contact_email": "test@example.com",
        "consent_given": True,
        "responses": data["responses"]
    }
    r3 = requests.post(f"{base_url}/assessment", json=assessment_data, timeout=5)
    print(f"Status: {r3.status_code}")
    if r3.status_code == 200:
        res_data = r3.json()
        print(f"Created assessment ID: {res_data['id']}")
        
        print(f"\n4. Testing GET /assessment/{res_data['id']}")
        r4 = requests.get(f"{base_url}/assessment/{res_data['id']}", timeout=5)
        print(f"Status: {r4.status_code}")
        if r4.status_code == 200:
            print("Successfully retrieved assessment.")
            print(f"Total Score: {r4.json()['total_score']}")
            print(f"Interpretation: {r4.json()['interpretation']}")            
            
except requests.exceptions.ConnectionError:
    print("Error: Could not connect to localhost:8000. Is the backend running?")
    sys.exit(1)
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
