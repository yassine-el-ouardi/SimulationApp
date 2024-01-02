import requests
import json
import pandas as pd
# URL of your Flask app's predict endpoint
url = 'http://127.0.0.1:5000/predict'

# Load your prediction data from the JSON file
with open('prediction_data.json', 'r') as file:
    json_data = json.load(file)

# Send a POST request to the Flask app
response = requests.post(url, json=json_data)

# Print the response from the Flask app
print(response.json())
