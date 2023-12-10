import requests
import time

def test_make_multiple_predictions():
    # Données de test avec 5 observations différentes
    test_data = {
        "observations": [
            [83.6467809, 30.54122117, 27.48709905, 21.39020691, 11.69324548, 31.05379341, 80.2000505, 17.96415397, 13.53711124, 2.188315303, 2.542581884, 1.668070932, 2.11301355, 51.92836011, 388.0689428, 642.6076087, 725.727703, 4.779629092, 1.420197337, 11.18770458, 6.257899434, 18.35273643, 25.41275889, 7.159392488]

        ]
    }

    start_time = time.time()  # Enregistrez le temps de début

    # Envoi de la requête à votre API
    response = requests.post("http://127.0.0.1:8000/make_prediction_chain", json=test_data)

    # Vérification du code d'état HTTP
    assert response.status_code == 200

    # Analyse de la réponse JSON
    result = response.json()

    # Affichage des résultats
    print(result)

    # Assertions sur les résultats
    assert "results" in result
    assert len(result["results"]) == 5  # Cinq observations dans les résultats

    for i, observation_result in enumerate(result["results"], start=1):
        assert len(observation_result) == 3  # Trois cellules dans chaque observation

        # Vérification des données pour chaque cellule
        for cell_result in observation_result:
            assert "observation" in cell_result
            assert "cell" in cell_result
            assert "data" in cell_result

            # Assertions spécifiques sur les résultats
            assert isinstance(cell_result["observation"], int)
            assert isinstance(cell_result["cell"], int)
            assert isinstance(cell_result["data"], list)

            print(f"Observation {i}, Cell {cell_result['cell']}, Data: {cell_result['data']}")

    end_time = time.time()  # Enregistrez le temps de fin
    elapsed_time = end_time - start_time  # Calculez le temps écoulé

    # Affichage du temps d'exécution à la fin
    print(f"Temps d'exécution total : {elapsed_time} secondes")

if __name__ == "__main__":
    test_make_multiple_predictions()
