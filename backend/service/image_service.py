
import cv2
import tensorflow as tf
import numpy as np
from torchvision import transforms
from tensorflow.keras.preprocessing import image

IMAGE_SIZE_V5 = 640


def preprocess_image(img_pil , IMAGE_SIZE):
  transform = None
  transform = transforms.Compose([
      transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
      transforms.ToTensor(),
  ])

  img = transform(img_pil)
  img = img.unsqueeze(0)

  return img

def predict_using_yolo_v8(img, confidence_threshold, model):
    img = preprocess_image(img, IMAGE_SIZE_V5)
    results = model.predict(img, stream=True)

    highest_confidence = 0
    highest_confidence_box = None

    class_name = ""

    # Iterate over the results
    for result in results:
        boxes = result.boxes.cpu().numpy()
        for box in boxes:
            confidence = float(box.conf)
            if confidence > highest_confidence:
                highest_confidence = confidence
                highest_confidence_box = box

    if highest_confidence_box is not None:
        class_id = int(highest_confidence_box.cls[0])  #
        class_name = model.names[class_id]

    return {
        "class" : class_name,
        "confidence" : highest_confidence
    }


def preprocess_image_own(img, h, w):
    # Resize the image to target dimensions
    img_array = image.img_to_array(img)

    # Add batch dimension
    img_array = img_array / 255.0
    img_array = np.expand_dims(img_array, axis=0)

    return img_array


def predict_using_own_model(image):

    pre_processed_image = preprocess_image_own(image, 128, 128)

    print(pre_processed_image.shape)

    # Load the model
    model = tf.keras.models.load_model('models/unet_classification_model.keras')

    # Perform prediction
    predictions = model.predict(pre_processed_image)

    print(predictions)

    top_2_indices = np.argsort(predictions[0])[-2:]

    second_largest_class_index = top_2_indices[0]

    print(f"Second Predicted class: {second_largest_class_index}")

    confidence_score = float(predictions[0][second_largest_class_index])

    return second_largest_class_index, confidence_score


