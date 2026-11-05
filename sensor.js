/*
  sensor.js - AcquaSafe - Teste do sensor de pH E201-9 no navegador
  ================================================================

  Le a porta serial do Arduino Uno R3 pela Web Serial API (Chrome/Edge,
  contexto seguro = HTTPS ou localhost, e um clique do usuario).
  Nao precisa de servidor, nem de WiFi, nem de biblioteca no Arduino.

  Opcionalmente grava as leituras na tabela "leituras" do Supabase,
  que e exatamente a tabela que o portal.html ja usa para o grafico.
  Para isso rode antes o SQL em supabase/leituras.sql.

  Depende de: supabase-client.js (carregado antes), Chart.js, Lucide.
*/

const BAUD_RATE = 9600;
const MAX_PONTOS = 60;

let porta = null;
let leitor = null;
let lendo = false;
let bufferSerial = "";
let grafico = null;
let ultimoEnvio = 0;
let totalEnvios = 0;

// Watchdog: se conectou mas nao chegou JSON, avisa que falta gravar o firmware.
let ultimaLinhaTs = 0;
let watchdog = null;
let avisoSemDados = false;

const $ = (id) => document.getElementById(id);

/* -------------------- UI auxiliar -------------------- */

function registrarLog(texto, tipo = "info") {
  const el = $("console-log");
  if (!el) return;
  const cores = {
    info: "text-slate-400",
    ok: "text-emerald-400",
    erro: "text-red-400",
    aviso: "text-amber-400"
  };
  const linha = document.createElement("div");
  linha.className = cores[tipo] || cores.info;
  linha.textContent = "[" + new Date().toLocaleTimeString("pt-BR") + "] " + texto;
  el.appendChild(linha);
  el.scrollTop = el.scrollHeight;
  while (el.children.length > 120) el.removeChild(el.firstChild);
}

function setStatus(texto, cor) {
  const dot = $("status-dot");
  const txt = $("status-texto");
  const mapa = {
    ok: "bg-emerald-400",
    aviso: "bg-amber-400",
    erro: "bg-red-400",
    neutro: "bg-slate-500"
  };
  dot.className = "w-2.5 h-2.5 rounded-full " + (mapa[cor] || mapa.neutro);
  txt.textContent = texto;
}

function setConexao(conectado) {
  $("btn-conectar").disabled = conectado;
  $("btn-desconectar").disabled = !conectado;
  const botoes = ["btn-raw", "btn-get", "btn-status", "btn-cal7", "btn-cal4", "btn-reset"];
  botoes.forEach((id) => { $(id).disabled = !conectado; });
}

function atualizarCalibracao(obj) {
  if (typeof obj.cal !== "boolean") return;
  const badge = $("cal-badge");
  const pontos = typeof obj.pontos === "number" ? obj.pontos : 0;
  if (obj.cal) {
    badge.textContent = "Calibrado (2 pontos)";
    badge.className = "text-[11px] px-2.5 py-1 rounded-full border bg-emerald-500/15 text-emerald-300 border-emerald-500/25";
  } else {
    badge.textContent = pontos + "/2 pontos · curva nominal (aproximada)";
    badge.className = "text-[11px] px-2.5 py-1 rounded-full border bg-amber-500/15 text-amber-300 border-amber-500/25";
  }
}

/* -------------------- Grafico -------------------- */

function initGrafico() {
  const ctx = $("chart-ph").getContext("2d");
  grafico = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [{
        label: "pH",
        data: [],
        borderColor: "#22d3ee",
        backgroundColor: "rgba(34,211,238,0.12)",
        fill: true,
        tension: 0.3,
        pointRadius: 2,
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: { legend: { labels: { color: "#cbd5e1" } } },
      scales: {
        y: {
          min: 0, max: 14,
          ticks: { color: "#94a3b8" },
          grid: { color: "rgba(255,255,255,0.05)" }
        },
        x: {
          ticks: { color: "#64748b", maxTicksLimit: 8 },
          grid: { display: false }
        }
      }
    }
  });
}

function pushGrafico(ph) {
  if (!grafico || typeof ph !== "number" || Number.isNaN(ph)) return;
  grafico.data.labels.push(new Date().toLocaleTimeString("pt-BR"));
  grafico.data.datasets[0].data.push(ph);
  if (grafico.data.labels.length > MAX_PONTOS) {
    grafico.data.labels.shift();
    grafico.data.datasets[0].data.shift();
  }
  grafico.update("none");
}

/* -------------------- Leitura -------------------- */

function atualizarLeitura(obj) {
  const ph = Number(obj.ph);
  const valido = !Number.isNaN(ph);

  $("valor-ph").textContent = valido ? ph.toFixed(2) : "--";
  $("valor-raw").textContent = obj.raw ?? "--";
  $("valor-mv").textContent = (obj.mv ?? "--") + " mV";
  $("valor-hora").textContent = "Atualizado " + new Date().toLocaleTimeString("pt-BR");

  const fora = valido && (ph < 6 || ph > 8.5);
  const badge = $("ph-badge");
  badge.textContent = fora ? "fora do padrão" : "faixa normal";
  badge.className = "text-[11px] px-2.5 py-1 rounded-full border " +
    (fora
      ? "bg-red-500/15 text-red-300 border-red-500/25"
      : "bg-emerald-500/15 text-emerald-300 border-emerald-500/25");

  atualizarCalibracao(obj);
  if (valido) pushGrafico(ph);
  talvezGravar(obj);
}

function iniciarWatchdog() {
  ultimaLinhaTs = Date.now();
  avisoSemDados = false;
  if (watchdog) clearInterval(watchdog);
  watchdog = setInterval(() => {
    if (!lendo) return;
    const semDados = Date.now() - ultimaLinhaTs > 4000;
    if (semDados && !avisoSemDados) {
      $("sem-dados").classList.remove("hidden");
      registrarLog("Nenhum JSON em 4 s — confira se o .ino foi gravado no Uno.", "aviso");
      avisoSemDados = true;
    } else if (!semDados && avisoSemDados) {
      $("sem-dados").classList.add("hidden");
      avisoSemDados = false;
    }
  }, 2000);
}

function pararWatchdog() {
  if (watchdog) clearInterval(watchdog);
  watchdog = null;
  avisoSemDados = false;
  $("sem-dados").classList.add("hidden");
}

function tratarLinha(linha) {
  ultimaLinhaTs = Date.now();
  if (avisoSemDados) {
    $("sem-dados").classList.add("hidden");
    avisoSemDados = false;
  }

  let obj;
  try {
    obj = JSON.parse(linha);
  } catch (_) {
    registrarLog("Serial: " + linha);
    return;
  }

  if (obj.tipo === "resposta") {
    registrarLog((obj.ok ? "✔ " : "✖ ") + (obj.msg || obj.cmd || ""), obj.ok ? "ok" : "erro");
    atualizarCalibracao(obj);
    return;
  }
  if (obj.tipo === "leitura") atualizarLeitura(obj);
}

/* -------------------- Web Serial -------------------- */

async function conectar() {
  if (!("serial" in navigator)) {
    registrarLog("Este navegador não tem Web Serial. Use Chrome/Edge desktop.", "erro");
    return;
  }

  try {
    // Precisa obrigatoriamente de um gesto do usuario (clique).
    porta = await navigator.serial.requestPort();
    await porta.open({ baudRate: BAUD_RATE });

    lendo = true;
    bufferSerial = "";
    setConexao(true);
    setStatus("Conectado · 9600 baud", "ok");
    registrarLog("Porta serial aberta. Aguardando leituras...", "ok");
    iniciarWatchdog();
    await loopLeitura();
  } catch (erro) {
    registrarLog("Falha ao conectar: " + erro.message, "erro");
    setStatus("Falha na conexão", "erro");
    setConexao(false);
    porta = null;
  }
}

async function loopLeitura() {
  let pipePromise;
  try {
    const decoder = new TextDecoderStream();
    pipePromise = porta.readable.pipeTo(decoder.writable);
    leitor = decoder.readable.getReader();

    while (lendo) {
      const { value, done } = await leitor.read();
      if (done) break;
      bufferSerial += value;
      let p;
      while ((p = bufferSerial.indexOf("\n")) >= 0) {
        const linha = bufferSerial.slice(0, p).replace(/\r$/, "").trim();
        bufferSerial = bufferSerial.slice(p + 1);
        if (linha) tratarLinha(linha);
      }
    }
  } catch (erro) {
    if (lendo) registrarLog("Leitura interrompida: " + erro.message, "erro");
  } finally {
    try { if (leitor) await leitor.cancel(); } catch (_) {}
    try { if (pipePromise) await pipePromise.catch(() => {}); } catch (_) {}
    leitor = null;
  }
}

async function desconectar() {
  lendo = false;
  try { if (leitor) await leitor.cancel(); } catch (_) {}
  try { if (porta) await porta.close(); } catch (_) {}
  porta = null;
  leitor = null;
  pararWatchdog();
  setConexao(false);
  setStatus("Desconectado", "neutro");
  registrarLog("Porta serial fechada.", "aviso");
}

async function enviarComando(cmd) {
  if (!porta || !porta.writable) {
    registrarLog("Conecte o Arduino primeiro.", "aviso");
    return;
  }
  try {
    const writer = porta.writable.getWriter();
    await writer.write(new TextEncoder().encode(cmd + "\n"));
    writer.releaseLock();
    registrarLog("→ " + cmd);
  } catch (erro) {
    registrarLog("Erro ao enviar " + cmd + ": " + erro.message, "erro");
  }
}

/* -------------------- Supabase (opcional) -------------------- */

async function talvezGravar(obj) {
  if (!$("chk-gravar").checked) return;

  const intervalo = Number($("intervalo").value) * 1000;
  if (Date.now() - ultimoEnvio < intervalo) return;
  ultimoEnvio = Date.now();

  if (typeof supabaseClient === "undefined") {
    registrarLog("supabase-client.js não carregou — verifique sua conexão/CDN.", "erro");
    return;
  }

  const ph = Number(obj.ph);
  if (Number.isNaN(ph)) return;

  try {
    // Mesma tabela/colunas que o script inline do portal.html ja consome.
    // Os outros parametros ficam NULL: so temos sensor de pH por enquanto.
    const { error } = await supabaseClient.from("leituras").insert({
      sensor_id: $("sensor-id").value.trim() || "sensor-01",
      ph: ph,
      fluor: null,
      cloro: null,
      turbidez: null
    });
    if (error) throw error;
    totalEnvios++;
    $("contador-envios").textContent = totalEnvios;
    registrarLog("pH " + ph.toFixed(2) + " gravado no Supabase.", "ok");
  } catch (erro) {
    registrarLog("Falha ao gravar: " + erro.message +
      " — rode supabase/leituras.sql e confira as policies de RLS.", "erro");
  }
}

/* -------------------- Init -------------------- */

document.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) lucide.createIcons();
  initGrafico();

  if (!("serial" in navigator)) {
    $("sem-webserial").classList.remove("hidden");
    setStatus("Web Serial indisponível", "erro");
  } else {
    setStatus("Desconectado", "neutro");
  }

  setConexao(false);

  $("btn-conectar").addEventListener("click", conectar);
  $("btn-desconectar").addEventListener("click", desconectar);
  $("btn-raw").addEventListener("click", () => enviarComando("RAW"));
  $("btn-get").addEventListener("click", () => enviarComando("GET"));
  $("btn-status").addEventListener("click", () => enviarComando("STATUS"));
  $("btn-cal7").addEventListener("click", () => {
    registrarLog("Coloque o eletrodo no buffer pH 7.00, espere estabilizar ~45 s e clique em CAL:7.00.", "aviso");
    enviarComando("CAL:7.00");
  });
  $("btn-cal4").addEventListener("click", () => {
    registrarLog("Enxague o eletrodo, coloque no buffer pH 4.00, espere ~45 s e clique em CAL:4.00.", "aviso");
    enviarComando("CAL:4.00");
  });
  $("btn-reset").addEventListener("click", () => enviarComando("RESET"));
  $("btn-limpar-log").addEventListener("click", () => { $("console-log").innerHTML = ""; });

  $("chk-gravar").addEventListener("change", (e) => {
    registrarLog(e.target.checked
      ? "Gravação no Supabase ATIVADA."
      : "Gravação no Supabase pausada.", "aviso");
  });

  if ("serial" in navigator) {
    navigator.serial.addEventListener("disconnect", () => {
      registrarLog("Arduino desconectado (cabo removido).", "aviso");
      desconectar();
    });
  }
});
