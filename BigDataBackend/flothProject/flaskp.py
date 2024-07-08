from flask import Flask, request, jsonify
import tensorflow as tf
import joblib
import pandas as pd
from influxdb_client import InfluxDBClient, Point
import random

app = Flask(__name__)

# Load the Keras model and scalers
def load_model_and_scalers():
    def r2_keras(output_index):
        def r2(y_true, y_pred):
            SS_res = tf.keras.backend.sum(tf.keras.backend.square(y_true[:, output_index] - y_pred[:, output_index]))
            SS_tot = tf.keras.backend.sum(tf.keras.backend.square(y_true[:, output_index] - tf.keras.backend.mean(y_true[:, output_index])))
            r2 = 1 - SS_res / (SS_tot + tf.keras.backend.epsilon())
            return r2

        r2.__name__ = f"r2_{output_index}"
        return r2

    model = tf.keras.models.load_model('model7_23.h5', custom_objects={
        f'r2_{i}': r2_keras(i) for i in range(23)
    })

    scalerX = joblib.load('scalerX_24.joblib')
    scalerY = joblib.load('scalerY_23.joblib')

    return model, scalerX, scalerY

model, scalerX, scalerY = load_model_and_scalers()

# InfluxDB configuration
INFLUXDB_URL = 'http://localhost:8086'
INFLUXDB_TOKEN = 'sUJZaiT1oMfvd0MKraMlw5WYl442Mom46YCLFcReJ3LXX0Ka9NWHF8e6uV6N8euHBY2C_QZph5Q4U78SPTkOLA=='
INFLUXDB_ORG = 'Dev team'
INFLUXDB_BUCKET = 'Seconds'

client = InfluxDBClient(url=INFLUXDB_URL, token=INFLUXDB_TOKEN)
write_api = client.write_api()

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Extract and prepare data from the POST request
        json_request = request.get_json()
        node_id = json_request['node_id']  # Retrieve node_id from the request

        # Fake data (replace this with your actual fake data)
        prediction_list = [
            random.uniform(0.5, 1.5),  # Air Efficiency
            random.uniform(0.1, 0.5),  # Flotation Rate: Cell
            random.uniform(0.01, 0.1),  # Entrainment: Cell
            random.uniform(50, 100),  # Total Solids Flow_Concentrate
            random.uniform(50, 100),  # Total Liquid Flow_Concentrate
            random.uniform(50, 100),  # Pulp Volumetric Flow_Concentrate
            random.uniform(1.0, 4.0),  # Solids SG_Concentrate
            random.uniform(1.0, 2.0),  # Pulp SG_Concentrate
            random.uniform(5, 15),  # Solids Fraction_Concentrate
            random.uniform(50, 100),  # Total Solids Flow_Tailings
            random.uniform(50, 100),  # Total Liquid Flow_Tailings
            random.uniform(50, 100),  # Pulp Volumetric Flow_Tailings
            random.uniform(1.0, 4.0),  # Solids SG_Tailings
            random.uniform(1.0, 2.0),  # Pulp SG_Tailings
            random.uniform(5, 15),  # Solids Fraction_Tailings
            random.uniform(0, 10),  # Cu_Tails
            random.uniform(0, 10),  # Fe_Tails
            random.uniform(0, 10),  # Pb_Tails
            random.uniform(0, 10),  # Zn_Tails
            random.uniform(0, 10),  # Cu_Concentrate
            random.uniform(0, 10),  # Fe_Concentrate
            random.uniform(0, 10),  # Pb_Concentrate
            random.uniform(0, 10)   # Zn_Concentrate
        ]
        
        # Adjust one of the fake data values based on other values
        prediction_list[11] = prediction_list[9] + prediction_list[10] / prediction_list[13]
        print(prediction_list)

        # Field names in the specified order
        field_names = [
            'Air Efficiency', 'Flotation Rate: Cell', 'Entrainment: Cell',
            'Total Solids Flow_Concentrate', 'Total Liquid Flow_Concentrate', 'Pulp Volumetric Flow_Concentrate',
            'Solids SG_Concentrate', 'Pulp SG_Concentrate', 'Solids Fraction_Concentrate',
            'Total Solids Flow_Tailings', 'Total Liquid Flow_Tailings', 'Pulp Volumetric Flow_Tailings',
            'Solids SG_Tailings', 'Pulp SG_Tailings', 'Solids Fraction_Tailings',
            'Cu_Tails', 'Fe_Tails', 'Pb_Tails', 'Zn_Tails',
            'Cu_Concentrate', 'Fe_Concentrate', 'Pb_Concentrate', 'Zn_Concentrate'
        ]

        # Write fake prediction data to InfluxDB
        point = Point("flotationCell").tag("node_id", node_id)
        for name, value in zip(field_names, prediction_list):
            point.field(name, value)

        write_api.write(INFLUXDB_BUCKET, INFLUXDB_ORG, point)
        
        return jsonify({'prediction': prediction_list})

    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=8000)  # Replace 8000 with your desired port number

@app.route('/')
def home():
    return "Flask app is running!"