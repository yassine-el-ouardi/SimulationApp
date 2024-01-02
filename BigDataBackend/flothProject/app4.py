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
# def preprocess_data(json_request, static_columns):
#     input_df = pd.DataFrame(json_request['data'], columns=json_request['features']).reindex(columns=scalerX.feature_names_in_)

#     static_variables = []
#     for col in static_columns:
#         col_values = [row[json_request['features'].index(col)] for row in json_request['data']]
#         static_variables.append(col_values)

#     static_variables = list(map(list, zip(*static_variables)))
#     return input_df, static_variables

# def predict_with_first_model(model, scalerX, scalerY, input_df):
#     scaled_input = scalerX.transform(input_df)
#     raw_prediction = model.predict(scaled_input)
#     final_prediction = scalerY.inverse_transform(raw_prediction)

#     concentrate_predictions = final_prediction[:, :10].tolist()
#     tailing_predictions = final_prediction[:, 10:20].tolist()

#     return final_prediction, concentrate_predictions, tailing_predictions

# def combine_and_predict_second_model(final_prediction, concentrate_predictions, static_variables):
#     combined_df_concentrate = pd.DataFrame(
#         [static_variables[i][:14] + concentrate_predictions[i][:10] for i in range(len(static_variables))],
#         columns=scalerX.feature_names_in_
#     )

#     scaled_input2 = scalerX.transform(combined_df_concentrate.reindex(columns=scalerX.feature_names_in_))
#     raw_prediction2 = model.predict(scaled_input2)
#     final_prediction2 = scalerY.inverse_transform(raw_prediction2)

#     concentrate_predictions2 = final_prediction2[:, :10].tolist()
#     tailing_predictions2 = final_prediction2[:, 10:20].tolist()

#     return final_prediction2, concentrate_predictions2, tailing_predictions2
# def print_predictions(combined_predictions_concentrate, combined_predictions_tailing,
#                       combined_predictions_concentrate2, combined_predictions_tailing2,
#                       concentrate_predictions, tailing_predictions,
#                       concentrate_predictions2, tailing_predictions2):
#     print("Combined Predictions_concentrate:")
#     for idx, prediction in enumerate(combined_predictions_concentrate):
#         print(f"Observation {idx + 1}: {prediction}")
#     print("Combined Predictions_tailing:")
#     for idx, prediction in enumerate(combined_predictions_tailing):
#         print(f"Observation {idx + 1}: {prediction}")

#     print("Combined Predictions_concentrate2:")
#     for idx, prediction in enumerate(combined_predictions_concentrate2):
#         print(f"Observation {idx + 1}: {prediction}")
#     print("Combined Predictions_tailing2:")
#     for idx, prediction in enumerate(combined_predictions_tailing2):
#         print(f"Observation {idx + 1}: {prediction}")

#     print("\nConcentrate Predictions:")
#     for idx, prediction in enumerate(concentrate_predictions):
#         print(f"Observation {idx + 1}: {prediction}")

#     print("\nTailing Predictions:")
#     for idx, prediction in enumerate(tailing_predictions):
#         print(f"Observation {idx + 1}: {prediction}")

#     print("\nConcentrate Predictions2:")
#     for idx, prediction in enumerate(concentrate_predictions2):
#         print(f"Observation {idx + 1}: {prediction}")

#     print("\nTailing Predictions2:")
#     for idx, prediction in enumerate(tailing_predictions2):
#         print(f"Observation {idx + 1}: {prediction}")
# def predict():
#     try:
#         # Load model and scalers
#         model, scalerX, scalerY = load_model_and_scalers()
#         json_request = request.get_json()
#         features = json_request['features']
#         index = json_request['index']
#         data = json_request['data']

#         # ... get_json(), features, index, and data from request ...
#         static_columns = ["Net Volume", "Pulp Area", "Froth surface area", "Froth thickness", "Air Flow rate",
#                           "R_inf Ccp", "R_inf Gn", "R_inf Po", "R_inf Sp", "k_max Ccp", "k_max Gn", "k_maxPo",
#                           "k_max Sp", "Entrainement Savassi parameters"]
#         input_df, static_variables = preprocess_data(json_request, static_columns)

#         final_prediction, concentrate_predictions, tailing_predictions = predict_with_first_model(model, scalerX, scalerY, input_df)

#         final_prediction2, concentrate_predictions2, tailing_predictions2 = combine_and_predict_second_model(final_prediction, concentrate_predictions, static_variables)

#         print_predictions(combined_predictions_concentrate, combined_predictions_tailing,
#                           combined_predictions_concentrate2, combined_predictions_tailing2,
#                           concentrate_predictions, tailing_predictions,
#                           concentrate_predictions2, tailing_predictions2)

#         # Return predictions split into concentrate and tailing
#         return jsonify({
#             'concentrate': concentrate_predictions,
#             'tailing': tailing_predictions,
#             'combined_predictions_concentrate': combined_predictions_concentrate,
#             'combined_predictions_tailing': combined_predictions_tailing,
#             'concentrate2': concentrate_predictions2,
#             'tailing2': tailing_predictions2,
#             'combined_predictions_concentrate2': combined_predictions_concentrate2,
#             'combined_predictions_tailing2': combined_predictions_tailing2
#         })

#     except Exception as e:
#         return jsonify({'error': str(e)})


# Run the Flask app
# if __name__ == '__main__':
#     app.run(debug=True)

def predict():
    try:
        
        # Extract and prepare data from the POST request
        json_request = request.get_json()
        features = json_request['features']
        index = json_request['index']
        data = json_request['data']

        # Create a DataFrame from the received data
        #input_df = pd.DataFrame(data, index=index, columns=features)
        input_df = pd.DataFrame(data, columns=features).reindex(columns=scalerX.feature_names_in_)
        # Extract specific columns from JSON data for static variables
        static_columns = ["Net Volume", "Pulp Area", "Froth surface area", "Froth thickness", "Air Flow rate",
                          "R_inf Ccp", "R_inf Gn", "R_inf Po", "R_inf Sp", "k_max Ccp", "k_max Gn", "k_maxPo",
                          "k_max Sp", "Entrainement Savassi parameters"]

        static_variables = []

        # Loop through the specific columns and extract their values for each observation
        for col in static_columns:
            col_values = [row[json_request['features'].index(col)] for row in json_request['data']]
            static_variables.append(col_values)

        # Transpose the static_variables list to have values for each column as separate lists
        static_variables = list(map(list, zip(*static_variables)))
        #selected_features =['Net Volume', 'Pulp Area', 'Froth surface area', 'Froth thickness', 'Air Flow rate', 'R_inf Ccp', 'R_inf Gn', 'R_inf Po', 'R_inf Sp', 'k_max Ccp', 'k_max Gn', 'k_maxPo', 'k_max Sp', 'Entrainement Savassi parameters', 'Total Solids Flow_Feed', 'Total Liquid Flow_Feed', 'Pulp Volumetric Flow_Feed', 'Solids SG_Feed', 'Pulp SG_Feed', 'Solids Fraction_Feed', 'Cu_Feed', 'Fe_Feed', 'Pb_Feed', 'Zn_Feed']
        # Convert DataFrame to numpy array for model input
       # input_df = input_df[selected_features]
        #input_array = input_df.to_numpy()

        # Normalize input data
        scaled_input = scalerX.transform(input_df)

        # Make prediction with model
        raw_prediction = model.predict(scaled_input)

        # Postprocess prediction: Inverse transform with scalerY
        final_prediction = scalerY.inverse_transform(raw_prediction)
        

        
        concentrate_predictions = final_prediction[:, :10].tolist()
        tailing_predictions = final_prediction[:, 10:20].tolist()

        combined_predictions_concentrate = [static_variables[i][:14] + concentrate_predictions[i][:10] for i in range(len(static_variables))]
        combined_predictions_tailing = [static_variables[i][:14] + tailing_predictions[i][:10] for i in range(len(static_variables))]

        # Use the output of the first model for the second model
        combined_df_concentrate = pd.DataFrame(combined_predictions_concentrate, columns=scalerX.feature_names_in_)

        
       # Print predictions for clarity in terminal
        print("Combined Predictions_concentrate:")
        for idx, prediction in enumerate(combined_predictions_concentrate):
            print(f"Observation {idx + 1}: {prediction}")
        print("Combined Predictions_tailing:")
        for idx, prediction in enumerate(combined_predictions_tailing):
            print(f"Observation {idx + 1}: {prediction}")
        # Print predictions for clarity in terminal
        print("Combined Predictions_concentrate2:")

        print("\nConcentrate Predictions:")
        for idx, prediction in enumerate(concentrate_predictions):
            print(f"Observation {idx + 1}: {prediction}")

        print("\nTailing Predictions:")
        for idx, prediction in enumerate(tailing_predictions):
            print(f"Observation {idx + 1}: {prediction}")
        print("\nConcentrate Predictions:")
        # Return predictions split into concentrate and tailing
        return jsonify({
            'concentrate': concentrate_predictions,
            'tailing': tailing_predictions,
            'combined_predictions_concentrate': combined_predictions_concentrate,
            'combined_predictions_tailing': combined_predictions_tailing,
        })
    except Exception as e:
        return jsonify({'error': str(e)})
if __name__ == '__main__':
    app.run(debug=True)
@app.route('/')
def home():
    return "Flask app is running!"
