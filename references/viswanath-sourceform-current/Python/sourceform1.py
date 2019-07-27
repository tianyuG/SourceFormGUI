# -*- coding: utf-8 -*-
"""
Created on Mon Apr 23 11:20:26 2018

@author: Viswanath
created to communicate with sourceforge printer
This is for demo purspose only, images are located at E:\STL\Trials\liberty
The xposure time is also set to 550 ms for the demo
"""

import serial,sys
import os
import cv2
#path for python dependencies
path=r'C:\Users\vmeenak\Desktop\Sourceform_current\Python'
sys.path.append(path)
import project
import time
import re
import auto_frame_rate

def sourceform1():
    burnintime=7000 # set as per requirement
    port="com3"
    ser=serial.Serial(port,9600,timeout=0)
    #path=input('enter image folder location')
    path=os.path.normpath(sys.argv[1])
    #exp_time=int(input('please enter exp time for 100 microns'))
    exp_time=400
    #path=path
    os.chdir(path)
    time.sleep(5)
    im_files=[]
    for f in os.listdir('.'):
       if f[-3:]=='bmp':
           im_files.append(f)
    convert = lambda text: int(text) if text.isdigit() else text
    alphanum_key = lambda key: [convert(c) for c in re.split('([0-9]+)', key)]
    im_files=sorted(im_files,key=alphanum_key)
    layers=len(im_files)
    imagepath=[];
    for i in range(0,len(im_files)):
        imagepath.append(path+'\\'+im_files[i])
 # writing the burn in to arduino   
    var='b'+str(burnintime)
    ser.write(var.encode())
    op=ser.read(4).decode()
    while op is not 'done':
        op=ser.read(4).decode()
        time.sleep(1)
        if op == 'done': 
            print('burnin time updated')
            del(op)
            break
            var='b'+burnintime
 # writing the exposure time to arduino      
    var='o'+str(exp_time)
    ser.write(var.encode())
    op=ser.read(4).decode()
    while op is not 'done':
        op=ser.read(4).decode()
        time.sleep(1)
        if op == 'done': 
            print('exposure time updated')
            del(op)
            break
 # writing the commands for printing
    var='h'
    ser.write(var.encode())
    op=ser.read(4).decode()
    while op is not 'done':
        op=ser.read(4).decode()
        time.sleep(1)
        if op == 'done': 
            print('homing complete')
            del(op)
            break
    var='s'
    ser.write(var.encode())
    op=ser.read(4).decode()
    while op is not 'done':
        op=ser.read(4).decode()
        time.sleep(1)
        if op == 'done': 
            print('Printhead moved to starting location')
            del(op)
            break
# sending layers    
    var='p'+str(layers)
    ser.write(var.encode())
    i=0
    print('Print Started')
    op=ser.read(4).decode()
#       while op is not 'done': include for printer based
    while i<layers:
        op=ser.read(4).decode()
    #call printing function
        if i==0:
            project.project(imagepath[i],2,burnintime,1)
        else:
            project.project(imagepath[i],2,exp_time,1)
        sys.stdout.write('\r')
        # the exact output you're looking for:
        sys.stdout.write("Printing layer " + str (i)+ " out of "+str(layers) )
        sys.stdout.flush()
        i=i+1
        
    print('\nPrinting complete')
    del(op)
    #            if op == 'done': include for printer based
    #                print('Printing complete')
    #                del(op)
    #                break
    ser.close()



if __name__=="__main__":
    sourceform1()