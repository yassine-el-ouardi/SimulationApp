from flask import Flask, request, jsonify
import tensorflow as tf
import joblib
import pandas as pd

app = Flask(__name__)

# Load the Keras model and scalers
def load_model_and_scalers():
    def r2_keras(output_index):
        def r2(y_true, y_pred):
            SS_res = tf.keras.backend.sum(tf.keras.backend.square(y_true[:, output_index] - y_pred[:, output_index]))
            SS_tot = tf.keras.backend.sum(tf.keras.backend.square(y_true[:, output_index] - tf.keras.backend.mean(y_true[:, output_index])))
            r2 = 1 - SS_res / (SS_tot + tf.keras.backend.epsilon())
            return r2

        r2.__name__ = f"r2_{output_index}"
        return r2

    model = tf.keras.models.load_model('model7_23.h5', custom_objects={
        f'r2_{i}': r2_keras(i) for i in range(23)
    })

    scalerX = joblib.load('scalerX_24.joblib')
    scalerY = joblib.load('scalerY_23.joblib')

    return model, scalerX, scalerY

model, scalerX, scalerY = load_model_and_scalers()


@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Extract and prepare data from the POST request
        json_request = request.get_json()
        features = json_request['features']

        # Create a DataFrame from the received data
        input_df = pd.DataFrame([features], columns=scalerX.feature_names_in_)

        # Normalize input data
        scaled_input = scalerX.transform(input_df)

        # Make prediction with model
        raw_prediction = model.predict(scaled_input)

        # Postprocess prediction: Inverse transform with scalerY
        final_prediction = scalerY.inverse_transform(raw_prediction)

        # Convert prediction to a list for JSON response
        prediction_list = final_prediction.tolist()[0]
        print(prediction_list)
        return jsonify({'prediction': prediction_list})
        
# def predict():
#     # Get JSON data sent to the API
#     data = request.get_json(force=True)

#     # Extract and combine features from nodes and links
#     combined_features = []
#     for node_id, node_data in data["nodes"].items():
#         cell_features = node_data['cellCharacteristics']
#         for link_id, link_data in data["links"].items():
#             if link_data['from']['nodeId'] == node_id:
#                 feed_features = link_data['feed']
#                 combined = cell_features + feed_features
#                 combined_features.append(combined)

#     # Prepare the combined features for prediction
#     scaled_features = scalerX.transform(combined_features)
#     predictions = model.predict(scaled_features)
#     final_predictions = scalerY.inverse_transform(predictions)

#     # Convert predictions to a list for JSON response
#     predictions_list = final_predictions.tolist()

#     # Create and send a response
#     return jsonify({'predictions': predictions_list})
    except Exception as e:
        return jsonify({'error': str(e)})
if __name__ == '__main__':
    app.run(debug=True)
@app.route('/')
def home():
    return "Flask app is running!"
