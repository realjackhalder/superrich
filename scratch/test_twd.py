import requests
import json

def test_p2p_rates():
    url = "http://localhost:3001/api/p2p-rates"
    try:
        response = requests.get(url)
        data = response.json()
        
        if data.get("success"):
            rates = data.get("data", {})
            if "TWD" in rates:
                print(f"SUCCESS: TWD rate found: {rates['TWD']}")
            else:
                print("FAILURE: TWD rate not found in response")
                print("Available rates:", list(rates.keys()))
        else:
            print("FAILURE: API returned success=False")
            print(data)
    except Exception as e:
        print(f"ERROR: Could not connect to backend: {e}")

if __name__ == "__main__":
    test_p2p_rates()
