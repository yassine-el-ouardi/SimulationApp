
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

        #print(f"dynamique value={dynamic_features}")


        static_feature_keys = [
            "Net Volume", "Pulp Area", "Froth surface area", "Froth thickness", "Air Flow rate",
            "R_inf Ccp", "R_inf Gn", "R_inf Po", "R_inf Sp", "k_max Ccp", "k_max Gn", "k_maxPo", "k_max Sp", 
            "Entrainement Savassi parameters"
        ]
        static_features = [self.cell_characteristics.get(key, None) for key in static_feature_keys]

        if dynamic_features is not None:
            #print(f"Length of provided dynamic_features: {dynamic_features}")
            combined_features = static_features + dynamic_features

        # Validate and log the number of features
        if len(combined_features) != 24:
            raise ValueError(f"Node {self.node_id} does not have 24 features, it has {len(combined_features)} features.")


        return combined_features

   
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



    def update_linksss(self, links, concentrate_keys, tailing_keys, concentrate, tailing):
        # Update the links that are fed by the current cell's output
        
        for link_id, link in links.items():
            # Using the .get method to safely access nodeId and portId
            source_node_id = link.source.get('nodeId') if link.source else None
            source_port_id = link.source.get('portId') if link.source else None

            if source_node_id == self.node_id:
                if source_port_id == 'port3':  # Assuming 'top' port is for concentrate
                    link.feed = dict(zip(concentrate_keys, concentrate))
                    
                elif source_port_id == 'port4':  # Assuming 'bottom' port is for tailing
                    link.feed = dict(zip(tailing_keys, tailing))

    
    def predict(self, links, api_url):
        
        # Extrait les caractéristiques à l'aide de la méthode combine_features de l'objet Node
        
        features = self.input_features(links)
        print(f"[LOG] Prédiction pour le nœud {self.node_id} démarrée.")
        features = self.input_features(links)
        print(f"[LOG] Caractéristiques combinées pour {self.node_id}: {features}")


        #print(f"combined features = {features}")

        # Envoi des données à l'API Flask pour le traitement de la réponse
        response = requests.post(api_url, json={"features": features})
        if response.status_code == 200:
            response_data = response.json()
            print(f"[LOG] Réponse de l'API Flask pour {self.node_id}: {response_data}")

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
file_path = 'chart_state.txt'
with open(file_path, 'r') as file:
    data = file.read()


# Parse the JSON data
parsed_data = json.loads(data)

#Dictionnaires
nodes = {}
links = {}
node_outputss = {}

# Définition des Clés pour les Données Concentrées et de Queue (Tailing)
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


###################################### prossing chaque node ##############################################


# Processing nodes = {}
for node_id, node_data in parsed_data["nodes"].items():
    nodes[node_id] = Node.from_json(node_id, node_data)

# Processing links = {}
for link_id, link_data in parsed_data["links"].items():
    links[link_id] = Link.from_json(link_id, link_data)

###################################### extracte boucle  ##############################################
    
def extract_successors(json_data, current_node_id, current_port_id, max_iterations=10, include_start_node=False):
    successors = []
    links = json_data.get("links", {})
    visited_nodes = set()
    iterations = 0

    while iterations < max_iterations:
        found_link = False

        for link_info in links.values():
            link_from = link_info.get("from", {})
            from_node_id = link_from.get("nodeId")
            from_port_id = link_from.get("portId")

            if from_node_id == current_node_id and from_port_id == current_port_id:
                link_to = link_info.get("to", {})
                to_node_id = link_to.get("nodeId")
                to_port_id = link_to.get("portId")

                if include_start_node and not successors:
                    successors.append(current_node_id)  # Add the start node only if specified

                if to_node_id in visited_nodes:
                    return [node for node in successors if node]  # Remove None and return

                successors.append(to_node_id)
                visited_nodes.add(to_node_id)

                current_node_id = to_node_id
                current_port_id = "port1" if to_port_id == "port3" else "port3"
                found_link = True
                break

        if not found_link or (current_port_id == "port3" and current_node_id == "-1"):
            break
        
        iterations += 1

    return [node for node in successors if node]  # Remove None from the list

# Assuming json_data is already loaded with your JSON content
start_node = "eaa503a4-b098-496d-a80a-f65fbf118a08"
start_port_concentrate = "port3"

successors_concentrate_firstcell = extract_successors(parsed_data, start_node, start_port_concentrate, include_start_node=True)
print("Successors concentrate:", successors_concentrate_firstcell)

start_port_tailing = "port4"

successors_tailing_firstcell = extract_successors(parsed_data, start_node, start_port_tailing)
print("Successors tailing:", successors_tailing_firstcell)

# Dictionnaire contenant les ID de nœuds pour chaque boucle
boucle_node_ids = {
    'boucle1': successors_concentrate_firstcell,
    'boucle2': successors_tailing_firstcell
}

# Afficher le dictionnaire pour vérifier
print("Dictionnaire des boucles de nœuds:", boucle_node_ids)


###################################### prossing Boucles ##############################################

def iterate_to_convergence_multi_boucle(nodes, links, api_url, boucle_node_ids, convergence_threshold=0.01, max_iterations=100):
    # Initialisation des sorties précédentes pour toutes les boucles
    previous_node_outputs = {node_id: {'concentrate': [0]*10, 'tailing': [0]*10} for boucle_nodes in boucle_node_ids.values() for node_id in boucle_nodes}
    converged = False
    iteration = 0

    while not converged and iteration < max_iterations:
        # Boucle sur chaque groupe de boucle
        print("[LOG] Début de l'itération principale.")
        for boucle_id, node_ids in boucle_node_ids.items():
            print(f"[LOG] Début de l'itération {iteration + 1}.")
            # Effectuer les prédictions pour les nœuds de la boucle actuelle
            for node_id in node_ids:
                print(f"[LOG] Traitement du nœud {node_id} dans la boucle {boucle_id}.")
                nodes[node_id].predict(links, api_url)
            print(f"[LOG] Fin de l'itération {iteration + 1}.")
        print("[LOG] Fin de l'itération principale.")

        # Vérifier la convergence pour toutes les boucles
        converged = True
        for boucle_nodes in boucle_node_ids.values():
            for node_id in boucle_nodes:
                current_output = node_outputss[node_id]
                previous_output = previous_node_outputs[node_id]

                for key in current_output:
                    if any(abs(c - p) > convergence_threshold for c, p in zip(current_output[key], previous_output[key])):
                        converged = False
                        break  # Arrêter la vérification dès qu'une non-convergence est détectée

            if not converged:
                break  # Arrêter la vérification des boucles si une non-convergence est déjà détectée

        if not converged:
            # Mise à jour des sorties précédentes pour la prochaine itération pour toutes les boucles
            for node_id in previous_node_outputs:
                previous_node_outputs[node_id] = node_outputss[node_id]

        iteration += 1
        print(f"Iteration {iteration} completed, convergence status: {converged}")


# Dictionnaire contenant les ID de nœuds pour chaque boucle
#boucle_node_ids = {
 #   'boucle1': ['eaa503a4-b098-496d-a80a-f65fbf118a08', '42173ee4-02ee-453e-a97e-23f2f7b67f4a', '0f4780cc-0f10-4b9c-a96f-24b4bfdb3e6d'],
  #  'boucle2': ['3cfdd7af-bfab-4d15-82d1-d9264e17d38c', '41577566-4f1a-4e3c-8bd6-98734f9515be', 'f445318a-944f-483b-b3b1-d06da5b41ca8', '0fba832b-af06-42ec-a1bb-2ecb1c47633a']
#}


# Appel de la fonction avec les boucles multiples
iterate_to_convergence_multi_boucle(nodes, links, api_url, boucle_node_ids, convergence_threshold=0.001, max_iterations=2)
print(" node outputs", node_outputss)




##################################################  Fichier  JSON Finale ###########################################

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



    







