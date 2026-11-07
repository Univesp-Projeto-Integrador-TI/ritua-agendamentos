class mainAppointments extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <main class="main-appointments">
                <card-week-agenda></card-week-agenda>

                <section class="section-appointments-painel">
                    <card-day-schedule></card-day-schedule>
                    <section-appointments-list></section-appointments-list>
                </section>

                <div class="info-main-appointments">
                    <img src="/src/assets/images/icon-lock-keyhole.svg" alt="">
                    <p>Apenas os seus agendamentos são exibidos aqui.</p>
                </div>

                <footer class="footer-main-appointments">
                    <p>Rituá Terapias · Cuidado que se organiza.</p>
                    <a href="#">Precisa de ajuda? →</a>
                </footer>
            </main>
        `;
    }
}

customElements.define('main-appointments', mainAppointments);
