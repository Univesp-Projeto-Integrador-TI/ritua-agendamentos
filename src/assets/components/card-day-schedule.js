import {
    agendaState, getFilteredAppointments, isSameDay, pad,
    weekdayLong, monthShort, capitalize, timeToMinutes, formatDuration
} from "../scripts/agenda-store.js";

const HOUR_HEIGHT = 56; // altura em px de cada hora na linha do tempo

class createDaySchedule extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <section class="card-day-schedule">
                <header class="header-day-schedule">
                    <h3>Agenda do dia</h3>
                    <span class="date-day-schedule"></span>
                </header>

                <div class="timeline-day-schedule"></div>

                <footer class="footer-day-schedule"></footer>
            </section>
        `;

        document.addEventListener("agenda-changed", () => this.render());

        this.render();
    }

    render() {
        const selected = agendaState.selectedDate;
        const dayAppointments = getFilteredAppointments(selected);

        this.querySelector(".date-day-schedule").textContent =
            `${capitalize(weekdayLong(selected))}, ${pad(selected.getDate())} ${monthShort(selected)} · ${selected.getFullYear()}`;

        // Linha do tempo: das 9h às 18h, expandindo se houver atendimento fora desse intervalo
        const firstHour = Math.min(9, ...dayAppointments.map(a => Math.floor(timeToMinutes(a.initialHour) / 60)));
        const lastHour = Math.max(18, ...dayAppointments.map(a => Math.ceil(timeToMinutes(a.finalHour) / 60)));

        const timeline = this.querySelector(".timeline-day-schedule");
        timeline.style.height = `${(lastHour - firstHour) * HOUR_HEIGHT}px`;

        let hoursHtml = "";
        for (let hour = firstHour; hour <= lastHour; hour++) {
            hoursHtml += `
                <div class="schedule-hour" style="top: ${(hour - firstHour) * HOUR_HEIGHT}px">
                    <span>${hour}:00</span>
                </div>
            `;
        }

        const blocksHtml = dayAppointments.map(appointment => {
            const start = timeToMinutes(appointment.initialHour);
            const end = timeToMinutes(appointment.finalHour);
            const top = (start - firstHour * 60) / 60 * HOUR_HEIGHT;
            const height = (end - start) / 60 * HOUR_HEIGHT;

            return `
                <div class="schedule-block ${appointment.status === "Agendado" ? "is-scheduled" : ""}"
                     style="top: ${top}px; height: ${height}px">
                    <p class="schedule-block-client">${appointment.client}</p>
                    <span>${appointment.initialHour}–${appointment.finalHour} · ${appointment.room.replace("Sala ", "")}</span>
                </div>
            `;
        }).join("");

        timeline.innerHTML = hoursHtml + blocksHtml;

        // Rodapé: total de atendimentos e tempo de cuidado
        const totalMinutes = dayAppointments.reduce((sum, appointment) => sum + appointment.duration, 0);
        const total = dayAppointments.length;

        this.querySelector(".footer-day-schedule").textContent = total === 0
            ? "Nenhum atendimento neste dia"
            : `${total} ${total === 1 ? "atendimento" : "atendimentos"} · ${formatDuration(totalMinutes)} de cuidado`;
    }
}

customElements.define('card-day-schedule', createDaySchedule);
