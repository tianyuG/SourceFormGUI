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

def translate(img,delx,dely):
    M = np.float32([[1,0,delx],[0,1,dely]])
    translated = cv2.warpAffine(img,M,(1280,800))
    return translated

def createstack(img,rows,comp_factor):
    img_stack=[]
    for j in range(int(rows/comp_factor)):
        img_stack.append(translate(img,0,-j*comp_factor))
    return img_stack

def project(path,mode,deltime,npix):
    if int(mode)==1: # 1 is movie mode and 2 is picture mode
        temp=cv2.imread(path,0)
        rows,cols=temp.shape
        test_stack=createstack(temp,rows,int(npix))
        cv2.namedWindow('display',cv2.WND_PROP_FULLSCREEN)
        cv2.moveWindow('display',1720,0)
        cv2.setWindowProperty('display',cv2.WND_PROP_FULLSCREEN,cv2.WINDOW_FULLSCREEN)
        for i in range(len(test_stack)):
            cv2.imshow('display',test_stack[i])
            cv2.waitKey(int(deltime)) #millisecond delay
        cv2.destroyAllWindows()
        del(test_stack)
    else:
        if int(mode)==2:
            temp=cv2.imread(path,0)
            cv2.namedWindow('display',cv2.WND_PROP_FULLSCREEN)
            cv2.setWindowProperty('display',cv2.WND_PROP_FULLSCREEN,1)
            cv2.moveWindow('display',1720,0)
            cv2.imshow('display',temp)
            cv2.waitKey(int(deltime)) #millisecond delay
            cv2.destroyAllWindows()
            del(temp)
if __name__=="__main__":
    project(sys.argv[1],sys.argv[2],sys.argv[3],sys.argv[4])
    #Process(target=project(sys.argv[1],sys.argv[2],sys.argv[3],sys.argv[4]), args=(':0.2',)).start()