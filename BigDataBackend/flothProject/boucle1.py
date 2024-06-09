from flask import Flask, request, jsonify
import json
import requests
from flask_cors import CORS
import pandas as pd
import logging
import time

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

############################################ Class Node ###############################################################

class Node:
    def __init__(self, node_id, node_type, position, ports, cell_characteristics, size):
        self.node_id = node_id
        self.node_type = node_type
        self.position = position
        self.ports = ports
        self.cell_characteristics = cell_characteristics
        self.size = size

    # Define input and average data
    def input_features(self, links):
        dynamic_features_dict = {key: 0 for key in [
            'totalSolidFlow', 'totalLiquidFlow', 'pulpVolumetricFlow', 'solidsSG',
            'pulpSG', 'solidsFraction', 'cuPercentage', 'fePercentage', 'pbPercentage', 'znPercentage'
        ]}
        all_feeds = []

        # Retrieve dynamic characteristics for each node
        for link in links.values():
            if link.destination and link.destination.get('nodeId') == self.node_id:
                all_feeds.append(link.feed)

        logger.info("All feeds: %s", all_feeds)

        # Replace None values with 0 and ensure all values are numeric
        filtered_feeds = []
        for feed in all_feeds:
            numeric_feed = {}
            for k, v in feed.items():
                if v is None:
                    numeric_feed[k] = 0
                else:
                    try:
                        numeric_feed[k] = float(v)
                    except ValueError:
                        numeric_feed[k] = 0
            filtered_feeds.append(numeric_feed)

        # Handle different number of feeds
        if len(filtered_feeds) == 1:
            dynamic_features_dict.update(filtered_feeds[0])
        elif len(filtered_feeds) > 1:
            total_solid_flows = sum(feed['totalSolidFlow'] for feed in filtered_feeds)

            for key in dynamic_features_dict:
                if key in ['totalSolidFlow', 'totalLiquidFlow', 'pulpVolumetricFlow']:
                    dynamic_features_dict[key] = sum(feed[key] for feed in filtered_feeds)
                else:
                    if total_solid_flows > 0:
                        dynamic_features_dict[key] = sum((feed[key] * feed['totalSolidFlow'] / total_solid_flows) for feed in filtered_feeds)
                    else:
                        dynamic_features_dict[key] = 0

        logger.info("Dynamic features: %s", dynamic_features_dict)

        static_feature_keys = [
            "netVolume", "pulpArea", "frothSurfaceArea", "frothThickness", "airFlowRate",
            "R_infCcp", "R_infGn", "R_infPo", "R_infSp", "k_maxCcp", "k_maxGn", "k_maxPo", "k_maxSp",
            "EntrainementSavassiparameters"
        ]

        static_features = [self.cell_characteristics.get(key, 0) for key in static_feature_keys]

        # Define the final order of all features
        feature_names = [
            "netVolume", "pulpArea", "frothSurfaceArea", "frothThickness", "airFlowRate",
            "R_infCcp", "R_infGn", "R_infPo", "R_infSp", "k_maxCcp", "k_maxGn", "k_maxPo", "k_maxSp",
            "EntrainementSavassiparameters",
            'totalSolidFlow', 'totalLiquidFlow', 'pulpVolumetricFlow',
            'solidsSG', 'pulpSG', 'solidsFraction', 'cuPercentage', 'fePercentage',
            'pbPercentage', 'znPercentage'
        ]

        # Combine static and dynamic features in the correct order
        combined_features = static_features + [dynamic_features_dict.get(name, 0) for name in feature_names[14:]]

        logger.info("Final input features: %s", combined_features)

        if len(combined_features) != 24:
            raise ValueError(f"Node {self.node_id} does not have 24 features, it has {len(combined_features)} features.")

        return combined_features




    def predict(self, links, api_url):
        logger.info("Prediction started for node %s.", self.node_id)
        features = self.input_features(links)

        response = requests.post(api_url, json={"features": features, "node_id": self.node_id})  # Include node_id
        if response.status_code == 200:
            response_data = response.json()
            logger.info("Response from Flask API: %s", response_data)

            model_output = response_data['prediction']
            concentrate = [model_output[i] for i in range(3, 9)] + [model_output[i] for i in range(19, 23)]
            tailing = [model_output[i] for i in range(9, 19)]

            node_outputss[self.node_id] = {
                'concentrate': concentrate,
                'tailing': tailing
            }

            self.update_links(links, concentrate_keys, tailing_keys, concentrate, tailing)
        else:
            logger.error("Error calling model API for Node %s: %s, %s", self.node_id, response.status_code, response.text)

    def update_links(self, links, concentrate_keys, tailing_keys, concentrate, tailing):
        logger.info("Updating links for node %s.", self.node_id)

        for link in links.values():
            source_node_id = link.source.get('nodeId') if link.source else None
            source_port_id = link.source.get('portId') if link.source else None

            # Skip updating the link with id 'First_Stream_id'
            if link.link_id == "First_Stream_id":
                logger.info("Skipping update for link %s to preserve initial values.", link.link_id)
                continue

            if source_node_id == self.node_id:
                if source_port_id == 'port3':
                    link.feed = dict(zip(concentrate_keys, concentrate))
                    logger.info("Updated link %s with concentrate: %s", link.link_id, link.feed)
                elif source_port_id == 'port4':
                    link.feed = dict(zip(tailing_keys, tailing))
                    logger.info("Updated link %s with tailing: %s", link.link_id, link.feed)

        logger.info("Finished updating links for node %s.", self.node_id)

    @classmethod
    def from_json(cls, node_id, node_data):
        return cls(
            node_id,
            node_data.get("type"),
            node_data.get("position"),
            node_data.get("ports"),
            node_data.get("cellCharacteristics"),
            node_data.get("size")
        )

############################################################ Class Link ####################################################

class Link:
    def __init__(self, link_id, source, destination, feed, waypoints):
        self.link_id = link_id
        self.source = source
        self.destination = destination
        self.feed = feed
        self.waypoints = waypoints

    @classmethod
    def from_json(cls, link_id, link_data):
        return cls(
            link_id,
            link_data.get("from"),
            link_data.get("to"),
            link_data.get("feed"),
            link_data.get("waypoints")
        )

###################################### extracte boucle  ##############################################

def extract_successors(json_data, current_node_id, traversal_port, max_iterations=10, include_start_node=False):
    successors = []
    links = json_data.get("links", {})
    visited_nodes = set()
    iterations = 0

    if include_start_node:
        successors.append(current_node_id)

    while iterations < max_iterations:
        found_link = False

        for link_info in links.values():
            link_from = link_info.get("from", {})
            from_node_id = link_from.get("nodeId")
            from_port_id = link_from.get("portId")

            if from_node_id == current_node_id and from_port_id == traversal_port:
                link_to = link_info.get("to", {})
                to_node_id = link_to.get("nodeId")

                if to_node_id and to_node_id not in visited_nodes:
                    successors.append(to_node_id)
                    visited_nodes.add(to_node_id)
                    current_node_id = to_node_id
                    found_link = True
                    break

        if not found_link:
            break

        iterations += 1

    return successors

###################################### processing Boucles ##############################################

def iterate_to_convergence_multi_boucle(nodes, links, api_url, boucle_node_ids, convergence_threshold=0.1, max_iterations=2):
    start_time_total = time.time()
    with open('results.txt', 'w') as file:
        file.write("Start of loop processing.\n")

    previous_node_outputs = {node_id: {'concentrate': [0]*10, 'tailing': [0]*10} for boucle_nodes in boucle_node_ids.values() for node_id in boucle_nodes}
    converged = False
    iteration = 0

    while not converged and iteration < max_iterations:
        start_time_iteration = time.time()

        for boucle_id, node_ids in boucle_node_ids.items():
            logger.info("Iteration %d for loop %s.", iteration + 1, boucle_id)

            for node_id in node_ids:
                start_time_node = time.time()

                nodes[node_id].predict(links, api_url)

                end_time_node = time.time()
                node_time = end_time_node - start_time_node

                current_output = node_outputss[node_id]
                with open('results.txt', 'a') as file:
                    file.write(f"Iteration {iteration + 1}, Node ID: {node_id}, Current Output: {current_output},  Time elapsed: {node_time} seconds.\n")

            logger.info("End of iteration %d for loop %s.", iteration + 1, boucle_id)

        end_time_iteration = time.time()
        iteration_time = end_time_iteration - start_time_iteration
        with open('results.txt', 'a') as file:
            file.write(f"Time elapsed for iteration %d: %d seconds.\n" % (iteration + 1, iteration_time))

        converged = True
        for boucle_nodes in boucle_node_ids.values():
            for node_id in boucle_nodes:
                current_output = node_outputss[node_id]
                previous_output = previous_node_outputs[node_id]

                for key in current_output:
                    if any(abs(c - p) > convergence_threshold for c, p in zip(current_output[key], previous_output[key])):
                        converged = False
                        break

                if not converged:
                    break

        if not converged:
            for node_id in previous_node_outputs:
                previous_node_outputs[node_id] = node_outputss[node_id]

        iteration += 1
        logger.info("Iteration %d completed, convergence status: %s", iteration, converged)

    end_time_total = time.time()
    total_time = end_time_total - start_time_total
    with open('results.txt', 'a') as file:
        file.write(f"Total time elapsed for 'iterate_to_convergence_multi_boucle': {total_time} seconds.\n")

##################################################  JSON Finale #####################################################

def generate_final_circuit_json(nodes, links, parsed_data):
    api_json = parsed_data
    final_json = {"links": {}}

    for link_id, link in links.items():
        final_json["links"][link_id] = {
            "id": link.link_id,
            "from": link.source if link.source else {},
            "to": link.destination if link.destination else {},
            "feed": link.feed,
            "waypoints": link.waypoints if link.waypoints else {}
        }

    for node_id, outputs in node_outputss.items():
        concentrate_destination = {}
        tailing_destination = {}

        for link in links.values():
            source_node_id = link.source.get('nodeId') if link.source else None
            if source_node_id == node_id:
                source_port_id = link.source.get('portId')
                if source_port_id == "port3":
                    concentrate_destination = link.destination if link.destination else {}
                elif source_port_id == "port4":
                    tailing_destination = link.destination if link.destination else {}

    # Preserving the initial values of 'First_Stream_id'
    if "First_Stream_id" in parsed_data["links"]:
        final_json["links"]["First_Stream_id"]["feed"] = parsed_data["links"]["First_Stream_id"]["feed"]

    api_json["links"] = final_json["links"]
    return api_json

###################################### Processing Each Node ###########################################################
################################################### Flask API pour model de predictio ###################################################################


#Dictionnaires
nodes = {}
links = {}
# Définition des Clés pour les Données Concentrées et de Queue (Tailing)
concentrate_keys = [
    'totalSolidFlow', 'totalLiquidFlow', 
    'pulpVolumetricFlow', 'solidsSG', 
    'pulpSG', 'solidsFraction', 
    'cuPercentage', 'fePercentage', 'znPercentage', 'pbPercentage'
]

tailing_keys = [
    'totalSolidFlow', 'totalLiquidFlow', 
    'pulpVolumetricFlow', 'solidsSG', 
    'pulpSG', 'solidsFraction', 
    'cuPercentage', 'fePercentage', 'znPercentage', 'pbPercentage'
]
node_outputss = {}
def process_json(parsed_data):
    logger.info("Processing JSON data.")

    api_url = 'http://127.0.0.1:8000/predict'
    nodes = {node_id: Node.from_json(node_id, node_data) for node_id, node_data in parsed_data["nodes"].items()}
    links = {link_id: Link.from_json(link_id, link_data) for link_id, link_data in parsed_data["links"].items()}

    first_cell_node_id = next((node_id for node_id, node in nodes.items() if node.node_type == "Rougher"), None)
    tailing_successors = extract_successors(parsed_data, first_cell_node_id, "port4", include_start_node=True)
    concentrate_successors = extract_successors(parsed_data, first_cell_node_id, "port3")

    boucle_node_ids = {'boucle1': tailing_successors, 'boucle2': concentrate_successors}
    iterate_to_convergence_multi_boucle(nodes, links, api_url, boucle_node_ids)

    final_circuit_json = generate_final_circuit_json(nodes, links, parsed_data)
    return final_circuit_json

##################################### Flask API ##########################""

@app.route('/process-circuit', methods=['POST'])
def process_circuit():
    json_data = request.get_json()
    json_data = json.loads(json_data)

    if not json_data:
        return jsonify({"error": "No JSON data received"}), 400

    try:
        final_json = process_json(json_data)
        logger.info("Received: %s", final_json)
        return jsonify(final_json)
    except Exception as e:
        logger.error("Error processing circuit: %s", str(e))
        return jsonify({"error": str(e)}), 500

@app.route('/fetch-csv-data', methods=['GET'])
def fetch_csv_data():
    try:
        df = pd.read_csv("senario_input.csv")
        return jsonify(df.to_dict(orient='records'))
    except FileNotFoundError:
        return "CSV file not found", 404
    except Exception as e:
        return str(e), 500

@app.route('/')
def home():
    return "Flask app is running!"

if __name__ == '__main__':
    app.run(debug=True)
