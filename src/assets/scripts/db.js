// Camada de dados do front.
// Com a API no ar (backend/server.js), lê e grava no PostgreSQL. Sem a API, cai na base local de testes.
// As leituras (select/findById) são síncronas porque trabalham sobre a cópia em memória carregada no início.
// As gravações são assíncronas nos dois modos, então quem chama precisa usar await.

import { DbError } from "./db-error.js";
import { apiFetch, detectApi, ApiError, getToken } from "./api.js";

export { DbError };

export const mode = await detectApi() ? "api" : "local";
const local = mode === "local" ? await import("./local-db.js") : null;

if (mode === "local") {
    console.warn("[Rituá] API indisponível: usando a base local de testes.");
}

/* ---------- Datas (mesmo formato usado nas colunas do banco) ---------- */

const pad = value => String(value).padStart(2, "0");
export const toDateKey = date => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
export const toTimestamp = (date, time) => `${date}T${time.length === 5 ? `${time}:00` : time}`;

/* ---------- Cópia em memória das tabelas ---------- */

const tables = {
    employees: [],
    clients: [],
    rooms: [],
    room_operating_hours: [],
    appointments: [],
    login: []
};

const notify = () => window.dispatchEvent(new CustomEvent("db-changed"));

// A API usa nomes de coluna próprios (employee_id, room_id...). Aceita os dois formatos para não
// quebrar se o backend for alinhado ao SQL validado (id_employee, id_room...).
const pick = (row, ...keys) => keys.map(key => row?.[key]).find(value => value !== undefined && value !== null);

const mapEmployee = row => ({
    id_employee: Number(pick(row, "id_employee", "employee_id")),
    cpf: row.cpf || null,
    email: row.email,
    phone: row.phone,
    name: row.name,
    specialty1: row.specialty1,
    specialty2: row.specialty2 || null,
    specialty3: row.specialty3 || null,
    employee_status: row.employee_status
});

const mapClient = row => ({
    client_id: Number(pick(row, "client_id", "id_client")),
    name: row.name,
    number: row.number,
    email: row.email || null,
    birth_date: row.birth_date ? String(row.birth_date).slice(0, 10) : null,
    gender: row.gender,
    notes: row.notes || null,
    client_status: row.client_status
});

const mapRoom = row => ({
    id_room: Number(pick(row, "id_room", "room_id")),
    name: row.name,
    description: row.description || null,
    capacity: row.capacity,
    default_duration_minutes: row.default_duration_minutes,
    interval_minutes: row.interval_minutes,
    amenities: row.amenities || null,
    room_status: row.room_status
});

const mapHour = (row, idRoom) => ({
    id_room_hour: Number(pick(row, "id_room_hour", "room_operating_hour_id")),
    id_room: Number(idRoom ?? pick(row, "id_room", "room_id")),
    day_of_week: row.day_of_week,
    opening_time: String(row.opening_time).slice(0, 8),
    closing_time: String(row.closing_time).slice(0, 8)
});

const mapAppointment = row => ({
    id_schedule: Number(pick(row, "id_schedule", "id_appointment")),
    service: row.service,
    description: row.description || null,
    date_hour_start: String(row.date_hour_start),
    date_hour_finish: String(row.date_hour_finish),
    appointment_status: row.appointment_status,
    notes: row.notes || null,
    id_customer: Number(pick(row, "id_customer", "client_id")),
    id_employee: Number(pick(row, "id_employee", "employee_id")),
    id_room: Number(pick(row, "id_room", "room_id"))
});

async function fetchAllClients() {
    const rows = [];
    for (let page = 1; page <= 50; page += 1) {
        const result = await apiFetch(`/clients?page=${page}`);
        const batch = result.data || [];
        rows.push(...batch);
        if (batch.length < 10) break;
    }
    return rows;
}

export async function refresh() {
    if (mode === "local") return;
    try {
        const [employees, rooms, appointments] = await Promise.all([
            apiFetch("/employees"),
            apiFetch("/rooms"),
            apiFetch("/appointments")
        ]);
        // A lista de clientes exige token: antes do login ela fica vazia.
        const clients = getToken() ? await fetchAllClients() : [];

        tables.employees = (employees.data || []).map(mapEmployee);
        tables.clients = clients.map(mapClient);
        tables.rooms = (rooms.data || []).map(mapRoom);
        tables.room_operating_hours = (rooms.data || []).flatMap(room =>
            (room.operating_hours || []).map(hour => mapHour(hour, pick(room, "id_room", "room_id")))
        );
        tables.appointments = (appointments.data || []).map(mapAppointment);
        notify();
    } catch (error) {
        if (error instanceof ApiError) throw new DbError("api", error.message);
        throw error;
    }
}

if (mode === "api") {
    try { await refresh(); } catch (error) { console.warn("[Rituá] Falha ao carregar os dados da API:", error.message); }
}

/* ---------- Leituras ---------- */

export function select(table, predicate = () => true) {
    if (mode === "local") return local.select(table, predicate);
    return (tables[table] || []).filter(predicate).map(row => ({ ...row }));
}

export function findById(table, id) {
    if (mode === "local") return local.findById(table, id);
    const pk = { employees: "id_employee", clients: "client_id", rooms: "id_room", room_operating_hours: "id_room_hour", appointments: "id_schedule", login: "id_login" }[table];
    const row = (tables[table] || []).find(item => String(item[pk]) === String(id));
    return row ? { ...row } : null;
}

/* ---------- Gravações ---------- */

const fail = error => {
    if (error instanceof DbError) throw error;
    if (error instanceof ApiError) throw new DbError("api", error.message);
    throw error;
};

export async function insert(table, data) {
    if (mode === "local") return local.insert(table, data);
    try {
        if (table === "clients") {
            const result = await apiFetch("/clients", { method: "POST", body: data });
            const row = mapClient(result.data);
            tables.clients.push(row);
            notify();
            return { ...row };
        }
        if (table === "rooms") {
            const result = await apiFetch("/rooms", { method: "POST", body: { ...data, operating_hours: [] } });
            const row = mapRoom(result.data);
            tables.rooms.push(row);
            notify();
            return { ...row };
        }
        if (table === "appointments") {
            const body = {
                service: data.service,
                description: data.description,
                date: String(data.date_hour_start).slice(0, 10),
                date_hour_start: data.date_hour_start,
                date_hour_finish: data.date_hour_finish,
                appointment_status: data.appointment_status,
                notes: data.notes,
                client_id: data.id_customer,
                employee_id: data.id_employee,
                room_id: data.id_room
            };
            const result = await apiFetch("/appointments", { method: "POST", body });
            const row = mapAppointment(result.data);
            tables.appointments.push(row);
            notify();
            return { ...row };
        }
        throw new DbError("unsupported", "Operação não disponível na API.");
    } catch (error) {
        fail(error);
    }
}

export async function update(table, id, changes) {
    if (mode === "local") return local.update(table, id, changes);
    try {
        if (table === "clients") {
            const result = await apiFetch(`/clients/${id}`, { method: "PATCH", body: changes });
            const row = mapClient(result.data);
            tables.clients = tables.clients.map(item => (item.client_id === row.client_id ? row : item));
            notify();
            return { ...row };
        }
        if (table === "rooms") {
            const result = await apiFetch(`/rooms/${id}`, { method: "PATCH", body: changes });
            const row = mapRoom(result.data);
            tables.rooms = tables.rooms.map(item => (item.id_room === row.id_room ? row : item));
            notify();
            return { ...row };
        }
        if (table === "appointments") {
            const onlyStatus = Object.keys(changes).length === 1 && "appointment_status" in changes;
            const result = onlyStatus
                ? await apiFetch(`/appointments/${id}/status`, { method: "PATCH", body: changes })
                : await apiFetch(`/appointments/${id}`, { method: "PATCH", body: changes });
            const row = mapAppointment(result.data);
            tables.appointments = tables.appointments.map(item => (item.id_schedule === row.id_schedule ? row : item));
            notify();
            return { ...row };
        }
        if (table === "employees") {
            const result = await apiFetch(`/employees/${id}`, { method: "PATCH", body: changes });
            const row = mapEmployee(result.data);
            tables.employees = tables.employees.map(item => (item.id_employee === row.id_employee ? row : item));
            notify();
            return { ...row };
        }
        if (table === "login") {
            const result = await apiFetch(`/logins/${id}`, { method: "PATCH", body: changes });
            return { ...result.data };
        }
        throw new DbError("unsupported", "Operação não disponível na API.");
    } catch (error) {
        fail(error);
    }
}

export async function remove(table, id) {
    if (mode === "local") return local.remove(table, id);
    try {
        if (table === "rooms") {
            await apiFetch(`/rooms/${id}`, { method: "DELETE" });
            tables.rooms = tables.rooms.filter(item => String(item.id_room) !== String(id));
            tables.room_operating_hours = tables.room_operating_hours.filter(item => String(item.id_room) !== String(id));
            notify();
            return;
        }
        if (table === "employees") {
            await apiFetch(`/employees/${id}`, { method: "DELETE" });
            tables.employees = tables.employees.filter(item => String(item.id_employee) !== String(id));
            notify();
            return;
        }
        if (table === "appointments") {
            await apiFetch(`/appointments/${id}`, { method: "DELETE" });
            tables.appointments = tables.appointments.filter(item => String(item.id_schedule) !== String(id));
            notify();
            return;
        }
        throw new DbError("unsupported", "Operação não disponível na API.");
    } catch (error) {
        fail(error);
    }
}

export async function replaceRoomHours(idRoom, rows) {
    if (mode === "local") return local.replaceRoomHours(idRoom, rows);
    try {
        const result = await apiFetch(`/rooms/${idRoom}/hours`, { method: "PUT", body: { operating_hours: rows } });
        tables.room_operating_hours = tables.room_operating_hours.filter(item => String(item.id_room) !== String(idRoom));
        (result.data || []).forEach(row => tables.room_operating_hours.push(mapHour(row, idRoom)));
        notify();
    } catch (error) {
        fail(error);
    }
}

// Login do profissional (id_login + nickname), usado para trocar a senha.
export async function findLoginByEmployee(employeeId) {
    if (mode === "local") return select("login", item => item.id_employee === Number(employeeId))[0] || null;
    const result = await apiFetch("/logins");
    const row = (result.data || []).find(item => Number(pick(item, "id_employee", "employee_id")) === Number(employeeId));
    return row ? { id_login: Number(pick(row, "id_login", "login_id")), nickname: row.nickname, id_employee: Number(employeeId) } : null;
}

export function resetDatabase() {
    if (mode === "local") return local.resetDatabase();
    location.reload();
}
