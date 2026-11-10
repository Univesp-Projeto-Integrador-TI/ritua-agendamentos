class createHeader extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <div class="header-ritua">
            <img src="/src/assets/images/logotipo-ritua.svg" alt="Logotipo Rituá Terapias" class="header-ritua-logo">
            <nav class="header-ritua-nav">
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
                    <span class="header-ritua-user-info-name">Guilherme Manso</span>
                    <span class="header-ritua-user-info-role">Desenvolvedor Rituá</span>
                </div>
                <button class="btn-user-settings">
                    <a href="/src/assets/pages/user-page.html" class="header-ritua-user-settings-icon">
                        <img src="/src/assets/images/icon-settings.svg" alt="Ícone de configuração">
                    </a>
                </button>
            </div>
        </div>`;

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