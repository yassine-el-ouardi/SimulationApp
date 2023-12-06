from flask import Flask, request, jsonify, render_template
from joblib import load
from tensorflow.keras.models import load_model
from tensorflow.keras import backend as K  # Importez le backend de Keras
import tensorflow as tf
import numpy as np

# Création de l'instance de l'application Flask
app = Flask(__name__)

# Routes de base de l'application Flask
@app.route('/')
def home():
    return render_template('home.html')  # Utilisez render_template pour la page d'accueil

@app.route('/about')
def about():
    return "Voici la page 'À Propos'."

@app.route('/contact')
def contact():
    return "Contactez-nous ici."

# Définition de la fonction R2 pour le modèle TensorFlow


def r2_keras(output_index):
    def r2(y_true, y_pred):
        SS_res = K.sum(K.square(y_true[:, output_index] - y_pred[:, output_index]))
        SS_tot = K.sum(K.square(y_true[:, output_index] - K.mean(y_true[:, output_index])))
        return 1 - SS_res / (SS_tot + K.epsilon())
    r2.__name__ = f"r2_{output_index}"
    return r2

# Charger le modèle TensorFlow
model = load_model('model7_23.h5', custom_objects={f'r2_{i}': r2_keras(i) for i in range(23)})

# Charger les scalers
scalerX = load('scalerX_24.joblib')
scalerY = load('scalerY_23.joblib')

# Route pour faire des prédictions
@app.route('/make_prediction', methods=['POST'])
def make_prediction():
    data = request.json
    input_features = np.array(data['input_features'])
    scaled_input = scalerX.transform([input_features])
    raw_prediction = model.predict(scaled_input)
    final_prediction = scalerY.inverse_transform(raw_prediction)
    return jsonify({'prediction': final_prediction.tolist()})

# Exécuter l'application
if __name__ == '__main__':
    app.run(debug=True)


