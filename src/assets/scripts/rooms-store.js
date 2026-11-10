const STORAGE_KEY = "ritua-rooms";
const WEEKDAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
const DEFAULT_HOURS = WEEKDAYS.map((day, index) => ({
    day,
    enabled: index < 5,
    start: "08:00",
    end: "18:00"
}));
const DEFAULT_ROOMS = [
    { name: "Sala Bambu", capacity: 1, duration: 60, description: "Ambiente acolhedor para massagens e terapias corporais.", amenities: ["Maca", "Ar-condicionado", "Som ambiente"], hours: DEFAULT_HOURS, interval: 15, active: true },
    { name: "Sala Lótus", capacity: 1, duration: 60, description: "Sala silenciosa com maca baixa, almofadas e cortinas de linho. Luz natural pela manhã.", amenities: ["Maca", "Som ambiente", "Pia", "Aromaterapia"], hours: DEFAULT_HOURS.map((item, index) => ({ ...item, start: index < 5 ? "07:00" : "08:00", end: index < 5 ? "19:00" : "12:00", enabled: index < 6 })), interval: 15, active: true },
    { name: "Sala Orquídea", capacity: 1, duration: 60, description: "Espaço leve para terapias integrativas e aromaterapia.", amenities: ["Maca", "Ar-condicionado", "Aromaterapia"], hours: DEFAULT_HOURS, interval: 15, active: true },
    { name: "Sala Rosas", capacity: 2, duration: 60, description: "Ambiente amplo, com iluminação suave para terapias em dupla.", amenities: ["Maca", "Som ambiente", "Pia"], hours: DEFAULT_HOURS, interval: 15, active: true },
    { name: "Sala Tulipa", capacity: 2, duration: 60, description: "Atendimento individual e espaço para acolhimento emocional.", amenities: ["Ar-condicionado", "Som ambiente", "Acessível"], hours: DEFAULT_HOURS, interval: 15, active: true }
].map((room, index) => ({ id: `room-${index + 1}`, image: "/src/assets/images/img-exe-ambiente-sala.svg", ...room }));

export function getRooms() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
        return Array.isArray(saved) ? saved : DEFAULT_ROOMS.map(room => ({ ...room }));
    } catch {
        return DEFAULT_ROOMS.map(room => ({ ...room }));
    }
}

export function saveRooms(rooms) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
    window.dispatchEvent(new CustomEvent("rooms-changed"));
}

export function getRoom(id) {
    return getRooms().find(room => room.id === id) || null;
}

export function saveRoom(room) {
    const rooms = getRooms();
    const index = rooms.findIndex(item => item.id === room.id);
    if (index < 0) rooms.push(room);
    else rooms[index] = room;
    saveRooms(rooms);
    return room;
}

export function removeRoom(id) {
    saveRooms(getRooms().filter(room => room.id !== id));
}

export function createRoomId() {
    return globalThis.crypto?.randomUUID?.() || `room-${Date.now()}`;
}

export function getRoomHours(room, dayIndex) {
    const index = (dayIndex + 6) % 7;
    return room.hours?.[index] || { enabled: false, start: "08:00", end: "18:00" };
}

export { WEEKDAYS, DEFAULT_HOURS };
