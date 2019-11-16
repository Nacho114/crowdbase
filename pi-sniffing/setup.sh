#!/bin/bash

DEVICEID="PI1"
airmon-ng start wlan0
service network-manager restart
ifconfig wlan0 up
