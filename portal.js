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
});

/**
 * Inicializa o gráfico de qualidade da água
 */
function initQualityChart() {
    const ctx = document.getElementById("qualityChart");
    if (!ctx) {
        console.warn("Canvas #qualityChart não encontrado");
        return;
    }

    new Chart(ctx.getContext("2d"), {
        type: "bar",
        data: {
            labels: ["pH", "Turbidez", "Cloro", "Coliformes", "Flúor", "DBO"],
            datasets: [
                {
                    label: "Valor Atual",
                    data: [7.2, 3.5, 1.8, 0, 0.7, 4.2],
                    backgroundColor: "rgba(34, 211, 238, 0.85)",
                    borderColor: "#22d3ee",
                    borderWidth: 1,
                    borderRadius: 6,
                },
                {
                    label: "Limite Máximo",
                    data: [9.5, 5, 5, 1, 1.5, 5],
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
            plugins: {
                legend: {
                    labels: {
                        color: "#94a3b8",
                        font: {
                            family: "DM Sans",
                            size: 13
                        },
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
function logout() {
    if (confirm("Deseja realmente sair?")) {
        localStorage.removeItem("usuarioAcquaSafe");
        window.location.href = "index.html";
    }
}
