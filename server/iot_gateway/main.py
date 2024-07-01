import sys
import cv2 
from Adafruit_IO import MQTTClient
import time
from threading import Thread
from uart import *
from vision import detect

AIO_FEED_IDs = ["ai", "sm", "humidity", "light", "temp", "led", "pump", "fan", "auto", "image"]
AIO_USERNAME = "your name"
AIO_KEY = "your key"

client = MQTTClient(AIO_USERNAME , AIO_KEY)

vid = cv2.VideoCapture(0) 

def vision():
    detect(vid, client)

def connected(client):
    print("Ket noi thanh cong ...")
    for topic in AIO_FEED_IDs:
        client.subscribe(topic)

def subscribe(client , userdata , mid , granted_qos):
    print("Subscribe thanh cong ...")

def disconnected(client):
    print("Ngat ket noi ...")
    sys.exit (1)

def message(client , feed_id , payload):
    print("Nhan du lieu: " + payload + " Feed ID: " + feed_id)
    if feed_id == "led":
        if payload == "0":  
            writeData("0")  # led off = 0
        else:               
            writeData("1")  # led on = 1
    if feed_id == "pump":   
        if payload == "0":  
            writeData("2")  # pump off = 2
        else:
            writeData("3")  # pump on = 3
    if feed_id == "fan":
        if payload == "0":
            writeData("4")  # fan off = 4
        elif payload == "1":
            writeData("5")  # fan level 1 = 5
        elif payload == "2":
            writeData("6")  # fan level 2 = 6
        elif payload == "3":
            writeData("7")  # fan level 3 = 7
        else:
            writeData("8")  # fan level 4 = 8
    if feed_id == "auto":
        if payload == "0":
            writeData("9")  # auto off = 9
        else:
            writeData("10") # auto on = 10

client.on_connect = connected
client.on_disconnect = disconnected
client.on_message = message
client.on_subscribe = subscribe
client.connect()
client.loop_background()

if __name__ == "__main__":
    cv = Thread(target= vision, args=())
    cv.start()
    cv.join()
    while True:
        readSerial(client)
        time.sleep(1)
        pass