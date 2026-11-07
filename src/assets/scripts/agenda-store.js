// Estado compartilhado da tela "Meus agendamentos".
// Os componentes leem este estado ao renderizar e escutam o evento "agenda-changed" no document.
// Quando o backend estiver pronto, basta trocar os arrays abaixo por dados vindos da API.

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

/* ---------- Dados (mock) ---------- */
// "dayOffset" é a distância em dias a partir da segunda-feira da semana atual,
// assim a tela sempre mostra dados na semana corrente.

const mondayOfCurrentWeek = startOfWeek(new Date());
const dateByOffset = offset => toDateKey(addDays(mondayOfCurrentWeek, offset));

export const rooms = ["Sala Bambu", "Sala Lótus", "Sala Orquídea", "Sala Ipê"];
export const statuses = ["Agendado", "Confirmado", "Concluído", "Cancelado"];

export const appointments = [
    { dayOffset: 0, initialHour: "10:00", finalHour: "11:00", client: "Ana Souza", service: "Massagem relaxante", duration: 60, room: "Sala Bambu", reservation: "09:45–11:15", status: "Confirmado" },
    { dayOffset: 0, initialHour: "13:00", finalHour: "14:00", client: "Beatriz Lima", service: "Reiki", duration: 60, room: "Sala Lótus", reservation: "12:45–14:15", status: "Agendado" },
    { dayOffset: 0, initialHour: "16:00", finalHour: "17:30", client: "Rafael Santos", service: "Massoterapia", duration: 90, room: "Sala Bambu", reservation: "15:45–17:45", status: "Confirmado" },

    { dayOffset: 1, initialHour: "09:00", finalHour: "10:00", client: "Maria Oliveira", service: "Drenagem linfática", duration: 60, room: "Sala Orquídea", reservation: "08:45–10:15", status: "Confirmado" },
    { dayOffset: 1, initialHour: "14:00", finalHour: "15:00", client: "Julia Santos", service: "Massagem terapêutica", duration: 60, room: "Sala Ipê", reservation: "13:45–15:15", status: "Agendado" },

    { dayOffset: 2, initialHour: "09:30", finalHour: "10:30", client: "Carlos Mendes", service: "Reiki", duration: 60, room: "Sala Ipê", reservation: "09:15–10:45", status: "Agendado" },
    { dayOffset: 2, initialHour: "11:00", finalHour: "12:00", client: "Ana Souza", service: "Massagem relaxante", duration: 60, room: "Sala Bambu", reservation: "10:45–12:15", status: "Confirmado" },
    { dayOffset: 2, initialHour: "15:00", finalHour: "16:00", client: "Paula Ribeiro", service: "Aromaterapia", duration: 60, room: "Sala Ipê", reservation: "14:45–16:15", status: "Confirmado" },

    { dayOffset: 3, initialHour: "10:00", finalHour: "11:00", client: "Beatriz Lima", service: "Reiki", duration: 60, room: "Sala Lótus", reservation: "09:45–11:15", status: "Confirmado" },
    { dayOffset: 3, initialHour: "17:00", finalHour: "18:00", client: "Rafael Santos", service: "Massoterapia", duration: 60, room: "Sala Bambu", reservation: "16:45–18:15", status: "Agendado" },

    { dayOffset: 4, initialHour: "10:00", finalHour: "11:00", client: "Maria Oliveira", service: "Drenagem linfática", duration: 60, room: "Sala Orquídea", reservation: "09:45–11:15", status: "Agendado" },
    { dayOffset: 4, initialHour: "13:00", finalHour: "14:00", client: "Julia Santos", service: "Massagem terapêutica", duration: 60, room: "Sala Ipê", reservation: "12:45–14:15", status: "Confirmado" }
].map(appointment => ({ ...appointment, data: dateByOffset(appointment.dayOffset) }));

// Reservas sem atendimento vinculado (não entram no total de atendimentos)
export const reservations = [
    { dayOffset: 2, initialHour: "09:00", finalHour: "10:00", room: "Sala Lótus", status: "Reservada", linkedAppointment: null }
].map(reservation => ({ ...reservation, data: dateByOffset(reservation.dayOffset) }));

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

export function getAvailableReservations() {
    const weekKeys = getWeekDays().map(toDateKey);

    return reservations
        .filter(reservation => {
            if (reservation.linkedAppointment) return false;
            if (!weekKeys.includes(reservation.data)) return false;
            return !agendaState.room || reservation.room === agendaState.room;
        })
        .sort((a, b) => a.data.localeCompare(b.data) || timeToMinutes(a.initialHour) - timeToMinutes(b.initialHour));
}

// "2026-11-04" -> Date local
export function parseDateKey(key) {
    const [year, month, day] = key.split("-").map(Number);
    return new Date(year, month - 1, day);
}
