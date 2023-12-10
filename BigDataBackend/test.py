import requests
import numpy as np
import time

def generate_random_observations(num_observations, num_features):
    return [list(np.random.rand(num_features)) for _ in range(num_observations)]

def test_with_batch(url, observations):
    data = {'observations': observations}

    start_time = time.time()
    response = requests.post(url + '/make_prediction_chain', json=data)
    end_time = time.time()

    print(f"Temps de réponse avec batch : {end_time - start_time} secondes")
    print("Réponse :", response.json())

def test_without_batch(url, observations):
    data = {'observations': observations}

    start_time = time.time()
    response = requests.post(url + '/make_prediction', json=data)
    end_time = time.time()

    print(f"Temps de réponse sans batch : {end_time - start_time} secondes")
    print("Réponse :", response.json())

if __name__ == "__main__":
    url = 'http://127.0.0.1:5000'
    num_observations = 10
    num_features = 24

    observations = generate_random_observations(num_observations, num_features)

    test_without_batch(url, observations)
    test_with_batch(url, observations)
