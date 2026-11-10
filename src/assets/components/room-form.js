import { appointments } from "../scripts/agenda-store.js";
import { createRoomId, DEFAULT_HOURS, getRoom, getRooms, removeRoom, saveRoom, WEEKDAYS } from "../scripts/rooms-store.js";

const escapeRoomText = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const AMENITIES = ["Maca", "Ar-condicionado", "Som ambiente", "Pia", "Aromaterapia", "Acessível"];
const CAPACITIES = [1, 2, 3, 4, 5, 6];
const DURATIONS = [30, 45, 60, 75, 90, 120];
const TIME_OPTIONS = Array.from({ length: 29 }, (_, index) => `${String(6 + Math.floor(index / 2)).padStart(2, "0")}:${index % 2 ? "30" : "00"}`);

class RoomForm extends HTMLElement {
    connectedCallback() {
        this.roomId = new URLSearchParams(location.search).get("id");
        this.editing = Boolean(this.roomId);
        this.room = this.editing ? getRoom(this.roomId) : null;
        if (this.editing && !this.room) {
            this.innerHTML = `<main class="room-form-page"><a href="./salas.html">‹ Minhas salas</a><h1>Sala não encontrada</h1><p>Esta sala pode ter sido removida.</p></main>`;
            return;
        }
        const current = this.room || { name: "", capacity: "", duration: 60, description: "", amenities: [], hours: DEFAULT_HOURS, interval: 15, active: true, image: "" };
        const appointmentsForRoom = this.editing ? appointments.filter(item => item.room === current.name).slice(0, 4) : [];
        this.innerHTML = `
            <main class="room-form-page">
                <a class="room-form-back" href="./salas.html">‹ Minhas salas</a>
                <header class="room-form-heading"><div><h1>${this.editing ? "Editar sala" : "Nova sala"}</h1><p>${this.editing ? "Atualize as informações e os horários da sala." : "Um novo espaço para acolher seus atendimentos."}</p></div>${this.editing ? `<small>Última atualização local</small>` : ""}</header>
                <div class="room-form-layout">
                    <form class="room-form">
                        <section class="room-form-panel room-data-panel">
                            <header class="room-panel-heading"><span class="room-heading-icon">♧</span><div><h2>Dados da sala</h2><p>Como a sala aparece para você ao agendar.</p></div>${this.editing ? `<label class="room-active-toggle"><input type="checkbox" name="active" ${current.active !== false ? "checked" : ""}><span>Sala ativa<small>Aparece em novos agendamentos</small></span></label>` : ""}</header>
                            <p class="room-required-note">* Campo obrigatório. Demais campos opcionais.</p>
                            <label class="room-field"><span>Nome da sala *</span><input name="name" value="${escapeRoomText(current.name)}" placeholder="Ex.: Sala Jasmim" required maxlength="60"></label>
                            <div class="room-form-fields"><label class="room-field"><span>Capacidade *</span><select name="capacity" required><option value="">Selecione o nº de pessoas</option>${CAPACITIES.map(value => `<option value="${value}" ${Number(current.capacity) === value ? "selected" : ""}>${value} ${value === 1 ? "pessoa" : "pessoas"}</option>`).join("")}</select></label><label class="room-field"><span>Duração padrão do agendamento</span><select name="duration">${DURATIONS.map(value => `<option value="${value}" ${Number(current.duration) === value ? "selected" : ""}>${value} minutos</option>`).join("")}</select></label></div>
                            <label class="room-field"><span>Descrição</span><textarea name="description" rows="3" maxlength="300" placeholder="Conte como é o espaço: ambiente, iluminação, para quais terapias ele funciona melhor.">${escapeRoomText(current.description)}</textarea></label>
                            <fieldset class="room-amenities"><legend>Comodidades</legend><small>Selecione o que a sala oferece. Ajuda a escolher o espaço certo para cada serviço.</small><div>${AMENITIES.map(item => `<label><input type="checkbox" name="amenities" value="${item}" ${(current.amenities || []).includes(item) ? "checked" : ""}><span>${item}</span></label>`).join("")}</div></fieldset>
                        </section>
                        <section class="room-form-panel room-hours-panel">
                            <header class="room-hours-heading"><div><h2>Horários de funcionamento</h2><p>Só é possível agendar a sala dentro destes horários.</p></div><button type="button" class="copy-monday">▢ Copiar segunda para todos</button></header>
                            <div class="room-week-hours">${WEEKDAYS.map((day, index) => {
                                const hours = current.hours?.[index] || DEFAULT_HOURS[index];
                                return `<div class="room-week-row" data-day-index="${index}"><label><input type="checkbox" name="day-enabled-${index}" ${hours.enabled ? "checked" : ""}><span>${day}</span></label><select name="day-start-${index}" aria-label="Abertura ${day}" ${hours.enabled ? "" : "disabled"}>${TIME_OPTIONS.map(time => `<option ${hours.start === time ? "selected" : ""}>${time}</option>`).join("")}</select><select name="day-end-${index}" aria-label="Fechamento ${day}" ${hours.enabled ? "" : "disabled"}>${TIME_OPTIONS.map(time => `<option ${hours.end === time ? "selected" : ""}>${time}</option>`).join("")}</select><small class="room-day-closed" ${hours.enabled ? "hidden" : ""}>Fechada — ative para liberar agendamentos neste dia</small></div>`;
                            }).join("")}</div>
                            <label class="room-field room-interval-field"><span>Intervalo entre agendamentos</span><select name="interval">${[0, 10, 15, 20, 30].map(value => `<option value="${value}" ${Number(current.interval) === value ? "selected" : ""}>${value === 0 ? "Sem intervalo" : `${value} minutos`}</option>`).join("")}</select><small>Tempo para arrumar a sala entre um atendimento e outro.</small></label>
                        </section>
                        <p class="room-form-message" role="status" aria-live="polite"></p>
                        <footer class="room-form-actions"><p>Revise os dados antes de salvar.</p><a href="./salas.html">Cancelar</a><button type="submit">${this.editing ? "Salvar alterações" : "Salvar sala"}</button></footer>
                    </form>
                    <aside class="room-form-aside">
                        <label class="room-photo-preview"><img class="room-photo" src="${escapeRoomText(current.image || "/src/assets/images/img-exe-ambiente-sala.svg")}" alt="Prévia da sala"><span class="room-photo-overlay">▧<small>Alterar foto da sala</small></span><input type="file" accept="image/*" hidden></label>
                        <section class="room-preview-card"><p class="room-form-eyebrow">PRÉ-VISUALIZAÇÃO</p><h2 class="preview-room-name">${escapeRoomText(current.name || "Nome da sala")}</h2><dl><dt>Capacidade</dt><dd class="preview-capacity">${current.capacity ? `${current.capacity} ${Number(current.capacity) === 1 ? "pessoa" : "pessoas"}` : "—"}</dd><dt>Funcionamento</dt><dd class="preview-hours"></dd><dt>Agendamento padrão</dt><dd>${Number(current.duration) || 60} min + ${Number(current.interval) || 0} min de intervalo</dd></dl></section>
                        ${this.editing ? `<section class="room-preview-card room-upcoming-card"><h2>Próximos agendamentos <span>${appointmentsForRoom.length}</span></h2>${appointmentsForRoom.map(item => `<p><b>${escapeRoomText(item.data)}</b> · ${escapeRoomText(item.initialHour)}–${escapeRoomText(item.finalHour)}<small>${escapeRoomText(item.client)} · ${escapeRoomText(item.status)}</small></p>`).join("") || `<small>Sem atendimentos cadastrados para esta sala.</small>`}<a href="./agendamentos.html">Ver agenda da sala ›</a></section><section class="room-danger-card"><h2>Pausar ou excluir sala</h2><p>Salas pausadas não aparecem em novos agendamentos. Agendamentos existentes são mantidos.</p><button type="button" class="pause-room">${current.active === false ? "Ativar sala" : "Pausar sala"}</button><button type="button" class="delete-room">Excluir</button></section>` : `<section class="room-preview-card room-checklist"><h2>Antes de salvar</h2><p class="check-name">○ Nome da sala definido</p><p class="check-hours">○ Ao menos um dia com horário</p><p class="check-capacity">○ Capacidade informada</p><small>Depois de salva, a sala já aparece em novos agendamentos.</small></section>`}
                    </aside>
                </div>
            </main>`;
        this.form = this.querySelector(".room-form");
        this.fileInput = this.querySelector(".room-photo-preview input");
        this.roomImage = current.image || "/src/assets/images/img-exe-ambiente-sala.svg";
        this.form.addEventListener("input", () => this.updatePreview());
        this.form.addEventListener("change", event => {
            if (event.target.name?.startsWith("day-enabled-")) this.toggleDay(event.target);
            this.updatePreview();
        });
        this.querySelector(".copy-monday").addEventListener("click", () => this.copyMonday());
        this.fileInput.addEventListener("change", () => this.readRoomPhoto());
        this.form.addEventListener("submit", event => this.submitForm(event));
        if (this.editing) {
            this.querySelector(".pause-room").addEventListener("click", () => this.toggleRoomActive());
            this.querySelector(".delete-room").addEventListener("click", () => this.deleteRoom());
        }
        this.updatePreview();
    }

    toggleDay(checkbox) {
        const row = checkbox.closest(".room-week-row");
        row.querySelectorAll("select").forEach(select => select.disabled = !checkbox.checked);
        row.querySelector(".room-day-closed").hidden = checkbox.checked;
    }

    copyMonday() {
        const monday = this.querySelector('[data-day-index="0"]');
        const enabled = monday.querySelector('input[type="checkbox"]').checked;
        const start = monday.querySelector('[name="day-start-0"]').value;
        const end = monday.querySelector('[name="day-end-0"]').value;
        this.querySelectorAll(".room-week-row").forEach((row, index) => {
            if (!index) return;
            const checkbox = row.querySelector('input[type="checkbox"]');
            checkbox.checked = enabled;
            row.querySelector('[name^="day-start-"]').value = start;
            row.querySelector('[name^="day-end-"]').value = end;
            this.toggleDay(checkbox);
        });
        this.updatePreview();
    }

    async readRoomPhoto() {
        const file = this.fileInput.files[0];
        if (!file) return;
        const dataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
        const image = new Image();
        image.src = dataUrl;
        await image.decode();
        const scale = Math.min(1, 1000 / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(image.naturalWidth * scale);
        canvas.height = Math.round(image.naturalHeight * scale);
        canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
        this.roomImage = canvas.toDataURL("image/jpeg", 0.78);
        this.querySelector(".room-photo").src = this.roomImage;
    }

    readSchedule() {
        return WEEKDAYS.map((day, index) => ({
            day,
            enabled: this.form.elements[`day-enabled-${index}`].checked,
            start: this.form.elements[`day-start-${index}`].value,
            end: this.form.elements[`day-end-${index}`].value
        }));
    }

    updatePreview() {
        if (!this.form) return;
        const name = this.form.elements.name.value.trim();
        const capacity = this.form.elements.capacity.value;
        const duration = Number(this.form.elements.duration.value) || 60;
        const interval = Number(this.form.elements.interval.value) || 0;
        const days = this.readSchedule().filter(item => item.enabled);
        this.querySelector(".preview-room-name").textContent = name || "Nome da sala";
        this.querySelector(".preview-capacity").textContent = capacity ? `${capacity} ${Number(capacity) === 1 ? "pessoa" : "pessoas"}` : "—";
        this.querySelector(".preview-hours").textContent = days.length
            ? `${days.length === 5 ? "Seg–Sex" : days.map(item => item.day.slice(0, 3)).join(", ")} · ${days[0].start}–${days[0].end}`
            : "Sem horários definidos";
        this.querySelector(".room-preview-card dl dd:last-child").textContent = `${duration} min + ${interval} min de intervalo`;
        const checklist = this.querySelector(".room-checklist");
        if (checklist) {
            checklist.querySelector(".check-name").textContent = `${name ? "✓" : "○"} Nome da sala definido`;
            checklist.querySelector(".check-hours").textContent = `${days.length ? "✓" : "○"} Ao menos um dia com horário`;
            checklist.querySelector(".check-capacity").textContent = `${capacity ? "✓" : "○"} Capacidade informada`;
        }
    }

    makeRoom() {
        const data = new FormData(this.form);
        return {
            id: this.room?.id || createRoomId(),
            name: String(data.get("name") || "").trim(),
            capacity: Number(data.get("capacity")),
            duration: Number(data.get("duration")),
            description: String(data.get("description") || "").trim(),
            amenities: data.getAll("amenities"),
            hours: this.readSchedule(),
            interval: Number(data.get("interval")),
            active: this.editing ? this.form.elements.active.checked : true,
            image: this.roomImage
        };
    }

    submitForm(event) {
        event.preventDefault();
        if (!this.form.reportValidity()) return;
        const room = this.makeRoom();
        const duplicate = getRooms().some(item => item.id !== room.id && item.name.toLocaleLowerCase("pt-BR") === room.name.toLocaleLowerCase("pt-BR"));
        if (duplicate) {
            this.showMessage("Já existe uma sala com esse nome.");
            return;
        }
        if (!room.hours.some(item => item.enabled && item.start < item.end)) {
            this.showMessage("Defina pelo menos um dia com um horário válido.");
            return;
        }
        saveRoom(room);
        location.href = "./salas.html";
    }

    toggleRoomActive() {
        const active = this.form.elements.active;
        active.checked = !active.checked;
        this.room = { ...this.room, active: active.checked };
        saveRoom(this.room);
        this.querySelector(".pause-room").textContent = active.checked ? "Pausar sala" : "Ativar sala";
        this.showMessage(active.checked ? "Sala ativada." : "Sala pausada. Ela não aparece em novos agendamentos.");
    }

    deleteRoom() {
        if (!window.confirm("Excluir esta sala? Os agendamentos existentes serão mantidos.")) return;
        removeRoom(this.room.id);
        location.href = "./salas.html";
    }

    showMessage(message) {
        const element = this.querySelector(".room-form-message");
        element.textContent = message;
        element.classList.add("visible");
    }
}

customElements.define("room-form", RoomForm);
