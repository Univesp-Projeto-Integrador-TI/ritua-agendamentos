import {
    agendaState, getAvailableReservations, parseDateKey, pad, weekdayLong, monthShort
} from "../scripts/agenda-store.js";

class createAvailableReservation extends HTMLElement {
    connectedCallback() {
        document.addEventListener("agenda-changed", () => this.render());

        this.render();
    }

    render() {
        const reservations = getAvailableReservations();

        // Sem reservas livres na semana, o card não aparece
        this.innerHTML = reservations.map(reservation => {
            const date = parseDateKey(reservation.data);

            return `
                <section class="card-available-reservation">
                    <header class="header-available-reservation">
                        <h4>Uma reserva disponível para agendar</h4>
                        <span class="status-available-reservation">${reservation.status}</span>
                    </header>

                    <p class="info-available-reservation">
                        ${reservation.room} · ${weekdayLong(date)}, ${pad(date.getDate())} ${monthShort(date)} · ${reservation.initialHour}–${reservation.finalHour}
                    </p>

                    <footer class="footer-available-reservation">
                        <p>Sem agendamento vinculado. Não entra no total de atendimentos.</p>

                        <button type="button" class="btn-link-appointment">
                            <span>+</span> Vincular atendimento
                        </button>
                    </footer>
                </section>
            `;
        }).join("");
    }
}

customElements.define('card-available-reservation', createAvailableReservation);
