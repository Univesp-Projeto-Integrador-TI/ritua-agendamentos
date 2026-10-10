class createHeader extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <div class="header-ritua">
            img src="./src/assets/images/logo.png" alt="Logo Rituá Terapias" class="logo-ritua">
        </div>`;
    }
}

customElements.define('header-ritua', createHeader);