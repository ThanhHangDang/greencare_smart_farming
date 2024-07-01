from yolobit import *
button_a.on_pressed = None
button_b.on_pressed = None
button_a.on_pressed_ab = button_b.on_pressed_ab = -1
from machine import RTC
import ntptime
import time
from aiot_lcd1602 import LCD1602
import sys
import uselect
from aiot_rgbled import RGBLed
from event_manager import *

#define led, lcd
tiny_rgb = RGBLed(pin0.pin, 4)
aiot_lcd1602 = LCD1602()
event_manager.reset()

# function to read terminal input, do not touch
def read_terminal_input():
  spoll=uselect.poll()        # Set up an input polling object.
  spoll.register(sys.stdin, uselect.POLLIN)    # Register polling object.

  input = ''
  if spoll.poll(0):
    input = sys.stdin.read(1)

    while spoll.poll(0):
      input = input + sys.stdin.read(1)

  spoll.unregister(sys.stdin)
  return input

# process message get from terminal input
def processData(data):
    data = data.replace("!", "")
    data = data.replace("#", "")
    splitData = data.split(":")
    print(splitData)
    match splitData[1]:
        case "LED":
            if splitData[2] == 1:
                tiny_rgb.show(0, hex_to_rgb('#000000'))     # off led
            else:
                tiny_rgb.show(0, hex_to_rgb('#ffffff'))     # on led
        case "PUMP":
            if splitData[2] == 3:
               pin13.write_digital((0))                     # off pump
            else:
               pin13.write_digital((1))                     # on pump
        case "FAN":
            if splitData[2] == 5:
               pin1.write_analog(round(translate(0, 0, 100, 0, 1023)))  # off fan
            if splitData[2] == 5:
               pin1.write_analog(round(translate(25, 0, 100, 0, 1023))) # on fan lv 1
            if splitData[2] == 5:
               pin1.write_analog(round(translate(50, 0, 100, 0, 1023))) # on fan lv2
            if splitData[2] == 5:
               pin1.write_analog(round(translate(75, 0, 100, 0, 1023))) # on fan lv 3
            if splitData[2] == 5:
               pin1.write_analog(round(translate(100, 0, 100, 0, 1023)))#on fan lv 4

# function read input from serial each 10 ms
def readSerial():
    read_serial = read_terminal_input()
    message = str(message) + str(read_serial)
    while ('#' in message) and ("!" in message):
        start = message.find('!')
        end = message.find('#')
        processData(message[start:end + 1])
        if end == len(message):
            message = ""
        else:
            message = message[end + 1:]
# initial
if True:
  display.scroll('Yolo Farm')
  display.show(Image.SMILE)
  ntptime.settime()
  (year, month, mday, week_of_year, hour, minute, second, milisecond) = RTC().datetime()
  RTC().init((year, month, mday, week_of_year, hour+7, minute, second, milisecond))
  aiot_lcd1602.clear()
# super loop
while True:
  readSerial()
  event_manager.run()
  time.sleep_ms(10)
