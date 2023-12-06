import requests
import time

def test_make_multiple_predictions():
    # Données de test avec 5 observations différentes
    test_data = {
        "observations": [
            [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
            [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120],
            [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48],
            [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 30, 29, 28, 27],
            [100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 200, 190, 180, 170, 160, 150, 140, 130, 120, 110, 300, 290, 280, 270]
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
