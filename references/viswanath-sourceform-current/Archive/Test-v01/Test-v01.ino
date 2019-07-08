void setup() {
Serial.begin(9600);

}

void loop() {

while(Serial.available()>0)
{
  char data=Serial.read();
  switch(data)
  {
    case 'h':
      Serial.write("done");
      //Serial.write('\n');
      break;
    case 's':
      //Serial.println("start printing");
      Serial.write("done");
      //Serial.write('\n');
      break;
    default:
    ;
  }
}

}
