import { select, findById, insert, update, DbError } from "./db.js";
import { appointments, isBlockingStatus } from "./agenda-store.js";

// Camada entre a tabela "clients" (colunas do banco) e os componentes (campos em português).

const GENDER_LABELS = { feminino: "Feminino", masculino: "Masculino", outro: "Outro", "nao-informado": "Prefiro não informar" };

export const digits = value => String(value || "").replace(/\D/g, "");

export function formatPhone(value) {
    const d = digits(value);
    if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
    if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return d;
}

const formatBirth = value => (value ? value.split("-").reverse().join("/") : "Não informada");

function toView(row) {
    return {
        id: row.client_id,
        nome: row.name,
        email: row.email || "",
        telefone: formatPhone(row.number),
        telefoneDigits: row.number,
        dataNascimento: formatBirth(row.birth_date),
        nascimentoISO: row.birth_date,
        genero: GENDER_LABELS[row.gender] || row.gender,
        generoValor: row.gender,
        observacoes: row.notes || "",
        status: row.client_status
    };
}

export const getClients = () => select("clients").map(toView).sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
export const getClient = id => { const row = findById("clients", id); return row ? toView(row) : null; };

function toRow(form) {
    return {
        name: String(form.nome || "").trim(),
        number: digits(form.telefone),
        email: String(form.email || "").trim() || null,
        birth_date: form.nascimento || null,
        gender: form.genero || "nao-informado",
        notes: String(form.observacoes || "").trim() || null
    };
}

function check(form) {
    if (!form.nome?.trim()) return "Informe o nome do cliente.";
    if (!form.nascimento) return "Informe a data de nascimento.";
    const phone = digits(form.telefone);
    if (phone.length < 10 || phone.length > 11) return "Informe um telefone válido, com DDD.";
    if (form.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return "Informe um e-mail válido.";
    return "";
}

const run = async action => {
    try { return { client: await action() }; } catch (error) {
        if (error instanceof DbError) return { error: error.message };
        throw error;
    }
};

export async function createClient(form) {
    const error = check(form);
    if (error) return { error };
    return run(async () => toView(await insert("clients", { ...toRow(form), client_status: "Ativo" })));
}

export async function updateClient(id, form) {
    const error = check(form);
    if (error) return { error };
    return run(async () => toView(await update("clients", id, toRow(form))));
}

/* ---------- Agendamentos do cliente (do profissional logado) ---------- */

const brDate = key => key.split("-").reverse().join("/");

// Próximo atendimento ainda por vir (ignora Desmarcado, Cancelado e Concluído).
export function getNextAppointment(clientId) {
    const now = new Date();
    const next = appointments
        .filter(item => item.clientId === clientId && isBlockingStatus(item.status) && item.status !== "Concluído" && new Date(`${item.data}T${item.initialHour}:00`) >= now)
        .sort((a, b) => `${a.data}${a.initialHour}`.localeCompare(`${b.data}${b.initialHour}`))[0];
    return next
        ? { id: next.id, data: brDate(next.data), horario: next.initialHour, servico: next.service, duracao: next.duration, sala: next.room, status: next.status }
        : null;
}

// Histórico completo do cliente, do mais recente para o mais antigo.
export function getClientHistory(clientId) {
    return appointments
        .filter(item => item.clientId === clientId)
        .sort((a, b) => `${b.data}${b.initialHour}`.localeCompare(`${a.data}${a.initialHour}`))
        .map(item => ({ id: item.id, data: brDate(item.data), reservation: `${item.initialHour}-${item.finalHour}`, service: item.service, duration: item.duration, room: item.room, status: item.status }));
}
