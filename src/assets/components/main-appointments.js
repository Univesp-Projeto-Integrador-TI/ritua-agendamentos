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
            </main>
        `;
    }
}

customElements.define('main-appointments', mainAppointments);
