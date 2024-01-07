
############################################ Class Node ###############################################################

class Node:

    def __init__(self, node_id, node_type, position, ports, cell_characteristics, size):
        self.node_id = node_id
        self.node_type = node_type
        self.position = position
        self.ports = ports
        self.cell_characteristics = cell_characteristics
        self.size = size


    # definir les données input et average
    def input_features(self, links):
        dynamic_features = []
        all_feeds = []  # Pour stocker les feeds de toutes les sources entrantes

        # Récupération des Caractéristiques Dynamiques pour chaque Nœud
        for link_id, link in links.items():
            if link.destination and link.destination.get('nodeId', None) == self.node_id:
                all_feeds.append(list(link.feed.values()))

        print("all feed is : ", all_feeds)

        # Remplacer les valeurs None par 0
        filtered_feeds = [[value if value is not None else 0 for value in feed] for feed in all_feeds]

        # Vérifier si la deuxième liste existe et est composée uniquement de zéros
        if len(filtered_feeds) > 1 and all(value == 0 for value in filtered_feeds[1]):
            dynamic_features = filtered_feeds[0]
        elif filtered_feeds:
            dynamic_features = [sum(feed) / len(feed) for feed in zip(*filtered_feeds)]

        print(f"Average dynamique value={dynamic_features}")


        static_feature_keys = [
            "netVolume", "pulpArea", "frothSurfaceArea", "frothThickness", "airFlowRate",
            "R_infCcp", "R_infGn", "R_infPo", "R_infSp", "k_maxCcp", "k_maxGn", "k_maxPo", "k_maxSp", 
            "EntrainementSavassiparameters"
        ]
        static_features = [self.cell_characteristics.get(key, None) for key in static_feature_keys]

        if dynamic_features is not None:
            #print(f"Length of provided dynamic_features: {dynamic_features}")
            combined_features = static_features + dynamic_features
            print(f"input finale ={combined_features}")

        # Validate and log the number of features
        if len(combined_features) != 24:
            raise ValueError(f"Node {self.node_id} does not have 24 features, it has {len(combined_features)} features.")


        return combined_features

    
    def predict(self, links, api_url):
        
        # Extrait les caractéristiques à l'aide de la méthode combine_features de l'objet Node
        
        print(f"[LOG] Prédiction pour le nœud {self.node_id} démarrée.")
        features = self.input_features(links)


        # Envoi des données à l'API Flask pour le traitement de la réponse
        response = requests.post(api_url, json={"features": features})
        if response.status_code == 200:
            response_data = response.json()
            #print(f"[LOG] Réponse de l'API Flask pour {self.node_id}: {response_data}")

            print("--------------------------------------------------------Response from Flask API:------------------------------------------------------------------------", response_data)

            # Assuming the model output is in a key named 'prediction'
            model_output = response_data['prediction']

            # Accessing the model output using indices
            # Split model output into concentrate and tailing (based on your logic)
            concentrate = [model_output[i] for i in range(3, 9)] + [model_output[i] for i in range(19, 23)]
            print(f"concentrate----------={concentrate}")
            tailing = [model_output[i] for i in range(9, 19)]
            print(f"tailing ----------={tailing}")
            # Store the data in node_outputs
            node_outputss[self.node_id] = {
                'concentrate': concentrate,
                'tailing': tailing
            }

            # Appel de la méthode update_links pour mettre à jour les liens
            self.update_links(links, concentrate_keys, tailing_keys, concentrate, tailing)

            print('#############################################################################################################################')

        else:
            print(f"Error calling model API for Node {self.node_id}: {response.status_code}, {response.text}")


    def update_links(self, links, concentrate_keys, tailing_keys, concentrate, tailing):
        # Log avant de commencer la mise à jour
        print(f"Debut de mise à jour des liens pour le nœud {self.node_id}")

        # Parcourir tous les liens pour mettre à jour
        for link_id, link in links.items():
            # Utilisation de la méthode .get pour accéder de manière sûre à nodeId et portId
            source_node_id = link.source.get('nodeId') if link.source else None
            source_port_id = link.source.get('portId') if link.source else None

            # Vérifier si le nœud source du lien correspond à ce nœud
            if source_node_id == self.node_id:
                # Mise à jour basée sur le port
                if source_port_id == 'port3':  # Supposition : 'port3' est pour le concentrate
                    link.feed = dict(zip(concentrate_keys, concentrate))
                    print(f"Mise à jour du lien {link_id} avec concentrate : {link.feed}")
                    
                elif source_port_id == 'port4':  # Supposition : 'port4' est pour le tailing
                    link.feed = dict(zip(tailing_keys, tailing))
                    print(f"Mise à jour du lien {link_id} avec tailing : {link.feed}")

        # Log après la fin de la mise à jour
        print(f"Fin de mise à jour des liens pour le nœud {self.node_id}")

    
    #juste pour affichage d'info
    def get_sources(self, links):
        sources = []
        for link_id, link in links.items():
            if 'nodeId' in link.destination and link.destination['nodeId'] == self.node_id:
                if 'nodeId' in link.source:  # Check if nodeId exists in source
                    source_node_id = link.source['nodeId']
                    source_port_id = link.source['portId']
                    sources.append((source_node_id, source_port_id, link.destination['portId']))
        return sources
    


        
    @classmethod
    #Crée une instance de node à partir de données JSON.
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
    def __init__(self, link_id, source, destination, feed):
        self.link_id = link_id
        self.source = source  #from
        self.destination = destination  #to
        self.feed = feed

    @classmethod
    #Crée une instance de Link à partir de données JSON.
    def from_json(cls, link_id, link_data):
        return cls(
            link_id,
            link_data.get("from"),
            link_data.get("to"),
            link_data.get("feed")
        )
    




################################################### Flask API ###################################################################
    
import json
import requests

# Flask API endpoint URL
api_url = 'http://127.0.0.1:5000/predict'

# Read data from the file
file_path = 'chart_state_finale.txt'
with open(file_path, 'r') as file:
    data = file.read()


# Parse the JSON data
parsed_data = json.loads(data)

#Dictionnaires
nodes = {}
links = {}


# Définition des Clés pour les Données Concentrées et de Queue (Tailing)
concentrate_keys = [
    'totalSolidFlow', 'totalLiquidFlow', 
    'pulpVolumetricFlow', 'olidsSG', 
    'pulpSG', 'solidsFraction', 
    'cuPercentage', 'fePercentage', 'znPercentage', 'pbPercentage'
]

tailing_keys = [
    'totalSolidFlow', 'totalLiquidFlow', 
    'pulpVolumetricFlow', 'olidsSG', 
    'pulpSG', 'solidsFraction', 
    'cuPercentage', 'fePercentage', 'znPercentage', 'pbPercentage'
]


###################################### prossing chaque node ##############################################


# Processing nodes = {}
for node_id, node_data in parsed_data["nodes"].items():
    nodes[node_id] = Node.from_json(node_id, node_data)

# Processing links = {}
for link_id, link_data in parsed_data["links"].items():
    links[link_id] = Link.from_json(link_id, link_data)

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
# Assuming json_data is already loaded with your JSON content
try:
    parsed_data = json.loads(data) # Replace with actual JSON string or file load
    # Initialiser une variable pour stocker l'ID du nœud de type 'First Cell'
    first_cell_node_id = None

    # Parcourir tous les nœuds pour trouver celui de type 'First Cell'
    for node_id, node in nodes.items():
        if node.node_type == "First Cell":
            first_cell_node_id = node_id
            break  # Arrêter la boucle une fois le premier nœud 'First Cell' trouvé

    # Afficher l'ID du nœud 'First Cell'
    if first_cell_node_id:
        print("L'ID du nœud 'First Cell' est :", first_cell_node_id)
    else:
        print("Aucun nœud 'First Cell' trouvé.")


    # Assuming json_data is already loaded with your JSON content
    start_node = first_cell_node_id
        


     # Tailing stream
    tailing_successors = extract_successors(parsed_data, start_node, "port4",include_start_node=True)
    print("Tailing stream successors:", tailing_successors)

    # Concentrate stream
    concentrate_successors = extract_successors(parsed_data, start_node, "port3")
    print("Concentrate stream successors:", concentrate_successors)

    # Dictionnaire contenant les ID de nœuds pour chaque boucle
    boucle_node_ids = {
        'boucle1': tailing_successors,
        'boucle2': concentrate_successors
    }
    # Afficher le dictionnaire pour vérifier
    print("Dictionnaire des boucles de nœuds:", boucle_node_ids)


except ValueError as e:
    print("Error:", e)
except json.JSONDecodeError:
    print("Error: Failed to parse JSON data.")












###################################### prossing Boucles ##############################################

node_outputss = {}

def iterate_to_convergence_multi_boucle(nodes, links, api_url, boucle_node_ids, convergence_threshold=0.1, max_iterations=1):
    # Dictionnaire pour stocker les sorties précédentes des nœuds
    previous_node_outputs = {node_id: {'concentrate': [0]*10, 'tailing': [0]*10} for boucle_nodes in boucle_node_ids.values() for node_id in boucle_nodes}
    converged = False
    iteration = 0

    while not converged and iteration < max_iterations:
        for boucle_id, node_ids in boucle_node_ids.items():
            print(f"[LOG] Début de l'itération {iteration + 1} pour la boucle {boucle_id}.")
            for node_id in node_ids:
                print(f"[LOG] Traitement du nœud {node_id} dans la boucle {boucle_id}.")
                nodes[node_id].predict(links, api_url)

                # Récupération des résultats actuels et écriture dans le fichier
                current_output = node_outputss[node_id]
                with open('results.txt', 'a') as file:
                    file.write(f"Iteration {iteration + 1}, Node ID: {node_id}, Current Output: {current_output}\n")
            print(f"[LOG] Fin de l'itération {iteration + 1} pour la boucle {boucle_id}.")

        # Vérification de la convergence pour toutes les boucles
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
            # Mise à jour des sorties précédentes pour la prochaine itération
            for node_id in previous_node_outputs:
                previous_node_outputs[node_id] = node_outputss[node_id]

        iteration += 1
        print(f"Iteration {iteration} completed, convergence status: {converged}")





# Appel de la fonction avec les boucles multiples
iterate_to_convergence_multi_boucle(nodes, links, api_url, boucle_node_ids)
#print(" node outputs", node_outputss)





##################################################  Fichier  JSON Finale ###########################################

def generate_final_circuit_json(nodes, links):
    with open(file_path, 'r') as file:
        api_json = json.load(file)

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
    for node_id, outputs in node_outputss.items():
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
    
    # Étape 4 : Remplacer les liens dans api_json par ceux de final_json
    api_json["links"] = final_json["links"]



    return api_json


final_circuit_json = generate_final_circuit_json(nodes, links)

print(json.dumps(final_circuit_json, indent=4))
    

# Enregistrer le JSON dans un fichier nommé 'final_circuit.json'
with open('final_circuit.json', 'w') as file:
    json.dump(final_circuit_json, file, indent=4)

# Afficher le chemin du fichier
print("Le fichier 'final_circuit.json' a été enregistré avec succès.")





