* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    color: #333;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

/* Header */
header {
    background: white;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    position: sticky;
    top: 0;
    z-index: 100;
}

header .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
}

.logo {
    font-size: 28px;
    font-weight: bold;
    color: #2e7d32;
}

nav a {
    margin-left: 25px;
    text-decoration: none;
    color: #333;
    font-weight: 500;
}

.btn-entrar {
    background: #2e7d32;
    color: white !important;
    padding: 8px 20px;
    border-radius: 25px;
}

/* Hero */
.hero {
    background: linear-gradient(135deg, #2e7d32, #4caf50);
    color: white;
    text-align: center;
    padding: 120px 20px;
}

.hero h1 {
    font-size: 3.2rem;
    margin-bottom: 10px;
}

.hero h2 {
    font-size: 2.5rem;
    margin-bottom: 20px;
}

.subtitulo {
    font-size: 1.3rem;
    margin-bottom: 40px;
    opacity: 0.95;
}

.stats {
    display: flex;
    justify-content: center;
    gap: 60px;
    margin: 50px 0;
    flex-wrap: wrap;
}

.stats div {
    text-align: center;
}

.stats strong {
    font-size: 2.5rem;
    display: block;
}

.btn-primary {
    background: white;
    color: #2e7d32;
    padding: 15px 35px;
    font-size: 1.2rem;
    text-decoration: none;
    border-radius: 50px;
    display: inline-block;
    font-weight: bold;
}

/* Seções */
section {
    padding: 80px 20px;
}

.sobre, .funcionalidades, .beneficios {
    background: #f9f9f9;
}

h2 {
    text-align: center;
    font-size: 2.5rem;
    margin-bottom: 10px;
    color: #2e7d32;
}

h3 {
    text-align: center;
    margin-bottom: 40px;
    font-size: 1.6rem;
}

/* Cards */
.cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 25px;
}

.card {
    background: white;
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.08);
    transition: transform 0.3s;
}

.card:hover {
    transform: translateY(-10px);
}

/* Contato */
.contato {
    background: white;
}

form {
    max-width: 600px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 15px;
}

input, textarea {
    padding: 15px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
}

button {
    background: #2e7d32;
    color: white;
    padding: 15px;
    border: none;
    border-radius: 8px;
    font-size: 1.1rem;
    cursor: pointer;
}

.success {
    text-align: center;
    color: #2e7d32;
    font-weight: bold;
    margin-top: 20px;
}

.hidden {
    display: none;
}

/* Footer */
footer {
    background: #1b5e20;
    color: white;
    text-align: center;
    padding: 40px 20px;
}

.footer-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 20px;
}

/* Responsivo */
@media (max-width: 768px) {
    .hero h1 { font-size: 2.5rem; }
    .hero h2 { font-size: 2rem; }
    nav { display: none; } /* Você pode adicionar menu mobile depois */
}
