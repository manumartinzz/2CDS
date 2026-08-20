/* portal.js – AcquaSafe – Painel Principal */

document.addEventListener("DOMContentLoaded", () => {
    console.log("✅ Portal AcquaSafe carregado com sucesso");

    // Inicializa ícones Lucide
    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }

    // Configuração do Gráfico
    initQualityChart();

    // Adiciona efeito de hover nos cards de navegação
    enhanceNavCards();

    // Sistema de alerta de qualidade da água
    initAlertSystem();
});

/* =========================================================
   GRÁFICO DE QUALIDADE DA ÁGUA
   ========================================================= */
let qualityChart = null;

function initQualityChart() {
    const ctx = document.getElementById("qualityChart");
    if (!ctx) {
        console.warn("Canvas #qualityChart não encontrado");
        return;
    }

    qualityChart = new Chart(ctx.getContext("2d"), {
        type: "bar",
        data: {
            labels: parametrosAgua.map(p => p.nome),
            datasets: [
                {
                    label: "Valor Atual",
                    data: parametrosAgua.map(p => p.normal),
                    backgroundColor: parametrosAgua.map(() => "rgba(34, 211, 238, 0.85)"),
                    borderColor: parametrosAgua.map(() => "#22d3ee"),
                    borderWidth: 1,
                    borderRadius: 6,
                },
                {
                    label: "Limite de Referência",
                    data: parametrosAgua.map(p => (p.direcao === "alto" ? p.max : p.min)),
                    backgroundColor: "rgba(148, 163, 184, 0.3)",
                    borderColor: "#94a3b8",
                    borderWidth: 1,
                    borderRadius: 6,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 600 },
            plugins: {
                legend: {
                    labels: {
                        color: "#94a3b8",
                        font: { family: "DM Sans", size: 13 },
                        padding: 20
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            },
            scales: {
                x: {
                    ticks: { color: "#64748b" },
                    grid: { color: "rgba(255,255,255,0.05)" }
                },
                y: {
                    beginAtZero: true,
                    ticks: { color: "#64748b" },
                    grid: { color: "rgba(255,255,255,0.05)" }
                }
            }
        }
    });
}

/**
 * Melhora interatividade dos cards de navegação
 */
function enhanceNavCards() {
    const cards = document.querySelectorAll('.glass-card[onclick]');

    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transition = 'all 0.3s ease';
        });
    });
}

// Função auxiliar para logout (caso queira usar)
async function logout() {
    if (confirm("Deseja realmente sair?")) {
        try {
            if (typeof dbSair === 'function') await dbSair();
        } catch (error) {
            console.warn('Não foi possível encerrar a sessão remota:', error);
        }
        sessionStorage.removeItem('usuarioLogado');
        sessionStorage.removeItem('usuarioEmail');
        sessionStorage.removeItem('usuarioNome');
        localStorage.removeItem("usuarioAcquaSafe");
        window.location.href = "index.html";
    }
}

/* =========================================================
   SISTEMA DE ALERTA DE QUALIDADE DA ÁGUA
   Referência: Portaria GM/MS nº 888/2021 (padrão de potabilidade)
   e Resolução CONAMA nº 357/2005 (classificação de corpos d'água)

   Para cada parâmetro, o risco pode estar na QUEDA (pH, Cloro
   residual, Flúor — perda de proteção/desinfecção) ou na ALTA
   (Turbidez, Coliformes, DBO — aumento de contaminação/sujidade).
   ========================================================= */
const parametrosAgua = [
    {
        nome: "pH",
        unidade: "",
        min: 6.0, max: 9.5,       // faixa recomendada (Portaria GM/MS 888/2021)
        normal: 7.2,
        critico: 4.8,              // muito abaixo do mínimo seguro
        direcao: "baixo",
        mensagem: "pH crítico: água ácida e corrosiva, imprópria para consumo e irrigação."
    },
    {
        nome: "Turbidez",
        unidade: " UNT",
        min: 0, max: 5,            // VMP = 5 UNT
        normal: 3.5,
        critico: 9.8,               // muito acima do limite máximo
        direcao: "alto",
        mensagem: "Turbidez crítica: excesso de partículas em suspensão na água."
    },
    {
        nome: "Cloro",
        unidade: " mg/L",
        min: 0.2, max: 5,          // mínimo obrigatório 0,2 mg/L
        normal: 1.8,
        critico: 0.05,              // muito abaixo do mínimo obrigatório
        direcao: "baixo",
        mensagem: "Cloro residual crítico: desinfecção comprometida, risco microbiológico."
    },
    {
        nome: "Coliformes",
        unidade: "/100mL",
        min: 0, max: 1,            // VMP: ausência em 100mL
        normal: 0,
        critico: 6,                 // presença confirmada e elevada
        direcao: "alto",
        mensagem: "Coliformes detectados: possível contaminação biológica da água."
    },
    {
        nome: "Flúor",
        unidade: " mg/L",
        min: 0.6, max: 1.5,        // faixa recomendada de fluoretação
        normal: 0.7,
        critico: 0.1,                // muito abaixo do recomendado
        direcao: "baixo",
        mensagem: "Flúor muito abaixo do recomendado."
    },
    {
        nome: "DBO",
        unidade: " mg/L",
        min: 0, max: 5,            // referência CONAMA 357 (águas classe 1)
        normal: 4.2,
        critico: 11,                 // muito acima do limite de referência
        direcao: "alto",
        mensagem: "DBO crítica: excesso de matéria orgânica, baixo oxigênio dissolvido."
    }
];

let alertoEmAndamento = false;
let cicloAlertaTimer = null;

function initAlertSystem() {
    // Dispara um alerta simulado periodicamente (entre 14 e 26 segundos)
    agendarProximoAlerta();

    // Botão de simulação manual (usado na apresentação/demo)
    const btnSimular = document.getElementById("btn-simular-alerta");
    if (btnSimular) {
        btnSimular.addEventListener("click", () => {
            if (!alertoEmAndamento) dispararAlerta();
        });
    }
}

function agendarProximoAlerta() {
    const delay = 14000 + Math.random() * 12000; // 14s – 26s
    cicloAlertaTimer = setTimeout(() => {
        if (!alertoEmAndamento) dispararAlerta();
        agendarProximoAlerta();
    }, delay);
}

function dispararAlerta() {
    if (!qualityChart) return;
    alertoEmAndamento = true;

    const idx = Math.floor(Math.random() * parametrosAgua.length);
    const parametro = parametrosAgua[idx];

    // Atualiza o valor no gráfico para o nível crítico
    qualityChart.data.datasets[0].data[idx] = parametro.critico;
    qualityChart.data.datasets[0].backgroundColor[idx] = "rgba(239, 68, 68, 0.85)";
    qualityChart.data.datasets[0].borderColor[idx] = "#ef4444";
    qualityChart.update();

    tocarSomAlerta();
    mostrarNotificacaoAlerta(parametro);

    // Após alguns segundos, o parâmetro volta ao normal (recuperação do sensor)
    setTimeout(() => {
        qualityChart.data.datasets[0].data[idx] = parametro.normal;
        qualityChart.data.datasets[0].backgroundColor[idx] = "rgba(34, 211, 238, 0.85)";
        qualityChart.data.datasets[0].borderColor[idx] = "#22d3ee";
        qualityChart.update();
        mostrarNotificacaoNormalizado(parametro);
        alertoEmAndamento = false;
    }, 7000);
}

/* ── Notificação visual ── */
function mostrarNotificacaoAlerta(parametro) {
    const container = document.getElementById("alert-container");
    if (!container) return;

    const card = document.createElement("div");
    card.className = "alert-toast alert-toast-critico";
    card.innerHTML = `
        <div class="alert-toast-icon">
            <i data-lucide="alert-triangle" class="w-5 h-5"></i>
        </div>
        <div class="flex-1">
            <p class="alert-toast-title">Alerta crítico — ${parametro.nome}</p>
            <p class="alert-toast-msg">${parametro.mensagem}</p>
            <p class="alert-toast-value">Leitura atual: <strong>${parametro.critico}${parametro.unidade}</strong> · faixa segura: ${parametro.min}${parametro.unidade} – ${parametro.max}${parametro.unidade}</p>
        </div>
        <button class="alert-toast-close" aria-label="Fechar">
            <i data-lucide="x" class="w-4 h-4"></i>
        </button>
    `;

    card.querySelector(".alert-toast-close").addEventListener("click", () => removerToast(card));
    container.appendChild(card);
    if (window.lucide) lucide.createIcons();

    requestAnimationFrame(() => card.classList.add("show"));

    setTimeout(() => removerToast(card), 9000);
}

function mostrarNotificacaoNormalizado(parametro) {
    const container = document.getElementById("alert-container");
    if (!container) return;

    const card = document.createElement("div");
    card.className = "alert-toast alert-toast-ok";
    card.innerHTML = `
        <div class="alert-toast-icon">
            <i data-lucide="check-circle" class="w-5 h-5"></i>
        </div>
        <div class="flex-1">
            <p class="alert-toast-title">${parametro.nome} normalizado</p>
            <p class="alert-toast-msg">Parâmetro voltou à faixa segura (${parametro.normal}${parametro.unidade}).</p>
        </div>
        <button class="alert-toast-close" aria-label="Fechar">
            <i data-lucide="x" class="w-4 h-4"></i>
        </button>
    `;

    card.querySelector(".alert-toast-close").addEventListener("click", () => removerToast(card));
    container.appendChild(card);
    if (window.lucide) lucide.createIcons();

    requestAnimationFrame(() => card.classList.add("show"));

    setTimeout(() => removerToast(card), 6000);
}

function removerToast(card) {
    if (!card || !card.parentNode) return;
    card.classList.remove("show");
    setTimeout(() => card.remove(), 300);
}

/* ── Som de alerta (gerado via Web Audio API — sem depender de arquivo externo) ── */
let audioCtx = null;

function tocarSomAlerta() {
    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        // Três bipes ascendentes, como um alerta de instrumentação
        const frequencias = [880, 880, 1046.5];
        frequencias.forEach((freq, i) => {
            const startTime = audioCtx.currentTime + i * 0.28;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = "square";
            osc.frequency.setValueAtTime(freq, startTime);

            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.18, startTime + 0.02);
            gain.gain.linearRampToValueAtTime(0, startTime + 0.22);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start(startTime);
            osc.stop(startTime + 0.25);
        });
    } catch (err) {
        console.warn("Não foi possível reproduzir o som de alerta:", err);
    }
}
