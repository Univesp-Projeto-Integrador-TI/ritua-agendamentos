import { appointments, timeToMinutes, formatDuration } from "../scripts/agenda-store.js";
import { getRooms, getRoomHours } from "../scripts/rooms-store.js";

const clients = [
    { name: "Beatriz Lima", phone: "(11) 97654-3210" },
    { name: "Ana Souza", phone: "(11) 98765-4321" },
    { name: "Maria Oliveira", phone: "(11) 97654-3210" },
    { name: "Rafael Santos", phone: "(11) 96543-2109" },
    { name: "Julia Santos", phone: "(11) 95432-1098" },
    { name: "Carlos Mendes", phone: "(11) 94321-0987" },
    { name: "Paula Ribeiro", phone: "(11) 93210-9876" }
];

const services = [
    { name: "Massagem relaxante", duration: 60 },
    { name: "Reiki", duration: 60 },
    { name: "Massoterapia", duration: 90 },
    { name: "Drenagem linfática", duration: 60 },
    { name: "Massagem terapêutica", duration: 60 },
    { name: "Aromaterapia", duration: 60 }
];

function dateKey(value) {
    return value;
}

function formatDate(value) {
    if (!value) return "Selecione uma data";
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return new Intl.DateTimeFormat("pt-BR", {
        weekday: "long", day: "2-digit", month: "2-digit", year: "numeric"
    }).format(date);
}

function addMinutes(time, minutes) {
    const total = timeToMinutes(time) + minutes;
    return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function durationBetween(start, end) {
    return timeToMinutes(end) - timeToMinutes(start);
}

function nextBusinessDate() {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 1);
    while (date.getDay() === 0 || date.getDay() === 6) date.setDate(date.getDate() + 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

class NewAppointment extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <main class="new-appointment-page">
                <a class="new-appointment-back" href="./agendamentos.html">‹ Meus agendamentos</a>
                <header class="new-appointment-heading">
                    <h1>Novo agendamento</h1>
                    <p>Um novo encontro de cuidado, alinhado à agenda do profissional e à disponibilidade do cliente e da sala.</p>
                </header>

                <div class="new-appointment-layout">
                    <form class="new-appointment-form">
                        <section class="booking-panel date-time-panel">
                            <h2>Data e horário</h2>
                            <div class="booking-field">
                                <label for="booking-date">Data do atendimento</label>
                                <input type="date" id="booking-date" name="date" required>
                            </div>
                            <div class="booking-time-fields">
                                <div class="booking-field">
                                    <label for="booking-start">Hora inicial *</label>
                                    <input type="time" id="booking-start" name="start" value="09:00" required>
                                </div>
                                <div class="booking-field">
                                    <label for="booking-end">Hora final *</label>
                                    <input type="time" id="booking-end" name="end" value="10:00" required>
                                </div>
                            </div>
                            <div class="booking-duration-banner">
                                <span class="duration-clock">◷</span>
                                <div>
                                    <small>Tempo de atendimento</small>
                                    <p class="duration-value">09:00 + 60 min</p>
                                </div>
                            </div>
                        </section>

                        <section class="booking-panel room-panel">
                            <h2>Sala</h2>
                            <p class="booking-panel-description">Escolha uma sala de acordo com a agenda e com intervalo livre.</p>
                            <p class="recommended-label">Sala recomendada para o seu agendamento</p>
                            <div class="recommended-room"></div>
                            <div class="booking-field">
                                <label for="booking-room">Sala disponível recomendada *</label>
                                <select id="booking-room" name="room" required></select>
                            </div>
                            <div class="room-availability-list"></div>
                        </section>

                        <section class="booking-panel client-service-panel">
                            <h2>Cliente e serviço</h2>
                            <div class="booking-field">
                                <label for="booking-client">Cliente *</label>
                                <select id="booking-client" name="client" required>
                                    <option value="">Selecione um cliente</option>
                                    ${clients.map(client => `<option value="${client.name}">${client.name}</option>`).join("")}
                                </select>
                                <small class="client-contact-hint">Selecione para consultar a disponibilidade do cliente.</small>
                                <button type="button" class="new-client-link">+ Novo cliente</button>
                            </div>
                            <div class="booking-service-fields">
                                <div class="booking-field">
                                    <label for="booking-service">Serviço *</label>
                                    <select id="booking-service" name="service" required>
                                        <option value="">Selecione um serviço</option>
                                        ${services.map(service => `<option value="${service.name}" data-duration="${service.duration}">${service.name}</option>`).join("")}
                                    </select>
                                </div>
                                <div class="booking-field">
                                    <label for="booking-professional">Profissional</label>
                                    <div class="locked-professional">
                                        <input type="text" id="booking-professional" value="Marina Oliveira" readonly>
                                        <span aria-hidden="true">♙</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <p class="booking-message" role="status" aria-live="polite"></p>
                        <footer class="booking-form-footer">
                            <p>Tudo pronto para revisar e criar o atendimento.</p>
                            <div>
                                <a class="booking-cancel" href="./agendamentos.html">Cancelar</a>
                                <button class="booking-create" type="submit">＋ Criar agendamento</button>
                            </div>
                        </footer>
                    </form>

                    <aside class="booking-summary-column">
                        <section class="booking-summary-card">
                            <img src="/src/assets/images/img-exe-ambiente-sala.svg" alt="Ambiente de atendimento">
                            <div class="booking-summary-content">
                                <p class="booking-summary-eyebrow">Revise antes de criar</p>
                                <h2 class="summary-client">Selecione um cliente</h2>
                                <dl>
                                    <dt>Serviço</dt>
                                    <dd class="summary-service">—</dd>
                                    <dt>Data e horário</dt>
                                    <dd class="summary-date-time">—</dd>
                                    <dt>Sala e profissional</dt>
                                    <dd class="summary-room-professional">— · Marina Oliveira</dd>
                                </dl>
                            </div>
                        </section>

                        <section class="availability-check-card">
                            <h2>Disponibilidade válida</h2>
                            <ul class="availability-check-list">
                                <li data-check="staff"><span>✓</span> Horário na agenda</li>
                                <li data-check="room"><span>✓</span> Sala disponível</li>
                                <li data-check="client"><span>✓</span> Cliente no horário disponível</li>
                            </ul>
                        </section>

                        <a class="booking-whatsapp" href="#" target="_blank" rel="noopener" aria-disabled="true">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <path d="M20.5 11.7a8.5 8.5 0 0 1-12.6 7.4L3 20l.9-4.7a8.5 8.5 0 1 1 16.6-3.6Z" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M8.5 8.2c.2-.5.4-.5.7-.5h.5c.2 0 .4.1.5.4l.7 1.7c.1.2.1.4 0 .5l-.5.7c-.1.2-.2.3 0 .5.2.4.7 1 1.4 1.6.8.7 1.5 1 1.8 1.2.2.1.4.1.5-.1l.7-.8c.2-.2.3-.2.6-.1l1.6.8c.2.1.4.2.4.4 0 .3-.2 1.2-.8 1.6-.5.4-1.2.6-1.9.4-.8-.2-1.8-.6-3.1-1.5-1.1-.8-2-1.8-2.6-2.8-.6-1-.8-1.8-.8-2.4 0-.6.3-1.2.6-1.6Z" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            Enviar agendamento
                        </a>
                    </aside>
                </div>
            </main>
        `;

        this.form = this.querySelector(".new-appointment-form");
        this.dateInput = this.querySelector("#booking-date");
        this.startInput = this.querySelector("#booking-start");
        this.endInput = this.querySelector("#booking-end");
        this.roomInput = this.querySelector("#booking-room");
        this.clientInput = this.querySelector("#booking-client");
        this.serviceInput = this.querySelector("#booking-service");
        this.dateInput.value = nextBusinessDate();
        this.clientInput.value = "Beatriz Lima";
        this.serviceInput.value = "Reiki";

        this.dateInput.addEventListener("change", () => this.renderAvailability());
        this.clientInput.addEventListener("change", () => this.renderAvailability());
        this.startInput.addEventListener("change", () => {
            this.endInput.value = addMinutes(this.startInput.value || "09:00", this.selectedService?.duration || 60);
            this.renderAvailability();
        });
        this.endInput.addEventListener("input", () => this.renderAvailability());
        this.endInput.addEventListener("change", () => this.renderAvailability());
        this.serviceInput.addEventListener("change", () => {
            this.endInput.value = addMinutes(this.startInput.value || "09:00", this.selectedService?.duration || 60);
            this.renderAvailability();
        });
        this.roomInput.addEventListener("change", () => this.renderAvailability());
        this.querySelector(".room-availability-list").addEventListener("click", event => this.selectRoomSlot(event));
        this.form.addEventListener("submit", event => this.createAppointment(event));
        this.querySelector(".new-client-link").addEventListener("click", () => {
            window.location.href = "./clients-page.html";
        });

        this.renderAvailability();
    }

    get roomChoices() {
        const [year, month, day] = this.dateInput.value.split("-").map(Number);
        const selectedDate = this.dateInput.value ? new Date(year, month - 1, day) : new Date();
        return getRooms().filter(room => room.active !== false).map(room => {
            const schedule = getRoomHours(room, selectedDate.getDay());
            if (!schedule.enabled) return null;
            const startMinutes = timeToMinutes(schedule.start);
            const endMinutes = timeToMinutes(schedule.end);
            return {
                ...room,
                opening: startMinutes,
                closing: endMinutes,
                intervalMinutes: Number(room.interval) || 0,
                hours: Array.from({ length: Math.max(0, Math.ceil((endMinutes - startMinutes) / 60)) }, (_, index) => startMinutes + index * 60)
                    .filter(minutes => minutes < endMinutes)
                    .map(minutes => `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`)
            };
        }).filter(Boolean);
    }

    get selectedService() {
        return services.find(service => service.name === this.serviceInput.value) || null;
    }

    get selectedClient() {
        return clients.find(client => client.name === this.clientInput.value) || null;
    }

    get selectedDuration() {
        const start = this.startInput?.value;
        const end = this.endInput?.value;
        const duration = start && end ? durationBetween(start, end) : 0;
        return duration > 0 ? duration : (this.selectedService?.duration || 60);
    }

    get endTime() {
        return this.endInput?.value || addMinutes(this.startInput.value || "09:00", this.selectedService?.duration || 60);
    }

    get validTimeRange() {
        return Boolean(this.startInput.value && this.endInput.value) &&
            durationBetween(this.startInput.value, this.endInput.value) > 0;
    }

    hasConflict(kind, start, end, roomName = this.roomInput.value) {
        const key = dateKey(this.dateInput.value);
        const clientName = this.clientInput.value;
        const savedAppointments = JSON.parse(localStorage.getItem("ritua-appointments") || "[]");

        return [...appointments, ...savedAppointments].some(appointment => {
            if ((appointment.data || appointment.date) !== key || appointment.status === "Cancelado") return false;
            if (kind === "client" && appointment.client !== clientName) return false;
            if (kind === "room" && appointment.room !== roomName) return false;
            return timeToMinutes(start) < timeToMinutes(appointment.finalHour) &&
                timeToMinutes(end) > timeToMinutes(appointment.initialHour);
        });
    }

    isRoomAvailable(room, start, end) {
        if (!start || !end || durationBetween(start, end) <= 0) return false;
        const startMinutes = timeToMinutes(start);
        const endMinutes = timeToMinutes(end);
        if (startMinutes < room.opening || endMinutes + room.intervalMinutes > room.closing) return false;
        if (this.hasConflict("staff", start, end)) return false;
        if (this.clientInput.value && this.hasConflict("client", start, end)) return false;
        return !this.hasConflict("room", start, end, room.name);
    }

    renderAvailability() {
        const start = this.startInput.value || "09:00";
        const end = this.endTime;
        const validTimeRange = this.validTimeRange;
        const duration = validTimeRange ? durationBetween(start, end) : 0;
        this.querySelector(".duration-value").textContent = validTimeRange
            ? `${start}–${end} · ${formatDuration(duration)}`
            : "A hora final deve ser posterior à inicial";

        const staffAvailable = validTimeRange && !this.hasConflict("staff", start, end);
        const clientAvailable = validTimeRange && Boolean(this.clientInput.value) && !this.hasConflict("client", start, end);
        this.setCheck("staff", staffAvailable);
        this.setCheck("client", clientAvailable);

        const rooms = this.roomChoices;
        const availableRooms = rooms.filter(room => this.isRoomAvailable(room, start, end));
        const currentRoom = availableRooms.find(room => room.name === this.roomInput.value);
        const recommendedRoom = currentRoom || availableRooms.find(room => room.name === "Sala Lótus") || availableRooms[0];

        this.roomInput.innerHTML = availableRooms.length
            ? availableRooms.map(room => `<option value="${room.name}">${room.name} · ${start}–${end}</option>`).join("")
            : `<option value="">Nenhuma sala disponível nesse horário</option>`;

        if (recommendedRoom) this.roomInput.value = recommendedRoom.name;
        this.setCheck("room", Boolean(recommendedRoom));
        this.querySelector(".recommended-room").innerHTML = recommendedRoom
                            ? `<img class="room-door" src="/src/assets/images/icon-door.svg" alt=""><div><strong>${recommendedRoom.name}</strong><small>Atendimento de ${this.selectedDuration} minutos</small></div>`
            : `<div class="no-recommended-room">Sem sala disponível para este horário.</div>`;

        this.querySelector(".room-availability-list").innerHTML = rooms.map(room => {
            const availableHours = room.hours.filter(slotStart =>
                this.isRoomAvailable(room, slotStart, addMinutes(slotStart, this.selectedDuration))
            );
            const active = this.roomInput.value === room.name;

            return `
                <article class="room-availability-card ${active ? "room-active" : ""}" data-room="${room.name}">
                    <div class="room-availability-heading"><img class="room-door" src="/src/assets/images/icon-door.svg" alt=""><strong>${room.name}</strong></div>
                    <small>Horários disponíveis:</small>
                    <div class="room-time-chips">
                        ${availableHours.length
                            ? availableHours.map(slotStart => `<button type="button" class="room-time-chip ${slotStart === start ? "selected" : ""}" data-room="${room.name}" data-time="${slotStart}">${slotStart}</button>`).join("")
                            : `<span class="no-room-times">Sem horários livres</span>`}
                    </div>
                </article>
            `;
        }).join("");

        this.setCheck("staff", staffAvailable);
        this.setCheck("client", clientAvailable);
        this.setCheck("room", Boolean(recommendedRoom));
        this.updateSummary();
        this.updateWhatsAppLink();
        this.querySelector(".booking-create").disabled = !validTimeRange || !staffAvailable || !clientAvailable || !recommendedRoom || !this.selectedService;
    }

    setCheck(name, valid) {
        const item = this.querySelector(`[data-check="${name}"]`);
        item.classList.toggle("check-invalid", !valid);
        item.querySelector("span").textContent = valid ? "✓" : "!";
    }

    selectRoomSlot(event) {
        const button = event.target.closest(".room-time-chip");
        if (!button) return;
        this.startInput.value = button.dataset.time;
        this.roomInput.value = button.dataset.room;
        this.renderAvailability();
    }

    updateSummary() {
        const client = this.selectedClient;
        const service = this.selectedService;
        const room = this.roomInput.value;
        this.querySelector(".summary-client").textContent = client?.name || "Selecione um cliente";
        this.querySelector(".summary-service").textContent = service ? `${service.name} · ${this.selectedDuration} minutos` : "—";
        this.querySelector(".summary-date-time").textContent = this.dateInput.value
            ? `${formatDate(this.dateInput.value)} · ${this.startInput.value}–${this.endTime}`
            : "—";
        this.querySelector(".summary-room-professional").textContent = `${room || "Selecione uma sala"} · Marina Oliveira`;
    }

    updateWhatsAppLink() {
        const client = this.selectedClient;
        const room = this.roomInput.value;
        const service = this.selectedService;
        const link = this.querySelector(".booking-whatsapp");
        const roomData = this.roomChoices.find(item => item.name === room);
        const isAvailable = client && service && roomData && this.validTimeRange &&
            !this.hasConflict("staff", this.startInput.value, this.endTime) &&
            !this.hasConflict("client", this.startInput.value, this.endTime) &&
            this.isRoomAvailable(roomData, this.startInput.value, this.endTime);

        if (!isAvailable) {
            link.href = "#";
            link.setAttribute("aria-disabled", "true");
            return;
        }
        const phone = client.phone.replace(/\D/g, "");
        const message = `Olá, ${client.name}! Seu atendimento de ${service.name} está agendado para ${formatDate(this.dateInput.value)}, das ${this.startInput.value} às ${this.endTime}, em ${room}.`;
        link.href = `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`;
        link.removeAttribute("aria-disabled");
    }

    createAppointment(event) {
        event.preventDefault();
        if (!this.form.reportValidity()) return;
        const client = this.selectedClient;
        const service = this.selectedService;
        const room = this.roomInput.value;
        const roomData = this.roomChoices.find(item => item.name === room);
        const isAvailable = client && service && roomData && this.validTimeRange &&
            !this.hasConflict("staff", this.startInput.value, this.endTime) &&
            !this.hasConflict("client", this.startInput.value, this.endTime) &&
            this.isRoomAvailable(roomData, this.startInput.value, this.endTime);

        if (!isAvailable) {
            this.querySelector(".booking-message").textContent = "Este horário não está mais disponível. Escolha outro horário para continuar.";
            this.querySelector(".booking-message").classList.add("booking-success");
            this.renderAvailability();
            return;
        }

        const newAppointment = {
            client: client.name,
            service: service.name,
            room,
            date: this.dateInput.value,
            initialHour: this.startInput.value,
            finalHour: this.endTime,
            duration: durationBetween(this.startInput.value, this.endTime),
            professional: "Marina Oliveira",
            status: "Agendado"
        };

        const saved = JSON.parse(localStorage.getItem("ritua-appointments") || "[]");
        saved.push(newAppointment);
        localStorage.setItem("ritua-appointments", JSON.stringify(saved));
        this.querySelector(".booking-message").textContent = "Agendamento criado. Você já pode enviar a confirmação pelo WhatsApp.";
        this.querySelector(".booking-message").classList.add("booking-success");
        this.querySelector(".booking-create").textContent = "Agendamento criado";
        this.querySelector(".booking-create").disabled = true;
    }
}

customElements.define("new-appointment", NewAppointment);
