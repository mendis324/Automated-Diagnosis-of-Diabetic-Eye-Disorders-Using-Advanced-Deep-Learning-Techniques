from flask import Flask, request, jsonify
from service.image_service import predict_using_own_model  , predict_using_yolo_v8
from flask_cors import CORS
import pathlib
from PIL import Image
import os
import numpy as np
import cv2
from ultralytics import YOLO
from tensorflow.keras.preprocessing import image

APP_NAME = 'drdme'
class_names = ['Mild', 'Moderate' , 'No_DR' , 'Proliferate_DR' , 'Severe' ]

app = Flask(APP_NAME)
CORS(app)


pathlib.PosixPath = pathlib.WindowsPath
print("Current Working Directory:", os.getcwd())
model_yolo_v8 = YOLO('models/dme.pt')
print("Available Classes V8 : " , getattr(model_yolo_v8, 'names', None))

# selected_mode = const.YOLO_V8
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"

@app.route('/dme', methods=['POST'])
def predict_dme():
    # Check if an image was uploaded
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'})

    # Load and preprocess the image received from the Flask API
    file = request.files['image']

    image = Image.open(file)
    prediction_list = predict_using_yolo_v8(image, confidence_threshold=0.1, model=model_yolo_v8 )
    prediction = prediction_list['class']
    confidence = float(prediction_list['confidence'])



    return jsonify(
        {
            'predicted_class': prediction,
            'confidence': confidence
        }
    )


# @app.route('/dr', methods=['POST'])
# def predict_dr_1():
#     # Check if an image was uploaded
#     if 'image' not in request.files:
#         return jsonify({'error': 'No image uploaded'})
#
#     # Load and preprocess the image received from the Flask API
#     file = request.files['image']
#
#     # Read the file into a byte buffer
#     file_bytes = file.read()
#
#     # Decode the image maintaining the exact format
#     nparr = np.frombuffer(file_bytes, np.uint8)
#     image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
#
#     # Process the image
#     prediction, confidence = predict_using_own_model(image)
#     prediction = class_names[prediction]
#
#     return jsonify({
#         'predicted_class': prediction,
#         'confidence': confidence
#     })


@app.route('/dr', methods=['POST'])
def predict_dr():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'})

    file = request.files['image']

    # Save file temporarily
    import tempfile
    import os

    with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp:
        file.save(temp.name)
        temp_filename = temp.name
    print(f"Image saved temporarily at: {temp_filename}")

    temp_filename_normalized = temp_filename.replace('\\', '/')
    img = image.load_img(temp_filename_normalized, target_size=(128, 128))

    # Clean up the temporary file
    os.unlink(temp_filename)

    # Process the image
    prediction, confidence = predict_using_own_model(img)
    prediction = class_names[prediction]

    return jsonify({
        'predicted_class': prediction,
        'confidence': confidence
    })

if APP_NAME == 'drdme':
    app.run(debug=True)

