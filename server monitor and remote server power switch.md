## Tutorial on how to build a server monitor and remote server power switch

Give a short and brief overview of what your project is about.
What needs to be included:
- Server monitor and remote server power switch
- By Mikael Andersson (ma225gn at Linnaeus University)
- This project aims to help people manage their server or computer by reading information and power it on/off remotely from anywhere.  

- **Estimated time: 2-4 days**. I've tried to keep the project as accessible as possible for people without a technical background.

This project is based on my IoT summer course(1dv305) but has been changed and improved:  
Tutorial: [https://hackmd.io/@MZQkS_EuT5ygqCUd55CIRA/ryiBQ8Js9](https://hackmd.io/@MZQkS_EuT5ygqCUd55CIRA/ryiBQ8Js9)  
Repo: [https://github.com/Lnuplugg/iot](https://github.com/Lnuplugg/iot)


### Objective
My motivation for choosing this particular project and use case is that i needed a way to power on/off my main workstation and server when i'm not at home. It was important for me that the project actually solves a real problem for me or someone else.

Use cases could include complex network architectures where something like wake-on-lan wouldn't be possible to use or where we don't have permissions.

Monitoring of specific events on the server. The possibilities here are endless.

Gaming server for you and your friends where they can login to the web-portal and start the server and stop when they're done as opposed to keep it running 24/7.

Or in vacation times needing to access something on the computer.

Someone might ask, why not just use wake-on-lan? Well, even if we are able to route the magic packet correctly or use a tunnel, my experience from using WOL throughout the years is that it's not reliable and sometimes just doesn't work.

### Material
I've used a esp32 microcontroller "Adafruit Feather HUZZAH32 - ESP32" beacause it suits my needs, it's cheap and most others were out of stock.

By sawing the breadboard in half we can fit bigger microcontrollers and get more space.

![](https://i.imgur.com/milGmVA.jpeg#center =x600)

1x 5v Relay - for shorting the power pins on the computer when activated.  
1x DHT11 - inexpensive temperature sensor.

Adafruit already has a temperature sensor built in, but I wanted to do some wiring.

### Links to material
| Product | Link | Price(rounded up) |
| -------- | -------- | -------- |
| Adafruit esp-32(unsoldered) | [Electrokit](https://www.electrokit.com/en/product/adafruit-feather-huzzah32-esp32-2/) | 27$ |
| Relay module 5V | [Electrokit](https://www.electrokit.com/en/product/relay-module-5v/) | 4$ |
| DHT11 | [Electrokit](https://www.electrokit.com/en/product/digital-temperature-and-humidity-sensor-dht11/) | 5$ |
| Breadboard | [Electrokit](https://www.electrokit.com/en/product/solderless-breadboard-840-tie-points-2/) | 7$ |
| USB-cable | [Electrokit](https://www.electrokit.com/en/product/usb-cable-a-male-microb-male-1-8m/) | 4$ |


### Computer setup
I used Thonny for the programming of the microcontroller to micropython.

Frontend: I've used Node.js, express and squirelly(lightweight template engine).  
Backend: Node.js, express and Elasticsearch for storing the data.

I used ngrok for local development and since i had some trouble with my CScloud machine(uploading files) and Azure was a complete nightmare to configure i ended up deploying my production build on bitlaunch on a VPS.

In production i used nginx(server config provided in repo) and pm2 for handling the frontend and backend.  
Link: [PM2](https://pm2.keymetrics.io)  

To install Elasticsearch i followed this guide:  
Link: [Elasticsearch install on Ubuntu](https://www.digitalocean.com/community/tutorials/how-to-install-and-configure-elasticsearch-on-ubuntu-22-04)

If we want the computer stats to be sent to the backend -> frontend we need to run the Python script monitoring.py, preferably autostarting when the computer boots. If not we can still use the power on/off feature.

I've tried to run this project on 2 linux servers and they both work. I also tried with a old Windows 7 computer but i couldn't get the stats transferred.

#### Flashing the microcontroller
Im using esptool for flashing the microcontroller with micropython:
Installation instructions: 
https://docs.espressif.com/projects/esptool/en/latest/esp32/index.html

Erasing the flash. For Windows it's COM1, COM2... instead of /dev/ttyUSB*
`sudo esptool.py --chip esp32 --port /dev/ttyUSB0 erase_flash`

`sudo esptool.py --chip esp32 --port /dev/ttyUSB0 --baud 460800 write_flash -z 0x1000 esp32-*.bin` <- Replace bin file.

The specific .bin file for the Adafruit feather esp32 can be found here:
https://micropython.org/download/esp32/

### Putting everything together

Circuit diagram:
![](https://i.imgur.com/wsOCJ8J.jpg#center =x300)

This particular temperature sensor already has a built in resistor but some don't.
The relay was advertised to work on 3.3v but it didn't, the led comes on but the relay doesn't activate.

### Platform
My original idea was to keep the project as lightweight as possible, but due to using Elasticsearch this project is not very lightweight.
Using a cloud database like Influx would be mor simple and lightweight.
### The code
Micropython main loop:  
![](https://i.imgur.com/xzMNFQ1.png#center =x500)
Unfortunately urequest doesn't seem to support https which is a security risk.

I had big troubles getting UART to work so I could communicate between the microcontroller and the computer. Instead the Python script sends a serial message to the port occupied by REPL and we parse it from there.

Backend-API:  
![](https://i.imgur.com/g3kmmTI.jpg#center =x500)  
The IoT device only communicates with the backend and not the frontend directly.  


Frontend:
![](https://i.imgur.com/hjgVDsa.jpg#center =x500)
The frontend communicates with the backend and retrieves data from elasticsearch.
The powerstate is updated dynamically on the backend.

Web thing model: http://206.188.196.19/wtm

### Data flow / Connectivity
The microcontroller itself is connected to the internet via my wifi router. Alternatives could be to share the internet with the host computer via the usb cable, 5G or one of many other choices.

The production deployment is hosted on a VPS in Amsterdam, both the frontend and backend. I've ched the nginx server config to only allow traffic to certain routes(public and routes that use authentication).

The data is transmitted every 10 seconds from the IoT device to the backend, in this case the server is hosted in Amsterdam so it takes a while longer usually before we can observe the data in the frontend.
This delay is also why it takes a while to change powerstate.

As we use the power supply from the usb port we dont have to worry about batteries, power consumption and such.
The data is communicated with JSON through simple http requests.
### Presenting the data
Admin portal:
![](https://i.imgur.com/dFvbnf4.jpg#center =x500)

The information is not limited to server stats but we can transfer any information we want by changing the Python script monitoring.py.


### Finalizing the design
Youtube:  
[![IMAGE ALT TEXT](https://i9.ytimg.com/vi_webp/mj6HBQ_96Uw/mq2.webp?sqp=CJjf86MG-oaymwEmCMACELQB8quKqQMa8AEB-AHOBYACgAqKAgwIABABGGUgWChFMA8=&rs=AOn4CLA7eaxeYXT-aDuDX8Up-_1lz2vM0g#center =x300)](https://youtu.be/mj6HBQ_96Uw "Video Title")  


Since i couldn't show the computer actually powering on, here's a link to the video for the summer course(1dv305) which shows the computer powering on:  
[Youtube](https://youtube.com/shorts/v73vwFeD6jE?feature=share "Video Title")  


