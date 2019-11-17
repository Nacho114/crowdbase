## Sardines: A tool to detect crowds
Ever been sick of being packed like sardines? This tool may help you avoid the crowd. Using Raspberry Pi's, this open source code will allow you to visualize crowds easily.

![Alt text](Crowdbase.png?raw=true "Crowdbase visualization")

### Raspberry Pi setup 
This project uses Raspberry Pi's to sniff WiFi Probe requests coming from people's devices. These probe requests let us know how many devices, and hence people there are in an area. Placing these Raspberry Pi's around campus allows us to create a heatmap showing the density of people around EPFL campus.
#### Raspberry Pi 3
To setup a Raspberry Pi 3 to sniff probe requests we used the following tutorial: https://null-byte.wonderhowto.com/how-to/enable-monitor-mode-packet-injection-raspberry-pi-0189378. This worked flawlessy. In order to follow this tutorial you will need:

- keyboard
- mouse
- HDMI cable

To sniff the probe requests we modified the script available on https://github.com/brannondorsey/sniff-probes. We modified it in such a way that it would sniff continuously and send the raw data to our database. These are the dependencies:

```
curl
gawk
tcpdump
```

We also set up our Raspberry Pi for sniffing its wifi connection, and its internal clock on boot by modifying the ```/etc/rc.local``` file. By doing this, our Raspberry Pi will connect to the wifi, start sniffing and send data to the database as soon as it has power. The ```/etc/rc.local``` file is as follows:

```
#!
blah blah

```

#### Raspberry Pi Zero W
Do not follow the above tutorial for this smaller version of Raspberry Pi. Note that in order to setup this Raspberry Pi you will need
- a mini HDMI to HDMI cable/adaptor, 
- and a way to plug in a keyboard (we used a micro USB to USB A converter as well as a USB A keyboard, but I suppose a micro USB keyboard would work too). 

Take care to plug in your keyboard in the micro USB input in the middle of the board and not in the edge, or the Raspberry Pi will not read the input. The micro USB input on the edge of the Raspberry board is reserved for power. 

We saw this tutorial which worked https://dantheiotman.com/2017/10/06/installing-kali-linux-on-a-pi-zero-w/. We tried following it with the current 2019.3 image of kali linux for Raspberry Pi Zero W but we did not manage to setup the eduroam WiFi like this unfortunately. Since this link uses an older version of Kali Linux, we decided to try to do the same thing. We found a 2018.2 image using the web archiver (way back machine), which worked for us. 

From here we setup the eduroam wifi by writing a ```/etc/wpa_supplicant/wpa_supplicant.conf``` file. Here are its contents for the EPFL network, your setup may differ.

```
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1
country=CH

network={
        ssid="eduroam"
        scan_ssid=1
        key_mgmt=WPA-EAP
        eap=TTLS
        phase2="auth=MSCHAPV2"
        identity="first.last@epfl.ch"
        password="********"
        priority=1
        proactive_key_caching=1
        id_str="school"
}
```

To enable the internet connection we followed this tutorial https://jonathansblog.co.uk/kali-linux-wpa_supplicant-cli-config. We had to repeat this multiple times and reboot multiple times for this to work - it wouldn't work on the first try (hopefully you are more lucky). Once it worked once, it wouldn't fail again on startup. These are the commands that need to be run:

```
ifconfig wlan0 up
sudo wpa_supplicant -B -iwlan0 -c/etc/wpa_supplicant.conf -Dwext
sudo dhclient wlan0
```

At this point we had an internet connection, but we still could not enable monitoring mode in order to capture the probe requests. For this we followed this tutorial https://null-byte.wonderhowto.com/how-to/set-up-kali-linux-new-10-raspberry-pi-zero-w-0176819/. In summary, we downloaded and installed the ```Re4son-Pi-Kernel```

```
wget  -O re4son-kernel_current.tar.xz https://re4son-kernel.com/download/re4son-kernel-current/
tar -xJf re4son-kernel_current.tar.xz
cd re4son-kernel_4*
./install.sh
```

This will take a while. Once it is done, WiFi monitor mode can be enabled.

Like in the Raspberry Pi 3, the sniffing is done by modifying the script on https://github.com/brannondorsey/sniff-probes. The script is modified in such a way that the Raspberry Pi sniffs and continuously sends the data to our database. 

The internet setup, time setup and the sniffing initialization are done on boot by modifying the ```/etc/rc.local``` file, which looks as follows:
```
#!
blah blah

```

## Database

For the database we followed this tutorial https://www.linkedin.com/pulse/serverless-api-aws-python-tutorial-felipe-ramos-da-silva/

We used amazon lambda functions combined with dynamodb and aws API. The code for the lambda functions for get/put requetst can be found in the ```server/``` folder

## Website

We built a simple html site based on the skeleton found in boxmap.
