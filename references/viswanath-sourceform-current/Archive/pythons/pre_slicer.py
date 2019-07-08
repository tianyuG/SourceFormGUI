# -*- coding: utf-8 -*-
"""
Created on Sat Nov 18 11:42:04 2017

@author: Viswanath
"""

"""
program to display images in single mode or movie mode
takes inputs of file name, delay time, num of pixels, mode
"""

import cv2
import os
import numpy as np
import time
import sys
from multiprocessing import Process
import math
sys.path.append(r'C:\Users\Viswanath\Desktop\Python_programming_movies\new_python_scripts\S-MPVP_v2.0\python scripts')
import auto_frame_rate

def translate(img,delx,dely):
    M = np.float32([[1,0,delx],[0,1,dely]])
    translated = cv2.warpAffine(img,M,(1920,1080))
    return translated

def createstack(img,rows,comp_factor):
    img_stack=[]
    for j in range(int(rows/comp_factor)):
        img_stack.append(translate(img,0,-j*comp_factor))
    return img_stack

def shaper(path,img,excesslength):
    os.chdir(path)
    blank_image=np.zeros((excesslength,1920),'uint8')
    blank_image_before=np.zeros((1080,1920),'uint8')
    temp_img=np.concatenate((blank_image_before,cv2.imread(img,0),blank_image),axis=0)
    return temp_img

def file_reader(path):
    im_files=[]
    for f in os.listdir('.'):
        if f[-3:]=='bmp':
            im_files.append(f)
    return im_files
def slicer(path,required_framerate):
    os.chdir(path)
    im_files=file_reader(path)
#    im_files=[]
#    for f in os.listdir('.'):
#        if f[-3:]=='bmp':
#            im_files.append(f)
    temp=cv2.imread(im_files[1],0)
    rows,cols=temp.shape # checking size of image
    if ((cols/1920)>1 or (rows/1080)>1):
        passes=math.ceil(cols/1920)
        lpass=math.ceil(rows/1080)
        excesslength=1080-(1080*lpass-rows)
        newpath=path+'\\row1'
        if not os.path.exists(newpath): os.makedirs(newpath)

        for i in range(len(im_files)):
            imagename='img_'+str(i).zfill(2)+'.bmp'
            extended_image=shaper(path,im_files[i],excesslength)
            os.chdir(newpath)
            cv2.imwrite(imagename,extended_image)
        auto_frame_rate.realframerate(newpath,required_framerate,1,path)
    else:
          auto_frame_rate.realframerate(path,required_framerate,0,path)  

if __name__=="__main__":
    slicer(sys.argv[1],sys.argv[2])
    #Process(target=project(sys.argv[1],sys.argv[2],sys.argv[3],sys.argv[4]), args=(':0.2',)).start()