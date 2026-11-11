import { asset } from "../scripts/paths.js";
import {
    agendaState, updateAgenda, getFilteredAppointments, getWeekDays, addDays, isSameDay, pad,
    weekdayShort, weekdayLong, monthShort, monthLong, capitalize, rooms, statuses
} from "../scripts/agenda-store.js";

class createWeekAgenda extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <section class="card-week-agenda">

                <header class="week-agenda-header">
                    <div class="week-agenda-navigation">
                        <button type="button" class="btn-calendar week-prev" aria-label="Semana anterior">
                            <svg width="7" height="11" viewBox="0 0 7 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5.63135 9.80005L1.13135 5.30005L5.63135 0.800049" stroke="#3E4228" stroke-width="1.6" stroke-linecap="round"/>
                            </svg>
                        </button>

                        <p class="week-agenda-title"></p>

                        <button type="button" class="btn-calendar week-next" aria-label="Próxima semana">
                            <svg width="7" height="11" viewBox="0 0 7 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M0.800049 9.80005L5.30005 5.30005L0.800049 0.800049" stroke="#3E4228" stroke-width="1.6" stroke-linecap="round"/>
                            </svg>
                        </button>
                    </div>

                    <button type="button" class="btn-current-date">Hoje</button>
                </header>

                <div class="week-agenda-days"></div>

                <p class="week-agenda-summary"></p>

                <div class="week-agenda-filters">
                    <div class="filter-field">
                        <label for="filter-search">Buscar atendimento</label>
                        <div class="filter-search">
                            <input type="search" id="filter-search" placeholder="Nome do cliente ou serviço" aria-label="Buscar atendimento por cliente ou serviço">
                            <img src="${asset('icon-searchglass.svg')}" alt="" class="filter-search-icon">
                        </div>
                    </div>

                    <div class="filter-field">
                        <label for="filter-room">Sala</label>
                        <select id="filter-room">
                            <option value="">Todas as salas</option>
                            ${rooms.map(room => `<option value="${room}">${room}</option>`).join("")}
                        </select>
                    </div>

                    <div class="filter-field">
                        <label for="filter-status">Status do agendamento</label>
                        <select id="filter-status">
                            <option value="">Todos os status</option>
                            ${statuses.map(status => `<option value="${status}">${status}</option>`).join("")}
                        </select>
                    </div>
                </div>
            </section>
        `;

        // Navegação entre semanas: mantém o mesmo dia da semana selecionado
        this.querySelector(".week-prev").addEventListener("click", () => this.changeWeek(-7));
        this.querySelector(".week-next").addEventListener("click", () => this.changeWeek(7));

        this.querySelector(".btn-current-date").addEventListener("click", () => {
            const today = new Date();
            updateAgenda({
                weekStart: addDays(today, -((today.getDay() + 6) % 7)),
                selectedDate: new Date(today.getFullYear(), today.getMonth(), today.getDate())
            });
        });

        // Filtros
        this.querySelector("#filter-search").addEventListener("input", event => {
            updateAgenda({ search: event.target.value });
        });

        this.querySelector("#filter-room").addEventListener("change", event => {
            updateAgenda({ room: event.target.value });
        });

        this.querySelector("#filter-status").addEventListener("change", event => {
            updateAgenda({ status: event.target.value });
        });

        // Seleção de dia (delegação de evento)
        this.querySelector(".week-agenda-days").addEventListener("click", event => {
            const button = event.target.closest("[data-day]");
            if (!button) return;

            const [year, month, day] = button.dataset.day.split("-").map(Number);
            updateAgenda({ selectedDate: new Date(year, month - 1, day) });
        });

        document.addEventListener("agenda-changed", () => this.render());

        this.render();
    }

    changeWeek(days) {
        updateAgenda({
            weekStart: addDays(agendaState.weekStart, days),
            selectedDate: addDays(agendaState.selectedDate, days)
        });
    }

    render() {
        const weekDays = getWeekDays();
        const firstDay = weekDays[0];
        const lastDay = weekDays[6];
        const today = new Date();

        // Título: "05–11 out 2026" ou "28 out–03 nov 2026"
        const sameMonth = firstDay.getMonth() === lastDay.getMonth();
        const startLabel = sameMonth ? pad(firstDay.getDate()) : `${pad(firstDay.getDate())} ${monthShort(firstDay)}`;
        this.querySelector(".week-agenda-title").textContent =
            `${startLabel}–${pad(lastDay.getDate())} ${monthShort(lastDay)} ${lastDay.getFullYear()}`;

        // Cards dos dias da semana
        const weekAppointments = getFilteredAppointments().filter(appointment =>
            weekDays.some(day => appointment.data === this.toKey(day))
        );

        this.querySelector(".week-agenda-days").innerHTML = weekDays.map(day => {
            const key = this.toKey(day);
            const total = weekAppointments.filter(appointment => appointment.data === key).length;
            const classes = ["week-day"];

            if (isSameDay(day, agendaState.selectedDate)) classes.push("day-selected");
            if (isSameDay(day, today)) classes.push("today");
            if (day.getDay() === 0 || day.getDay() === 6) classes.push("weekend");

            return `
                <button type="button" class="${classes.join(" ")}" data-day="${key}" aria-pressed="${isSameDay(day, agendaState.selectedDate)}">
                    <span class="week-day-name">${weekdayShort(day)}</span>
                    <span class="week-day-number">${pad(day.getDate())}</span>
                    <span class="week-day-total">${total} atend.</span>
                </button>
            `;
        }).join("");

        // Resumo da semana
        const selected = agendaState.selectedDate;
        const selectedLabel = `${weekdayLong(selected)}, ${pad(selected.getDate())} de ${monthLong(selected)}`;
        const totalWeek = weekAppointments.length;

        this.querySelector(".week-agenda-summary").textContent =
            `${totalWeek} ${totalWeek === 1 ? "agendamento" : "agendamentos"} na semana · ` +
            `${isSameDay(selected, today) ? "Hoje, " + selectedLabel : capitalize(selectedLabel)}`;
    }

    toKey(date) {
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    }
}

customElements.define('card-week-agenda', createWeekAgenda);
