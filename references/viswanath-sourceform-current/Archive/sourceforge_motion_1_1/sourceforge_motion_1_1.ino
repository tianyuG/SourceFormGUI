#include <Stepper.h>

//-------------- Print Parameters-----------------------------------------------------------------------------------------

const float heightperprojection = .025; //in milimeters
const float projectionspersecond = 4; //in Hz
const float rapidSpeedmmpers = 15; //in milimeters per second

//-------------- Machine Parameters --------------------------------------------------------------------------------------

const float hometostartdist = 250; //nominal distance from home position to bottom in milimeters
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
String input;
Stepper myStepper(stepsPerRevolution, 8, 9, 10, 11);

//-----------------------------------------------------------------------------------------------------------------------

void setup() {
  // set the speed at 60 rpm:
  myStepper.setSpeed(rapidSpeed);
  pinMode(limitSwitchPin, INPUT);
  // initialize the serial port:
  Serial.begin("Printer enabled. Send 'h' to home head, 's' to lower to starting position, and 'P###' where ### is the number of projections");
  Serial.begin(9600);
  Serial.println("Rapid speed is");
  Serial.println(rapidSpeed);
  Serial.println("Print speed is");
  Serial.println(printSpeed);

}

void loop() {
  delay(100);
  while (Serial.available()) {

    input = Serial.readString();// read the incoming data as string
    if (input.charAt(0) == 'h')
    {
      Serial.println("Homing...");
      while (digitalRead(limitSwitchPin) == HIGH)
      {
        myStepper.step(-1);
      }
      while (digitalRead(limitSwitchPin) == LOW)
      {
        myStepper.step(1);
      }
      currentLoc = 0;
      Serial.print("Current Location is ");
      Serial.println(currentLoc);
    }

    if (input.charAt(0) == 's' and currentLoc >= 0)
    {
      Serial.println("Moving to start position...");
      myStepper.step(hometostartsteps - currentLoc);
      currentLoc = hometostartsteps;
      Serial.print("The head is at the start position. Current Location is ");
      Serial.println(currentLoc);

    }
    
    if (input.charAt(0) == 'p' and currentLoc == hometostartsteps)
    {
      numImages = input.substring(1).toInt();
      Serial.println(numImages);
      Serial.println("Beginning Print");
      myStepper.setSpeed(printSpeed);
      myStepper.step(-numImages);
      myStepper.setSpeed(rapidSpeed);
      Serial.println("The print is complete");

    }
  }
  
}

