from flask import Flask, jsonify, request
from opcua import Client
import threading

app = Flask(__name__)

# Replace with your OPC UA server endpoint
opcua_server_url = "opc.tcp://<your_opcua_server_ip>:<port>"

# Replace with your node IDs
node_ids = {
    "sensor1": "ns=2;s=MySensor1",
    "sensor2": "ns=2;s=MySensor2",
    # Add more sensors as needed
}

client = Client(opcua_server_url)
client_lock = threading.Lock()

def connect_client():
    with client_lock:
        if not client.uaclient.server:
            client.connect()

def disconnect_client():
    with client_lock:
        if client.uaclient.server:
            client.disconnect()

def read_opcua_data(node_ids):
    data = {}
    with client_lock:
        for sensor, node_id in node_ids.items():
            node = client.get_node(node_id)
            data[sensor] = node.get_value()
    return data

@app.route('/fetch-sensor-data', methods=['GET'])
def fetch_sensor_data():
    try:
        connect_client()
        sensor_data = read_opcua_data(node_ids)
        return jsonify(sensor_data)
    except Exception as e:
        return jsonify({"error": str(e)})
    finally:
        disconnect_client()

if __name__ == "__main__":
    app.run(host='127.0.0.1', port=5000)