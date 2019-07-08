# -*- coding: utf-8 -*-
"""
Created on Fri Nov 17 16:55:34 2017

@author: Viswanath
"""
import cv2 as cv
import os
import numpy as np
import time
import sys

def translate(img,delx,dely):
    M = np.float32([[1,0,delx],[0,1,dely]])
    translated = cv.warpAffine(img,M,(1280,800))
    return translated
def createstack(img,rows,comp_factor):
    img_stack=[]
    for j in range(int(rows/comp_factor)):
        img_stack.append(translate(img,0,-j*comp_factor))
    return img_stack
def realframerate(imagepath,required_framerate,ifscanning,logsavingpath):
    os.chdir(imagepath)
    im_files=[]
    for f in os.listdir('.'):
       if f[-3:]=='bmp':
           im_files.append(f)
    avg_time=0
    temp=cv.imread(im_files[1],0)
    rows,cols=temp.shape
    test_stack=createstack(temp,rows,1)
    cv.namedWindow('display',cv.WND_PROP_FULLSCREEN)
    cv.setWindowProperty('display',cv.WND_PROP_FULLSCREEN,cv.WINDOW_FULLSCREEN)
    for i in range(len(test_stack)):
        start=time.clock()
        cv.imshow('display',test_stack[i])
        cv.waitKey(1) #millisecond delay
        delay=(time.clock()-start)
        avg_time+=1000*delay
    cv.destroyAllWindows()
    avg_td=avg_time/len(test_stack)
    del(test_stack)
    ## using close loop program to correct the frame rate 
    req_frate=int(required_framerate)
    actual_frate=1000/avg_td
    if actual_frate<req_frate:
        #print('inside the high loop')
        comp_factor=req_frate//actual_frate
        avg_time=0
        temp=cv.imread(im_files[1],0)
        rows,cols=temp.shape
        test_stack=createstack(temp,rows,comp_factor)
        cv.namedWindow('display',cv.WND_PROP_FULLSCREEN)
        cv.setWindowProperty('display',cv.WND_PROP_FULLSCREEN,cv.WINDOW_FULLSCREEN)
        for i in range(len(test_stack)):
            start=time.clock()
            cv.imshow('display',test_stack[i])
            cv.waitKey(1) #millisecond delay
            delay=(time.clock()-start) #its in seconds
            avg_time+=1000*delay
        cv.destroyAllWindows()
        avg_td=avg_time/len(test_stack)
        #print(avg_td)
        actual_frate=comp_factor*1000/avg_td   ### this has to be written into the log file
        del_time=1
        del(test_stack)  
    else:
        #print('inside the low loop')
        comp_factor=1   #### need to print this into file
        req_delay=int(1000*1/req_frate) # in ms
        avg_time=0
        temp=cv.imread(im_files[1],0)
        rows,cols=temp.shape
        cv.namedWindow('display',cv.WND_PROP_FULLSCREEN)
        cv.setWindowProperty('display',cv.WND_PROP_FULLSCREEN,cv.WINDOW_FULLSCREEN)
        for i in range(100):
            start=time.clock()
            cv.imshow('display',temp)
            cv.waitKey(i+1) #millisecond delay
            delay=(time.clock()-start)
            avg_time+=1000*delay
            #print('image render time is %f ms and the excess is %f ms'%(1000*delay,1000*delay-req_delay))
            if 1000*delay>=req_delay:
                break
        cv.destroyAllWindows()
        actual_frate=1/delay  ### need to print this into file 
        del_time=i+1
        del(temp)
    if ifscanning==1:
        os.chdir(logsavingpath)
        log_file=open('logfile.txt','w')
        log_file.write('%d\n%d\n%d\n%d\n%d\n'%(len(im_files),req_frate,actual_frate,comp_factor,del_time))
        for i in range(len(im_files)):
            log_file.write('row1\\%s\n'%(im_files[i]))
        log_file.close()
    else:
        os.chdir(logsavingpath)
        log_file=open('logfile.txt','w')
        log_file.write('%d\n%d\n%d\n%d\n%d\n'%(len(im_files),req_frate,actual_frate,comp_factor,del_time))
        for i in range(len(im_files)):
            log_file.write('%s\n'%(im_files[i]))
        log_file.close()
    #print('avergae render time is %.2f ms' %(avg_td))
#if __name__=="__main__":
#    realframerate(sys.argv[1],sys.argv[2])