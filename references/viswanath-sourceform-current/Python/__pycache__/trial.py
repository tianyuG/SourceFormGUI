# -*- coding: utf-8 -*-
"""
Created on Mon Jul  2 15:41:26 2018

@author: vmeenak
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

# frate is not reqyured.. only exposure time per layer thickness is 

path=input('enter image folder location')
required_framerate=int(input('please enter exposure time for 100 micron layers'))
path=path
auto_frame_rate.realframerate(path,required_framerate,0,path)
logfile=open(path +"\logfile.txt","r")
layers=int(logfile.readline())
req_frate=int(logfile.readline())
act_frate=int(logfile.readline())
deltime=int(logfile.readline())
npix=int(logfile.readline())
imagepath=[]
i=0
for i in range(1,layers+1):
    imagepath.append(path+'\\'+(logfile.readline()))
logfile.close()
i=0
while i<layers:
    project.project(imagepath[i][:-1],2,required_framerate,1) # changed frate here
    i=i+1
#%%