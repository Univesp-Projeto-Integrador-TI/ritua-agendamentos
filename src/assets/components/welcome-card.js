const name = "Guilherme";
const qtdAtendimentos = 5;

class createWelcomeCard extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <section class="container-welcome-card">
                <div class="description-welcome-card">
                    <p id="data-atual">...</p>
                    <h1 id="saudacao">...</h1>
                    <p id="descricao">...</p>
                </div>
                <div class="buttons-welcome-card">
                    <a href="reservas.html" class="button-welcome">Reservar sala</a>
                    <a href="agendamentos.html" class="button-welcome">+ Novo agendamento</a>
                </div>
            </section>
        `
    }
}

customElements.define('container-welcome-card', createWelcomeCard);

const data = new Date();

document.getElementById("data-atual").textContent = 
    data.toLocaleDateString("pt-BR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
});

document.getElementById("saudacao").textContent =
    data.getHours() < 12 ? `Bom dia, ${name}!` :
    data.getHours() < 18 ? `Boa tarde, ${name}!` :
    `Boa noite, ${name}!`;

document.getElementById("descricao").textContent =
    qtdAtendimentos >= 1 ? `Seu dia começa aqui! Você tem ${qtdAtendimentos} atendimentos agendados para hoje.` :
    `Seu dia começa aqui! Você não tem atendimentos agendados para hoje.`;