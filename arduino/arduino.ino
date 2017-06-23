// PONER CABLES DEL RELE EN EL TORNILLO DEL MEDIO Y DE LA DERECHA
#include <ArduinoJson.h>
#include <dht.h>
#include <EmonLib.h>

// RELES
#define RELE_ENCENDIDO 1
#define RELE_APAGADO 0
// CONEXIONES
#define DHT22_PIN 2
#define ELECTROVALVULA_DEPOSITO_1 3
#define ELECTROVALVULA_DEPOSITO_2 4
#define ELECTROVALVULA_DEPOSITO_3 5
#define ELECTROVALVULA_DEPOSITO_4 6
#define ELECTROVALVULA_BOMBA_AGUA 7
#define NIVEL_BAJO_DEPOSITO_GENERAL 8
#define LED 9
// SENSORES
#define SENSOR_CORRIENTE A0
#define LDR A5
// CONSTANTES
#define INTERVALO_DHT22 3000
#define INTERVALO_NIVELES 30000
#define INTERVALO_TIEMPOS 60000
#define INTERVALO_LDR 30000
#define NUMERO_ELECTROVALVULAS 4
#define INICIO_RIEGO 1
#define FIN_RIEGO 2
#define LLENANDO_DEPOSITO 3
#define DEPOSITO_LLENO 4
#define INTERVALO_CORRIENTE 3000

// VARIABLES
dht DHT;
unsigned long ultimoTiempoDHT, ultimoTiemposElectrovalvulas;
unsigned long ultimoTiempoNiveles, ultimoTiempoCorriente, ultimoTiempoLDR;
unsigned long pinsElectroValvulas[NUMERO_ELECTROVALVULAS] = {ELECTROVALVULA_DEPOSITO_1, ELECTROVALVULA_DEPOSITO_2, ELECTROVALVULA_DEPOSITO_3, ELECTROVALVULA_DEPOSITO_4};
unsigned long tiemposElectrovalvulas[NUMERO_ELECTROVALVULAS] = {1000, 1000, 1000, 1000};
unsigned long tiempoBombaAgua = 1000;
boolean estadoLed = false;
EnergyMonitor emon1;

void conectarPins() {
  for (int i = 0; i < NUMERO_ELECTROVALVULAS; i++) {
    pinMode(pinsElectroValvulas[i], OUTPUT);
  }
  pinMode(ELECTROVALVULA_BOMBA_AGUA, OUTPUT);
  pinMode(NIVEL_BAJO_DEPOSITO_GENERAL, INPUT);
  pinMode(LED, OUTPUT);
  //pinMode(LDR, INPUT);
}

void leerElectroValvulas() {
  DynamicJsonBuffer jsonBuffer;
  JsonObject& root = jsonBuffer.createObject();
  root["status"] = "success";
  root["type"] = "signals";
  JsonObject& data = root.createNestedObject("data");
  data["ELECTROVALVULA_BOMBA_AGUA"] = digitalRead(ELECTROVALVULA_BOMBA_AGUA);
  for (int i = 0; i < NUMERO_ELECTROVALVULAS; i++) {
    String key = String("ELECTROVALVULA_DEPOSITO_") + String(i + 1);
    data[key] = digitalRead(pinsElectroValvulas[i]);
  }
  imprimeJson(root);
}

void leerEstadoNiveles() {
  if (millis() - ultimoTiempoNiveles >= INTERVALO_NIVELES) {
    ultimoTiempoNiveles = millis();
    cambiaEstadoLed();
    DynamicJsonBuffer jsonBuffer;
    JsonObject& root = jsonBuffer.createObject();
    root["status"] = "success";
    root["type"] = "signals";
    JsonObject& data = root.createNestedObject("data");
    data["NIVEL_BAJO_DEPOSITO_GENERAL"] = digitalRead(NIVEL_BAJO_DEPOSITO_GENERAL);
    imprimeJson(root);
    cambiaEstadoLed();
  }
}

void calculaCorriente() {
  if (millis() - ultimoTiempoCorriente >= INTERVALO_CORRIENTE) {
    ultimoTiempoCorriente = millis();
    cambiaEstadoLed();
    double Irms = emon1.calcIrms(1480);
    DynamicJsonBuffer jsonBuffer;
    JsonObject& root = jsonBuffer.createObject();
    root["status"] = "success";
    root["type"] = "electricity";
    JsonObject& data = root.createNestedObject("data");
    data["irms"] = Irms;
    data["power"] = Irms * 227.0;
    data["watts"] = Irms * 230.0;
    imprimeJson(root);
    cambiaEstadoLed();
  }
}

void inicializarConexiones() {
  for (int i = 0; i < NUMERO_ELECTROVALVULAS; i++) {
    digitalWrite(pinsElectroValvulas[i], RELE_APAGADO);
  }
  digitalWrite(ELECTROVALVULA_BOMBA_AGUA, RELE_APAGADO);
  emon1.current(SENSOR_CORRIENTE, 30);
}

void inicializarTimers() {
  ultimoTiempoDHT = millis();
  ultimoTiempoNiveles = millis();
  ultimoTiemposElectrovalvulas = millis();
  ultimoTiempoCorriente = millis();
  //ultimoTiempoLDR = millis();
}

void setup() {
  Serial.begin(115200);
  while (!Serial) {};
  conectarPins();
  inicializarConexiones();
  inicializarTimers();
  delay(3000);
}

void loop() {
  leerEntradaSerial();
  leerDHT22();
  leerEstadoNiveles();
  leerTiempos();
  calculaCorriente();
  //leerLuz();
}

void leerTiempos() {
  if (millis() - ultimoTiemposElectrovalvulas >= INTERVALO_TIEMPOS) {
    ultimoTiemposElectrovalvulas = millis();
    enviarTiempos();
  }
}

void cambiaEstadoLed() {
  estadoLed = !estadoLed;
  digitalWrite(LED, estadoLed);
}

void imprimeJson(JsonObject& root) {
  int len = root.measureLength() + 1;
  char rootstr[len];
  root.printTo(rootstr, len);
  Serial.println(rootstr);
}

void leerDHT22() {
  if (millis() - ultimoTiempoDHT >= INTERVALO_DHT22) {
    ultimoTiempoDHT = millis();
    cambiaEstadoLed();
    int chk = DHT.read22(DHT22_PIN);
    if (chk == DHTLIB_OK) {
      DynamicJsonBuffer jsonBuffer;
      JsonObject& root = jsonBuffer.createObject();
      root["status"] = "success";
      root["type"] = "dht22";
      JsonObject& data = root.createNestedObject("data");
      data["temperature"] = DHT.temperature;
      data["humidity"] = DHT.humidity;
      imprimeJson(root);
    }
    cambiaEstadoLed();
  }
}

void leerLuz() {
  if (millis() - ultimoTiempoLDR >= INTERVALO_LDR) {
    ultimoTiempoLDR = millis();
    int value = analogRead(LDR);
    if (value > 900) {
      value = 900;
    }
    int result = map(value, 0, 900, 0, 100);
    DynamicJsonBuffer jsonBuffer;
    JsonObject& root = jsonBuffer.createObject();
    root["status"] = "success";
    root["type"] = "signals";
    root["light"] = result;
    imprimeJson(root);
  }
}

void enviarEvento(String message) {
  DynamicJsonBuffer jsonBuffer;
  JsonObject& root = jsonBuffer.createObject();
  root["status"] = "success";
  root["type"] = "event";
  root["message"] = message;
  imprimeJson(root);
}

void leerEntradaSerial() {
  while (Serial.available() > 0) {
    String userEntry = Serial.readString();
    DynamicJsonBuffer jsonBuffer;
    JsonObject &root = jsonBuffer.parseObject(userEntry);
    if (!root.success()) {
      JsonObject& errorRoot = jsonBuffer.createObject();
      errorRoot["status"] = String("error");
      errorRoot["message"] = String("Invalid JSON data");
      imprimeJson(errorRoot);
      return;
    }
    else {
      String action = root["action"];
      if (action == "water") {
        riegoManual();
      }
      else if (action == "change-times") {
        actualizarTiempos(root);
      }
      else {
        JsonObject& invalidOption = jsonBuffer.createObject();
        invalidOption["status"] = String("error");
        invalidOption["message"] = String("Invalid option");
        imprimeJson(invalidOption);
        return;
      }
    }
  }
}

void actualizarTiempos(JsonObject &root) {
  for (int i = 0; i < NUMERO_ELECTROVALVULAS; i++) {
    String key = String("solenoid") + String(i + 1);
    tiemposElectrovalvulas[i] = root["data"][key];
  }
  tiempoBombaAgua = root["data"]["bomb"];
  enviarTiempos();
  enviarEvento("TIEMPOS_ACTUALIZADOS");
}

void enviarTiempos() {
  DynamicJsonBuffer jsonBuffer;
  JsonObject& root = jsonBuffer.createObject();
  root["status"] = "success";
  root["type"] = "times";
  JsonObject& data = root.createNestedObject("data");
  for (int i = 0; i < NUMERO_ELECTROVALVULAS; i++) {
    String key = String("solenoid") + String(i + 1);
    data[key] = tiemposElectrovalvulas[i];
  }
  data["bomb"] = tiempoBombaAgua;
  imprimeJson(root);
}

void riegoManual() {
  cambiaEstadoLed();
  leerElectroValvulas();
  enviarRiego(INICIO_RIEGO, -1);
  enviarEvento("INICIANDO_RIEGO");
  enviarEvento("ELECTROVALVULA_BOMBA_AGUA_ACTIVA");
  digitalWrite(ELECTROVALVULA_BOMBA_AGUA, RELE_ENCENDIDO);
  leerElectroValvulas();
  // Esperar un poco a que la bomba tenga agua en las mangueras
  delay(tiempoBombaAgua);
  ////////////////////////////////
  for (int i = 0; i < NUMERO_ELECTROVALVULAS; i++) {
    int numElectroValvula = i + 1;
    enviarRiego(LLENANDO_DEPOSITO, numElectroValvula);
    String event = String("ELECTROVALVULA_DEPOSITO_") + String(numElectroValvula) + String("_ACTIVA");
    enviarEvento(event);
    digitalWrite(pinsElectroValvulas[i], RELE_ENCENDIDO);
    leerElectroValvulas();
    event = String("LLENANDO_DEPOSITO_") + String(numElectroValvula);
    enviarEvento(event);
    delay(tiemposElectrovalvulas[i]);
    enviarRiego(DEPOSITO_LLENO, numElectroValvula);
    event = String("ELECTROVALVULA_DEPOSITO_") + String(numElectroValvula) + String("_DESACTIVADA");
    enviarEvento(event);
    digitalWrite(pinsElectroValvulas[i], RELE_APAGADO);
  }
  ////////////////////////////////
  leerElectroValvulas();
  enviarRiego(FIN_RIEGO, -1);
  enviarEvento("ELECTROVALVULA_BOMBA_AGUA_DESACTIVADA");
  digitalWrite(ELECTROVALVULA_BOMBA_AGUA, RELE_APAGADO);
  leerElectroValvulas();
  enviarEvento("RIEGO_FINALIZADO");
  cambiaEstadoLed();
}

void enviarRiego(int codigo, int electroValvula) {
  DynamicJsonBuffer jsonBuffer;
  JsonObject& root = jsonBuffer.createObject();
  root["status"] = "success";
  root["type"] = "watering";
  root["code"] = codigo;
  if (electroValvula > 0) {
    root["solenoid"] = electroValvula;
  }
  imprimeJson(root);
}
