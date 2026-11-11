import { getSessionUser } from "/src/assets/scripts/session.js";
class createHeader extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <div class="header-ritua">
            <picture class="header-ritua-logo-picture">
                <source media="(max-width: 900px)" srcset="/src/assets/images/logo-ritua.svg">
                <img src="/src/assets/images/logotipo-ritua.svg" alt="Logotipo Rituá Terapias" class="header-ritua-logo">
            </picture>
            <button type="button" class="header-ritua-menu-toggle" aria-label="Abrir menu" aria-expanded="false" aria-controls="header-ritua-nav">
                <span></span><span></span><span></span>
            </button>
            <nav class="header-ritua-nav" id="header-ritua-nav">
                <a href="/index.html" class="header-ritua-nav-link"> 
                    <img src="/src/assets/images/icon-home.svg" alt="Ícone de casa" class="header-ritua-nav-link-icon">
                    Início
                </a>
                <a href="/src/assets/pages/clients-page.html" class="header-ritua-nav-link"> 
                    <img src="/src/assets/images/icon-people.svg" alt="Ícone de pessoa" class="header-ritua-nav-link-icon">
                    Clientes
                </a>
                <a href="/src/assets/pages/agendamentos.html" class="header-ritua-nav-link"> 
                    <img src="/src/assets/images/icon-calendar.svg" alt="Ícone de calendário" class="header-ritua-nav-link-icon">
                    Agendamentos
                </a>
                <a href="/src/assets/pages/salas.html" class="header-ritua-nav-link">
                    <img src="/src/assets/images/icon-door.svg" alt="Ícone de porta" class="header-ritua-nav-link-icon">
                    Salas
                </a>
            </nav>
            <div class="header-ritua-user">
                <img class="user-icon" src="/src/assets/images/icon-user.svg" alt="Ícone de usuário" class="header-ritua-user-icon">
                <div class="header-ritua-user-info">
                    <span class="header-ritua-user-info-name">${getSessionUser().name}</span>
                    <span class="header-ritua-user-info-role">${getSessionUser().role}</span>
                </div>
                <button class="btn-user-settings">
                    <a href="/src/assets/pages/user-page.html" class="header-ritua-user-settings-icon">
                        <img src="/src/assets/images/icon-settings.svg" alt="Ícone de configuração">
                    </a>
                </button>
            </div>
        </div>`;

        const toggle = this.querySelector(".header-ritua-menu-toggle");
        const header = this.querySelector(".header-ritua");
        toggle.addEventListener("click", () => {
            const open = header.classList.toggle("menu-open");
            toggle.setAttribute("aria-expanded", String(open));
            toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
        });

        // Destaca o link da página atual
        const currentPath = window.location.pathname;

        this.querySelectorAll(".header-ritua-nav-link").forEach(link => {
            const linkPath = link.getAttribute("href");

            const isAppointmentsPage = (currentPath.endsWith("/novo-agendamento.html") || currentPath.endsWith("/detalhes-agendamento.html")) && linkPath.endsWith("/agendamentos.html");
            const isRoomsPage = ["/salas.html", "/nova-sala.html", "/editar-sala.html"].some(page => currentPath.endsWith(page)) && linkPath.endsWith("/salas.html");

            if (currentPath === linkPath || isAppointmentsPage || isRoomsPage || (currentPath === "/" && linkPath === "/index.html")) {
                link.classList.add("active");
            }
        });
    }
}

customElements.define('header-ritua', createHeader);