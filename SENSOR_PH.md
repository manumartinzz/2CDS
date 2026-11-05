# Guia: sensor de pH E201-9 → site AcquaSafe

> **Resposta curta:** dá sim. O Arduino Uno R3 **não tem WiFi**, então o caminho mais curto é
> **USB → Web Serial → página do próprio site**. Não precisa comprar módulo de rede, não precisa
> de servidor e não precisa mexer no backend: o navegador lê a porta COM do Arduino e, se quiser,
> grava a leitura direto na tabela `leituras` do Supabase que o `portal.html` já usa.

---

## 1. Antes de tudo: o que você tem e o que falta

O **E201-9 é só o eletrodo** (uma sonda de vidro com conector BNC). Sozinho ele **não liga no
Arduino**: a saída dele é um sinal de milivolts de altíssima impedância. Quem conversa com o
Arduino é a **placa de condicionamento** (a famosa PH-4502C / "pH meter V1.1" que normalmente
vem no kit, com o conector BNC e dois trimpots) [5](https://mikroelectron.com/product/me-428).
👉 **Confere aí:** se você comprou só a sonda, precisa dessa placa. Ela custa pouco e é o que
possibilita tudo abaixo.

Checklist:

- [ ] Eletrodo E201-9 (BNC)
- [ ] Placa de condicionamento BNC → 3 pinos (VCC / GND / PO)
- [ ] Arduino Uno R3 + **cabo USB que transmita dados** (não serve cabo só de carga)
- [ ] Soluções-tampão **pH 7,00** e **pH 4,00** (essenciais; pH 10,00 é opcional)
- [ ] Água destilada para enxague e solução de armazenamento (KCl 3M) pra guardar a sonda
- [ ] Chrome ou Edge **desktop** (Web Serial não existe no Firefox/Safari)

Como a placa funciona: ela "flutua" o sinal em ~2,5 V, que corresponde a pH 7; a tensão **cai**
conforme o pH **sobe**, cerca de 0,18 V por unidade de pH (varia por placa e por sonda) — pH 4
fica perto de 3,0 V e pH 10 perto de 2,0 V [2](https://protei.org/how-to-use-a-ph-sensor-with-arduino/),
[4](https://www.e-tinkers.com/2019/11/measure-ph-with-a-low-cost-arduino-ph-sensor-board/).
O ADC de 10 bits do Uno com referência de 5 V dá ~4,9 mV por passo, ou seja ~0,03 unidade de pH
de resolução — mais que suficiente pra bancada.

---

## 2. Três formas de levar o dado até o site

| Caminho | Como | Prós | Contras |
|---|---|---|---|
| **A. Web Serial (recomendado)** | Arduino no USB → `sensor.html` lê a porta pelo navegador | Zero hardware extra, zero servidor, vê o pH na hora | Precisa Chrome/Edge, HTTPS/localhost, aba própria e a página aberta |
| **B. Ponte Python** | script no PC lê a serial e faz POST no Supabase | Funciona em qualquer navegador, roda 24/7 em background, reconecta sozinho | Precisa Python + `pyserial` na máquina |
| **C. WiFi (ESP8266/ESP32)** | módulo ligado ao Uno (ou um ESP32 no lugar dele) faz POST direto na REST do Supabase | É o "produto real", sensor autônomo | Mais hardware, firmware novo, e **nunca** coloque a chave `service_role` no microcontrolador |

Este kit implementa **A** e **B** prontos. O **C** é o próximo passo natural se você quiser
deixar o sensor instalado na lavoura sem PC ligado — me fala que eu monto.

> ⚠️ Limitação do preview: a Web Serial exige um **contexto de navegação de topo** com um gesto
> do usuário. Se abrir o site dentro de um iframe de preview, o navegador pode bloquear
> (`Permissions Policy: serial`). Abra a URL em **aba própria**. `localhost` também é contexto
> seguro, então clonar o repo e rodar `python3 -m http.server` na sua máquina funciona igual.

---

## 3. Ligação elétrica

| Placa BNC (PH-4502C) | Arduino Uno R3 |
|---|---|
| `VCC` / `V+` | **5V** |
| `GND` / `G` | **GND** (ligue os dois GND da placa se houver dois) |
| `PO` / `AOUT` | **A0** |
| `TO` (temperatura) | não usado |
| `DO` (alarme digital) | não usado |

Cuidados:

- **GND comum obrigatório** entre placa e Arduino.
- Nunca coloque mais de 5 V no A0. Se a sua placa for de 3,3 V, ainda funciona (só muda a escala e a calibração resolve).
- O cabo do BNC é de alta impedância: deixe curto, longe de motores/rede elétrica, e não encoste no pino central com o dedo.
- Os pinos **D0/D1 são a serial USB** — não use para mais nada.
- O trimpot **POT 1** (o mais perto do BNC) ajusta o offset: com o BNC em curto (pino central ligado à malha externa) a saída `PO` deve dar **2,50 V** [1](https://meta-express.com/?attachment_category_id=1&item_id=675&page_is=item_attachment).
  Dá pra fazer isso com um multímetro, mas a **calibração por software em 2 pontos** (abaixo) é mais confiável e dispensa o ajuste fino.
- O bulbo de vidro é frágil: **nunca deixe seco**, não esfregue, guarde em KCl e enxague com água destilada entre soluções.

---

## 4. Firmware (`arduino/acquasafe_ph/acquasafe_ph.ino`)

1. Abra o `.ino` na Arduino IDE, selecione **Arduino Uno** e a porta, faça o upload.
2. Serial: **9600 baud**. O sketch emite **uma linha JSON por segundo**:

```json
{"tipo":"leitura","ph":7.02,"raw":512,"mv":2502,"cal":true,"pontos":2,"ms":12345}
```

   > Sem Arduino IDE? Dá pra usar `arduino-cli` (roda na sua máquina, não no sandbox):
   > ```bash
   > arduino-cli core install arduino:avr
   > arduino-cli compile --fqbn arduino:avr:uno arduino/acquasafe_ph
   > arduino-cli upload -p COM3 --fqbn arduino:avr:uno arduino/acquasafe_ph   # /dev/ttyACM0 no Linux
   > ```
   > **Só estar plugado no USB não basta**: um Uno novo não envia nada pela serial sem o sketch gravado.
   > A página `sensor.html` avisa automaticamente se conectar e não receber nenhum JSON em 4 s.

3. Comandos que você pode mandar (Monitor Serial ou pelos botões da página):

| Comando | Efeito |
|---|---|
| `HELP` | lista os comandos |
| `RAW` / `GET` | publica uma leitura na hora |
| `STATUS` | mostra os pontos de calibração gravados |
| `CAL:7.00` | registra o ponto no tampão pH 7,00 |
| `CAL:4.00` | registra o ponto no tampão pH 4,00 |
| `CAL:10.00` | terceiro ponto opcional (ficam sempre os 2 últimos) |
| `RESET` | apaga a calibração |

A leitura usa **média dos 10 valores centrais de 30 amostras** (corta ruído) e a conversão é uma
**reta entre os 2 pontos calibrados**, sem depender de constantes de fabricante. A calibração fica
na **EEPROM**, então não se perde ao desligar. Enquanto você não calibrar, o campo `ph` vem de uma
curva nominal aproximada e `cal` vem `false` — serve só pra confirmar que o sensor reage.

---

## 5. Calibração (a parte que mais importa)

1. Enxague o bulbo com água destilada, seque com leves batidas no papel (não esfregue).
2. Mergulhe no tampão **pH 7,00**, espere **30–60 s** o valor estabilizar, envie `CAL:7.00`.
3. Enxague de novo, mergulhe no tampão **pH 4,00**, espere estabilizar, envie `CAL:4.00`.
4. O badge da página passa a **"Calibrado (2 pontos)"**. A partir daí o pH é calculado pela reta real do seu conjunto sonda+placa.

Dicas: a temperatura muda a inclinação da curva de Nernst (~59 mV/pH a 25 °C), então calibre na
temperatura em que vai medir; recalibre a cada algumas semanas (eletrodo envelhece); se tiver um
DS18B20, dá pra ligar no `TO`/A1 e compensar depois.

---

## 6. Banco de dados (só se quiser gravar / ver no portal)

O repositório **não versiona o schema do Supabase** — só o código que consulta as tabelas. Rode
uma vez no **SQL Editor** do Supabase:

```bash
# conteúdo em: supabase/leituras.sql
```

Ele cria `public.leituras` (`sensor_id`, `ph`, `fluor`, `cloro`, `turbidez`, `criado_em`), índice e
as policies de RLS. O `portal.html` faz GET nessa tabela **com a anon key e sem sessão**, então a
policy de SELECT precisa incluir `anon`. A policy de INSERT também está aberta para `anon` —
**ok para TCC/bancada, mas não para produção** (qualquer pessoa com a anon key poderia inserir
linhas). O próprio arquivo SQL traz 3 formas de endurecer isso.

> A anon key estar no código **não é um vazamento**: ela é pública por design; quem protege é o RLS.
> O que **nunca** pode ir pro frontend/firmware é a chave `service_role`.

---

## 7. Teste ponta a ponta (caminho A)

1. Monte a fiação da seção 3 e conecte o USB.
2. Faça upload do `acquasafe_ph.ino`; confira no Monitor Serial que chegam linhas JSON.
3. **Feche o Monitor Serial** (a porta é exclusiva — se ficar aberto, o navegador não consegue abrir).
4. Abra **`sensor.html`** em **aba própria**, no Chrome/Edge, em HTTPS (ou localhost).
5. Clique em **Conectar Arduino** → escolha a porta → status fica "Conectado · 9600 baud".
6. O número de pH começa a atualizar a cada 1 s e o gráfico desenha as últimas 60 amostras.
   **Teste rápido de vida:** tire e coloque o eletrodo do tampão pH 7 para o pH 4 — o `raw`/`mV`
   deve subir ~0,5 V e o pH cair ~3 unidades. Se nada mudar, o problema é elétrico, não de código.
7. Faça a calibração de 2 pontos (seção 5).
8. Marque **"Enviar leituras para a tabela `leituras`"**. O console confirma cada gravação.
9. Clique em **"Ver no painel →"** (`portal.html?real=1`) e veja a leitura real no dashboard
   (o portal continua exigindo login, como antes).

### Troubleshooting

| Sintoma | Causa provável |
|---|---|
| "Falha ao conectar: Failed to open serial port" | Monitor Serial da IDE aberto, ou outro app usando a COM |
| Nenhuma porta aparece no diálogo | Cabo só de carga, driver CH340/ATmega16U2 faltando |
| `Permission denied` no Linux | `sudo usermod -aG dialout $USER` + logout/login |
| Página em iframe não conecta | Web Serial bloqueada por Permissions Policy → abra em aba própria |
| Valor travado em ~512 / 2,5 V | BNC em curto, sonda desconectada ou placa sem alimentação |
| pH oscila muito | Cabo longo/ruído, bulbo sujo, sonda seca, ou falta de estabilização térmica |
| "Falha ao gravar ... RLS" | Não rodou `supabase/leituras.sql`, ou a policy de INSERT não inclui `anon` |
| `pH` absurdo (0 ou 14) | Ainda sem calibração: use a curva nominal só como indicador de reação |

### Caminho B (se não quiser depender do navegador)

```bash
pip install pyserial
python3 bridge/ph_serial_bridge.py --port /dev/ttyACM0 --interval 5
# Windows:  python3 bridge/ph_serial_bridge.py --port COM3
# so olhar: python3 bridge/ph_serial_bridge.py --port /dev/ttyACM0 --dry-run
```

O script lê as mesmas linhas JSON, reconecta se o USB cair e faz POST na REST do Supabase.
Aí qualquer navegador (até o iframe) consegue ver os dados em `portal.html?real=1`.

---

## 8. O que foi ajustado no site

Para não misturar leitura **real** com leitura **simulada**, entrei com mudanças pequenas e
compatíveis (o comportamento normal do site não muda):

| Arquivo | Mudança |
|---|---|
| `sensor.html` / `sensor.js` | Nova página de bancada: Web Serial, gráfico, calibração, gravação opcional no Supabase |
| `portal.html` | Link "Testar Sensor" na navbar; parâmetro **`?real=1`** desliga o gerador de leituras falsas, desativa o botão "simular alerta" e passa a só reler o banco a cada 10 s; cards agora tratam parâmetros ausentes (`—`) em vez de quebrar com `null.toFixed()` |
| `portal.js` | No modo `?real=1`, mantém a checagem de login mas **não** cria um segundo gráfico no mesmo canvas (evita o conflito entre os dois "cérebros" do painel) |
| `sw.js` | Cache do PWA atualizado (`acquasafe-v3`) incluindo a nova página |
| `supabase/leituras.sql` | Schema + RLS da tabela que faltava no repo |
| `bridge/ph_serial_bridge.py` | Ponte serial → Supabase |
| `arduino/acquasafe_ph/` | Firmware do Uno R3 |

---

## 9. Limitações honestas / próximos passos

- Você tem **só pH**. Em `?real=1`, flúor, cloro e turbidez aparecem como `—` (nulos) e o
  gráfico do portal mostra lacunas nesses datasets. O `sensor.html` mostra só pH, sem fake.
- Não há compensação de temperatura nem isolamento galvânico; o Uno é 5 V e a placa BNC é analógica.
- O repo ainda convive com **dois modelos de dados** (`leituras` no script inline do portal e
  `leituras_sensores`/`sensores`/`alertas` no `portal.js`). Este kit escolheu `leituras` porque é o
  que já alimenta os cards e o gráfico. Vale unificar isso num próximo passo.
- Se quiser **WiFi de verdade**, o próximo passo é um ESP8266/ESP32 recebendo o `PO` (com divisor
  de tensão se for ESP32 em 3,3 V) ou um ESP ligado à serial do Uno, fazendo POST autenticado por
  token de dispositivo numa RPC `SECURITY DEFINER`.

---

## 10. Arquivos deste kit

```
arduino/acquasafe_ph/acquasafe_ph.ino   firmware do Uno R3 (9600 baud, JSON, calibração na EEPROM)
sensor.html                            página de teste no navegador
sensor.js                              Web Serial + Chart + gravação no Supabase
bridge/ph_serial_bridge.py             alternativa Python (serial → REST)
supabase/leituras.sql                  tabela + índice + policies RLS
SENSOR_PH.md                           este guia
```

### Referências de hardware

- [2](https://protei.org/how-to-use-a-ph-sensor-with-arduino/) — pH 7 ≈ 2,5 V, ~0,18 V/pH, calibração em 2 pontos
- [5](https://mikroelectron.com/product/me-428) — pinout da PH-4502C (VCC/GND/PO/TO/DO) e trimpots
- [4](https://www.e-tinkers.com/2019/11/measure-ph-with-a-low-cost-arduino-ph-sensor-board/) — offset de 2,5 V e cálculo da inclinação
- [1](https://meta-express.com/?attachment_category_id=1&item_id=675&page_is=item_attachment) — ajuste do trimpot com BNC em curto
