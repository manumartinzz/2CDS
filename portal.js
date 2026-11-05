/*
  portal.js — AcquaSafe · Painel de Controle
  ==========================================
  ÚNICO dono do dashboard. Antes havia um script inline em portal.html
  (tabela "leituras") e este arquivo (tabelas "sensores" /
  "leituras_sensores" / "alertas"), ambos criando um Chart no mesmo
  canvas e registrando listeners no mesmo botão. Isso foi unificado aqui.

  Modelo canônico: tabela public.leituras
    id, sensor_id, ph, fluor, cloro, turbidez, criado_em
  É a mesma tabela que sensor.html, bridge/ph_serial_bridge.py e
  supabase/leituras.sql utilizam.

  Modos:
    portal.html            → simulação (gravando leituras de demonstração)
    portal.html?real=1     → sensor real (não grava nada falso, só lê)

  Precisa ser carregado DEPOIS de: chart.js, supabase-js, supabase-client.js
*/

const TABELA = "leituras";
const SENSOR_ID = "sensor-01";
const MAX_PONTOS = 40;
const TICK_MS = 30 * 60 * 1000;   // 30 min no modo simulação
const POLL_MS = 10 * 1000;        // 10 s no modo sensor real
const MODO_REAL = new URLSearchParams(location.search).get("real") === "1";

const $ = (id) => document.getElementById(id);

let chart = null;
let canal = null;
let avisouFalhaBanco = false;

/* Estado da simulação (random walk suave) */
const sim = { ph: 7.2, fluor: 0.8, cloro: 1.2, turbidez: 3.5 };
let contaminationTicks = 0;

document.addEventListener("DOMContentLoaded", init);

/* -------------------- Acesso -------------------- */

async function verificarAcesso() {
  const { data: { user }, error } = await supabaseClient.auth.getUser();
  if (error || !user) {
    window.location.href = "login.html";
    return null;
  }

  // O admin pode bloquear um cliente em admin-bloqueios.html.
  // Essa checagem existia só no login; agora vale também no painel.
  const { data: perfil, error: erroPerfil } = await supabaseClient
    .from("profiles")
    .select("bloqueado, motivo_bloqueio")
    .eq("id", user.id)
    .maybeSingle();

  if (erroPerfil) {
    // Falha de leitura não deve travar o painel inteiro; só registra.
    console.warn("Não foi possível verificar o status da conta:", erroPerfil.message);
  }
  if (perfil?.bloqueado) {
    await supabaseClient.auth.signOut();
    window.location.href = "login.html?bloqueado=1";
    return null;
  }
  return user;
}

/* -------------------- Banco -------------------- */

async function carregarHistorico() {
  const { data, error } = await supabaseClient
    .from(TABELA)
    .select("id, sensor_id, ph, fluor, cloro, turbidez, criado_em")
    .eq("sensor_id", SENSOR_ID)
    .order("criado_em", { ascending: false })
    .limit(MAX_PONTOS);

  if (error) throw error;
  return (data || []).reverse();
}

async function gravarLeitura(leitura) {
  const { data, error } = await supabaseClient
    .from(TABELA)
    .insert({ sensor_id: SENSOR_ID, ...leitura })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/* -------------------- Cards / alertas -------------------- */

function temValor(v) {
  return v !== null && v !== undefined && v !== "" && !Number.isNaN(Number(v));
}

function foraDoPadrao(r) {
  const n = (v) => Number(v);
  return (temValor(r.ph) && (n(r.ph) < 6 || n(r.ph) > 8.5)) ||
         (temValor(r.fluor) && n(r.fluor) > 1.5) ||
         (temValor(r.cloro) && (n(r.cloro) < 0.2 || n(r.cloro) > 2)) ||
         (temValor(r.turbidez) && n(r.turbidez) > 10);
}

function setCard(id, valor, unidade, alerta) {
  const el = $("val-" + id);
  const badge = $("badge-" + id);
  if (!el || !badge) return;

  // No modo sensor real só existe pH: os demais parâmetros chegam NULL.
  if (!temValor(valor)) {
    el.innerHTML = '<span class="text-slate-500">—</span>';
    badge.textContent = "sem dados";
    badge.className = "text-[10px] px-2 py-0.5 rounded-full border bg-white/5 text-slate-400 border-white/10";
    return;
  }

  el.innerHTML = `${valor}${unidade ? ' <span class="text-xs font-medium text-slate-400">' + unidade + "</span>" : ""}`;
  badge.textContent = alerta ? "alerta" : "normal";
  badge.className = "text-[10px] px-2 py-0.5 rounded-full border " +
    (alerta
      ? "bg-red-500/15 text-red-300 border-red-500/25"
      : "bg-emerald-500/15 text-emerald-300 border-emerald-500/25");
}

function updateCards(r) {
  const n = (v) => Number(v);
  setCard("ph", temValor(r.ph) ? n(r.ph).toFixed(2) : null, "", temValor(r.ph) && (n(r.ph) < 6 || n(r.ph) > 8.5));
  setCard("fluor", temValor(r.fluor) ? n(r.fluor).toFixed(2) : null, "mg/L", temValor(r.fluor) && n(r.fluor) > 1.5);
  setCard("cloro", temValor(r.cloro) ? n(r.cloro).toFixed(2) : null, "mg/L", temValor(r.cloro) && (n(r.cloro) < 0.2 || n(r.cloro) > 2));
  setCard("turbidez", temValor(r.turbidez) ? n(r.turbidez).toFixed(1) : null, "NTU", temValor(r.turbidez) && n(r.turbidez) > 10);
  return foraDoPadrao(r);
}

function setUpdatedAt() {
  const el = $("updated-at");
  if (el) el.textContent = "Atualizado " + new Date().toLocaleTimeString("pt-BR");
}

function mostrarAlerta(nivel, mensagem) {
  const cores = {
    info: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
    atencao: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    critico: "border-red-500/30 bg-red-500/10 text-red-300"
  };
  const container = $("alert-container");
  if (!container) return;
  const box = document.createElement("div");
  box.className = "glass-card rounded-xl p-4 border " + (cores[nivel] || cores.info) + " shadow-lg";
  box.textContent = mensagem;
  container.appendChild(box);
  setTimeout(() => box.remove(), 8000);
}

/* -------------------- Chart.js (UMA instância) -------------------- */

function initChart() {
  const canvas = $("qualityChart");
  if (!canvas || typeof Chart === "undefined") return;

  chart = new Chart(canvas.getContext("2d"), {
    type: "bar",
    data: {
      labels: [],
      datasets: [
        { label: "pH", data: [], borderColor: "#22d3ee", backgroundColor: "rgba(34,211,238,0.65)", borderWidth: 2, yAxisID: "yPh" },
        { label: "Flúor (mg/L)", data: [], borderColor: "#60a5fa", backgroundColor: "rgba(96,165,250,0.55)", borderWidth: 2, yAxisID: "yOther" },
        { label: "Cloro (mg/L)", data: [], borderColor: "#34d399", backgroundColor: "rgba(52,211,153,0.55)", borderWidth: 2, yAxisID: "yOther" },
        { label: "Turbidez (NTU)", data: [], borderColor: "#fbbf24", backgroundColor: "rgba(251,191,36,0.55)", borderWidth: 2, yAxisID: "yOther" }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 250 },
      interaction: { mode: "index", intersect: false },
      plugins: { legend: { labels: { color: "#cbd5e1", font: { family: "DM Sans", size: 11 } } } },
      scales: {
        x: { ticks: { color: "#64748b", maxRotation: 0, autoSkip: true, font: { size: 10 } }, grid: { color: "rgba(255,255,255,0.05)" } },
        yPh: { position: "left", min: 3, max: 10, ticks: { color: "#22d3ee", font: { size: 10 } }, grid: { color: "rgba(255,255,255,0.05)" }, title: { display: true, text: "pH", color: "#22d3ee" } },
        yOther: { position: "right", min: 0, max: 30, ticks: { color: "#94a3b8", font: { size: 10 } }, grid: { display: false } }
      }
    }
  });
}

function pushToChart(r, criadoEm) {
  if (!chart) return;
  const label = new Date(criadoEm || Date.now()).toLocaleTimeString("pt-BR");
  chart.data.labels.push(label);
  chart.data.datasets[0].data.push(temValor(r.ph) ? Number(r.ph) : null);
  chart.data.datasets[1].data.push(temValor(r.fluor) ? Number(r.fluor) : null);
  chart.data.datasets[2].data.push(temValor(r.cloro) ? Number(r.cloro) : null);
  chart.data.datasets[3].data.push(temValor(r.turbidez) ? Number(r.turbidez) : null);
  if (chart.data.labels.length > MAX_PONTOS) {
    chart.data.labels.shift();
    chart.data.datasets.forEach((d) => d.data.shift());
  }
  chart.update("none");
}

function loadHistory(rows) {
  if (!chart) return;
  chart.data.labels = rows.map((r) => new Date(r.criado_em).toLocaleTimeString("pt-BR"));
  chart.data.datasets[0].data = rows.map((r) => (temValor(r.ph) ? Number(r.ph) : null));
  chart.data.datasets[1].data = rows.map((r) => (temValor(r.fluor) ? Number(r.fluor) : null));
  chart.data.datasets[2].data = rows.map((r) => (temValor(r.cloro) ? Number(r.cloro) : null));
  chart.data.datasets[3].data = rows.map((r) => (temValor(r.turbidez) ? Number(r.turbidez) : null));
  chart.update();
  if (rows.length) {
    updateCards(rows[rows.length - 1]);
    setUpdatedAt();
  }
}

/* -------------------- Simulação -------------------- */

function step(v, alvo, drift, ruido, min, max) {
  const proximo = v + (alvo - v) * drift + (Math.random() - 0.5) * ruido;
  return Math.min(max, Math.max(min, proximo));
}

function proximaLeitura() {
  const contaminando = contaminationTicks > 0;
  if (contaminando) contaminationTicks--;

  sim.ph = step(sim.ph, contaminando ? 5.6 : 7.2, 0.25, 0.12, 3, 10);
  sim.fluor = step(sim.fluor, contaminando ? 2.6 : 0.8, 0.25, 0.08, 0, 4);
  sim.cloro = step(sim.cloro, contaminando ? 0.05 : 1.2, 0.25, 0.1, 0, 4);
  sim.turbidez = step(sim.turbidez, contaminando ? 22 : 3.5, 0.3, 0.5, 0, 30);

  return {
    ph: Number(sim.ph.toFixed(2)),
    fluor: Number(sim.fluor.toFixed(2)),
    cloro: Number(sim.cloro.toFixed(2)),
    turbidez: Number(sim.turbidez.toFixed(2))
  };
}

async function tick() {
  const leitura = proximaLeitura();
  updateCards(leitura);
  setUpdatedAt();
  try {
    const row = await gravarLeitura(leitura);
    pushToChart(leitura, row?.criado_em);
  } catch (err) {
    // Continua mostrando a leitura localmente mesmo sem banco configurado.
    pushToChart(leitura, new Date().toISOString());
    if (!avisouFalhaBanco) {
      avisouFalhaBanco = true;
      console.warn("Falha ao gravar leitura no Supabase:", err.message);
      mostrarAlerta("info", "Exibindo leituras locais — rode supabase/schema.sql para gravar no banco.");
    }
  }
  if (foraDoPadrao(leitura)) {
    mostrarAlerta("critico", "Parâmetro fora do padrão detectado — verifique o painel.");
  }
}

async function simularAlerta() {
  contaminationTicks = 6;
  mostrarAlerta("atencao", "Evento de contaminação simulado: os parâmetros vão se alterar nas próximas leituras.");
  await tick();
}

/* -------------------- Realtime (só no modo real) -------------------- */
/* Na simulação o próprio tick() já desenha o ponto; assinar INSERT aqui
   duplicaria cada leitura no gráfico. Por isso só ligamos em ?real=1. */

function inscreverRealtime() {
  try {
    canal = supabaseClient
      .channel("leituras-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: TABELA, filter: `sensor_id=eq.${SENSOR_ID}` },
        (payload) => {
          const r = payload.new;
          pushToChart(r, r.criado_em);
          updateCards(r);
          setUpdatedAt();
          if (foraDoPadrao(r)) {
            mostrarAlerta("critico", "Parâmetro fora do padrão detectado — verifique o painel.");
          }
        }
      )
      .subscribe();
  } catch (err) {
    console.warn("Realtime indisponível; usando polling:", err.message);
  }
}

/* -------------------- Sessão -------------------- */

function logout() {
  if (canal) supabaseClient.removeChannel(canal).catch(() => {});
  supabaseClient.auth.signOut().then(() => {
    window.location.href = "login.html";
  });
}

/* -------------------- Boot -------------------- */

async function init() {
  if (window.lucide) lucide.createIcons();

  const usuario = await verificarAcesso();
  if (!usuario) return;

  initChart();

  try {
    const rows = await carregarHistorico();
    if (rows.length) loadHistory(rows);
  } catch (err) {
    console.warn("Não foi possível carregar o histórico:", err.message);
    mostrarAlerta("info", "Sem histórico no banco ainda — rode supabase/schema.sql no SQL Editor.");
  }

  const btn = $("btn-simular-alerta");

  if (MODO_REAL) {
    // Não grava leitura falsa: apenas acompanha o que o sensor E201-9 enviou.
    if (btn) {
      btn.disabled = true;
      btn.title = "Simulação desativada no modo sensor real";
      btn.classList.add("opacity-50", "cursor-not-allowed");
    }
    const el = $("updated-at");
    if (el) el.textContent = "Modo sensor real · atualização a cada 10 s";
    inscreverRealtime();
    setInterval(async () => {
      try { loadHistory(await carregarHistorico()); }
      catch (err) { console.warn("Falha ao atualizar leituras reais:", err.message); }
    }, POLL_MS);
    return;
  }

  if (btn) btn.addEventListener("click", simularAlerta);
  await tick();
  setInterval(tick, TICK_MS);
}
