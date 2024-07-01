# install h5py, numpy, tensorflow, keras

import h5py
import numpy as np
from keras.models import load_model
from keras.preprocessing.image import load_img
from keras.preprocessing.image import img_to_array
from keras import utils


# input: image with size (224, 224)
# output: class label
def classify(input, usedModelFileName):
    usedModel = load_model(usedModelFileName)
    labels = ["Health", "Sick"]
    # load an image from file
    # img = load_img(imageFile, target_size=(224, 224))
    # img = img_to_array(img)
    img = input
    # print(img)
    # print(img.shape)
    img = np.expand_dims(img, axis=0)
    img = img / 255

    # predict the class
    result = usedModel.predict(img)
    # result = usedModel.predict(input)
    print(result)
    # result = np.argmax(result)
    # resultLabel = labels[0] if result == "Normal" else labels[1]
    resultLabel = ""
    if result[0][0] > 0.5:
        resultLabel = labels[0]
    else:
        resultLabel = labels[1]
    return resultLabel


# imgFile = "test/laBenh.jpg"
# print(classify(imgFile, "VGG16_model.h5"))
