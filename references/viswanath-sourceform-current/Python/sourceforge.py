# -*- coding: utf-8 -*-
"""
Created on Mon Apr 23 11:20:26 2018

@author: Viswanath
created to communicate with sourceforge printer
"""

import serial,sys
import os
#path for python dependencies
path=r'C:\Users\vmeenak\Desktop\Sourceform_current\Python'
os.chdir(path)
import auto_frame_rate
import project
import cv2
import time


def sourceforge():
    burnintime=5000; # set as per requirement
    port="com3"
    ser=serial.Serial(port,9600,timeout=0)
    path=input('enter image folder location')
    required_framerate=int(input('please enter exp time for 100 microns'))
    path=path
    auto_frame_rate.realframerate(path,required_framerate,0,path)
    logfile=open(path +"\logfile.txt","r")
    layers=int(logfile.readline())
    req_frate=int(logfile.readline())
    act_frate=int(logfile.readline())
    deltime=int(logfile.readline())
    npix=int(logfile.readline())
    imagepath1=[];
    for i in range(1,layers+1):
        imagepath1.append(path+'\\'+(logfile.readline()))
    logfile.close()
    var='a'
    while var is not 'e':
        var=input()
        
        if var=='h':
            ser.write(var.encode())
            op=ser.read(4).decode()
            while op is not 'done':
                op=ser.read(4).decode()
                time.sleep(1)
                if op == 'done': 
                    print('homing complete')
                    del(op)
                    break
        elif var=='s':
            ser.write(var.encode())
            op=ser.read(4).decode()
            while op is not 'done':
                op=ser.read(4).decode()
                time.sleep(1)
                if op == 'done': 
                    print('Printhead moved to starting location')
                    del(op)
                    break
        elif var=='p':
            #var=input('please input printing paramteres p###')
            ser.write(('p'+str(layers)).encode())
            i=0
            print('Print Started')
            op=ser.read(4).decode()
    #       while op is not 'done': include for printer based
            while i<layers:
                op=ser.read(4).decode()
    #       call printing function
                if i==0:
                    project.project(imagepath[i][:-1],2,burnintime,1)
                else:
                    project.project(imagepath[i][:-1],2,required_framerate,1)
                i=i+1
            print('Printing complete')
            del(op)
    #            if op == 'done': include for printer based
    #                print('Printing complete')
    #                del(op)
    #                break
    ser.close()



if __name__=="__main__":
    sourceforge()