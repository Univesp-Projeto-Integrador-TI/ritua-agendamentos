class footerRitua extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <footer class="footer-ritua">
                <p>Rituá Terapias · Cuidado que se organiza.</p>
                <a href="#">Precisa de ajuda? →</a>
            </footer>
        `;
    }
}

customElements.define("footer-ritua", footerRitua);
