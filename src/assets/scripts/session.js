import { select, update, DbError, mode, findLoginByEmployee } from "./db.js";
import { checkPassword, makePasswordHash } from "./auth.js";
import { apiFetch, getToken, setToken, ApiError } from "./api.js";

const SESSION_KEY = "ritua-session";

function readSession() {
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)) || null; } catch { return null; }
}

function findAccountLocal() {
    const session = readSession();
    if (!session?.login) return null;
    const loginRow = select("login", item => item.nickname === session.login)[0];
    const employee = loginRow && select("employees", item => item.id_employee === loginRow.id_employee)[0];
    return employee ? { loginRow, employee } : null;
}

// Com a API, quem confirma a sessão é o backend (GET /auth/me com o token).
async function findAccountApi() {
    if (!getToken()) return null;
    try {
        const result = await apiFetch("/auth/me");
        const row = result.data;
        const employee = {
            id_employee: Number(row.id_employee ?? row.employee_id),
            name: row.name,
            email: row.email,
            phone: row.phone,
            specialty1: row.specialty1,
            specialty2: row.specialty2,
            specialty3: row.specialty3,
            employee_status: row.employee_status
        };
        return { loginRow: { nickname: row.nickname }, employee };
    } catch {
        return null;
    }
}

const account = mode === "api" ? await findAccountApi() : findAccountLocal();

// Sem sessão válida (primeira abertura, aba nova ou token expirado), vai direto para o login.
if (!account) {
    sessionStorage.removeItem(SESSION_KEY);
    setToken("");
    location.replace(new URL("../pages/login.html", import.meta.url).href);
}

const services = employee => [employee.specialty1, employee.specialty2, employee.specialty3].filter(Boolean);

export function getCurrentAccount() {
    if (!account) return null;
    const { employee, loginRow } = account;
    return { id: employee.id_employee, login: loginRow.nickname, name: employee.name, email: employee.email, phone: employee.phone, services: services(employee) };
}

export function getSessionUser() {
    const current = getCurrentAccount();
    if (!current) return { id: null, name: "Usuário", firstName: "Usuário", role: "Profissional Rituá", services: [] };
    return { id: current.id, name: current.name, firstName: current.name.split(" ")[0], role: "Profissional Rituá", services: current.services };
}

export async function saveAccountSettings(data, passwords) {
    if (!account) return { error: "Não foi possível localizar o cadastro deste usuário." };
    const { employee, loginRow } = account;

    const hasPasswordChange = passwords.current || passwords.next || passwords.confirm;
    if (hasPasswordChange) {
        if (!passwords.current || !passwords.next || !passwords.confirm) return { error: "Preencha os três campos para alterar a senha." };
        if (passwords.next.length < 8 || !/[A-Za-z]/.test(passwords.next) || !/\d/.test(passwords.next)) return { error: "A nova senha precisa ter 8 caracteres, com letras e números." };
        if (passwords.next !== passwords.confirm) return { error: "A confirmação da nova senha não confere." };
    }
    if (!data.services?.length) return { error: "Adicione pelo menos 1 serviço." };

    const columns = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        specialty1: data.services[0],
        specialty2: data.services[1] || null,
        specialty3: data.services[2] || null
    };

    try {
        if (mode === "api") {
            if (hasPasswordChange) {
                // Confere a senha atual entrando de novo; o backend devolve um token novo.
                const check = await apiFetch("/auth/login", {
                    method: "POST",
                    auth: false,
                    body: { nickname: loginRow.nickname, password: passwords.current }
                });
                setToken(check.token);
            }
            await update("employees", employee.id_employee, columns);
            if (hasPasswordChange) {
                const login = await findLoginByEmployee(employee.id_employee);
                if (!login) return { error: "Não foi possível localizar as credenciais deste usuário." };
                await update("login", login.id_login, { password: passwords.next });
            }
        } else {
            if (hasPasswordChange && !await checkPassword(passwords.current, loginRow.password)) {
                return { error: "A senha atual está incorreta." };
            }
            await update("employees", employee.id_employee, columns);
            if (hasPasswordChange) {
                await update("login", loginRow.id_login, { password: await makePasswordHash(passwords.next) });
            }
        }
    } catch (error) {
        if (error instanceof DbError) return { error: error.code === "unique" ? "Este e-mail já está cadastrado." : error.message };
        if (error instanceof ApiError) return { error: error.status === 401 ? "A senha atual está incorreta." : error.message };
        throw error;
    }

    Object.assign(employee, columns);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...readSession(), name: data.name }));
    return { success: true };
}
