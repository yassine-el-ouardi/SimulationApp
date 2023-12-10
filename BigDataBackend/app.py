from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
from fastapi import Request
import numpy as np
from tensorflow.keras.models import load_model
from joblib import load
from tensorflow.keras import backend as K

# Fonction R2 personnalisée pour évaluer le modèle Keras.
def r2_keras(output_index):
    def r2(y_true, y_pred):
        SS_res = K.sum(K.square(y_true[:, output_index] - y_pred[:, output_index]))
        SS_tot = K.sum(K.square(y_true[:, output_index] - K.mean(y_true[:, output_index])))
        return 1 - SS_res / (SS_tot + K.epsilon())
    r2.__name__ = f"r2_{output_index}"
    return r2

# Classe pour les données entrantes
class Item(BaseModel):
    observations: list

# Création de l'instance de l'application FastAPI
app = FastAPI()

# Configuration de Jinja2 pour le rendu des modèles
templates = Jinja2Templates(directory="templates")

# Chargement du modèle Keras et des scalers
model = load_model('model7_23.h5', custom_objects={f'r2_{i}': r2_keras(i) for i in range(23)})
scalerX = load('scalerX_24.joblib')
scalerY = load('scalerY_23.joblib')


# Liste des variables statiques par défaut pour tous les cellules
#static_variables = ['Net Volume', 'Pulp Area', 'Froth surface area', 'Froth thickness',
#                    'Air Flow rate', 'R_inf Ccp', 'R_inf Gn', 'R_inf Po', 'R_inf Sp',
#                    'k_max Ccp', 'k_max Gn', 'k_maxPo', 'k_max Sp', 'Entrainement Savassi parameters']

static_variables =  [83.6467809, 30.54122117, 27.48709905, 21.39020691, 11.69324548, 31.05379341, 80.2000505, 17.96415397, 13.53711124, 2.188315303, 2.542581884, 1.668070932, 2.11301355, 51.92836011]

# Liste des indices des variables pour chaque cellule
cell_2_indices = list(range(3, 9)) + list(range(19, 23))
cell_3_indices = list(range(9, 19))

# Route pour la page d'accueil
@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("home.html", {"request": request})

# Route pour faire des prédictions en chaîne
@app.post("/make_prediction_chain")
async def make_prediction_chain(item: Item):
    results = []

    # Traitement de chaque observation
    for observation_index, observation in enumerate(item.observations, start=1):
        results_for_observation = []  # Liste pour enregistrer les résultats de l'observation
        current_input = np.array(observation)

        #first create a data structure from the txt file provided by Achik
        #second the code would be able to get number of cells from that datastructure
        #code the recursive functionning when the output of a cell is going back to a cell that s before 

        # Traitement à travers les cellules de flottation
        for cell_number in range(1, 4):
            if cell_number == 1:
                selected_variables = current_input
            elif cell_number == 2:
                indices = cell_2_indices
                selected_variables = static_variables + [current_input[i] for i in indices]
            elif cell_number == 3:
                indices = cell_3_indices
                selected_variables = static_variables + [current_input[i] for i in indices]

            # Construction de la liste complète pour l'entrée
            full_input = selected_variables

            
            # Préparation de l'entrée pour le modèle
            scaled_input = scalerX.transform([full_input])
            raw_prediction = model.predict(scaled_input)
            current_output = scalerY.inverse_transform(raw_prediction).flatten()


           
            # Enregistrement des résultats de l'observation avec informations supplémentaires
            result_entry = {
                "observation": observation_index,
                "cell": cell_number,
                "data": current_output.tolist()
            }

            results_for_observation.append(result_entry)

            # Préparation de l'entrée pour la prochaine cellule
            current_input = full_input

        # Ajout des résultats de l'observation courante à la liste des résultats
        # Ajout des résultats de l'observation courante à la liste des résultats
        results.append(results_for_observation)

    # Retourne un JSON avec les résultats finaux
    return JSONResponse(content={"results": results})

# Exécuter l'application avec uvicorn si ce fichier est le point d'entrée principal
# Cela permettra de lancer le serveur lors de l'exécution du script
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)