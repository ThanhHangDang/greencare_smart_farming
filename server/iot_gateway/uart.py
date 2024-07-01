import serial.tools.list_ports

def getPort():
    ports = serial.tools.list_ports.comports()
    N = len(ports)
    commPort = "None"
    for i in range(0, N):
        port = ports[i]
        strPort = str(port)
        if "USB Serial Device" in strPort:
            splitPort = strPort.split(" ")
            commPort = (splitPort[0])
    # return commPort
    # return "COM8"
    return "COM6"

if getPort() != "None":
    ser = serial.Serial( port=getPort(), baudrate=115200)
    print(ser)

avgTemp = 0
avgHum = 0
avgLight = 0
avgSM = 0
countSample =0

def processData(client, data):
    global avgSM, avgLight, avgHum, avgTemp, countSample
    data = data.replace("!", "")
    data = data.replace("#", "")
    splitData = data.split(":")
    print(splitData)
    match splitData[1]:
        case "TEMP":
            # client.publish("temp", splitData[2])
            avgTemp += float(splitData[2])
            countSample += 1
        case "HUMIDITY":
            # client.publish("humidity", splitData[2])
            avgHum += float(splitData[2])
            countSample += 1
        case "LIGHT":
            # client.publish("light", splitData[2])
            avgLight += float(splitData[2])
            countSample += 1
        case "SM":
            # client.publish("sm", splitData[2])
            avgSM += float(splitData[2])
            countSample += 1
        case "LED":
            client.publish("led", splitData[2])
        case "PUMP":
            client.publish("pump", splitData[2])
        case "FAN":
            client.publish("fan", splitData[2])

    if countSample == 60:
        countSample = 0;
        client.publish("temp", str(avgTemp/15))
        client.publish("humidity", str(avgHum/15))
        client.publish("light", str(avgLight/15))
        client.publish("sm", str(avgSM/15))
        avgTemp = avgSM = avgLight = avgHum = 0



mess = ""
def readSerial(client):
    bytesToRead = ser.inWaiting()
    if (bytesToRead > 0):
        global mess
        mess = mess + ser.read(bytesToRead).decode("UTF-8")
        while ("#" in mess) and ("!" in mess):
            start = mess.find("!")
            end = mess.find("#")
            processData(client, mess[start:end + 1])
            if (end == len(mess)):
                mess = ""
            else:
                mess = mess[end+1:]

def writeData(data):
    ser.write(str(data).encode())