import { asset, page } from "../scripts/paths.js";
import { getRelatedStatuses, statuses, updateAppointmentStatus, getAppointmentById } from "../scripts/agenda-store.js";
import { getClient } from "../scripts/clients-store.js";

const PROGRESS_STEPS = ["Agendado", "Confirmado", "Em andamento", "Concluído"];

class AppointmentDetails extends HTMLElement {
    connectedCallback() {
        const appointment = this.getAppointment();
        const progressIndex = PROGRESS_STEPS.indexOf(appointment.status);
        const progressClosed = progressIndex === -1;
        this.innerHTML = `
            <main class="appointment-details-page">
                <a class="appointment-details-back" href="${page('agendamentos.html')}">‹ Meus agendamentos</a>

                <header class="appointment-details-heading">
                    <div>
                        <h1>Detalhes do agendamento</h1>
                        <p>Consulte o atendimento e as informações da sala.</p>
                    </div>
                    <a class="appointment-edit-link" href="./novo-agendamento.html">✎ Editar / Remarcar</a>
                </header>

                <div class="appointment-details-layout">
                    <div class="appointment-details-main-column">
                        <section class="appointment-highlight-card">
                            <div class="appointment-highlight-status"><span>✓</span> ${appointment.status}</div>
                            <p class="appointment-card-eyebrow">AGENDAMENTO</p>
                            <h2>${appointment.client}</h2>
                            <p class="appointment-highlight-service">${appointment.service}</p>
                            <div class="appointment-highlight-divider"></div>
                            <div class="appointment-highlight-time">
                                <div class="appointment-date-tile">
                                    <strong>${appointment.day}</strong>
                                    <span>${appointment.month}</span>
                                </div>
                                <div>
                                    <p class="appointment-weekday">${appointment.weekday}</p>
                                    <p class="appointment-time-range">${appointment.initialHour}–${appointment.finalHour}</p>
                                    <span>${appointment.duration} minutos de atendimento</span>
                                </div>
                            </div>
                            <div class="appointment-professional"><span>♙</span> ${appointment.professional}</div>
                        </section>

                        <section class="appointment-contact-card">
                            <h2>Cliente e contato</h2>
                            <div class="appointment-client-identity">
                                <span class="appointment-client-avatar">${appointment.client.charAt(0)}</span>
                                <div>
                                    <strong>${appointment.client}</strong>
                                    <a href="${page('clients-page.html')}">Ver dados do cliente →</a>
                                </div>
                            </div>
                            <div class="appointment-contact-details">
                                <div><span>Telefone</span><p>${appointment.phone || "Não informado"}</p></div>
                                <div><span>E-mail</span><p>${appointment.email || "Não informado"}</p></div>
                            </div>
                            <p class="appointment-contact-note">Prefere receber confirmações por WhatsApp. Avisar com antecedência em caso de alteração de horário.</p>
                        </section>

                        <section class="appointment-manage-card">
                            <h2>Etapa do atendimento</h2>
                            <p>Atualize o andamento aqui. Agendamentos desmarcados ou cancelados liberam o horário, a sala e a agenda do profissional.</p>
                            <ol class="appointment-progress" aria-label="Progresso do atendimento">
                                ${PROGRESS_STEPS.map((step, index) => {
                                    const state = index < progressIndex ? "done" : index === progressIndex ? "current" : "pending";
                                    return `<li class="appointment-progress-step ${state}${progressClosed ? " closed" : ""}"${index === progressIndex ? ' aria-current="step"' : ""}>
                                        <span class="appointment-progress-dot">${index < progressIndex ? "✓" : index + 1}</span>
                                        <span class="appointment-progress-label">${step}</span>
                                    </li>`;
                                }).join("")}
                            </ol>
                            ${progressClosed ? `<p class="appointment-progress-note">Atendimento encerrado como <strong>${appointment.status}</strong>. As etapas anteriores continuam registradas no histórico.</p>` : ""}
                            <label class="appointment-status-control">Alterar status
                                <select class="appointment-status-select">
                                    <option value="">Selecione o status</option>
                                    ${statuses.filter(status => status !== appointment.status).map(status => `<option value="${status}">${status === "Desmarcado" ? "Desmarcado (a pedido do cliente)" : status === "Cancelado" ? "Cancelado (pela equipe)" : status}</option>`).join("")}
                                </select>
                                <small class="appointment-status-hint">Qualquer etapa pode ser escolhida, inclusive voltar. Desmarcado e Cancelado liberam o horário.</small>
                            </label>
                            <div class="appointment-related-statuses">
                                <p>Cliente <strong>${getRelatedStatuses(appointment.status).client}</strong></p>
                                <p>Sala <strong>${getRelatedStatuses(appointment.status).room}</strong></p>
                                <p>Profissional <strong>${getRelatedStatuses(appointment.status).professional}</strong></p>
                            </div>
                            <p class="appointment-cancel-message" role="status" aria-live="polite"></p>
                        </section>
                    </div>

                    <aside class="appointment-room-card">
                        <img src="${asset('img-exe-ambiente-sala.svg')}" alt="Ambiente de atendimento">
                        <div class="appointment-room-content">
                            <h2>Sala do atendimento</h2>
                            <div class="appointment-room-title"><strong>${appointment.room}</strong><span class="appointment-room-status">${getRelatedStatuses(appointment.status).room}</span></div>
                            <dl>
                                <dt>Data</dt><dd>${appointment.fullDate}</dd>
                                <dt>Tempo de atendimento</dt><dd>${appointment.duration} minutos</dd>
                            </dl>
                            <p class="appointment-room-caption">Horário validado na agenda do profissional e da sala.</p>
                            <div class="appointment-room-timeline" aria-label="Horário do atendimento">
                                <div class="appointment-room-track"><span style="width: 100%">${appointment.initialHour}–${appointment.finalHour}</span></div>
                                <div class="appointment-room-track-labels"><span>${appointment.initialHour}</span><span>${appointment.finalHour}</span></div>
                            </div>
                        </div>
                    </aside>
                </div>

                <div class="appointment-details-privacy"><img src="${asset('icon-lock-keyhole.svg')}" alt=""><span>Apenas seus agendamentos são exibidos aqui.</span></div>
            </main>
        `;

        this.querySelector(".appointment-status-select").addEventListener("change", async event => {
            const nextStatus = event.target.value;
            if (!nextStatus) return;
            const message = this.querySelector(".appointment-cancel-message");
            if (!appointment.id || !await updateAppointmentStatus(appointment.id, nextStatus)) {
                message.textContent = "Não foi possível salvar a alteração deste agendamento.";
                event.target.value = "";
                return;
            }
            const updatedAppointment = { ...appointment, status: nextStatus };
            sessionStorage.setItem("ritua-appointment-detail", JSON.stringify(updatedAppointment));
            this.connectedCallback();
        });

    }

    getAppointment() {
        const stored = sessionStorage.getItem("ritua-appointment-detail");
        const saved = stored ? JSON.parse(stored) : {};
        // Sempre usa os dados atuais da base (status, sala, contato do cliente) quando o agendamento existe.
        const current = getAppointmentById(saved.id);
        const contact = current ? getClient(current.clientId) : null;
        const appointment = current ? { ...saved, ...current, date: current.data, phone: contact?.telefone || "", email: contact?.email || "" } : saved;
        const dateValue = appointment.date || "2026-11-08";
        const [year, month, day] = dateValue.split("-").map(Number);
        const date = new Date(year, month - 1, day);
        const format = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });

        return {
            id: appointment.id || "",
            date: dateValue,
            client: appointment.client || "Ana Souza",
            service: appointment.service || "Massagem relaxante",
            room: appointment.room || "Sala Bambu",
            initialHour: appointment.initialHour || "10:00",
            finalHour: appointment.finalHour || "11:00",
            status: appointment.status || "Confirmado",
            duration: appointment.duration || 60,
            professional: appointment.professional || "",
            phone: appointment.phone ?? "(11) 98765-4321",
            email: appointment.email ?? "ana.souza@exemplo.com",
            day: String(day).padStart(2, "0"),
            month: new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(date).replace(".", "").toUpperCase(),
            weekday: `${new Intl.DateTimeFormat("pt-BR", { weekday: "long" }).format(date)} · ${year}`,
            fullDate: format.format(date)
        };
    }
}

customElements.define("appointment-details", AppointmentDetails);
