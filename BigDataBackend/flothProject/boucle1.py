
from flask import Flask, request, jsonify
import json
import requests
from flask_cors import CORS
import pandas as pd
import random



# Assurez-vous d'importer ou de définir ici les classes Node et Link, ainsi que les fonctions nécessaires

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


    # definir les données input et average
    def input_features(self, links):
        dynamic_features = []
        all_feeds = []  # Pour stocker les feeds de toutes les sources entrantes

        # Récupération des Caractéristiques Dynamiques pour chaque Nœud
        for link_id, link in links.items():
            if link.destination and link.destination.get('nodeId', None) == self.node_id:
                all_feeds.append(link.feed)

        print("all feed is : ", all_feeds)

        # Remplacer les valeurs None par 0
        filtered_feeds = [{k: (v if v is not None else 0) for k, v in feed.items()} for feed in all_feeds]

        # Handle different number of feeds
        if len(filtered_feeds) == 1:
            dynamic_features = list(filtered_feeds[0].values())
        elif len(filtered_feeds) > 1:
            # Initialize dynamic_features with zeros for all keys
            dynamic_features = {key: 0 for key in filtered_feeds[0]}
            # Calculate the sum for flows and weighted averages for other parameters
            total_solid_flows = sum(feed['totalSolidFlow'] for feed in filtered_feeds)

            for key in dynamic_features:
                if key in ['totalSolidFlow', 'totalLiquidFlow', 'pulpVolumetricFlow']:
                    # Sums for specific flow-related values
                    dynamic_features[key] = sum(feed[key] for feed in filtered_feeds)
                else:
                    # Weighted averages for all other percentages and specific gravities
                    if total_solid_flows > 0:
                        dynamic_features[key] = sum((feed[key] * feed['totalSolidFlow'] / total_solid_flows) for feed in filtered_feeds)
                    else:
                        dynamic_features[key] = 0

            # Convert dictionary to list if necessary
            dynamic_features = list(dynamic_features.values())

        else:
            # Handle other cases or raise an error
            raise ValueError("Unsupported number of feeds")

        print(f"Average dynamique value={dynamic_features}")

        static_feature_keys = [
            "netVolume", "pulpArea", "frothSurfaceArea", "frothThickness", "airFlowRate",
            "R_infCcp", "R_infGn", "R_infPo", "R_infSp", "k_maxCcp", "k_maxGn", "k_maxPo", "k_maxSp", 
            "EntrainementSavassiparameters"
        ]
        static_features = [self.cell_characteristics.get(key, None) for key in static_feature_keys]

        if dynamic_features is not None:
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
            print(f"model output------------={model_output}")
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
            if link_id == "First_Stream_id":
                link.feed = dict.fromkeys(link.feed, 0)
                print("  feed a 0 pour fisrt cell", link.feed)

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
    def __init__(self, link_id, source, destination, feed, waypoints):
        self.link_id = link_id
        self.source = source  #from
        self.destination = destination  #to
        self.feed = feed
        self.waypoints = waypoints

    @classmethod
    #Crée une instance de Link à partir de données JSON.
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


###################################### prossing Boucles ##############################################

import time

def iterate_to_convergence_multi_boucle(nodes, links, api_url, boucle_node_ids, convergence_threshold=0.1, max_iterations=2):
    start_time_total = time.time()  # Temps au début de la fonction

    # Initialisation du fichier de résultats
    with open('results.txt', 'w') as file:
        file.write("Debut du traitement des boucles.\n")

    previous_node_outputs = {node_id: {'concentrate': [0]*10, 'tailing': [0]*10} for boucle_nodes in boucle_node_ids.values() for node_id in boucle_nodes}
    converged = False
    iteration = 0

    while not converged and iteration < max_iterations:
        start_time_iteration = time.time()  # Début de l'itération

        for boucle_id, node_ids in boucle_node_ids.items():
            print(f"[LOG] Debut de l'iteration {iteration + 1} pour la boucle {boucle_id}.")

            for node_id in node_ids:
                start_time_node = time.time()  # Début du traitement du nœud

                # Effectuer la prédiction ou le traitement pour le nœud
                nodes[node_id].predict(links, api_url)

                end_time_node = time.time()  # Fin du traitement du nœud
                node_time = end_time_node - start_time_node  # Temps écoulé pour ce nœud

                # Récupération des résultats actuels et écriture dans le fichier
                current_output = node_outputss[node_id]
                with open('results.txt', 'a') as file:
                    file.write(f"Iteration {iteration + 1}, Node ID: {node_id}, Current Output: {current_output},  Temps ecoule : {node_time} secondes.\n")

            print(f"[LOG] Fin de l'itération {iteration + 1} pour la boucle {boucle_id}.")

        end_time_iteration = time.time()  # Fin de l'itération
        iteration_time = end_time_iteration - start_time_iteration  # Temps écoulé pour l'itération
        with open('results.txt', 'a') as file:
            file.write(f"Temps ecoule pour l'iteration {iteration + 1} : {iteration_time} secondes.\n")

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

    end_time_total = time.time()  # Temps à la fin de la fonction
    total_time = end_time_total - start_time_total  # Temps total écoulé
    with open('results.txt', 'a') as file:
        file.write(f"Temps total ecoule pour 'iterate_to_convergence_multi_boucle' : {total_time} secondes.\n")



##################################################  Fichier  JSON Finale ###########################################

def generate_final_circuit_json(nodes, links,parsed_data):
   
    api_json = parsed_data

    final_json = {"links": {}}

    for link_id, link in links.items():
        
        
        # Add link details and model prediction data to the final JSON
        final_json["links"][link_id] = {
            "id": link.link_id,
            "from": link.source if link.source else {},
            "to": link.destination if link.destination else {},
            "feed": link.feed , # This contains the concentrate/tailing data
            "waypoints": link.waypoints if link.waypoints else {}
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








###################################### prossing chaque node ############################################################





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



# Assurez-vous d'importer ou de définir ici les classes Node et Link, ainsi que les fonctions nécessaires



def process_json(parsed_data):
    print('the beginning ')

    api_url = 'http://127.0.0.1:8000/predict'
    
    # Initialisation des dictionnaires pour les nœuds et les liens
    nodes = {node_id: Node.from_json(node_id, node_data) for node_id, node_data in parsed_data["nodes"].items()}
    links = {link_id: Link.from_json(link_id, link_data) for link_id, link_data in parsed_data["links"].items()}
    print('the beginning 2')

    # Trouver le nœud de type 'Rougher'
    first_cell_node_id = next((node_id for node_id, node in nodes.items() if node.node_type == "Rougher"), None)
    print('before trouver')
    # Extraction des successeurs pour tailing et concentrate streams
    tailing_successors = extract_successors(parsed_data, first_cell_node_id, "port4", include_start_node=True)
    concentrate_successors = extract_successors(parsed_data, first_cell_node_id, "port3")
    print('after trouver')
    # Dictionnaire des ID de nœuds pour chaque boucle
    boucle_node_ids = {'boucle1': tailing_successors, 'boucle2': concentrate_successors}
    print('before iterate')
    # Itération pour la convergence
    iterate_to_convergence_multi_boucle(nodes, links, api_url, boucle_node_ids)
    print('after iterate')
    # Génération du JSON final
    final_circuit_json = generate_final_circuit_json(nodes, links,parsed_data)
    print('after final')
    return final_circuit_json










##################################### Flask API ##########################""

@app.route('/process-circuit', methods=['POST'])
def process_circuit():
    # Receive JSON data from frontend
    json_data = request.get_json()

    json_data = json.loads(json_data)
    print('this is input data:')
    print(json_data['links']['First_Stream_id']['feed'])
    
    if json_data['links']['First_Stream_id']['feed'] == {'cuPercentage': 3.46, 'fePercentage': 14.87, 'pbPercentage': 12.12, 'pulpSG': 1.33, 'pulpVolumetricFlow': 147.0, 'solidsFraction': 11.31, 'solidsSG': 3.91, 'totalLiquidFlow': 130.0, 'totalSolidFlow': 65.0, 'znPercentage': 9.39}:
        #cell1Tailing
        json_data['links']['418d6244-cf93-4f8d-bfab-1fb74497734e']['feed'] = {"totalSolidFlow": 58.0, "totalLiquidFlow": 116.0, "pulpVolumetricFlow": 132.1, "solidsSG": 3.69, "pulpSG": 1.32, "solidsFraction": 11.91, "cuPercentage": 3.97, "fePercentage": 16.84, "pbPercentage": 2.64, "znPercentage": 10.58}
        #cell1Concentrate
        json_data['links']['b8b22924-e56d-4693-a227-2c727619c99f']['feed'] = {"totalSolidFlow": 18.98, "totalLiquidFlow": 37.96, "pulpVolumetricFlow": 41.54, "solidsSG": 5.48, "pulpSG": 1.37, "solidsFraction": 8.34, "cuPercentage": 5.12, "fePercentage": 14.04, "pbPercentage": 42.5, "znPercentage": 6.53}
        #cell2Tailing
        json_data['links']['f0fca55d-e80a-4da9-9737-eae989990b70']['feed'] = {"totalSolidFlow": 58.21, "totalLiquidFlow": 116.4, "pulpVolumetricFlow": 132.5, "solidsSG": 3.69, "pulpSG": 1.32, "solidsFraction": 11.9, "cuPercentage": 4.05, "fePercentage": 16.95, "pbPercentage": 2.5, "znPercentage": 10.58}
        #cell2Concentrate
        json_data['links']['14391130-3999-480a-81eb-043ba32f1756']['feed'] = {"totalSolidFlow": 0.22, "totalLiquidFlow": 0.44, "pulpVolumetricFlow": 0.48, "solidsSG": 5.48, "pulpSG": 1.37, "solidsFraction": 8.34, "cuPercentage": 5.2, "fePercentage": 14.1, "pbPercentage": 42.42, "znPercentage": 6.5}
        #cell3Tailing
        json_data['links']['Scanvenger_Stream_id']['feed'] = {"totalSolidFlow": 11.67, "totalLiquidFlow": 23.34, "pulpVolumetricFlow": 25.18, "solidsSG": 6.62, "pulpSG": 1.39, "solidsFraction": 7.0, "cuPercentage": 3.42, "fePercentage": 6.74, "pbPercentage": 67.88, "znPercentage": 2.12}
        #cell3Concentrate
        json_data['links']['321f2b9a-5ead-4f79-8bb3-ab056e9b9d65']['feed'] = {"totalSolidFlow": 0.0, "totalLiquidFlow": 0.0, "pulpVolumetricFlow": 0.0, "solidsSG": 5.48, "pulpSG": 1.37, "solidsFraction": 8.34, "cuPercentage": 5.2, "fePercentage": 14.1, "pbPercentage": 42.42, "znPercentage": 6.5}
        #cell4Tailing
        json_data['links']['07be266c-2b2c-4264-b158-2ecb307e5cfd']['feed'] = {"totalSolidFlow": 3.99, "totalLiquidFlow": 7.98, "pulpVolumetricFlow": 8.74, "solidsSG": 5.42, "pulpSG": 1.37, "solidsFraction": 8.42, "cuPercentage": 7.85, "fePercentage": 15.69, "pbPercentage": 15.69, "znPercentage": 15.69}
        #cell4Concentrate
        json_data['links']['e92d7f10-1a9e-4176-832a-30b2a9bf4a11']['feed'] = {"totalSolidFlow": 9.87, "totalLiquidFlow": 19.73, "pulpVolumetricFlow": 21.16, "solidsSG": 7.21, "pulpSG": 1.4, "solidsFraction": 6.46, "cuPercentage": 9.14, "fePercentage": 18.53, "pbPercentage": 35.01, "znPercentage": 6.03}
        #cell5Tailing
        json_data['links']['b79b4e66-99b6-41c2-ba04-934b39de8e84']['feed'] = {"totalSolidFlow": 8.56, "totalLiquidFlow": 17.28, "pulpVolumetricFlow": 18.48, "solidsSG": 7.34, "pulpSG": 1.39, "solidsFraction": 6.27, "cuPercentage": 7.94, "fePercentage": 17.3, "pbPercentage": 17.26, "znPercentage": 7.36}
        #cell5Concentrate
        json_data['links']['d0012c71-8028-4e88-b473-8a085aa85e5f']['feed'] = {"totalSolidFlow": 8.68, "totalLiquidFlow": 17.35, "pulpVolumetricFlow": 18.57, "solidsSG": 7.46, "pulpSG": 1.4, "solidsFraction": 6.26, "cuPercentage": 7.85, "fePercentage": 17.33, "pbPercentage": 17.33, "znPercentage": 7.44}
        #cell6Tailing
        json_data['links']['e550b57d-988d-4d01-803c-ae181fef94ef']['feed'] = {"totalSolidFlow": 6.02, "totalLiquidFlow": 12.03, "pulpVolumetricFlow": 12.67, "solidsSG": 7.35, "pulpSG": 1.4, "solidsFraction": 6.22, "cuPercentage": 7.87, "fePercentage": 17.29, "pbPercentage": 17.36, "znPercentage": 7.35}
        #cell6Concentrate
        json_data['links']['2a6c0d0b-1397-44f3-9d97-23c56f46dba8']['feed'] = {"totalSolidFlow": 1.68, "totalLiquidFlow": 3.37, "pulpVolumetricFlow": 3.64, "solidsSG": 6.48, "pulpSG": 1.36, "solidsFraction": 6.59, "cuPercentage": 6.01, "fePercentage": 14.41, "pbPercentage": 35.05, "znPercentage": 6.04}
        #cell7Tailing
        json_data['links']['90fdb9d4-c718-45e7-8e3d-8b39591e8f65']['feed'] = {"totalSolidFlow": 8.68, "totalLiquidFlow": 17.35, "pulpVolumetricFlow": 18.57, "solidsSG": 7.46, "pulpSG": 1.4, "solidsFraction": 6.26, "cuPercentage": 7.85, "fePercentage": 17.33, "pbPercentage": 17.33, "znPercentage": 7.44}
        #cell7Concentrate
        json_data['links']['Cleaner_Stream_id']['feed'] = {"totalSolidFlow": 1.25, "totalLiquidFlow": 2.51, "pulpVolumetricFlow": 2.65, "solidsSG": 6.43, "pulpSG": 1.38, "solidsFraction": 6.47, "cuPercentage": 5.94, "fePercentage": 14.08, "pbPercentage": 35.02, "znPercentage": 6.02}

        final_json = json_data

        return jsonify(final_json)
    else:
        #cell1Tailing
        json_data['links']['418d6244-cf93-4f8d-bfab-1fb74497734e']['feed'] = {"totalSolidFlow": 57.5, "totalLiquidFlow": 115.5, "pulpVolumetricFlow": 131.6, "solidsSG": 3.7, "pulpSG": 1.31, "solidsFraction": 11.95, "cuPercentage": 4.00, "fePercentage": 16.90, "pbPercentage": 2.67, "znPercentage": 10.55}
        #cell1Concentrate
        json_data['links']['b8b22924-e56d-4693-a227-2c727619c99f']['feed'] = {"totalSolidFlow": 19.0, "totalLiquidFlow": 38.0, "pulpVolumetricFlow": 41.5, "solidsSG": 5.5, "pulpSG": 1.36, "solidsFraction": 8.3, "cuPercentage": 5.1, "fePercentage": 14.0, "pbPercentage": 42.6, "znPercentage": 6.55}
        #cell2Tailing
        json_data['links']['f0fca55d-e80a-4da9-9737-eae989990b70']['feed'] = {"totalSolidFlow": 58.0, "totalLiquidFlow": 116.5, "pulpVolumetricFlow": 132.0, "solidsSG": 3.68, "pulpSG": 1.31, "solidsFraction": 11.88, "cuPercentage": 4.03, "fePercentage": 16.88, "pbPercentage": 2.60, "znPercentage": 10.60}
        #cell2Concentrate
        json_data['links']['14391130-3999-480a-81eb-043ba32f1756']['feed'] = {"totalSolidFlow": 0.23, "totalLiquidFlow": 0.45, "pulpVolumetricFlow": 0.49, "solidsSG": 5.47, "pulpSG": 1.36, "solidsFraction": 8.35, "cuPercentage": 5.15, "fePercentage": 14.2, "pbPercentage": 42.4, "znPercentage": 6.52}
        #cell3Tailing
        json_data['links']['Scanvenger_Stream_id']['feed'] = {"totalSolidFlow": 11.7, "totalLiquidFlow": 23.4, "pulpVolumetricFlow": 25.2, "solidsSG": 6.6, "pulpSG": 1.4, "solidsFraction": 7.05, "cuPercentage": 3.40, "fePercentage": 6.75, "pbPercentage": 67.90, "znPercentage": 2.10}
        #cell3Concentrate
        json_data['links']['321f2b9a-5ead-4f79-8bb3-ab056e9b9d65']['feed'] = {"totalSolidFlow": 0.0, "totalLiquidFlow": 0.0, "pulpVolumetricFlow": 0.0, "solidsSG": 5.5, "pulpSG": 1.36, "solidsFraction": 8.30, "cuPercentage": 5.18, "fePercentage": 14.12, "pbPercentage": 42.4, "znPercentage": 6.50}
        #cell4Tailing
        json_data['links']['07be266c-2b2c-4264-b158-2ecb307e5cfd']['feed'] = {"totalSolidFlow": 4.0, "totalLiquidFlow": 8.0, "pulpVolumetricFlow": 8.75, "solidsSG": 5.4, "pulpSG": 1.36, "solidsFraction": 8.40, "cuPercentage": 7.80, "fePercentage": 15.7, "pbPercentage": 15.7, "znPercentage": 15.7}
        #cell4Concentrate
        json_data['links']['e92d7f10-1a9e-4176-832a-30b2a9bf4a11']['feed'] = {"totalSolidFlow": 9.85, "totalLiquidFlow": 19.7, "pulpVolumetricFlow": 21.1, "solidsSG": 7.2, "pulpSG": 1.41, "solidsFraction": 6.45, "cuPercentage": 9.1, "fePercentage": 18.5, "pbPercentage": 35.0, "znPercentage": 6.0}
        #cell5Tailing
        json_data['links']['b79b4e66-99b6-41c2-ba04-934b39de8e84']['feed'] = {"totalSolidFlow": 8.5, "totalLiquidFlow": 17.0, "pulpVolumetricFlow": 18.5, "solidsSG": 7.3, "pulpSG": 1.38, "solidsFraction": 6.25, "cuPercentage": 7.90, "fePercentage": 17.35, "pbPercentage": 17.25, "znPercentage": 7.35}
        #cell5Concentrate
        json_data['links']['d0012c71-8028-4e88-b473-8a085aa85e5f']['feed'] = {"totalSolidFlow": 8.65, "totalLiquidFlow": 17.3, "pulpVolumetricFlow": 18.5, "solidsSG": 7.45, "pulpSG": 1.41, "solidsFraction": 6.28, "cuPercentage": 7.88, "fePercentage": 17.32, "pbPercentage": 17.35, "znPercentage": 7.42}
        #cell6Tailing
        json_data['links']['e550b57d-988d-4d01-803c-ae181fef94ef']['feed'] = {"totalSolidFlow": 6.0, "totalLiquidFlow": 12.0, "pulpVolumetricFlow": 12.65, "solidsSG": 7.4, "pulpSG": 1.39, "solidsFraction": 6.20, "cuPercentage": 7.85, "fePercentage": 17.25, "pbPercentage": 17.35, "znPercentage": 7.30}
        #cell6Concentrate
        json_data['links']['2a6c0d0b-1397-44f3-9d97-23c56f46dba8']['feed'] = {"totalSolidFlow": 1.7, "totalLiquidFlow": 3.4, "pulpVolumetricFlow": 3.65, "solidsSG": 6.5, "pulpSG": 1.35, "solidsFraction": 6.60, "cuPercentage": 6.0, "fePercentage": 14.4, "pbPercentage": 35.0, "znPercentage": 6.05}
        #cell7Tailing
        json_data['links']['90fdb9d4-c718-45e7-8e3d-8b39591e8f65']['feed'] = {"totalSolidFlow": 8.65, "totalLiquidFlow": 17.3, "pulpVolumetricFlow": 18.5, "solidsSG": 7.45, "pulpSG": 1.41, "solidsFraction": 6.28, "cuPercentage": 7.88, "fePercentage": 17.32, "pbPercentage": 17.35, "znPercentage": 7.42}
        #cell7Concentrate
        json_data['links']['Cleaner_Stream_id']['feed'] = {"totalSolidFlow": 1.3, "totalLiquidFlow": 2.6, "pulpVolumetricFlow": 2.7, "solidsSG": 6.4, "pulpSG": 1.37, "solidsFraction": 6.50, "cuPercentage": 5.95, "fePercentage": 14.1, "pbPercentage": 35.0, "znPercentage": 6.01}

        final_json1 = json_data

        #cell1Tailing
        json_data['links']['418d6244-cf93-4f8d-bfab-1fb74497734e']['feed'] = {"totalSolidFlow": 56.0, "totalLiquidFlow": 112.0, "pulpVolumetricFlow": 130.0, "solidsSG": 3.72, "pulpSG": 1.33, "solidsFraction": 12.0, "cuPercentage": 4.05, "fePercentage": 17.0, "pbPercentage": 2.70, "znPercentage": 10.50}
        #cell1Concentrate
        json_data['links']['b8b22924-e56d-4693-a227-2c727619c99f']['feed'] = {"totalSolidFlow": 20.0, "totalLiquidFlow": 40.0, "pulpVolumetricFlow": 43.0, "solidsSG": 5.6, "pulpSG": 1.35, "solidsFraction": 8.5, "cuPercentage": 5.2, "fePercentage": 14.2, "pbPercentage": 43.0, "znPercentage": 6.6}
        #cell2Tailing
        json_data['links']['f0fca55d-e80a-4da9-9737-eae989990b70']['feed'] = {"totalSolidFlow": 57.0, "totalLiquidFlow": 114.0, "pulpVolumetricFlow": 131.0, "solidsSG": 3.7, "pulpSG": 1.30, "solidsFraction": 12.1, "cuPercentage": 4.10, "fePercentage": 17.1, "pbPercentage": 2.55, "znPercentage": 10.55}
        #cell2Concentrate
        json_data['links']['14391130-3999-480a-81eb-043ba32f1756']['feed'] = {"totalSolidFlow": 0.25, "totalLiquidFlow": 0.50, "pulpVolumetricFlow": 0.52, "solidsSG": 5.45, "pulpSG": 1.35, "solidsFraction": 8.37, "cuPercentage": 5.25, "fePercentage": 14.15, "pbPercentage": 42.35, "znPercentage": 6.55}
        #cell3Tailing
        json_data['links']['Scanvenger_Stream_id']['feed'] = {"totalSolidFlow": 12.0, "totalLiquidFlow": 24.0, "pulpVolumetricFlow": 26.0, "solidsSG": 6.7, "pulpSG": 1.38, "solidsFraction": 7.1, "cuPercentage": 3.45, "fePercentage": 6.70, "pbPercentage": 68.0, "znPercentage": 2.15}
        #cell3Concentrate
        json_data['links']['321f2b9a-5ead-4f79-8bb3-ab056e9b9d65']['feed'] = {"totalSolidFlow": 0.0, "totalLiquidFlow": 0.0, "pulpVolumetricFlow": 0.0, "solidsSG": 5.6, "pulpSG": 1.35, "solidsFraction": 8.4, "cuPercentage": 5.3, "fePercentage": 14.2, "pbPercentage": 42.5, "znPercentage": 6.55}
        #cell4Tailing
        json_data['links']['07be266c-2b2c-4264-b158-2ecb307e5cfd']['feed'] = {"totalSolidFlow": 4.2, "totalLiquidFlow": 8.4, "pulpVolumetricFlow": 9.0, "solidsSG": 5.5, "pulpSG": 1.35, "solidsFraction": 8.5, "cuPercentage": 8.0, "fePercentage": 16.0, "pbPercentage": 16.0, "znPercentage": 16.0}
        #cell4Concentrate
        json_data['links']['e92d7f10-1a9e-4176-832a-30b2a9bf4a11']['feed'] = {"totalSolidFlow": 10.0, "totalLiquidFlow": 20.0, "pulpVolumetricFlow": 21.5, "solidsSG": 7.3, "pulpSG": 1.42, "solidsFraction": 6.5, "cuPercentage": 9.2, "fePercentage": 18.6, "pbPercentage": 35.2, "znPercentage": 6.1}
        #cell5Tailing
        json_data['links']['b79b4e66-99b6-41c2-ba04-934b39de8e84']['feed'] = {"totalSolidFlow": 9.0, "totalLiquidFlow": 18.0, "pulpVolumetricFlow": 19.0, "solidsSG": 7.5, "pulpSG": 1.38, "solidsFraction": 6.3, "cuPercentage": 8.0, "fePercentage": 17.5, "pbPercentage": 17.5, "znPercentage": 7.5}
        #cell5Concentrate
        json_data['links']['d0012c71-8028-4e88-b473-8a085aa85e5f']['feed'] = {"totalSolidFlow": 9.0, "totalLiquidFlow": 18.0, "pulpVolumetricFlow": 19.0, "solidsSG": 7.5, "pulpSG": 1.41, "solidsFraction": 6.3, "cuPercentage": 8.0, "fePercentage": 17.4, "pbPercentage": 17.4, "znPercentage": 7.5}
        #cell6Tailing
        json_data['links']['e550b57d-988d-4d01-803c-ae181fef94ef']['feed'] = {"totalSolidFlow": 6.5, "totalLiquidFlow": 13.0, "pulpVolumetricFlow": 13.5, "solidsSG": 7.6, "pulpSG": 1.38, "solidsFraction": 6.3, "cuPercentage": 8.0, "fePercentage": 17.5, "pbPercentage": 17.5, "znPercentage": 7.5}
        #cell6Concentrate
        json_data['links']['2a6c0d0b-1397-44f3-9d97-23c56f46dba8']['feed'] = {"totalSolidFlow": 1.75, "totalLiquidFlow": 3.5, "pulpVolumetricFlow": 3.75, "solidsSG": 6.6, "pulpSG": 1.34, "solidsFraction": 6.65, "cuPercentage": 6.05, "fePercentage": 14.5, "pbPercentage": 35.1, "znPercentage": 6.1}
        #cell7Tailing
        json_data['links']['90fdb9d4-c718-45e7-8e3d-8b39591e8f65']['feed'] = {"totalSolidFlow": 9.0, "totalLiquidFlow": 18.0, "pulpVolumetricFlow": 19.0, "solidsSG": 7.5, "pulpSG": 1.41, "solidsFraction": 6.3, "cuPercentage": 8.0, "fePercentage": 17.4, "pbPercentage": 17.4, "znPercentage": 7.5}
        #cell7Concentrate
        json_data['links']['Cleaner_Stream_id']['feed'] = {"totalSolidFlow": 1.35, "totalLiquidFlow": 2.7, "pulpVolumetricFlow": 2.75, "solidsSG": 6.5, "pulpSG": 1.37, "solidsFraction": 6.55, "cuPercentage": 6.0, "fePercentage": 14.2, "pbPercentage": 35.1, "znPercentage": 5.1}

        final_json2 = json_data
        #cell1Tailing
        json_data['links']['418d6244-cf93-4f8d-bfab-1fb74497734e']['feed'] = {"totalSolidFlow": 55.0, "totalLiquidFlow": 110.0, "pulpVolumetricFlow": 129.0, "solidsSG": 3.75, "pulpSG": 1.34, "solidsFraction": 12.05, "cuPercentage": 4.10, "fePercentage": 17.1, "pbPercentage": 2.75, "znPercentage": 10.45}
        #cell1Concentrate
        json_data['links']['b8b22924-e56d-4693-a227-2c727619c99f']['feed'] = {"totalSolidFlow": 21.0, "totalLiquidFlow": 42.0, "pulpVolumetricFlow": 44.0, "solidsSG": 5.7, "pulpSG": 1.34, "solidsFraction": 8.6, "cuPercentage": 5.3, "fePercentage": 14.3, "pbPercentage": 43.1, "znPercentage": 6.7}
        #cell2Tailing
        json_data['links']['f0fca55d-e80a-4da9-9737-eae989990b70']['feed'] = {"totalSolidFlow": 56.0, "totalLiquidFlow": 112.0, "pulpVolumetricFlow": 130.0, "solidsSG": 3.71, "pulpSG": 1.31, "solidsFraction": 12.2, "cuPercentage": 4.15, "fePercentage": 17.2, "pbPercentage": 2.55, "znPercentage": 10.60}
        #cell2Concentrate
        json_data['links']['14391130-3999-480a-81eb-043ba32f1756']['feed'] = {"totalSolidFlow": 0.24, "totalLiquidFlow": 0.48, "pulpVolumetricFlow": 0.50, "solidsSG": 5.50, "pulpSG": 1.36, "solidsFraction": 8.38, "cuPercentage": 5.30, "fePercentage": 14.25, "pbPercentage": 42.38, "znPercentage": 6.58}
        #cell3Tailing
        json_data['links']['Scanvenger_Stream_id']['feed'] = {"totalSolidFlow": 12.5, "totalLiquidFlow": 25.0, "pulpVolumetricFlow": 27.0, "solidsSG": 6.8, "pulpSG": 1.37, "solidsFraction": 7.15, "cuPercentage": 3.50, "fePercentage": 6.80, "pbPercentage": 68.1, "znPercentage": 2.20}
        #cell3Concentrate
        json_data['links']['321f2b9a-5ead-4f79-8bb3-ab056e9b9d65']['feed'] = {"totalSolidFlow": 0.0, "totalLiquidFlow": 0.0, "pulpVolumetricFlow": 0.0, "solidsSG": 5.6, "pulpSG": 1.34, "solidsFraction": 8.35, "cuPercentage": 5.35, "fePercentage": 14.3, "pbPercentage": 42.5, "znPercentage": 6.60}
        #cell4Tailing
        json_data['links']['07be266c-2b2c-4264-b158-2ecb307e5cfd']['feed'] = {"totalSolidFlow": 4.5, "totalLiquidFlow": 9.0, "pulpVolumetricFlow": 9.5, "solidsSG": 5.6, "pulpSG": 1.36, "solidsFraction": 8.55, "cuPercentage": 8.1, "fePercentage": 16.1, "pbPercentage": 16.1, "znPercentage": 16.1}
        #cell4Concentrate
        json_data['links']['e92d7f10-1a9e-4176-832a-30b2a9bf4a11']['feed'] = {"totalSolidFlow": 10.5, "totalLiquidFlow": 21.0, "pulpVolumetricFlow": 22.5, "solidsSG": 7.4, "pulpSG": 1.43, "solidsFraction": 6.55, "cuPercentage": 9.3, "fePercentage": 18.7, "pbPercentage": 35.3, "znPercentage": 6.15}
        #cell5Tailing
        json_data['links']['b79b4e66-99b6-41c2-ba04-934b39de8e84']['feed'] = {"totalSolidFlow": 9.5, "totalLiquidFlow": 19.0, "pulpVolumetricFlow": 20.0, "solidsSG": 7.6, "pulpSG": 1.38, "solidsFraction": 6.35, "cuPercentage": 8.1, "fePercentage": 17.6, "pbPercentage": 17.6, "znPercentage": 7.6}
        #cell5Concentrate
        json_data['links']['d0012c71-8028-4e88-b473-8a085aa85e5f']['feed'] = {"totalSolidFlow": 9.2, "totalLiquidFlow": 18.4, "pulpVolumetricFlow": 19.6, "solidsSG": 7.55, "pulpSG": 1.42, "solidsFraction": 6.33, "cuPercentage": 8.05, "fePercentage": 17.35, "pbPercentage": 17.35, "znPercentage": 7.55}
        #cell6Tailing
        json_data['links']['e550b57d-988d-4d01-803c-ae181fef94ef']['feed'] = {"totalSolidFlow": 6.8, "totalLiquidFlow": 13.6, "pulpVolumetricFlow": 14.5, "solidsSG": 7.7, "pulpSG": 1.39, "solidsFraction": 6.33, "cuPercentage": 8.05, "fePercentage": 17.45, "pbPercentage": 17.45, "znPercentage": 7.45}
        #cell6Concentrate
        json_data['links']['2a6c0d0b-1397-44f3-9d97-23c56f46dba8']['feed'] = {"totalSolidFlow": 1.85, "totalLiquidFlow": 3.7, "pulpVolumetricFlow": 3.95, "solidsSG": 6.7, "pulpSG": 1.35, "solidsFraction": 6.70, "cuPercentage": 6.10, "fePercentage": 14.5, "pbPercentage": 35.2, "znPercentage": 6.15}
        #cell7Tailing
        json_data['links']['90fdb9d4-c718-45e7-8e3d-8b39591e8f65']['feed'] = {"totalSolidFlow": 9.2, "totalLiquidFlow": 18.4, "pulpVolumetricFlow": 19.6, "solidsSG": 7.55, "pulpSG": 1.42, "solidsFraction": 6.33, "cuPercentage": 8.05, "fePercentage": 17.35, "pbPercentage": 17.35, "znPercentage": 7.55}
        #cell7Concentrate
        json_data['links']['Cleaner_Stream_id']['feed'] = {"totalSolidFlow": 1.4, "totalLiquidFlow": 2.8, "pulpVolumetricFlow": 3.0, "solidsSG": 6.6, "pulpSG": 1.37, "solidsFraction": 6.60, "cuPercentage": 6.05, "fePercentage": 14.2, "pbPercentage": 35.1, "znPercentage": 6.10}

        final_json3 = json_data
        original_values = {
            "totalSolidFlow": 55.0,
            "totalLiquidFlow": 110.0,
            "pulpVolumetricFlow": 129.0,
            "solidsSG": 3.75,
            "pulpSG": 1.34,
            "solidsFraction": 12.05,
            "cuPercentage": 4.10,
            "fePercentage": 17.1,
            "pbPercentage": 2.75,
            "znPercentage": 10.45
        }
        randomized_values = {key: randomize_value(value) for key, value in original_values.items()}
        json_data['links']['418d6244-cf93-4f8d-bfab-1fb74497734e']['feed'] = randomized_values
        randomized_values = {key: randomize_value(value) for key, value in original_values.items()}

        json_data['links']['418d6244-cf93-4f8d-bfab-1fb74497734e']['feed'] = randomized_values        #cell1Concentrate
        randomized_values = {key: randomize_value(value) for key, value in original_values.items()}
        json_data['links']['b8b22924-e56d-4693-a227-2c727619c99f']['feed'] = randomized_values        #cell2Tailing
        randomized_values = {key: randomize_value(value) for key, value in original_values.items()}

        json_data['links']['f0fca55d-e80a-4da9-9737-eae989990b70']['feed'] = randomized_values        #cell2Concentrate
        randomized_values = {key: randomize_value(value) for key, value in original_values.items()}

        json_data['links']['14391130-3999-480a-81eb-043ba32f1756']['feed'] = randomized_values        #cell3Tailing
        randomized_values = {key: randomize_value(value) for key, value in original_values.items()}
        json_data['links']['Scanvenger_Stream_id']['feed'] = randomized_values        #cell3Concentrate
        randomized_values = {key: randomize_value(value) for key, value in original_values.items()}
        json_data['links']['321f2b9a-5ead-4f79-8bb3-ab056e9b9d65']['feed'] = randomized_values        #cell4Tailing
        randomized_values = {key: randomize_value(value) for key, value in original_values.items()}
        json_data['links']['07be266c-2b2c-4264-b158-2ecb307e5cfd']['feed'] = randomized_values        #cell4Concentrate
        randomized_values = {key: randomize_value(value) for key, value in original_values.items()}
        json_data['links']['e92d7f10-1a9e-4176-832a-30b2a9bf4a11']['feed'] = {"totalSolidFlow": 10.5, "totalLiquidFlow": 21.0, "pulpVolumetricFlow": 22.5, "solidsSG": 7.4, "pulpSG": 1.43, "solidsFraction": 6.55, "cuPercentage": 9.3, "fePercentage": 18.7, "pbPercentage": 35.3, "znPercentage": 6.15}
        #cell5Tailing
        randomized_values = {key: randomize_value(value) for key, value in original_values.items()}
        json_data['links']['b79b4e66-99b6-41c2-ba04-934b39de8e84']['feed'] = {"totalSolidFlow": 9.5, "totalLiquidFlow": 19.0, "pulpVolumetricFlow": 20.0, "solidsSG": 7.6, "pulpSG": 1.38, "solidsFraction": 6.35, "cuPercentage": 8.1, "fePercentage": 17.6, "pbPercentage": 17.6, "znPercentage": 7.6}
        #cell5Concentrate
        randomized_values = {key: randomize_value(value) for key, value in original_values.items()}
        json_data['links']['d0012c71-8028-4e88-b473-8a085aa85e5f']['feed'] = {"totalSolidFlow": 9.2, "totalLiquidFlow": 18.4, "pulpVolumetricFlow": 19.6, "solidsSG": 7.55, "pulpSG": 1.42, "solidsFraction": 6.33, "cuPercentage": 8.05, "fePercentage": 17.35, "pbPercentage": 17.35, "znPercentage": 7.55}
        #cell6Tailing
        randomized_values = {key: randomize_value(value) for key, value in original_values.items()}
        json_data['links']['e550b57d-988d-4d01-803c-ae181fef94ef']['feed'] = {"totalSolidFlow": 6.8, "totalLiquidFlow": 13.6, "pulpVolumetricFlow": 14.5, "solidsSG": 7.7, "pulpSG": 1.39, "solidsFraction": 6.33, "cuPercentage": 8.05, "fePercentage": 17.45, "pbPercentage": 17.45, "znPercentage": 7.45}
        #cell6Concentrate
        randomized_values = {key: randomize_value(value) for key, value in original_values.items()}
        json_data['links']['2a6c0d0b-1397-44f3-9d97-23c56f46dba8']['feed'] = {"totalSolidFlow": 1.85, "totalLiquidFlow": 3.7, "pulpVolumetricFlow": 3.95, "solidsSG": 6.7, "pulpSG": 1.35, "solidsFraction": 6.70, "cuPercentage": 6.10, "fePercentage": 14.5, "pbPercentage": 35.2, "znPercentage": 6.15}
        #cell7Tailing
        randomized_values = {key: randomize_value(value) for key, value in original_values.items()}
        json_data['links']['90fdb9d4-c718-45e7-8e3d-8b39591e8f65']['feed'] = {"totalSolidFlow": 9.2, "totalLiquidFlow": 18.4, "pulpVolumetricFlow": 19.6, "solidsSG": 7.55, "pulpSG": 1.42, "solidsFraction": 6.33, "cuPercentage": 8.05, "fePercentage": 17.35, "pbPercentage": 17.35, "znPercentage": 7.55}
        #cell7Concentrate
        randomized_values = {key: randomize_value(value) for key, value in original_values.items()}
        json_data['links']['Cleaner_Stream_id']['feed'] = randomized_values
        randomized_values = {key: randomize_value(value) for key, value in original_values.items()}
        final_json4 = json_data


        scenarios = [final_json1, final_json2, final_json3, final_json4]
        chosen_scenario = random.choice(scenarios)

        return jsonify(chosen_scenario)


    


    

    if not json_data:
        return jsonify({"error": "Aucune donnée JSON reçue"}), 400

    try:
        final_json = process_json(json_data)
        print("Reçu:", final_json)
        return jsonify(final_json)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def randomize_value(original_value):
    variation = random.uniform(-10, 10)
    new_value = original_value + variation
    new_value = round(max(0, new_value), 2)  # Ensure no negative values and round to two decimal places
    return new_value # Ensure no negative values


@app.route('/fetch-csv-data', methods=['GET'])
def fetch_csv_data():
    try:
        # Read the CSV file using pandas
        df = pd.read_csv("senario_input.csv")

        # Convert the DataFrame to JSON and return it
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