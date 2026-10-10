class createHeader extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <div class="header-ritua">
            <img src="./src/assets/images/logotipo-ritua.svg" alt="Logotipo Rituá Terapias" class="header-ritua-logo">
            <nav class="header-ritua-nav">
                <a href="./index.html" class="header-ritua-nav-link"> 
                    <img src="./src/assets/images/icon-home.svg" alt="Ícone de casa" class="header-ritua-nav-link-icon">
                    Início
                </a>
                <a href="./src/assets/pages/clientes.html" class="header-ritua-nav-link"> 
                    <img src="./src/assets/images/icon-people.svg" alt="Ícone de pessoa" class="header-ritua-nav-link-icon">
                    Clientes
                </a>
                <a href="./src/assets/pages/agendamentos.html" class="header-ritua-nav-link"> 
                    <img src="./src/assets/images/icon-calendar.svg" alt="Ícone de calendário" class="header-ritua-nav-link-icon">
                    Agendamentos
                </a>
                <a href="./src/assets/pages/reservas.html" class="header-ritua-nav-link"> 
                    <img src="./src/assets/images/icon-door.svg" alt="Ícone de porta" class="header-ritua-nav-link-icon">
                    Reservas
                </a>
            </nav>
            <div class="header-ritua-user">
                <img class="user-icon" src="./src/assets/images/icon-user.svg" alt="Ícone de usuário" class="header-ritua-user-icon">
                <div class="header-ritua-user-info">
                    <span class="header-ritua-user-info-name">Guilherme Manso</span>
                    <span class="header-ritua-user-info-role">Desenvolvedor Rituá</span>
                </div>
                <button class="btn-user-settings">
                    <img src="./src/assets/images/icon-settings.svg" alt="Ícone de configurações" class="header-ritua-user-settings-icon">
                </button>
            </div>
        </div>`;
    }
}

customElements.define('header-ritua', createHeader);