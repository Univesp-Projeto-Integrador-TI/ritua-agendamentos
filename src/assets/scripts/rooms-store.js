import { asset } from "./paths.js";
import { select, findById, insert, update, remove, replaceRoomHours } from "./db.js";

// Camada entre as tabelas "rooms" + "room_operating_hours" e os componentes de sala.
// A imagem não vai para o banco: todas as salas usam a imagem padrão do projeto.

const WEEKDAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
const DAY_KEYS = ["segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo"];
const DEFAULT_HOURS = WEEKDAYS.map((day, index) => ({
    day,
    enabled: index < 5,
    start: "08:00",
    end: "18:00"
}));

const short = time => String(time).slice(0, 5);

function toView(row, hourRows) {
    const hours = WEEKDAYS.map((day, index) => {
        const found = hourRows.find(item => item.id_room === row.id_room && item.day_of_week === DAY_KEYS[index]);
        return found
            ? { day, enabled: true, start: short(found.opening_time), end: short(found.closing_time) }
            : { day, enabled: false, start: "08:00", end: "18:00" };
    });
    return {
        id: row.id_room,
        name: row.name,
        capacity: row.capacity,
        duration: row.default_duration_minutes,
        description: row.description || "",
        amenities: row.amenities ? row.amenities.split(",").map(item => item.trim()).filter(Boolean) : [],
        hours,
        interval: row.interval_minutes,
        active: row.room_status === "Ativa",
        image: asset("img-exe-ambiente-sala.svg")
    };
}

export function getRooms() {
    const hourRows = select("room_operating_hours");
    return select("rooms").map(row => toView(row, hourRows));
}

export function getRoom(id) {
    const row = findById("rooms", id);
    return row ? toView(row, select("room_operating_hours", item => item.id_room === row.id_room)) : null;
}

// Cria (sem id) ou atualiza (com id) a sala e os horários de funcionamento. Lança DbError se o banco recusar.
export function saveRoom(room) {
    const columns = {
        name: room.name,
        description: room.description || null,
        capacity: Number(room.capacity),
        default_duration_minutes: Number(room.duration),
        interval_minutes: Number(room.interval),
        amenities: (room.amenities || []).join(","),
        room_status: room.active === false ? "Pausada" : "Ativa"
    };
    const row = room.id ? update("rooms", room.id, columns) : insert("rooms", columns);
    const hours = (room.hours || [])
        .map((item, index) => ({ item, index }))
        .filter(({ item }) => item.enabled)
        .map(({ item, index }) => ({ day_of_week: DAY_KEYS[index], opening_time: `${item.start}:00`, closing_time: `${item.end}:00` }));
    replaceRoomHours(row.id_room, hours);
    return getRoom(row.id_room);
}

// Lança DbError se a sala tiver agendamentos (ON DELETE RESTRICT).
export function removeRoom(id) {
    remove("rooms", id);
    window.dispatchEvent(new CustomEvent("rooms-changed"));
}

export function getRoomHours(room, dayIndex) {
    const index = (dayIndex + 6) % 7;
    return room.hours?.[index] || { enabled: false, start: "08:00", end: "18:00" };
}

export { WEEKDAYS, DEFAULT_HOURS };
