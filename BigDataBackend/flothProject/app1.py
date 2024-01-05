class Node:
    def __init__(self, node_id, node_type, position, ports, cell_characteristics, size):
        self.node_id = node_id
        self.node_type = node_type
        self.position = position
        self.ports = ports
        self.cell_characteristics = cell_characteristics
        self.size = size
        self.output_connections = {}  # Dictionary to store output connections
        self.input_connections={}
        self.related_links = []  # Initialize as an empty list
  # New property to store related links
    def add_related_link(self, link):
        self.related_links.append(link)
    # In the Node class, add this method
    def average_inputs(self):
        # Assuming each port can have multiple feeds, we combine them by averaging
        for port_id, feeds in self.input_connections.items():
            if len(feeds) > 1:  # More than one feed for this port, need to average
                averaged_feed = {}
                num_feeds = len(feeds)
                for key in feeds[0].feed.keys():  # Assuming all feeds have the same structure
                    averaged_feed[key] = sum(feed.feed[key] for feed in feeds) / num_feeds
                self.ports[port_id]['feed'] = averaged_feed
            elif len(feeds) == 1:  # Only one feed, just use it
                self.ports[port_id]['feed'] = feeds[0].feed

    def extract_features(self, dynamic_features=None):
        # Static features from cell_characteristics
        static_feature_keys = [
            "Net Volume", "Pulp Area", "Froth surface area", "Froth thickness", "Air Flow rate",
            "R_inf Ccp", "R_inf Gn", "R_inf Po", "R_inf Sp", "k_max Ccp", "k_max Gn", "k_max Po", "k_max Sp", 
            "Entrainement Savassi parameters"
        ]
        static_features = [self.cell_characteristics.get(key, None) for key in static_feature_keys]

        # Dynamic features from related links
        # Use provided dynamic features if available (for cell_2 and onwards)
        if dynamic_features is not None:
            print(f"Length of provided dynamic_features: {dynamic_features}")
            combined_features = static_features + dynamic_features
        else:
            # For cell_1, extract dynamic features from the firstLink
            link = links.get('First_Stream_id')
            if link:
                dynamic_features = list(link.feed.values())[:10]  # Assuming 10 dynamic features from firstLink
                print(f"Length of dynamic_features from link: {len(dynamic_features)}")
                combined_features = static_features + dynamic_features
            else:
                combined_features = static_features  # Fallback in case no dynamic data is available

        # Validate and log the number of features
        if len(combined_features) != 24:
            raise ValueError(f"Node {self.node_id} does not have 24 features, it has {len(combined_features)} features.")

        return combined_features

    def set_alimentation_feed(self, feed_data, port_id):
        # Ensure the port exists
        if port_id not in self.ports:
            raise ValueError(f"Port {port_id} does not exist in node {self.node_id}")

        # Set the feed data as the dynamic features for this node's port
        self.ports[port_id]['feed'] = feed_data
    def add_input_connection(self, port_id, source_node, source_port_id):
        # This method should add the source node and its port to the input connections of the node.
        # Assuming you want to track input connections similar to output connections:
        if port_id not in self.ports:
            raise ValueError(f"Port with ID {port_id} does not exist in node {self.node_id}.")
        
        # You can structure input_connections similarly to output_connections if needed.
        # For example:
        if not hasattr(self, 'input_connections'):
            self.input_connections = {}  # Initialize if it doesn't exist
        
        self.input_connections[port_id] = (source_node, source_port_id)
    def add_output_connection(self, port_id, destination_node, destination_port):
        if port_id not in self.ports:
            raise ValueError(f"Port with ID {port_id} does not exist.")

        self.output_connections[port_id] = (destination_node, destination_port)
    def get_sources(self, links):
        sources = []
        for link_id, link in links.items():
            if 'nodeId' in link.destination and link.destination['nodeId'] == self.node_id:
                if 'nodeId' in link.source:  # Check if nodeId exists in source
                    source_node_id = link.source['nodeId']
                    source_port_id = link.source['portId']
                    sources.append((source_node_id, source_port_id, link.destination['portId']))
        return sources

    def get_node_info(self):
        return f"Node ID: {self.node_id}, Type: {self.node_type}, Position: {self.position}, Ports: {self.ports}, Characteristics: {self.cell_characteristics}, Size: {self.size}"
    def has_multiple_inputs(self, port_id):
        # Check if a port has multiple input links
        return len([link for link in self.related_links if links[link].destination.get('portId') == port_id]) > 1


    def aggregate_input_links(self, port_id):
        # Aggregate feeds from multiple input links for a specific port
        input_link_ids = [link for link in self.related_links if links[link].destination.get('portId') == port_id]
        if len(input_link_ids) == 1:
            return list(links[input_link_ids[0]].feed.values())
        
        # Assuming two links maximum as per your constraints
        feeds = [links[link_id].feed for link_id in input_link_ids]
        aggregated_feed = [sum(feed[key] for feed in feeds) / len(feeds) for key in feeds[0]]
        return aggregated_feed
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
    def get_connections(self):
        return self.output_connections
class Link:
    def __init__(self, link_id, source, destination, feed):
        self.link_id = link_id
        self.source = source
        self.destination = destination
        self.feed = feed

    @classmethod
    def from_json(cls, link_id, link_data):
        return cls(
            link_id,
            link_data.get("from"),
            link_data.get("to"),
            link_data.get("feed")
        )
    def connect_nodes(self, nodes):
        source_node_id = self.source.get('nodeId') if self.source else None
        destination_node_id = self.destination.get('nodeId') if self.destination else None

        # Handling the case where there is no source node (alimentation feed)
        if source_node_id is None and destination_node_id in nodes:
            dest_node = nodes[destination_node_id]
            # Providing the port_id when setting the alimentation feed
            dest_port_id = self.destination.get('portId')
            dest_node.set_alimentation_feed(self.feed, dest_port_id)

        elif source_node_id in nodes and destination_node_id in nodes:
            source_node = nodes[source_node_id]
            dest_node = nodes[destination_node_id]
            source_port_id = self.source.get('portId')
            dest_port_id = self.destination.get('portId')
            source_node.add_output_connection(source_port_id, dest_node, dest_port_id)
            dest_node.add_input_connection(dest_port_id, source_node, source_port_id)
        else:
            # Check if the source or destination node types are 'Scavanger' or 'Cleaner'
            source_node_type = nodes.get(source_node_id).node_type if source_node_id in nodes else None
            destination_node_type = nodes.get(destination_node_id).node_type if destination_node_id in nodes else None

            if source_node_type not in ['Scavanger', 'Cleaner'] and destination_node_type not in ['Scavanger', 'Cleaner']:
                print(f"Invalid link with ID {self.link_id}: Source or destination nodes not found.")
    # Establish connections between nodes based on links
##################################################################################################################################
# class Cell:
#     def __init__(self, cell_id, static_features, dynamic_features=None):
#         self.cell_id = cell_id
#         self.static_features = static_features
#         self.dynamic_features = dynamic_features if dynamic_features else []

#     def set_dynamic_features(self, dynamic_features):
#         self.dynamic_features = dynamic_features

#     def get_combined_features(self):
#         return self.static_features + self.dynamic_features
import json

# Read data from the file
file_path = 'chart_state[1].txt'
with open(file_path, 'r') as file:
    data = file.read()

# Parse the JSON data
parsed_data = json.loads(data)
cells = []
# for cell_key, cell_data in parsed_data['nodes'].items():
#         cell_id = cell_data['id']
#         static_features = cell_data['cellCharacteristics']
#         print(static_features)
#         dynamic_features = cell_data.get('dynamicFeatures', [])  # Assume dynamicFeatures key is optional
#         cell = Cell(cell_id, static_features, dynamic_features)
#         print(dynamic_features)
#         cells.append(cell)
# print(cells)
nodes = {}
links = {}

# Processing nodes
for node_id, node_data in parsed_data["nodes"].items():
    nodes[node_id] = Node.from_json(node_id, node_data)

# Processing links
for link_id, link_data in parsed_data["links"].items():
    links[link_id] = Link.from_json(link_id, link_data)

for link_id, link in links.items():
    link.connect_nodes(nodes)
print("Nodes:")
for node_id, node in nodes.items():
    print(f"Node ID: {node_id}, Node Type: {node.node_type}")
print("-------------------------------------------------------------------------------------------------------------------------")

for link_id, link in links.items():
     print(f"Link ID: {link_id}, Source: {link.source}, Destination: {link.destination}")
print("------------------------------------------------------------------------------------------------")

# print("\nLinks:")
# Print nodes and their connections

# Assuming nodes is a dictionary containing all your Node objects
# Assuming nodes is a dictionary containing all your Node objects
for node_id, node in nodes.items():
    print(f"Node ID: {node_id}, Node Type: {node.node_type}")
    connections = node.get_connections()
    
    if connections:
        print("Connections:")
        for port, connection in connections.items():
            destination_node, destination_port = connection
            print(f" {port} -> Destination Node: {destination_node.node_type}, {destination_port}")
    else:
        print("No connections")
    
    # Afficher les sources pour chaque nœud
    sources = node.get_sources(links)
    if sources:
        print(f"Sources:")
        for source_node_id, source_port_id, destination_port in sources:
            source_node_type = nodes[source_node_id].node_type
            print(f"  {source_node_type}, {source_port_id} ->  {destination_port}")
    else:
        print("No sources")
    print("--------------------------------------------------------------------")



node_id_to_retrieve = 'eaa503a4-b098-496d-a80a-f65fbf118a08'
if node_id_to_retrieve in nodes:
    specific_node = nodes[node_id_to_retrieve]
    print(specific_node.get_node_info())

# After the nodes and links are connected...
for node_id, node in nodes.items():
    features = node.extract_features()
    print(f"Node ID: {node_id}, Features: {features},it has {len(features)} features.")
    if len(features) != 24:
        print(f"Warning: Node {node_id} does not have 24 features, it has {len(features)} features.")



import requests
import json

# Flask API endpoint URL
api_url = 'http://127.0.0.1:5000/predict'

# Function to update links with new dynamic data
def update_link_dynamic_data(links, source_node_id, port_id_concentrate, port_id_tailing, concentrate_data, tailing_data):
    concentrate_keys = ['Total Solids Flow_Concentrate', 'Total Liquid Flow_Concentrate', 
                        'Pulp Volumetric Flow_Concentrate', 'Solids SG_Concentrate', 
                        'Pulp SG_Concentrate', 'Solids Fraction_Concentrate', 
                        'Cu_Concentrate', 'Fe_Concentrate', 'Pb_Concentrate', 'Zn_Concentrate']

    tailing_keys = ['Total Solids Flow_Tailings', 'Total Liquid Flow_Tailings', 
                    'Pulp Volumetric Flow_Tailings', 'Solids SG_Tailings', 
                    'Pulp SG_Tailings', 'Solids Fraction_Tailings', 
                    'Cu_Tails', 'Fe_Tails', 'Pb_Tails', 'Zn_Tails']

    for link_id, link in links.items():
        # Safely get nodeId and portId from link.source
        source_node_id_link = link.source.get('nodeId') if link.source else None
        source_port_id = link.source.get('portId') if link.source else None

        if source_node_id_link == source_node_id:
            # Update based on port ID
            if source_port_id == port_id_concentrate:  # Concentrate port
                link.feed.update(dict(zip(concentrate_keys, concentrate_data)))
            elif source_port_id == port_id_tailing:  # Tailing port
                link.feed.update(dict(zip(tailing_keys, tailing_data)))

print('-------------------------------------client side----------------------------------------------------------------')
# Dictionary to store the dynamic features for each cell based on the model output
concentrate_keys = [
    'Total Solids Flow_Concentrate', 'Total Liquid Flow_Concentrate', 
    'Pulp Volumetric Flow_Concentrate', 'Solids SG_Concentrate', 
    'Pulp SG_Concentrate', 'Solids Fraction_Concentrate', 
    'Cu_Concentrate', 'Fe_Concentrate', 'Pb_Concentrate', 'Zn_Concentrate'
]

tailing_keys = [
    'Total Solids Flow_Tailings', 'Total Liquid Flow_Tailings', 
    'Pulp Volumetric Flow_Tailings', 'Solids SG_Tailings', 
    'Pulp SG_Tailings', 'Solids Fraction_Tailings', 
    'Cu_Tails', 'Fe_Tails', 'Pb_Tails', 'Zn_Tails'
]
# Dictionary to store concentrate and tailing data for each node
node_outputs = {}

# Assuming 'nodes' and 'links' are dictionaries containing your Node and Link objects
for node_id, node in nodes.items():
    dynamic_features = []
    if node_id == 'eaa503a4-b098-496d-a80a-f65fbf118a08':
        # Special handling for cell_1 to pull dynamic features from 'firstLink'
        if 'First_Stream_id' in links and links['First_Stream_id'].feed:
            dynamic_features = list(links['First_Stream_id'].feed.values())
    else:
        # For other cells, pull dynamic features based on links where this cell is the destination
        for link_id, link in links.items():
            if link.destination and link.destination.get('nodeId', None) == node_id:
                dynamic_features = list(link.feed.values())
                print(f"dynamique value={dynamic_features}")

    features = node.extract_features(dynamic_features=dynamic_features)  
    print(f"extract features = {features}")
    # Send data to Flask API
    response = requests.post(api_url, json={"features": features})
    if response.status_code == 200:
        response_data = response.json()

        # Split model output into concentrate and tailing (based on your logic)
       # Assuming the model output is in a key named 'prediction'
        print("Response from Flask API:------------------------------------------------", response_data)

        model_output = response_data['prediction']

        # Accessing the model output using indices
        concentrate = [model_output[i] for i in range(3, 9)] + [model_output[i] for i in range(19, 23)]
        print(f"concentrate----------={concentrate}")
        tailing = [model_output[i] for i in range(9, 19)]
        print(f"tailing ----------={tailing}")
        # Store the data in node_outputs
        node_outputs[node_id] = {
            'concentrate': concentrate,
            'tailing': tailing
        }
        # Update the links that are fed by the current cell's output
        for link_id, link in links.items():
            # Using the .get method to safely access nodeId and portId
            source_node_id = link.source.get('nodeId') if link.source else None
            source_port_id = link.source.get('portId') if link.source else None

            if source_node_id == node_id:
                if source_port_id == 'port3':  # Assuming 'top' port is for concentrate
                    link.feed = dict(zip(concentrate_keys, concentrate))
                elif source_port_id == 'port4':  # Assuming 'bottom' port is for tailing
                    link.feed = dict(zip(tailing_keys, tailing))

        # Update links with new dynamic data
        update_link_dynamic_data(links, node_id, 'port3', 'port4', concentrate, tailing)

        print('---------------------------------------------------------------------------------------')

    else:
        print(f"Error calling model API for Node {node_id}: {response.status_code}, {response.text}")
def generate_final_circuit_json(nodes, links):
    final_json = {"links": {}}

    for link_id, link in links.items():
        
        
        # Add link details and model prediction data to the final JSON
        final_json["links"][link_id] = {
            "id": link.link_id,
            "source": link.source if link.source else {},
            "destination": link.destination if link.destination else {},
            "feed": link.feed  # This contains the concentrate/tailing data
        }

    # Additionally, add links for concentrate and tailing with no destination
    # Add links for concentrate and tailing outputs
    # Add links for concentrate and tailing outputs with actual or no destinations
    for node_id, outputs in node_outputs.items():
        # Initialize the destinations for concentrate and tailing
        concentrate_destination = {}
        tailing_destination = {}
        # Check if there is a link where this node is the source
        for link_id, link in links.items():
            source_node_id = link.source.get('nodeId') if link.source else None
            if source_node_id == node_id:
                source_port_id = link.source.get('portId')
                if source_port_id == "port3":  # Assuming 'top' port is for concentrate
                    concentrate_destination = link.destination if link.destination else {}
                elif source_port_id == "port4":  # Assuming 'bottom' port is for tailing
                    tailing_destination = link.destination if link.destination else {}

        # Add concentrate link with detailed keys and destination
        concentrate_link_id = f"{node_id}_concentrate"
        final_json["links"][concentrate_link_id] = {
            "id": concentrate_link_id,
            "source": {"nodeId": node_id, "portId": "port3"},
            "destination": concentrate_destination,
            "feed": dict(zip(concentrate_keys, outputs.get('concentrate', [])))
        }

        # Add tailing link with detailed keys and destination
        tailing_link_id = f"{node_id}_tailing"
        final_json["links"][tailing_link_id] = {
            "id": tailing_link_id,
            "source": {"nodeId": node_id, "portId": "port4"},
            "destination": tailing_destination,
            "feed": dict(zip(tailing_keys, outputs.get('tailing', [])))
        }

    return final_json
final_circuit_json = generate_final_circuit_json(nodes, links)
print(json.dumps(final_circuit_json, indent=4))
