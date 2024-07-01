# import the opencv library 
import cv2 
import numpy as np
import time
import classify
import binascii

DETECT_TIME = 5
MODEL = "new_model.h5"

vid = cv2.VideoCapture(0) 

def detect(vid, client):
    start_time =time.time()
    print(start_time)
    # define a video capture object 
    vid = vid

    if not vid.isOpened():
        print("Cannot open camera")
        exit()

    #setting input frame
    WIDTH = 224
    HEIGHT = 224
    DIM = (WIDTH, HEIGHT)
    
    while(True): 
        
        # Capture the video frame 
        # by frame 
        ret, frame = vid.read()
        jpeg = frame
        frame = cv2.resize(frame, DIM, interpolation=cv2.INTER_AREA)
        if time.time() - start_time >= DETECT_TIME:
            start_time = time.time()
            result = classify.classify(frame, MODEL)
            if result == "Sick":
                client.publish("ai", "Có bệnh")
            else:
                client.publish("ai", "Bình thường")
            compression_level = 100
            success, jpeg = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), compression_level])
            encoded_data = binascii.b2a_base64(jpeg).strip()
            # print(len(encoded_data))
            client.publish("image", encoded_data)
    
        # Display the resulting frame 
        cv2.imshow('frame', frame) 
        
        # the 'q' button is set as the 
        # quitting button you may use any 
        # desired button of your choice 
        if cv2.waitKey(1) & 0xFF == ord('q'): 
            break
    
    # After the loop release the cap object 
    vid.release() 
    # Destroy all the windows 
    cv2.destroyAllWindows() 

if __name__ == "__main__":
    detect(vid)