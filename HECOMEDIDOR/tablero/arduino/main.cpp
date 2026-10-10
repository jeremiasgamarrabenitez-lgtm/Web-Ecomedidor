#include <Arduino.h>

const byte PIN_TV=2;
const byte PIN_VENTILADOR=3;
const byte PIN_LUZ=4;

const byte LED_TV=8;
const byte LED_VENTILADOR=9;
const byte LED_LUZ=10;

bool estadoTV=false,estadoVentilador=false,estadoLuz=false;
bool ultimoTV=HIGH,ultimoVentilador=HIGH,ultimoLuz=HIGH;
unsigned long cambioTV=0,cambioVentilador=0,cambioLuz=0;
const unsigned long DEBOUNCE=50;

void revisar(byte pin,byte led,bool &estado,bool &ultimo,unsigned long &tiempo,const char* nombre){
  bool lectura=digitalRead(pin);
  if(lectura!=ultimo){tiempo=millis();ultimo=lectura;}
  if(millis()-tiempo>DEBOUNCE){
    bool nuevo=(lectura==LOW);
    if(nuevo!=estado){
      estado=nuevo;
      digitalWrite(led,estado?HIGH:LOW);
      Serial.print(nombre);Serial.print("=");Serial.println(estado?"1":"0");
    }
  }
}

void enviarEstados(){
  Serial.print("TV=");Serial.println(estadoTV?"1":"0");
  Serial.print("VENTILADOR=");Serial.println(estadoVentilador?"1":"0");
  Serial.print("LUZ=");Serial.println(estadoLuz?"1":"0");
  Serial.println("READY");
}

void setup(){
  pinMode(PIN_TV,INPUT_PULLUP);
  pinMode(PIN_VENTILADOR,INPUT_PULLUP);
  pinMode(PIN_LUZ,INPUT_PULLUP);
  pinMode(LED_TV,OUTPUT);
  pinMode(LED_VENTILADOR,OUTPUT);
  pinMode(LED_LUZ,OUTPUT);
  digitalWrite(LED_TV,LOW);
  digitalWrite(LED_VENTILADOR,LOW);
  digitalWrite(LED_LUZ,LOW);
  Serial.begin(9600);
  delay(500);
  enviarEstados();
}

void loop(){
  revisar(PIN_TV,LED_TV,estadoTV,ultimoTV,cambioTV,"TV");
  revisar(PIN_VENTILADOR,LED_VENTILADOR,estadoVentilador,ultimoVentilador,cambioVentilador,"VENTILADOR");
  revisar(PIN_LUZ,LED_LUZ,estadoLuz,ultimoLuz,cambioLuz,"LUZ");
}
