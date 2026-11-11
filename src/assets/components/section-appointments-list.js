import { asset, page } from "../scripts/paths.js";
import {
    agendaState, getFilteredAppointments, isSameDay, pad, monthLong, formatDuration
} from "../scripts/agenda-store.js";

class createAppointmentsList extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <section class="container-appointments-list">
                <header class="header-appointments-list">
                    <h3 class="title-appointments-list"></h3>
                    <span class="info-appointments-list"></span>
                </header>

                <section class="group-cards-appointments-list"></section>
            </section>
        `;

        document.addEventListener("agenda-changed", () => this.render());

        this.render();
    }

    render() {
        const selected = agendaState.selectedDate;
        const dayAppointments = getFilteredAppointments(selected);
        const total = dayAppointments.length;

        this.querySelector(".title-appointments-list").textContent =
            `Atendimentos de ${pad(selected.getDate())} de ${monthLong(selected)}`;

        this.querySelector(".info-appointments-list").textContent =
            `${isSameDay(selected, new Date()) ? "Hoje · " : ""}` +
            `${total} ${total === 1 ? "agendamento" : "agendamentos"} · Ordenados por início`;

        const list = this.querySelector(".group-cards-appointments-list");

        if (total === 0) {
            list.innerHTML = `
                <div class="section-empty-appointments">
                    <div class="icon-calendar">
                        <img src="${asset('icon-calendar.svg')}" alt="">
                    </div>

                    <div class="text-empty-appointments">
                        <p>Nenhum atendimento neste dia!</p>
                        <p>Não há agendamentos para o dia e os filtros selecionados.</p>
                    </div>
                </div>
            `;
            return;
        }

        list.innerHTML = dayAppointments.map(appointment => `
            <div class="card-appointments-list">
                <div class="service-time-card">
                    <p class="initial-hour-card">${appointment.initialHour}</p>
                    <p class="final-hour-card">${appointment.finalHour}</p>
                </div>

                <span class="line-card-appointments ${appointment.status === "Agendado" ? "is-scheduled" : ""}"></span>

                <div class="detail-appointments-card">
                    <p class="name-client-card">${appointment.client}</p>
                    <span>${appointment.service} · ${appointment.duration} min</span>
                    <span>${appointment.room}</span>
                    <a href="${page('detalhes-agendamento.html')}" class="link-detail-appointment">Ver detalhes →</a>
                </div>

                <p class="status-appointments-card">${appointment.status}</p>
            </div>
        `).join("");

        this.bindDetailLinks(dayAppointments, ".link-detail-appointment");
    }

    // Guarda o atendimento escolhido para a tela de detalhes
    bindDetailLinks(items, selector) {
        this.querySelectorAll(selector).forEach((link, index) => {
            link.addEventListener("click", () => {
                const item = items[index];

                sessionStorage.setItem("ritua-appointment-detail", JSON.stringify({
                    id: item.id,
                    client: item.client,
                    date: item.data,
                    initialHour: item.initialHour,
                    finalHour: item.finalHour,
                    service: item.service,
                    duration: item.duration,
                    room: item.room,
                    status: item.status,
                    professional: "Marina Oliveira"
                }));
            });
        });
    }
}

customElements.define('section-appointments-list', createAppointmentsList);
