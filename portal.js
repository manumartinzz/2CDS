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
    conta de teste         → SOMENTE pH, lido DIRETO do pHmetro (Web Serial)
                             dentro deste painel, sem página extra; os outros
                             três parâmetros ficam zerados. Nenhuma gravação
                             no banco e nenhum valor simulado nesse modo.

  Precisa ser carregado DEPOIS de: chart.js, supabase-js, supabase-client.js
*/

const TABELA = "leituras";
const SENSOR_ID = "sensor-01";
const MAX_PONTOS = 40;
const TICK_MS = 30 * 60 * 1000;   // 30 min no modo simulação
const POLL_MS = 10 * 1000;        // 10 s no modo sensor real
const MODO_REAL = new URLSearchParams(location.search).get("real") === "1";

const $ = (id) => document.getElementById(id);

/* Um Chart por parâmetro (4 painéis de barras verticais). */
const charts = {};
let canal = null;
let avisouFalhaBanco = false;

/* Conta de teste: pHmetro ligado direto ao gráfico. A chave é SOMENTE o
   e-mail (definido em pesquisa-culturas.js); nenhuma senha é usada aqui. */
let MODO_PH_DIRETO = false;
const BAUD_PH = 9600;
let portaPh = null, leitorPh = null, lendoPh = false, bufferPh = "";
let ultimoAlertaPh = 0;

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

/* -------------------- Som de notificação -------------------- */
/* Web Audio API: não precisa de arquivo de áudio nem de CDN. O clique do
   usuário no botão é o gesto que permite ao navegador reproduzir o som. */
let audioCtx = null;
let ultimoSom = 0;

function tocarSomAlerta() {
  const agora = Date.now();
  if (agora - ultimoSom < 1200) return; // evita bip duplo no mesmo evento
  ultimoSom = agora;
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    audioCtx = audioCtx || new Ctx();
    if (audioCtx.state === "suspended") audioCtx.resume();

    const t0 = audioCtx.currentTime;
    [[880, 0], [660, 0.22]].forEach(([freq, atraso]) => {
      const osc = audioCtx.createOscillator();
      const ganho = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t0 + atraso);
      ganho.gain.setValueAtTime(0.0001, t0 + atraso);
      ganho.gain.exponentialRampToValueAtTime(0.22, t0 + atraso + 0.02);
      ganho.gain.exponentialRampToValueAtTime(0.0001, t0 + atraso + 0.18);
      osc.connect(ganho);
      ganho.connect(audioCtx.destination);
      osc.start(t0 + atraso);
      osc.stop(t0 + atraso + 0.2);
    });
  } catch (err) {
    console.warn("Não foi possível reproduzir o som do alerta:", err.message);
  }
}

function mostrarAlerta(nivel, mensagem) {
  if (nivel === "critico") tocarSomAlerta();
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

/* -------------------- Permissões visuais -------------------- */
/* Só as contas em config-admins.js veem o botão do painel administrativo.
   O botão já nasce com "hidden" no HTML: se este JS falhar, ele não aparece
   para ninguém (fail-closed). */
function aplicarPermissoesVisuais(usuario) {
  const admin = typeof emailAdmin === "function" && emailAdmin(usuario.email);

  const btnAdmin = $("btn-painel-admin");
  if (btnAdmin) btnAdmin.classList.toggle("hidden", !admin);

  const btnPerfil = $("btn-perfil");
  if (btnPerfil) {
    btnPerfil.className = admin
      ? "w-10 h-10 rounded-full flex items-center justify-center border border-amber-400/40 bg-black text-amber-300 hover:border-amber-300 transition"
      : "w-10 h-10 rounded-full flex items-center justify-center border border-white/20 bg-gradient-to-br from-cyan-500/30 to-emerald-500/30 text-white hover:border-cyan-400/50 transition";
    btnPerfil.innerHTML = admin
      ? '<i data-lucide="crown" class="w-5 h-5"></i>'
      : '<i data-lucide="user" class="w-5 h-5"></i>';
    btnPerfil.title = admin ? "Perfil · Administrador" : "Meu perfil";
    if (window.lucide) lucide.createIcons();
  }
}

/* -------------------- Chart.js (UMA instância) -------------------- */

/* -------------------- Chart.js (UMA instância) -------------------- */
/* Limites usados pelo próprio painel nos cards acima do gráfico.
   Mantidos idênticos para que o tooltip nunca contradiga os badges. */
/* Limites usados pelo próprio painel nos cards acima do gráfico.
   Cada parâmetro tem a sua escala, cor e faixa normal — um painel por vez,
   sem dois eixos diferentes convivendo no mesmo gráfico. */
const FAIXAS_PAINEL = [
  { id:"ph",       nome:"pH",       unidade:"",     cor:"#22d3ee", fundo:"rgba(34,211,238,0.70)", min:3,  max:10, normal:[6.0, 8.5], faixa:"6,0–8,5" },
  { id:"fluor",    nome:"Flúor",    unidade:"mg/L", cor:"#60a5fa", fundo:"rgba(96,165,250,0.65)", min:0,  max:4,  normal:[0, 1.5],    faixa:"até 1,5 mg/L" },
  { id:"cloro",    nome:"Cloro",    unidade:"mg/L", cor:"#34d399", fundo:"rgba(52,211,153,0.65)", min:0,  max:4,  normal:[0.2, 2.0],  faixa:"0,2–2,0 mg/L" },
  { id:"turbidez", nome:"Turbidez", unidade:"NTU",  cor:"#fbbf24", fundo:"rgba(251,191,36,0.65)", min:0,  max:30, normal:[0, 10],     faixa:"até 10 NTU" }
];

function initChart() {
  if (typeof Chart === "undefined") return;
  FAIXAS_PAINEL.forEach(function (f) {
    const canvas = $("chart-" + f.id);
    if (!canvas) return;
    charts[f.id] = new Chart(canvas.getContext("2d"), {
      type: "bar",
      data: {
        labels: [],
        datasets: [{ label: f.nome, data: [], backgroundColor: f.fundo,
                     borderColor: f.cor, borderWidth: 2, borderRadius: 3,
                     maxBarThickness: 26 }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 250 },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "rgba(10,15,26,0.96)",
            borderColor: f.cor, borderWidth: 1,
            titleColor: "#e2e8f0", bodyColor: "#cbd5e1",
            titleFont: { family: "DM Sans", size: 12, weight: "bold" },
            bodyFont: { family: "DM Sans", size: 12 }, padding: 10,
            callbacks: {
              title: function (itens) { return "Leitura às " + (itens[0] ? itens[0].label : ""); },
              label: function (ctx) {
                const v = ctx.parsed.y;
                if (v === null || typeof v === "undefined") return " Sem dado";
                const normal = v >= f.normal[0] && v <= f.normal[1];
                return " " + f.nome + ": " +
                  Number(v).toLocaleString("pt-BR", { maximumFractionDigits: 2 }) +
                  (f.unidade ? " " + f.unidade : "") + " — " +
                  (normal ? "normal" : "fora da faixa") + " (" + f.faixa + ")";
              }
            }
          }
        },
        scales: {
          x: {
            ticks: { color: "#94a3b8", maxRotation: 0, autoSkip: true,
                     maxTicksLimit: 6, font: { size: 11 } },
            grid: { color: "rgba(255,255,255,0.04)" }
          },
          y: {
            min: f.min, max: f.max,
            ticks: { color: f.cor, font: { size: 11 } },
            grid: { color: "rgba(255,255,255,0.06)" },
            title: { display: true,
                     text: f.nome + (f.unidade ? " (" + f.unidade + ")" : ""),
                     color: f.cor, font: { size: 11, weight: "bold" } }
          }
        }
      }
    });
  });
}

function pushToChart(r, criadoEm) {
  const label = new Date(criadoEm || Date.now())
    .toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  FAIXAS_PAINEL.forEach(function (f) {
    const c = charts[f.id];
    if (!c) return;
    c.data.labels.push(label);
    c.data.datasets[0].data.push(temValor(r[f.id]) ? Number(r[f.id]) : null);
    if (c.data.labels.length > MAX_PONTOS) {
      c.data.labels.shift();
      c.data.datasets[0].data.shift();
    }
    c.update("none");
  });
}

function loadHistory(rows) {
  const labels = rows.map(function (r) {
    return new Date(r.criado_em).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  });
  FAIXAS_PAINEL.forEach(function (f) {
    const c = charts[f.id];
    if (!c) return;
    c.data.labels = labels.slice();
    c.data.datasets[0].data = rows.map(function (r) {
      return temValor(r[f.id]) ? Number(r[f.id]) : null;
    });
    c.update();
  });
  if (rows.length) {
    updateCards(rows[rows.length - 1]);
    setUpdatedAt();
  }
}

/* -------------------- Conta de teste: pHmetro DIRETO -------------------- */
/* Neste modo não há histórico do banco, nem simulação, nem gravação:
   o pH chega pela porta serial e vai direto para os 4 painéis. Os outros
   três parâmetros são mantidos em ZERO, sem badge de alerta. */

function zerarCardsSecundarios() {
  [["fluor", "0,00", "mg/L"], ["cloro", "0,00", "mg/L"], ["turbidez", "0,0", "NTU"]]
    .forEach(function (item) {
      const el = $("val-" + item[0]);
      const badge = $("badge-" + item[0]);
      if (el) el.innerHTML = item[1] +
        ' <span class="text-xs font-medium text-slate-400">' + item[2] + "</span>";
      if (badge) {
        badge.textContent = "zerado";
        badge.className = "text-[10px] px-2 py-0.5 rounded-full border bg-white/5 text-slate-400 border-white/10";
      }
    });
}

function aplicarLeituraPh(ph) {
  const n = Number(ph);
  if (!Number.isFinite(n)) return;
  const alerta = n < 6 || n > 8.5;
  const el = $("val-ph");
  const badge = $("badge-ph");
  if (el) el.innerHTML = n.toFixed(2);
  if (badge) {
    badge.textContent = alerta ? "alerta" : "normal";
    badge.className = "text-[10px] px-2 py-0.5 rounded-full border " +
      (alerta ? "bg-red-500/15 text-red-300 border-red-500/25"
              : "bg-emerald-500/15 text-emerald-300 border-emerald-500/25");
  }
  zerarCardsSecundarios();
  pushToChart({ ph: n, fluor: 0, cloro: 0, turbidez: 0 }, new Date().toISOString());
  setUpdatedAt();
  // O firmware envia ~1 leitura/s: limita o alerta a uma vez por minuto.
  if (alerta && Date.now() - ultimoAlertaPh > 60000) {
    ultimoAlertaPh = Date.now();
    mostrarAlerta("critico", "pH fora da faixa normal (6,0–8,5) — verifique a água.");
  }
}

function definirStatusPh(texto) {
  const s = $("updated-at");
  if (s) s.textContent = texto;
}

async function conectarPhmetro() {
  if (!("serial" in navigator)) {
    mostrarAlerta("atencao", "Web Serial indisponível. Use Chrome ou Edge desktop para ligar o pHmetro.");
    return;
  }
  if (typeof TextDecoderStream === "undefined") {
    mostrarAlerta("atencao", "Este navegador não oferece TextDecoderStream. Use Chrome ou Edge atualizado.");
    return;
  }
  try {
    // Exige gesto do usuário (clique no botão dentro do próprio painel).
    portaPh = await navigator.serial.requestPort();
    await portaPh.open({ baudRate: BAUD_PH });
    lendoPh = true;
    bufferPh = "";
    definirStatusPh("pHmetro conectado · 9600 baud");
    const btn = $("btn-conectar-ph");
    if (btn) btn.textContent = "pHmetro conectado";

    const decoder = new TextDecoderStream();
    const pipe = portaPh.readable.pipeTo(decoder.writable);
    leitorPh = decoder.readable.getReader();

    while (lendoPh) {
      const { value, done } = await leitorPh.read();
      if (done) break;
      bufferPh += value;
      let pos;
      while ((pos = bufferPh.indexOf("\n")) >= 0) {
        const linha = bufferPh.slice(0, pos).replace(/\r$/, "").trim();
        bufferPh = bufferPh.slice(pos + 1);
        if (!linha) continue;
        try {
          const obj = JSON.parse(linha);
          // O firmware envia {"tipo":"leitura","ph":7.02,...}.
          if (obj && obj.tipo === "leitura" && temValor(obj.ph)) aplicarLeituraPh(obj.ph);
        } catch (_) { /* linha de log/resposta do Arduino: ignorar */ }
      }
    }
    await pipe.catch(() => {});
  } catch (erro) {
    mostrarAlerta("atencao", "Falha ao conectar o pHmetro: " + erro.message);
    definirStatusPh("pHmetro desconectado");
  } finally {
    lendoPh = false;
    leitorPh = null;
  }
}

function desconectarPhmetro() {
  lendoPh = false;
  try { if (leitorPh) leitorPh.cancel(); } catch (_) {}
  try { if (portaPh) portaPh.close(); } catch (_) {}
  leitorPh = null;
  portaPh = null;
}

function iniciarModoPhDireto() {
  const el = $("val-ph");
  if (el) el.innerHTML = '<span class="text-slate-500">—</span>';
  const badge = $("badge-ph");
  if (badge) {
    badge.textContent = "aguardando";
    badge.className = "text-[10px] px-2 py-0.5 rounded-full border bg-white/5 text-slate-400 border-white/10";
  }
  zerarCardsSecundarios();

  const btnSim = $("btn-simular-alerta");
  if (btnSim) { btnSim.classList.add("hidden"); btnSim.disabled = true; }

  const btnPh = $("btn-conectar-ph");
  if (btnPh) {
    btnPh.classList.remove("hidden");
    btnPh.classList.add("flex");
    btnPh.addEventListener("click", conectarPhmetro);
  }

  const nota = $("nota-grafico");
  if (nota) {
    nota.innerHTML = "Nesta conta o <strong class=\"text-cyan-300/80\">pH é lido diretamente do pHmetro</strong> " +
      "(Web Serial, 9600 baud) e enviado para os gráficos sem página extra. " +
      "Flúor, Cloro e Turbidez permanecem <strong>zerados</strong>.";
  }
  definirStatusPh("pHmetro direto · aguardando conexão");
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
  tocarSomAlerta(); // som imediato no clique (gesto do usuário)
  contaminationTicks = 6;
  // Texto e comportamento vindos do commit "botão alerta" da main: o clique
  // gera uma leitura contaminada AGORA (await tick()), não só nas próximas.
  mostrarAlerta("atencao", "Alerta simulado: leitura contaminada gerada agora. Os parâmetros vão se alterar nas próximas leituras.");
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
  desconectarPhmetro();
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

  // Comparação estrita apenas pelo e-mail normalizado. Nenhum fallback:
  // qualquer outra conta segue o fluxo normal de sempre.
  MODO_PH_DIRETO = typeof ehContaPhDireto === "function" && ehContaPhDireto(usuario.email);

  // Cultura da conta para o botão Curiosidades.
  try {
    if (typeof obterCulturaAtual === "function") {
      window.ACQUASAFE_CULTURA = await obterCulturaAtual();
    }
  } catch (_) { /* sem cultura: curiosidades usam soja */ }

  aplicarPermissoesVisuais(usuario);
  initChart();

  if (MODO_PH_DIRETO) {
    iniciarModoPhDireto();
    return;
  }

  try {
    const rows = await carregarHistorico();
    if (rows.length) {
      loadHistory(rows);
    } else if (!MODO_REAL) {
      // Mensagem preservada do commit "botão alerta" da main: sem sensor
      // instalado, o simulador local continua disponível e o botão ativo.
      mostrarAlerta("info", "Nenhum sensor instalado ainda. O simulador local continua disponível.");
    }
  } catch (err) {
    console.warn("Não foi possível carregar o histórico:", err.message);
    mostrarAlerta("info", "Sem histórico no banco — rode supabase/schema.sql. O simulador local continua disponível.");
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
