/*
  ============================================================================
   AcquaSafe - Leitura do sensor de pH E201-9 no Arduino Uno R3
   Arquivo: arduino/acquasafe_ph/acquasafe_ph.ino
  ============================================================================

   IMPORTANTE: o E201-9 eh apenas o ELETRODO (conector BNC). Ele NAO liga
   direto no Arduino: voce precisa da placa de condicionamento de sinal
   (tipo PH-4502C / "pH meter V1.1") que vem no kit.

   LIGACAO (placa BNC -> Arduino Uno R3)
     VCC / V+  -> 5V
     GND / G   -> GND
     PO / AOUT -> A0
     (TO = temperatura e DO = alarme digital: opcionais, nao usados aqui)
   O pino USB (serial) usa os pinos 0/1 - nao use esses pinos para outra coisa.

   A placa entrega ~2,5 V em pH 7 e a tensao CAI conforme o pH SOBE
   (~0,18 V por unidade de pH, varia por placa/probe). Por isso a calibracao
   de 2 pontos e obrigatoria para numeros confiaveis.

   PROTOCOLO SERIAL: 9600 baud, 1 linha JSON por segundo.
     {"tipo":"leitura","ph":7.02,"raw":512,"mv":2502,"cal":true,"pontos":2,"ms":12345}

   COMANDOS (envie pelo Monitor Serial ou pela pagina sensor.html):
     HELP        -> lista de comandos
     RAW / GET   -> publica uma leitura imediatamente
     STATUS      -> mostra a calibracao atual
     CAL:7.00    -> registra o ponto de calibracao no buffer de pH 7.00
     CAL:4.00    -> registra o ponto de calibracao no buffer de pH 4.00
     CAL:10.00   -> (opcional) terceiro ponto; sempre ficam os 2 ultimos
     RESET       -> apaga a calibracao (volta para a curva nominal)

   A calibracao fica gravada na EEPROM, entao nao se perde ao desligar.
   Enquanto nao houver 2 pontos, o valor "ph" vem de uma curva nominal
   APROXIMADA e o campo "cal" vem false - sirva apenas para ver o sensor
   reagir, nao para medir de verdade.
  ============================================================================
*/

#include <Arduino.h>
#include <EEPROM.h>

const byte     PIN_PH      = A0;
const uint8_t  N_AMOSTRAS  = 30;
const unsigned PERIODO_MS  = 1000;          // 1 leitura por segundo
const float    VREF        = 5.0;           // Uno R3 = referencia de 5 V
const float    ADC_FULL    = 1023.0;        // ADC de 10 bits
const float    V_PH7_NOM   = 2.5;           // valor tipico em pH 7
const float    V_POR_PH    = 0.18;          // inclinacao tipica (V por pH)

const uint32_t MAGIA = 0x41535048UL;        // "ASPH"

struct PontoCal { float ph; int raw; };
struct CalData  { uint32_t magia; PontoCal a; PontoCal b; };

CalData cal;
bool calibrado = false;
unsigned long ultimoEnvio = 0;

/* -------------------- utilidades -------------------- */

float meuAbs(float x) { return x < 0 ? -x : x; }

uint8_t nPontos() {
  return (cal.a.ph > 0.1f ? 1 : 0) + (cal.b.ph > 0.1f ? 1 : 0);
}

void recalcularFlag() {
  calibrado = (nPontos() == 2) &&
              (cal.a.raw != cal.b.raw) &&
              (meuAbs(cal.a.ph - cal.b.ph) > 0.5f);
}

/* Media dos 10 valores centrais de 30 amostras: corta ruido da rede
   e picos do cabo longo do eletrodo sem precisar de biblioteca. */
int lerRaw() {
  int v[N_AMOSTRAS];
  for (uint8_t i = 0; i < N_AMOSTRAS; i++) {
    v[i] = analogRead(PIN_PH);
    delay(4);
  }
  for (uint8_t i = 1; i < N_AMOSTRAS; i++) {        // insertion sort
    int x = v[i];
    int8_t j = (int8_t)i - 1;
    while (j >= 0 && v[j] > x) { v[j + 1] = v[j]; j--; }
    v[j + 1] = x;
  }
  long soma = 0;
  for (uint8_t i = 10; i < 20; i++) soma += v[i];  // 10 amostras centrais
  return (int)(soma / 10);
}

float tensaoDe(int raw) { return raw * VREF / ADC_FULL; }

float phDe(int raw) {
  if (calibrado) {
    // Interpolacao linear entre os 2 pontos de calibracao.
    // Nao depende de nenhuma constante "de fabrica" da placa.
    return cal.a.ph +
           (float)(raw - cal.a.raw) * (cal.b.ph - cal.a.ph) /
           (float)(cal.b.raw - cal.a.raw);
  }
  // Curva nominal provisoria (APROXIMADA): tensao cai quando o pH sobe.
  return 7.0 + (V_PH7_NOM - tensaoDe(raw)) / V_POR_PH;
}

void publicarLeitura() {
  int   raw = lerRaw();
  float ph  = phDe(raw);
  if (ph < 0.0)   ph = 0.0;
  if (ph > 14.0)  ph = 14.0;

  Serial.print(F("{\"tipo\":\"leitura\",\"ph\":"));
  Serial.print(ph, 2);
  Serial.print(F(",\"raw\":"));
  Serial.print(raw);
  Serial.print(F(",\"mv\":"));
  Serial.print((int)(tensaoDe(raw) * 1000.0));
  Serial.print(F(",\"cal\":"));
  Serial.print(calibrado ? F("true") : F("false"));
  Serial.print(F(",\"pontos\":"));
  Serial.print(nPontos());
  Serial.print(F(",\"ms\":"));
  Serial.print(millis());
  Serial.println(F("}"));
}

void responder(const char* cmd, bool ok, const String& msg) {
  Serial.print(F("{\"tipo\":\"resposta\",\"cmd\":\""));
  Serial.print(cmd);
  Serial.print(F("\",\"ok\":"));
  Serial.print(ok ? F("true") : F("false"));
  Serial.print(F(",\"msg\":\""));
  for (unsigned int i = 0; i < msg.length(); i++) {
    char c = msg.charAt(i);
    if (c == '"' || c == '\\') Serial.write('\\');
    Serial.write(c);
  }
  Serial.print(F("\",\"cal\":"));
  Serial.print(calibrado ? F("true") : F("false"));
  Serial.print(F(",\"pontos\":"));
  Serial.print(nPontos());
  Serial.println(F("}"));
}

/* -------------------- comandos -------------------- */

void processarComando(String cmd) {
  cmd.trim();
  if (cmd.length() == 0) return;

  if (cmd.equalsIgnoreCase("HELP")) {
    responder("HELP", true,
      String("RAW | GET | STATUS | CAL:7.00 | CAL:4.00 | CAL:10.00 | RESET"));
    return;
  }
  if (cmd.equalsIgnoreCase("RAW") || cmd.equalsIgnoreCase("GET")) {
    publicarLeitura();
    return;
  }
  if (cmd.equalsIgnoreCase("STATUS")) {
    String m = "pH7~2.5V / ";
    m += String(nPontos());
    m += " ponto(s). a=";
    m += String(cal.a.ph, 2) + "@" + String(cal.a.raw);
    m += " b=" + String(cal.b.ph, 2) + "@" + String(cal.b.raw);
    responder("STATUS", true, m);
    return;
  }
  if (cmd.startsWith("CAL:") || cmd.startsWith("cal:")) {
    float ph = cmd.substring(4).toFloat();
    if (ph < 0.0 || ph > 14.0) {
      responder("CAL", false, String("pH invalido (use 0..14)"));
      return;
    }
    int raw = lerRaw();

    // Substitui ponto existente com o mesmo pH; senao preenche um slot livre.
    if (nPontos() > 0 && meuAbs(cal.a.ph - ph) < 0.05f)      cal.a = {ph, raw};
    else if (nPontos() > 0 && meuAbs(cal.b.ph - ph) < 0.05f) cal.b = {ph, raw};
    else if (cal.a.ph <= 0.1f)                                cal.a = {ph, raw};
    else                                                      cal.b = {ph, raw};

    EEPROM.put(0, cal);
    recalcularFlag();

    String m = "Ponto pH " + String(ph, 2) +
               " = raw " + String(raw) +
               " (" + String(tensaoDe(raw), 3) + "V). " +
               String(nPontos()) + "/2 pontos.";
    responder("CAL", true, m);
    return;
  }
  if (cmd.equalsIgnoreCase("RESET")) {
    cal.magia = MAGIA;
    cal.a = {0.0f, 0};
    cal.b = {0.0f, 0};
    EEPROM.put(0, cal);
    recalcularFlag();
    responder("RESET", true, String("Calibracao apagada; curva nominal ativa."));
    return;
  }
  responder(cmd.c_str(), false, String("Comando desconhecido. Digite HELP."));
}

/* -------------------- setup / loop -------------------- */

void setup() {
  Serial.begin(9600);
  pinMode(PIN_PH, INPUT);

  EEPROM.get(0, cal);
  if (cal.magia != MAGIA) {
    cal.magia = MAGIA;
    cal.a = {0.0f, 0};
    cal.b = {0.0f, 0};
    EEPROM.put(0, cal);
  }
  recalcularFlag();

  Serial.println(F("{\"tipo\":\"resposta\",\"cmd\":\"BOOT\",\"ok\":true,\"msg\":\"AcquaSafe pH pronto - 9600 baud. Digite HELP.\",\"cal\":false,\"pontos\":0}"));
}

void loop() {
  if (Serial.available()) {
    processarComando(Serial.readStringUntil('\n'));
  }
  if (millis() - ultimoEnvio >= PERIODO_MS) {
    ultimoEnvio = millis();
    publicarLeitura();
  }
}
