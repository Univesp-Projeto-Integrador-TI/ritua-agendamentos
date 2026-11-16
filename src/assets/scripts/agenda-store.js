import { getRooms } from "./rooms-store.js";
import { select, insert, update, toTimestamp, DbError } from "./db.js";
import { getSessionUser } from "./session.js";

// Estado compartilhado da tela "Meus agendamentos".
// Os componentes leem este estado ao renderizar e escutam o evento "agenda-changed" no document.
// Os dados vêm da base fake (tabelas appointments, clients, rooms e employees) em db.js.

const MONTHS_SHORT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const MONTHS_LONG = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const WEEKDAYS_LONG = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
const WEEKDAYS_SHORT = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];

/* ---------- Helpers de data ---------- */

export function addDays(date, days) {
    const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    result.setDate(result.getDate() + days);
    return result;
}

// Semana começa na segunda-feira
export function startOfWeek(date) {
    const weekday = (date.getDay() + 6) % 7;
    return addDays(date, -weekday);
}

export function toDateKey(date) {
    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0")
    ].join("-");
}

export function isSameDay(dateA, dateB) {
    return toDateKey(dateA) === toDateKey(dateB);
}

export function pad(number) {
    return String(number).padStart(2, "0");
}

export const weekdayShort = date => WEEKDAYS_SHORT[date.getDay()];
export const weekdayLong = date => WEEKDAYS_LONG[date.getDay()];
export const monthShort = date => MONTHS_SHORT[date.getMonth()];
export const monthLong = date => MONTHS_LONG[date.getMonth()];

export function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

export function timeToMinutes(time) {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
}

// 210 -> "3h30" | 120 -> "2h" | 45 -> "45 min"
export function formatDuration(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours === 0) return `${minutes} min`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h${pad(minutes)}`;
}

/* ---------- Dados (base fake) ---------- */

export const rooms = [];
export const statuses = ["Agendado", "Confirmado", "Em andamento", "Concluído", "Desmarcado", "Cancelado"];

// Qualquer status pode ser escolhido a qualquer momento (inclusive voltar etapas).
export const statusTransitions = Object.fromEntries(
    statuses.map(status => [status, statuses.filter(item => item !== status)])
);

export function getRelatedStatuses(status) {
    if (["Agendado", "Confirmado"].includes(status)) return { client: "Confirmado", room: "Reservada", professional: "Ocupado" };
    if (status === "Em andamento") return { client: "Em atendimento", room: "Ocupada", professional: "Ocupado" };
    if (["Desmarcado", "Cancelado"].includes(status)) return { client: "Desmarcado", room: "Desocupada", professional: "Disponível" };
    return { client: "Atendido", room: "Desocupada", professional: "Disponível" };
}

export function isBlockingStatus(status) {
    // Concluído continua bloqueando o horário, como na constraint do banco (só Desmarcado e Cancelado liberam).
    return !["Desmarcado", "Cancelado"].includes(status);
}


// Todos os agendamentos da base (usado para checar conflitos de sala e de cliente).
export const allAppointments = [];
// Agendamentos do profissional logado (o que as telas exibem).
export const appointments = [];

const minutesOf = time => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));

function toView(row, clients, employees, roomRows) {
    const start = row.date_hour_start;
    const finish = row.date_hour_finish;
    const initialHour = start.slice(11, 16);
    const finalHour = finish.slice(11, 16);
    const date = start.slice(0, 10);
    return {
        id: row.id_schedule,
        client: clients.get(row.id_customer)?.name || "Cliente removido",
        clientId: row.id_customer,
        service: row.service,
        room: roomRows.get(row.id_room)?.name || "Sala removida",
        roomId: row.id_room,
        professional: employees.get(row.id_employee)?.name || "—",
        employeeId: row.id_employee,
        data: date,
        date,
        initialHour,
        finalHour,
        duration: minutesOf(finalHour) - minutesOf(initialHour),
        status: row.appointment_status,
        notes: row.notes || ""
    };
}

export function refreshAppointments() {
    const clients = new Map(select("clients").map(row => [row.client_id, row]));
    const employees = new Map(select("employees").map(row => [row.id_employee, row]));
    const roomRows = new Map(select("rooms").map(row => [row.id_room, row]));
    const currentId = getSessionUser().id;
    const views = select("appointments").map(row => toView(row, clients, employees, roomRows));

    allAppointments.length = 0;
    allAppointments.push(...views);
    appointments.length = 0;
    appointments.push(...views.filter(item => item.employeeId === currentId));
    rooms.length = 0;
    rooms.push(...getRooms().map(room => room.name));
}

refreshAppointments();
window.addEventListener("db-changed", refreshAppointments);

export function getAppointmentById(id) {
    return allAppointments.find(item => String(item.id) === String(id)) || null;
}

export async function updateAppointmentStatus(id, status) {
    if (!id || !statuses.includes(status)) return false;
    // Qualquer status é aceito, desde que seja diferente do atual.
    const current = getAppointmentById(id);
    if (!current || current.status === status) return false;
    try {
        await update("appointments", id, { appointment_status: status });
    } catch (error) {
        if (error instanceof DbError) return false;
        throw error;
    }
    document.dispatchEvent(new CustomEvent("agenda-changed"));
    return true;
}

// Cria o agendamento para o profissional logado. Devolve { appointment } ou { error } com a mensagem do banco.
export async function createAppointment({ clientId, roomId, service, date, start, end, notes = null }) {
    const professional = getSessionUser();
    const startAt = toTimestamp(date, start);
    if (new Date(startAt) < new Date()) {
        return { error: "Não é possível criar um agendamento com início no passado." };
    }
    try {
        const row = await insert("appointments", {
            service,
            description: null,
            date_hour_start: startAt,
            date_hour_finish: toTimestamp(date, end),
            appointment_status: "Agendado",
            notes,
            id_customer: Number(clientId),
            id_employee: professional.id,
            id_room: Number(roomId)
        });
        document.dispatchEvent(new CustomEvent("agenda-changed"));
        return { appointment: getAppointmentById(row.id_schedule) };
    } catch (error) {
        if (error instanceof DbError) return { error: error.message };
        throw error;
    }
}

/* ---------- Estado e filtros ---------- */

const today = new Date();

export const agendaState = {
    weekStart: startOfWeek(today),
    selectedDate: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
    search: "",
    room: "",
    status: ""
};

export function updateAgenda(changes) {
    Object.assign(agendaState, changes);
    document.dispatchEvent(new CustomEvent("agenda-changed"));
}

const normalize = text => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

// Atendimentos filtrados (busca, sala e status). Se "date" for informada, filtra também pelo dia.
export function getFilteredAppointments(date = null) {
    const term = normalize(agendaState.search.trim());

    return appointments
        .filter(appointment => {
            if (date && appointment.data !== toDateKey(date)) return false;
            if (agendaState.room && appointment.room !== agendaState.room) return false;
            if (agendaState.status && appointment.status !== agendaState.status) return false;

            return !term ||
                normalize(appointment.client).includes(term) ||
                normalize(appointment.service).includes(term);
        })
        .sort((a, b) => timeToMinutes(a.initialHour) - timeToMinutes(b.initialHour));
}

export function getWeekDays() {
    return Array.from({ length: 7 }, (_, index) => addDays(agendaState.weekStart, index));
}

// "2026-11-04" -> Date local
export function parseDateKey(key) {
    const [year, month, day] = key.split("-").map(Number);
    return new Date(year, month - 1, day);
}
