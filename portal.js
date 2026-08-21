// portal.js
// Lógica do painel.html (dashboard do cliente).
// Precisa ser carregado DEPOIS de supabase-client.js.

let sensorAtual = null;
let chartInstance = null;

document.addEventListener("DOMContentLoaded", init);

async function init() {
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const { data: sensores } = await supabaseClient
    .from("sensores")
    .select("id, nome")
    .eq("user_id", user.id)
    .eq("ativo", true)
    .limit(1);

  const botaoSimular = document.getElementById("btn-simular-alerta");

  if (!sensores || sensores.length === 0) {
    mostrarAlerta("info", "Nenhum sensor instalado ainda. Entre em contato com a equipe AcquaSafe.");
    botaoSimular.disabled = true;
    botaoSimular.classList.add("opacity-50", "cursor-not-allowed");
    return;
  }

  sensorAtual = sensores[0];
  await carregarLeituras();
  inscreverTempoReal();

  botaoSimular.addEventListener("click", simularAlerta);
}

async function carregarLeituras() {
  const { data: leituras, error } = await supabaseClient
    .from("leituras_sensores")
    .select("ph, turbidez, coliformes, qualidade_percentual, medido_em")
    .eq("sensor_id", sensorAtual.id)
    .order("medido_em", { ascending: true })
    .limit(20);

  if (error || !leituras || leituras.length === 0) return;

  desenharGrafico(leituras);
}

function desenharGrafico(leituras) {
  const labels = leituras.map((l) =>
    new Date(l.medido_em).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  );
  const ph = leituras.map((l) => l.ph);
  const turbidez = leituras.map((l) => l.turbidez);
  const coliformes = leituras.map((l) => l.coliformes);

  const ctx = document.getElementById("qualityChart").getContext("2d");
  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        { label: "pH", data: ph, borderColor: "#22d3ee", tension: 0.3 },
        { label: "Turbidez", data: turbidez, borderColor: "#3b82f6", tension: 0.3 },
        { label: "Coliformes", data: coliformes, borderColor: "#f43f5e", tension: 0.3 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: "#cbd5e1" } } },
      scales: {
        x: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(255,255,255,0.05)" } },
        y: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(255,255,255,0.05)" } }
      }
    }
  });
}

function inscreverTempoReal() {
  supabaseClient
    .channel("leituras-realtime")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "leituras_sensores", filter: `sensor_id=eq.${sensorAtual.id}` },
      () => carregarLeituras()
    )
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "alertas", filter: `sensor_id=eq.${sensorAtual.id}` },
      (payload) => mostrarAlerta(payload.new.nivel, payload.new.mensagem)
    )
    .subscribe();
}

async function simularAlerta() {
  const leituraFake = {
    sensor_id: sensorAtual.id,
    ph: (Math.random() * 3 + 4).toFixed(2),
    turbidez: (Math.random() * 50 + 20).toFixed(2),
    coliformes: (Math.random() * 100).toFixed(2),
    qualidade_percentual: (Math.random() * 40).toFixed(2)
  };

  const { data: leitura, error } = await supabaseClient
    .from("leituras_sensores")
    .insert(leituraFake)
    .select()
    .single();

  if (error) {
    mostrarAlerta("critico", "Erro ao simular alerta: " + error.message);
    return;
  }

  await supabaseClient.from("alertas").insert({
    sensor_id: sensorAtual.id,
    leitura_id: leitura.id,
    nivel: "critico",
    mensagem: "Parâmetros fora do padrão detectados (simulação)."
  });
}

function mostrarAlerta(nivel, mensagem) {
  const cores = {
    info: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
    atencao: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    critico: "border-red-500/30 bg-red-500/10 text-red-300"
  };
  const box = document.createElement("div");
  box.className = `glass-card rounded-xl p-4 border ${cores[nivel] || cores.info} shadow-lg`;
  box.textContent = mensagem;
  document.getElementById("alert-container").appendChild(box);
  setTimeout(() => box.remove(), 8000);
}

function logout() {
  supabaseClient.auth.signOut().then(() => {
    window.location.href = "login.html";
  });
}