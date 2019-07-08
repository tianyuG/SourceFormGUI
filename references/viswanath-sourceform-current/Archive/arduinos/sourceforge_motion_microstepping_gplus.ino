#include <AccelStepper.h>
#include <MultiStepper.h>

#include <Stepper.h>
#define stp 2
#define dir 3
#define MS1 4
#define MS2 5
#define MS3 6
#define EN  7

//-------------- Print Parameters-----------------------------------------------------------------------------------------

float heightperprojection = .025; //in milimeters
float projectionspersecond = 4; //in Hz
int microsteppingfactor = 1;

//-------------- Machine Parameters --------------------------------------------------------------------------------------

const float rapidSpeedmmpers = 15; //in milimeters per second
const float hometostartdist = 287.38; //nominal distance from home position to bottom in milimeters
const int stepsPerRevolution = 200;  // change this to fit the number of steps per revolution
const float leadpitch = 5.08; //in milimeters

//-------------- Initializations -----------------------------------------------------------------------------------------

const float mmperstep = leadpitch/stepsPerRevolution; //nominal distance traveled per step in milimeters
const int hometostartsteps = floor(hometostartdist/mmperstep); //nominal distance from home position to bottom in steps
const float printSpeedmmpers = heightperprojection*projectionspersecond; //in milimeters per second
const float rapidSpeed = (60*rapidSpeedmmpers/leadpitch); //in rpm
const float printSpeed = (60*printSpeedmmpers/leadpitch); //in rpm
const int limitSwitchPin =  13;
int currentLoc = -1;
int numImages;
int i = 0;
String input;


//-----------------------------------------------------------------------------------------------------------------------

void setup() {
  pinMode(stp, OUTPUT);
  pinMode(dir, OUTPUT);
  pinMode(MS1, OUTPUT);
  pinMode(MS2, OUTPUT);
  pinMode(MS3, OUTPUT);
  pinMode(EN, OUTPUT);
  resetBEDPins(); //Set step, direction, microstep and enable pins to default states
  // set the speed at 60 rpm:
  pinMode(limitSwitchPin, INPUT);
  // initialize the serial port:
  //Serial.begin("Printer enabled. Send 'h' to home head, 's' to lower to starting position, and 'P###' where ### is the number of projections");
  Serial.begin(9600);
  
}

void loop() {
  delay(100);
  digitalWrite(EN, LOW); //Pull enable pin low to set FETs active and allow motor control
  while (Serial.available()) {

    input = Serial.readString();// read the incoming data as string
    if (input.charAt(0) == 't')
    {
      projectionspersecond = input.substring(1).toInt();
      //Serial.print("Time per projection was set to ");
      //Serial.println(projectionspersecond);
      Serial.write("done");
    }

    if (input.charAt(0) == 'd')
    {
      heightperprojection = .001*input.substring(1).toInt();
      //Serial.print("Height per projection was set to ");
      //Serial.println(heightperprojection);
      Serial.write("done");
    }
   
    if (input.charAt(0) == 'h')
    {
      
      digitalWrite(dir, HIGH); //Pull direction pin low to move "forward"
      //Serial.println("Homing...");
      digitalWrite(MS1, LOW); //Pull MS1,MS2, and MS3 high to set logic to 1/16th microstep resolution
      digitalWrite(MS2, LOW);
      digitalWrite(MS3, LOW);
      while (digitalRead(limitSwitchPin) == HIGH)
      {
        
        digitalWrite(stp,HIGH); //Trigger one step forward
        delay(1);
        digitalWrite(stp,LOW); //Pull step pin low so it can be triggered again
        delay(1);
      }
      digitalWrite(dir,LOW);
      while (digitalRead(limitSwitchPin) == LOW)
      {
        
        digitalWrite(stp,HIGH); //Trigger one step forward
        delay(1);
        digitalWrite(stp,LOW); //Pull step pin low so it can be triggered again
        delay(1);
        
      }
      
      
      currentLoc = 0;
      //Serial.print("Current Location is ");
      //Serial.println(currentLoc);
      Serial.write("done");
    }

    if (input.charAt(0) == 's' and currentLoc >= 0)
    {
      //Serial.println("Moving to start position...");
//      myStepper.step(hometostartsteps - currentLoc);
        digitalWrite(dir,LOW);
        while (currentLoc < hometostartsteps) 
        {
        digitalWrite(stp,HIGH); //Trigger one step forward
        delay(1);
        digitalWrite(stp,LOW); //Pull step pin low so it can be triggered again
        delay(1);
        currentLoc++;
        }
      currentLoc = hometostartsteps;
      //Serial.print("The head is at the start position. Current Location is ");
      //Serial.println(currentLoc);
      Serial.write("done");

    }
    if (input.charAt(0) == '+' and currentLoc >= 0)
    {
      //Serial.println("Moving to start position...");
//      myStepper.step(hometostartsteps - currentLoc);
        
        digitalWrite(dir,LOW);
        digitalWrite(stp,HIGH); //Trigger one step forward
        delay(1);
        digitalWrite(stp,LOW); //Pull step pin low so it can be triggered again
        delay(1);
        currentLoc++;
        digitalWrite(stp,HIGH); //Trigger one step forward
        delay(1);
        digitalWrite(stp,LOW); //Pull step pin low so it can be triggered again
        delay(1);
        currentLoc++;
        digitalWrite(stp,HIGH); //Trigger one step forward
        delay(1);
        digitalWrite(stp,LOW); //Pull step pin low so it can be triggered again
        delay(1);
        currentLoc++;
        digitalWrite(stp,HIGH); //Trigger one step forward
        delay(1);
        digitalWrite(stp,LOW); //Pull step pin low so it can be triggered again
        delay(1);
        currentLoc++;
        
      Serial.println(currentLoc*mmperstep);
      //Serial.print("The head is at the start position. Current Location is ");
      //Serial.println(currentLoc);
      

    }
    if (input.charAt(0) == '-' and currentLoc >= 0)
    {
      //Serial.println("Moving to start position...");
//      myStepper.step(hometostartsteps - currentLoc);
        
        digitalWrite(dir,HIGH);
        digitalWrite(stp,HIGH); //Trigger one step forward
        delay(1);
        digitalWrite(stp,LOW); //Pull step pin low so it can be triggered again
        delay(1);
        currentLoc=currentLoc-1;
        digitalWrite(stp,HIGH); //Trigger one step forward
        delay(1);
        digitalWrite(stp,LOW); //Pull step pin low so it can be triggered again
        delay(1);
        currentLoc=currentLoc-1;
        digitalWrite(stp,HIGH); //Trigger one step forward
        delay(1);
        digitalWrite(stp,LOW); //Pull step pin low so it can be triggered again
        delay(1);
        currentLoc=currentLoc-1;
        digitalWrite(stp,HIGH); //Trigger one step forward
        delay(1);
        digitalWrite(stp,LOW); //Pull step pin low so it can be triggered again
        delay(1);
        currentLoc=currentLoc-1;
        digitalWrite(dir,LOW);
      Serial.println(currentLoc*mmperstep);
      //Serial.print("The head is at the start position. Current Location is ");
      //Serial.println(currentLoc);
      

    }
    
    if (input.charAt(0) == 'p')
    {
      delay(35000);
      digitalWrite(MS1, LOW); //Pull MS1,MS2, and MS3 high to set logic to 1/16th microstep resolution
      digitalWrite(MS2, LOW);
      digitalWrite(MS3, LOW);
      digitalWrite(dir, HIGH);
      numImages = input.substring(1).toInt();
      for(i= 1; i<=numImages; i++)  //Loop the forward stepping enough times for motion to be visible
      {
        digitalWrite(stp,HIGH); //Trigger one step forward
        delay(8333); //works with 5.5v in
        digitalWrite(stp,LOW); //Pull step pin low so it can be triggered again
        
      }
      while (digitalRead(limitSwitchPin) == HIGH)
      {
        
        digitalWrite(stp,HIGH); //Trigger one step forward
        delay(1);
        digitalWrite(stp,LOW); //Pull step pin low so it can be triggered again
        delay(1);
      }
      digitalWrite(dir,LOW);
      while (digitalRead(limitSwitchPin) == LOW)
      {
        
        digitalWrite(stp,HIGH); //Trigger one step forward
        delay(1);
        digitalWrite(stp,LOW); //Pull step pin low so it can be triggered again
        delay(1);
        
      }
      //Serial.println(numImages);
      //Serial.println("Beginning Print");
//      myStepper.setSpeed(printSpeed);
//      myStepper.step(-numImages);
//      myStepper.setSpeed(rapidSpeed);
      //Serial.println("The print is complete");
    Serial.write("done");
    }
  }
  
}

void resetBEDPins()
{
  digitalWrite(stp, LOW);
  digitalWrite(dir, LOW);
  digitalWrite(MS1, LOW);
  digitalWrite(MS2, LOW);
  digitalWrite(MS3, LOW);
  digitalWrite(EN, HIGH);
}

