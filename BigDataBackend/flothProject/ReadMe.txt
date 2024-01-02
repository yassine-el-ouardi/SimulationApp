# R2 metric
def r2_keras(output_index):
    def r2(y_true, y_pred):
        SS_res =  K.sum(K.square(y_true[:,output_index] - y_pred[:,output_index])) 
        SS_tot = K.sum(K.square(y_true[:,output_index] - K.mean(y_true[:,output_index])))
        r2 = 1 - SS_res/(SS_tot + K.epsilon())
        return r2
    r2.__name__ = f"r2_{output_index}"
    return r2

# Load machine learning model
model = load_model('model7_23.h5', custom_objects={'r2_0': r2_keras(0),
                                                   'r2_1': r2_keras(1),
                                                   'r2_2': r2_keras(2),
                                                   'r2_3': r2_keras(3),
                                                   'r2_4': r2_keras(4),
                                                   'r2_5': r2_keras(5),
                                                   'r2_6': r2_keras(6),
                                                   'r2_7': r2_keras(7),
                                                   'r2_8': r2_keras(8),
                                                   'r2_9': r2_keras(9),
                                                   'r2_10': r2_keras(10),
                                                   'r2_11': r2_keras(11),
                                                   'r2_12': r2_keras(12),
                                                   'r2_13': r2_keras(13),
                                                   'r2_14': r2_keras(14),
                                                   'r2_15': r2_keras(15),
                                                   'r2_16': r2_keras(16),
                                                   'r2_17': r2_keras(17),
                                                   'r2_18': r2_keras(18),
                                                   'r2_19': r2_keras(19),
                                                   'r2_20': r2_keras(20),
                                                   'r2_21': r2_keras(21),
                                                   'r2_22': r2_keras(22)
                                                  })

# Load scalers
scalerX = load('scalerX_24.joblib')
scalerY = load('scalerY_23.joblib')

# in order to make predictions
 		# Get X inputs features
		# Scale input features
        		scaled_input = scalerX.transform(input_features)
		# Make prediction using the model
        		raw_prediction = model.predict(scaled_input)
		# Reverse scale the output
        		final_prediction = scalerY.inverse_transform(raw_prediction)