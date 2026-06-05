/* =============================================
   style.css — AcquaSafe Painel de Controle
   ============================================= */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'DM Sans', sans-serif;
}

body {
  background-color: #0a0f1a;
  color: #ffffff;
  line-height: 1.6;
  min-height: 100vh;
}

/* ── Glass Card ── */
.glass-card {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.glow-border {
  border: 1px solid rgba(56, 189, 248, 0.2);
  box-shadow: 0 0 20px rgba(56, 189, 248, 0.04);
}

/* ── Pulse (ponto verde animado) ── */
.pulse-dot {
  animation: pulse-anim 2s infinite;
}

@keyframes pulse-anim {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.3);
  }
}

/* ── Hover nos cards de navegação ── */
.info-card-hover {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.info-card-hover:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
}

/* ── Fade-in de entrada ── */
.fade-in {
  animation: fadeIn 0.5s ease forwards;
  opacity: 0;
}

@keyframes fadeIn {
  to { opacity: 1; }
}

/* ── Scrollbar personalizada ── */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #0a0f1a;
}

::-webkit-scrollbar-thumb {
  background: #1e3a5f;
  border-radius: 20px;
}

::-webkit-scrollbar-thumb:hover {
  background: #2a4a6f;
}

/* ── Responsividade ── */
@media (max-width: 640px) {
  header {
    padding: 12px 16px;
  }
}
