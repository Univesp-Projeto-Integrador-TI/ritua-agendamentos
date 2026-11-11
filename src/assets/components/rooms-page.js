import { appointments } from "../scripts/agenda-store.js";
import { getRooms, removeRoom } from "../scripts/rooms-store.js";

const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const todayKey = () => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

class RoomsPage extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <main class="rooms-page">
                <header class="rooms-heading">
                    <div><p class="rooms-eyebrow">ORGANIZAÇÃO DO ESPAÇO</p><h1>Minhas salas</h1><p>Cadastre seus espaços, defina horários de funcionamento e acompanhe a disponibilidade de cada sala.</p></div>
                    <div class="rooms-heading-actions"><a class="rooms-secondary-button" href="./novo-agendamento.html">◷ Agendar sala</a><a class="rooms-primary-button" href="./nova-sala.html">＋ Nova sala</a></div>
                </header>
                <section class="rooms-stats" aria-label="Resumo das salas"></section>
                <div class="rooms-layout">
                    <section class="rooms-main-column">
                        <div class="rooms-toolbar"><div><h2 class="rooms-count"></h2><p>Disponibilidade de hoje</p></div><div class="rooms-tools"><input class="rooms-search" type="search" placeholder="Nome da sala ou tipo de atendimento" aria-label="Buscar sala"><select class="rooms-filter" aria-label="Filtrar salas"><option value="all">Todos os status</option><option value="active">Ativas</option><option value="paused">Pausadas</option></select></div></div>
                        <div class="rooms-grid"></div>
                    </section>
                    <aside class="rooms-aside">
                        <section class="rooms-aside-card today-rooms-appointments"><p class="rooms-aside-eyebrow">AGENDAMENTOS DE HOJE</p><h2></h2><div class="today-rooms-list"></div><a href="./agendamentos.html">Ver todos os agendamentos ↗</a></section>
                        <section class="rooms-aside-card link-room-appointment"><p class="rooms-aside-eyebrow">AGENDA DA SALA</p><h2>Vincule um atendimento</h2><p>Os horários da sala são cruzados com a agenda do profissional e a disponibilidade do cliente.</p><a class="rooms-primary-button" href="./novo-agendamento.html">＋ Novo agendamento</a></section>
                        <section class="rooms-aside-card occupancy-card"><p class="rooms-aside-eyebrow">OCUPAÇÃO POR SALA</p><div class="room-occupancy-list"></div><small>A ocupação considera os atendimentos registrados nos últimos 7 dias.</small></section>
                    </aside>
                </div>
            </main>`;
        this.querySelector(".rooms-search").addEventListener("input", () => this.render());
        this.querySelector(".rooms-filter").addEventListener("change", () => this.render());
        this.addEventListener("click", event => {
            const deleteButton = event.target.closest("[data-delete-room]");
            if (deleteButton && window.confirm("Excluir esta sala? Os agendamentos existentes serão mantidos.")) {
                removeRoom(deleteButton.dataset.deleteRoom);
                this.render();
            }
        });
        window.addEventListener("rooms-changed", () => this.render());
        this.render();
    }

    render() {
        const rooms = getRooms();
        const today = todayKey();
        const todayAppointments = appointments.filter(item => item.data === today && !["Cancelado", "Desmarcado"].includes(item.status));
        const weekStart = new Date();
        weekStart.setHours(0, 0, 0, 0);
        weekStart.setDate(weekStart.getDate() - 6);
        const weekAppointments = appointments.filter(item => {
            const date = new Date(`${item.data}T00:00:00`);
            return date >= weekStart && date <= new Date() && !["Cancelado", "Desmarcado"].includes(item.status);
        });
        const active = rooms.filter(room => room.active !== false).length;
        const occupancy = active ? Math.min(100, Math.round(weekAppointments.length / (active * 4) * 100)) : 0;
        this.querySelector(".rooms-stats").innerHTML = `
            <div class="card-person-summary"><div class="card-person-summary-header"><h2>${rooms.length}</h2><svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.58 19.25V4.58C4.58 3.57 5.4 2.75 6.42 2.75H15.58C16.6 2.75 17.42 3.57 17.42 4.58V19.25M2.75 19.25H19.25M13.75 11H13.76" stroke="#9B684B" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></div><div class="card-person-summary-body"><p>Salas</p><span>${active} ativas</span></div></div>
            <div class="card-person-summary"><div class="card-person-summary-header"><h2>${todayAppointments.length}</h2><svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.33 1.83V5.5M14.67 1.83V5.5M2.75 9.17H19.25M8.25 14.67L10.08 16.5L13.75 12.83M4.58 3.67H17.42C18.43 3.67 19.25 4.49 19.25 5.5V18.33C19.25 19.35 18.43 20.17 17.42 20.17H4.58C3.57 20.17 2.75 19.35 2.75 18.33V5.5C2.75 4.49 3.57 3.67 4.58 3.67Z" stroke="#9B684B" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></div><div class="card-person-summary-body"><p>Agendamentos</p><span>Hoje</span></div></div>
            <div class="card-person-summary"><div class="card-person-summary-header"><h2>${Math.max(0, active * 10 - todayAppointments.length)}</h2><svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11 6.42V11L13.75 12.83M20.17 11A9.17 9.17 0 1 1 1.83 11A9.17 9.17 0 0 1 20.17 11Z" stroke="#9B684B" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></div><div class="card-person-summary-body"><p>Horários livres</p><span>Hoje, nas salas ativas</span></div></div>
            <div class="card-person-summary"><div class="card-person-summary-header"><h2>${occupancy}%</h2><svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.67 18.33V11M11 18.33V3.67M18.33 18.33V8.25" stroke="#9B684B" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></div><div class="card-person-summary-body"><p>Ocupação</p><span>Nos últimos 7 dias</span></div></div>
        `;
        const filter = this.querySelector(".rooms-filter").value;
        const term = this.querySelector(".rooms-search").value.trim().toLocaleLowerCase("pt-BR");
        const visibleRooms = rooms.filter(room => {
            const matchesStatus = filter === "all" || (filter === "active") === (room.active !== false);
            return matchesStatus && `${room.name} ${room.description} ${(room.amenities || []).join(" ")}`.toLocaleLowerCase("pt-BR").includes(term);
        });
        this.querySelector(".rooms-count").textContent = `${rooms.length} ${rooms.length === 1 ? "sala" : "salas"}`;
        this.querySelector(".rooms-grid").innerHTML = `${visibleRooms.map(room => this.renderRoom(room, todayAppointments)).join("")}${visibleRooms.length ? "" : `<p class="rooms-empty">Nenhuma sala encontrada.</p>`}<a class="room-add-card" href="./nova-sala.html"><span>＋</span><strong>Cadastrar nova sala</strong><small>Adicione nome e horários de funcionamento para liberar agendamentos.</small><b>Começar cadastro →</b></a>`;
        this.querySelector(".today-rooms-appointments h2").textContent = `${todayAppointments.length} ${todayAppointments.length === 1 ? "agendamento" : "agendamentos"}`;
        this.querySelector(".today-rooms-list").innerHTML = todayAppointments.slice(0, 4).map(item => `
            <a class="today-room-item" href="/src/assets/pages/detalhes-agendamento.html" data-appointment='${escapeHtml(JSON.stringify(item))}'><strong>${escapeHtml(item.initialHour)}</strong><span><b>${escapeHtml(item.room)}</b><small>${escapeHtml(item.client)} · ${escapeHtml(item.service)}</small></span><i>↗</i></a>`).join("") || `<p class="rooms-no-today">Nenhum atendimento previsto para hoje.</p>`;
        this.querySelectorAll("[data-appointment]").forEach(link => link.addEventListener("click", () => {
            const item = JSON.parse(link.dataset.appointment);
            sessionStorage.setItem("ritua-appointment-detail", JSON.stringify({ ...item, date: item.data }));
        }));
        const roomCounts = rooms.map(room => ({ room, count: weekAppointments.filter(item => item.room === room.name).length }));
        const maxCount = Math.max(1, ...roomCounts.map(item => item.count));
        this.querySelector(".room-occupancy-list").innerHTML = roomCounts.map(({ room, count }) => `
            <div class="room-occupancy-row"><div><span>${escapeHtml(room.name.replace("Sala ", ""))}</span><b>${Math.round(count / maxCount * 100)}%</b></div><span class="occupancy-track"><i style="width:${Math.round(count / maxCount * 100)}%"></i></span></div>`).join("");
    }

    renderRoom(room, todayAppointments) {
        const count = todayAppointments.filter(item => item.room === room.name).length;
        const todayHours = room.hours?.[(new Date().getDay() + 6) % 7];
        const opening = todayHours?.enabled ? `${todayHours.start} às ${todayHours.end}` : "Fechada hoje";
        const paused = room.active === false;
        const status = paused ? "Pausada" : count ? "Em uso hoje" : "Disponível";
        const capacity = Number(room.capacity) || 1;

        return `
            <article class="room-card ${paused ? "room-card-paused" : ""}">
                <img src="${escapeHtml(room.image || "/src/assets/images/img-exe-ambiente-sala.svg")}" alt="Ambiente da ${escapeHtml(room.name)}">
                <div class="room-card-content">
                    <div class="room-card-title">
                        <h3>${escapeHtml(room.name)}</h3>
                        <span class="room-card-status ${paused || count ? "reserved" : ""}">${status}</span>
                    </div>
                    <p class="room-card-info">${capacity} ${capacity === 1 ? "pessoa" : "pessoas"} · ${opening}</p>
                    <p class="room-card-detail">${escapeHtml(room.description || "Sala para atendimentos e terapias")}</p>
                    <div class="room-card-amenities">${(room.amenities || []).slice(0, 4).map(value => `<span>${escapeHtml(value)}</span>`).join("")}</div>
                    <div class="room-card-footer">
                        <a href="./editar-sala.html?id=${encodeURIComponent(room.id)}">${count ? `${count} atendimento${count > 1 ? "s" : ""} hoje · ` : ""}Editar sala →</a>
                        <button type="button" data-delete-room="${escapeHtml(room.id)}" aria-label="Excluir ${escapeHtml(room.name)}">Excluir</button>
                    </div>
                </div>
            </article>`;
    }
}

customElements.define("rooms-page", RoomsPage);
