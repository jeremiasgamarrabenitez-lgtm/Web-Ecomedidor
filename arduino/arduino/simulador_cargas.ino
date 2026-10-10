/*
 SIMULADOR DE CARGAS ELECTRICAS DOMICILIARIAS
 Arduino UNO - Version 2

 Tomas:
 D2 = TV / LED D8 / 80 W
 D3 = Cocina / LED D9 / 1800 W
 D4 = Cargador / LED D10 / 10 W

 Los pulsadores representan el mecanismo de las tomas:
 enchufado = pulsador accionado = ON
 desenchufado = pulsador liberado = OFF

 No conectar 110/220 V.
*/
const byte PIN_TV=2,PIN_COCINA=3,PIN_CARGADOR=4;
const byte LED_TV=8,LED_COCINA=9,LED_CARGADOR=10;
bool estadoTV=false,estadoCocina=false,estadoCargador=false;
bool ultimoTV=HIGH,ultimoCocina=HIGH,ultimoCargador=HIGH;
unsigned long cambioTV=0,cambioCocina=0,cambioCargador=0;
const unsigned long DEBOUNCE=50;

void setup(){
  pinMode(PIN_TV,INPUT_PULLUP); pinMode(PIN_COCINA,INPUT_PULLUP); pinMode(PIN_CARGADOR,INPUT_PULLUP);
  pinMode(LED_TV,OUTPUT); pinMode(LED_COCINA,OUTPUT); pinMode(LED_CARGADOR,OUTPUT);
  digitalWrite(LED_TV,LOW); digitalWrite(LED_COCINA,LOW); digitalWrite(LED_CARGADOR,LOW);
  Serial.begin(9600); delay(500); enviarEstados();
}
void loop(){
  revisar(PIN_TV,LED_TV,estadoTV,ultimoTV,cambioTV,"TV");
  revisar(PIN_COCINA,LED_COCINA,estadoCocina,ultimoCocina,cambioCocina,"COCINA");
  revisar(PIN_CARGADOR,LED_CARGADOR,estadoCargador,ultimoCargador,cambioCargador,"CARGADOR");
}
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
  Serial.print("COCINA=");Serial.println(estadoCocina?"1":"0");
  Serial.print("CARGADOR=");Serial.println(estadoCargador?"1":"0");
  Serial.println("READY");
}
