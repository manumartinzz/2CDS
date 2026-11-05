#!/usr/bin/env python3
"""
AcquaSafe - Ponte Serial -> Supabase (alternativa a sensor.html / Web Serial)
============================================================================

Use quando o navegador nao tiver Web Serial (Firefox/Safari, iframe de preview,
maquina sem interface grafica) ou quando quiser deixar o sensor gravando no
banco 24/7 sem pagina aberta.

  pip install pyserial

  python3 bridge/ph_serial_bridge.py --port /dev/ttyACM0
  python3 bridge/ph_serial_bridge.py --port COM3 --interval 10
  python3 bridge/ph_serial_bridge.py --port /dev/ttyACM0 --dry-run   # so imprime

No Linux, se der "Permission denied":
  sudo usermod -aG dialout $USER   # depois faca logout/login

O Arduino deve estar rodando arduino/acquasafe_ph/acquasafe_ph.ino (9600 baud,
uma linha JSON por segundo). A tabela e as policies estao em
supabase/leituras.sql.
"""

import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.request

# Mesmos valores de supabase-client.js. A anon key e PUBLICA por design:
# quem protege os dados e o RLS, nao o segredo da chave.
URL_PADRAO = "https://syoxvywvlwftdkpebogn.supabase.co"
KEY_PADRAO = (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5b3h2eXd2bHdmdGRrcGVib2duIiwicm9sZSI6ImFub24iLCJ"
    "pYXQiOjE3ODczNDM3ODksImV4cCI6MjEwMjkxOTc4OX0.AjXevRAIevIOZpD5DBWJm-kM1QubOlbvugN7F_lWzpY"
)
TABELA = "leituras"


def log(msg: str) -> None:
    print(f"[{time.strftime('%H:%M:%S')}] {msg}", flush=True)


def postar_leitura(base_url: str, key: str, payload: dict) -> None:
    url = base_url.rstrip("/") + "/rest/v1/" + TABELA
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        method="POST",
        headers={
            "apikey": key,
            "Authorization": "Bearer " + key,
            "Content-Type": "application/json",
            "Prefer": "return=minimal",
        },
    )
    with urllib.request.urlopen(req, timeout=10) as resp:
        if resp.status not in (200, 201, 204):
            raise RuntimeError(f"HTTP {resp.status}: {resp.read().decode()}")


def main() -> int:
    p = argparse.ArgumentParser(description="AcquaSafe: Arduino pH -> Supabase")
    p.add_argument("--port", default=os.environ.get("PH_PORT", "/dev/ttyACM0"),
                   help="Porta serial (COM3 no Windows, /dev/ttyACM0 no Linux)")
    p.add_argument("--baud", type=int, default=9600)
    p.add_argument("--interval", type=float, default=5.0,
                   help="Segundos minimos entre gravacoes no banco")
    p.add_argument("--sensor", default="sensor-01", help="Valor de sensor_id")
    p.add_argument("--url", default=os.environ.get("SUPABASE_URL", URL_PADRAO))
    p.add_argument("--key", default=os.environ.get("SUPABASE_ANON_KEY", KEY_PADRAO))
    p.add_argument("--dry-run", action="store_true", help="Nao grava, so imprime")
    args = p.parse_args()

    try:
        import serial  # pyserial
    except ImportError:
        log("ERRO: pyserial nao instalado. Rode: pip install pyserial")
        return 1

    log(f"Abrindo {args.port} @ {args.baud} baud...")
    ultimo_envio = 0.0
    total = 0

    while True:
        try:
            with serial.Serial(args.port, args.baud, timeout=2) as ser:
                log("Porta aberta. Aguardando linhas JSON do Arduino...")
                # Descarta possivel linha parcial da abertura da porta.
                ser.reset_input_buffer()
                while True:
                    bruta = ser.readline()
                    if not bruta:
                        continue
                    linha = bruta.decode("utf-8", errors="replace").strip()
                    if not linha:
                        continue
                    try:
                        obj = json.loads(linha)
                    except json.JSONDecodeError:
                        log(f"Serial (nao-JSON): {linha}")
                        continue

                    if obj.get("tipo") != "leitura":
                        log(f"Arduino: {obj.get('msg', obj)}")
                        continue

                    ph = obj.get("ph")
                    agora = time.time()
                    if agora - ultimo_envio < args.interval:
                        continue

                    payload = {
                        "sensor_id": args.sensor,
                        "ph": ph,
                        "fluor": None,
                        "cloro": None,
                        "turbidez": None,
                    }
                    if args.dry_run:
                        log(f"[dry-run] gravaria: {payload}")
                    else:
                        postar_leitura(args.url, args.key, payload)
                        total += 1
                        log(f"pH {ph} gravado (total {total}). raw={obj.get('raw')} "
                            f"mv={obj.get('mv')} cal={obj.get('cal')}")
                    ultimo_envio = agora

        except serial.SerialException as e:
            log(f"Serial indisponivel ({e}). Tentando de novo em 3 s...")
            time.sleep(3)
        except urllib.error.HTTPError as e:
            body = e.read().decode(errors="replace")
            log(f"Supabase HTTP {e.code}: {body}")
            log("Dica: rode supabase/leituras.sql e confira as policies de RLS.")
            time.sleep(5)
        except (urllib.error.URLError, RuntimeError) as e:
            log(f"Falha de rede: {e}. Tentando de novo em 5 s...")
            time.sleep(5)
        except KeyboardInterrupt:
            log("Encerrado pelo usuario.")
            return 0


if __name__ == "__main__":
    sys.exit(main())
