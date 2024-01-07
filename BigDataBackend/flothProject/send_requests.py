import requests
import json

# URL of your Flask app's predict endpoint
url = 'http://127.0.0.1:5000/process-circuit'

# Read data from the file
file_path = 'chart_state_finale.txt'
with open(file_path, 'r') as file:
    data = file.read()

# Parse the JSON data
parsed_data = json.loads(data)

# Send a POST request to the Flask app
response = requests.post(url, json=parsed_data)

# Check the response status
if response.status_code == 200:
    response_data = response.json()
    print("Response from the Flask app:", json.dumps(response_data, indent=4))
else:
    print(f"Error occurred: {response.status_code}, {response.text}")
