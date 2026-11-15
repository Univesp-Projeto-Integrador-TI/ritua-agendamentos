// Banco de dados FAKE para testes de usabilidade.

const STORAGE_KEY = "ritua-fake-db";
const VERSION = 1;

export const STATUS = {
    employee: ["Ativo", "Inativo"],
    client: ["Ativo", "Inativo"],
    room: ["Ativa", "Pausada"],
    appointment: ["Agendado", "Confirmado", "Em andamento", "Concluído", "Desmarcado", "Cancelado"]
};

// Status que liberam o horário (Concluído continua bloqueando, como na constraint EXCLUDE do banco).
const NON_BLOCKING = ["Cancelado", "Desmarcado"];

const SCHEMA = {
    employees: { pk: "id_employee", required: ["email", "phone", "name", "specialty1", "employee_status"], unique: [["cpf"], ["email"]], check: { employee_status: STATUS.employee }, label: "profissional" },
    clients: { pk: "client_id", required: ["name", "number", "birth_date", "gender", "client_status"], unique: [], check: { client_status: STATUS.client }, label: "cliente" },
    rooms: { pk: "id_room", required: ["name", "capacity", "default_duration_minutes", "interval_minutes", "room_status"], unique: [["name"]], check: { room_status: STATUS.room }, label: "sala" },
    room_operating_hours: { pk: "id_room_hour", required: ["id_room", "day_of_week", "opening_time", "closing_time"], unique: [["id_room", "day_of_week"]], check: {}, label: "horário" },
    appointments: { pk: "id_schedule", required: ["service", "date_hour_start", "date_hour_finish", "appointment_status", "id_customer", "id_employee", "id_room"], unique: [], check: { appointment_status: STATUS.appointment }, label: "agendamento" },
    login: { pk: "id_login", required: ["nickname", "password", "id_employee"], unique: [["nickname"], ["id_employee"]], check: {}, label: "login" }
};

const FOREIGN_KEYS = {
    room_operating_hours: [["id_room", "rooms"]],
    appointments: [["id_customer", "clients"], ["id_employee", "employees"], ["id_room", "rooms"]],
    login: [["id_employee", "employees"]]
};

// Quem impede (RESTRICT) ou acompanha (CASCADE) a exclusão de um registro.
const RESTRICT = { clients: [["appointments", "id_customer"]], employees: [["appointments", "id_employee"]], rooms: [["appointments", "id_room"]] };
const CASCADE = { rooms: [["room_operating_hours", "id_room"]], employees: [["login", "id_employee"]] };

export class DbError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
    }
}

/* ---------- Datas ---------- */

const pad = value => String(value).padStart(2, "0");
const dateKey = date => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const timestamp = (date, time) => `${date}T${time.length === 5 ? `${time}:00` : time}`;

function mondayKey(date) {
    const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate() - ((date.getDay() + 6) % 7));
    return dateKey(monday);
}

function daysBetween(fromKey, toKey) {
    const parse = key => { const [y, m, d] = key.split("-").map(Number); return Date.UTC(y, m - 1, d); };
    return Math.round((parse(toKey) - parse(fromKey)) / 86400000);
}

function shiftTimestamp(value, days) {
    const [date, time] = value.split("T");
    const [y, m, d] = date.split("-").map(Number);
    return `${dateKey(new Date(y, m - 1, d + days))}T${time}`;
}

/* ---------- Estado ---------- */

async function loadSeed() {
    const response = await fetch(new URL("../data/database.json", import.meta.url));
    if (!response.ok) throw new Error("Não foi possível carregar a base de testes (database.json).");
    const seed = await response.json();

    // Move a semana de referência dos agendamentos para a semana atual.
    const shift = daysBetween(seed._meta.reference_monday, mondayKey(new Date()));
    const tables = {};
    const sequences = {};
    Object.keys(SCHEMA).forEach(name => {
        tables[name] = (seed[name] || []).map(row => ({ ...row }));
        sequences[name] = tables[name].reduce((max, row) => Math.max(max, row[SCHEMA[name].pk]), 0);
    });
    tables.appointments.forEach(row => {
        row.date_hour_start = shiftTimestamp(row.date_hour_start, shift);
        row.date_hour_finish = shiftTimestamp(row.date_hour_finish, shift);
    });
    return { version: VERSION, tables, sequences };
}

if (new URLSearchParams(location.search).has("resetdb")) {
    localStorage.removeItem(STORAGE_KEY);
    const url = new URL(location.href);
    url.searchParams.delete("resetdb");
    history.replaceState(null, "", url);
}

let state = null;
try { state = JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch { state = null; }
if (!state || state.version !== VERSION) {
    state = await loadSeed();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent("db-changed"));
};

export function resetDatabase() {
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
}

/* ---------- Validações (equivalentes às constraints do SQL) ---------- */

const same = (a, b) => (typeof a === "string" && typeof b === "string" ? a.toLowerCase() === b.toLowerCase() : a === b);

function validate(table, row, ignoreId = null) {
    const schema = SCHEMA[table];
    schema.required.forEach(column => {
        if (row[column] === undefined || row[column] === null || row[column] === "") throw new DbError("notnull", `O campo "${column}" é obrigatório.`);
    });
    Object.entries(schema.check).forEach(([column, values]) => {
        if (!values.includes(row[column])) throw new DbError("check", `Valor inválido em "${column}": ${row[column]}.`);
    });
    schema.unique.forEach(columns => {
        if (columns.some(column => row[column] === null || row[column] === undefined)) return;
        const duplicated = state.tables[table].some(other => other[schema.pk] !== ignoreId && columns.every(column => same(other[column], row[column])));
        if (duplicated) throw new DbError("unique", `Já existe ${schema.label} com ${columns.join(" + ")} igual.`);
    });
    (FOREIGN_KEYS[table] || []).forEach(([column, target]) => {
        if (!state.tables[target].some(other => other[SCHEMA[target].pk] === row[column])) throw new DbError("fk", `Registro de ${target} não encontrado.`);
    });
    if (table === "room_operating_hours" && row.closing_time <= row.opening_time) throw new DbError("check", "O fechamento deve ser depois da abertura.");
    if (table === "appointments") validateAppointment(row, ignoreId);
}

function validateAppointment(row, ignoreId) {
    if (row.date_hour_finish <= row.date_hour_start) throw new DbError("check", "O horário final deve ser posterior ao inicial.");
    if (NON_BLOCKING.includes(row.appointment_status)) return;
    const labels = { id_customer: "O cliente já tem um agendamento nesse horário.", id_employee: "O profissional já tem um agendamento nesse horário.", id_room: "A sala já está ocupada nesse horário." };
    Object.entries(labels).forEach(([column, message]) => {
        const conflict = state.tables.appointments.some(other =>
            other.id_schedule !== ignoreId && other[column] === row[column] && !NON_BLOCKING.includes(other.appointment_status) &&
            row.date_hour_start < other.date_hour_finish && other.date_hour_start < row.date_hour_finish);
        if (conflict) throw new DbError("overlap", message);
    });
}

/* ---------- Operações ---------- */

export function select(table, predicate = () => true) {
    return state.tables[table].filter(predicate).map(row => ({ ...row }));
}

export function findById(table, id) {
    const row = state.tables[table].find(item => item[SCHEMA[table].pk] === Number(id));
    return row ? { ...row } : null;
}

export function insert(table, data) {
    const schema = SCHEMA[table];
    const row = { ...data };
    const columns = Object.keys(state.tables[table][0] || {});
    columns.forEach(column => { if (!(column in row)) row[column] = null; });
    row[schema.pk] = state.sequences[table] + 1;
    validate(table, row);
    if (table === "appointments" && row.date_hour_start < timestamp(dateKey(new Date()), `${pad(new Date().getHours())}:${pad(new Date().getMinutes())}`)) {
        throw new DbError("past", "Não é possível criar um agendamento com início no passado.");
    }
    state.sequences[table] = row[schema.pk];
    state.tables[table].push(row);
    save();
    return { ...row };
}

export function update(table, id, changes) {
    const schema = SCHEMA[table];
    const index = state.tables[table].findIndex(item => item[schema.pk] === Number(id));
    if (index < 0) throw new DbError("notfound", "Registro não encontrado.");
    const row = { ...state.tables[table][index], ...changes, [schema.pk]: state.tables[table][index][schema.pk] };
    validate(table, row, row[schema.pk]);
    state.tables[table][index] = row;
    save();
    return { ...row };
}

export function remove(table, id) {
    const schema = SCHEMA[table];
    const numericId = Number(id);
    (RESTRICT[table] || []).forEach(([child, column]) => {
        if (state.tables[child].some(row => row[column] === numericId)) {
            throw new DbError("fk", `${schema.label === "sala" ? "Esta" : "Este"} ${schema.label} possui agendamentos e não pode ser excluíd${schema.label === "sala" ? "a" : "o"}. Use a inativação.`);
        }
    });
    (CASCADE[table] || []).forEach(([child, column]) => {
        state.tables[child] = state.tables[child].filter(row => row[column] !== numericId);
    });
    state.tables[table] = state.tables[table].filter(row => row[schema.pk] !== numericId);
    save();
}

// Troca todos os horários de funcionamento de uma sala de uma vez (sala + room_operating_hours).
export function replaceRoomHours(idRoom, rows) {
    const backup = state.tables.room_operating_hours;
    state.tables.room_operating_hours = backup.filter(row => row.id_room !== idRoom);
    try {
        rows.forEach(data => {
            const row = { ...data, id_room: idRoom, id_room_hour: state.sequences.room_operating_hours + 1 };
            validate("room_operating_hours", row);
            state.sequences.room_operating_hours = row.id_room_hour;
            state.tables.room_operating_hours.push(row);
        });
    } catch (error) {
        state.tables.room_operating_hours = backup;
        throw error;
    }
    save();
}

export const toTimestamp = timestamp;
export const toDateKey = dateKey;
