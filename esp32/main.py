import dht
from machine import Pin
import urequests
import time
import json
import select
import sys
import network

powerstate = None
relay = Pin(21, Pin.OUT)
sensor = dht.DHT11(Pin(33))

def do_connect():
    try:
        wlan = network.WLAN(network.STA_IF)
        wlan.active(True)

        while not wlan.isconnected():
            print('Connecting...')
            wlan.connect('***', '***')
            pass
                
        print('network config:', wlan.ifconfig())
        

    except:
        print(" init error")

do_connect()



print('starting')

def pwerstate():
    try:
        global powerstate
        res = urequests.get("http://***/powerstate")
        json = res.json()
        print(json)
        
        if json is None:
            powerstate = json
            return
        
        # IF powerstate hasn't changed we don't need to do anything
        if powerstate == json:
            return
        
        #sync powerstate
        if powerstate is None:
            powerstate = json
            
        #powerstate has changed   
        if json != powerstate:
            powerSwitch()
            powerstate = None
    except Exception as e:
        print(e)
    
def powerSwitch():
    # RELAY ON
    relay.value(1)
    time.sleep(1)
    relay.value(0)

# Get temp from DHT11 sensor
def getTemp():
    while True:
        try:
            sensor.measure()
            temp = sensor.temperature()
            hum = sensor.humidity()
            tempF = temp * (9/5) + 32.0
            
            return { "tempC": temp, "tempF": tempF, "humidity": hum }
        except OSError as e:
            print("Cant read:", e)
            sys.print_exception(e)

def monitor():
    try:
        global powerstate
        while True:
            pwerstate()
            
            # workaround to avoid blocking input when server/monitoring.py is down.
            i = select.select( [sys.stdin], [], [], 10 )
            if len(i[0]) == 0:
                print('empty')
                
                
            else:
                print('not empty')
                msg = sys.stdin.readline()
                #pwerstate()
                    
                #urequests does not support https, this is a security issue.
                body = {"password": "test", "data": msg, "dht": getTemp(), "powerstate": powerstate, "ts": time.time()}
                resp = urequests.post("http://**/createstats", json = body)
                print(resp)
                
            time.sleep(10)
    except Exception as e:
        print(e)

try:
    monitor()
except:
    print("crash")
    time.sleep(10)
    monitor()
