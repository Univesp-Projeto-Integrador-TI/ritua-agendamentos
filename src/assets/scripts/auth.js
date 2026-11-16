import { select, insert, remove, DbError, mode, refresh } from "./db.js";
import { apiFetch, setToken, ApiError } from "./api.js";

// Cadastro e autenticação sobre as tabelas "employees" e "login".
// Com a API no ar, quem confere a senha é o backend (bcrypt). Na base local, o hash é feito no navegador
// e serve só para testes.

const SESSION_KEY = "ritua-session";

export const digits = value => String(value || "").replace(/\D/g, "");
export const normalizeLogin = value => {
    const text = String(value || "").trim();
    return digits(text).length === 11 && /^[\d.\-\s]+$/.test(text) ? digits(text) : text.toLowerCase();
};

async function sha256(text) {
    const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return [...new Uint8Array(buffer)].map(byte => byte.toString(16).padStart(2, "0")).join("");
}

// Formato guardado em login.password na base local: "salt:hash"
export async function makePasswordHash(password) {
    const salt = crypto.randomUUID();
    return `${salt}:${await sha256(`${salt}:${password}`)}`;
}

export async function checkPassword(password, stored) {
    const [salt, hash] = String(stored || "").split(":");
    return Boolean(salt && hash) && await sha256(`${salt}:${password}`) === hash;
}

export function startSession(loginRow, employee) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ login: loginRow.nickname, name: employee.name, employeeId: employee.id_employee }));
}

export async function authenticate(user, password) {
    if (mode === "api") {
        try {
            const result = await apiFetch("/auth/login", {
                method: "POST",
                body: { nickname: normalizeLogin(user), password },
                auth: false
            });
            setToken(result.token);
            await refresh();
            const employee = select("employees", item => item.id_employee === Number(result.user.employee_id))[0];
            if (!employee || employee.employee_status !== "Ativo") {
                setToken("");
                return null;
            }
            startSession({ nickname: result.user.nickname }, employee);
            return employee;
        } catch (error) {
            if (error instanceof ApiError) return null;
            throw error;
        }
    }

    const loginRow = select("login", item => item.nickname === normalizeLogin(user))[0];
    if (!loginRow || !await checkPassword(password, loginRow.password)) return null;
    const employee = select("employees", item => item.id_employee === loginRow.id_employee)[0];
    if (!employee || employee.employee_status !== "Ativo") return null;
    startSession(loginRow, employee);
    return employee;
}

// Cria o profissional e o login. Devolve { error } se o banco recusar (e-mail ou usuário repetido, etc.).
export async function createAccount({ name, phone, email, login, services, password }) {
    const cpf = /^\d{11}$/.test(login) ? login : null;
    const specialties = {
        specialty1: services[0],
        specialty2: services[1] || null,
        specialty3: services[2] || null
    };

    if (mode === "api") {
        try {
            await apiFetch("/employees", {
                method: "POST",
                auth: false,
                body: { cpf, email, phone, name, ...specialties, employee_status: "Ativo", nickname: login, password }
            });
            await refresh();
            return { success: true };
        } catch (error) {
            if (!(error instanceof ApiError)) throw error;
            const message = String(error.message || "");
            if (/nickname|login/i.test(message)) return { error: "Este usuário já possui cadastro." };
            if (/email/i.test(message)) return { error: "Este e-mail já está cadastrado." };
            if (/cpf/i.test(message)) return { error: "Este CPF já está cadastrado." };
            return { error: message || "Não foi possível concluir o cadastro." };
        }
    }

    const hash = await makePasswordHash(password);
    try {
        const employee = await insert("employees", {
            cpf, email, phone, name,
            ...specialties,
            employee_status: "Ativo"
        });
        try {
            await insert("login", { nickname: login, password: hash, id_employee: employee.id_employee });
        } catch (error) {
            // Equivale a um rollback: não deixa profissional sem login.
            await remove("employees", employee.id_employee);
            throw error;
        }
        return { success: true };
    } catch (error) {
        if (!(error instanceof DbError)) throw error;
        if (error.code === "unique") {
            if (/nickname/.test(error.message)) return { error: "Este usuário já possui cadastro." };
            if (/email/.test(error.message)) return { error: "Este e-mail já está cadastrado." };
            if (/cpf/.test(error.message)) return { error: "Este CPF já está cadastrado." };
        }
        return { error: error.message };
    }
}
