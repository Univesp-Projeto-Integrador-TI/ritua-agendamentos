import { select, update, DbError } from "./db.js";
import { checkPassword, makePasswordHash } from "./auth.js";

const SESSION_KEY = "ritua-session";

function readSession() {
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)) || null; } catch { return null; }
}

function findAccount() {
    const session = readSession();
    if (!session?.login) return null;
    const loginRow = select("login", item => item.nickname === session.login)[0];
    const employee = loginRow && select("employees", item => item.id_employee === loginRow.id_employee)[0];
    return employee ? { loginRow, employee } : null;
}

// Sem sessão válida (primeira abertura, aba nova ou base de testes reiniciada), vai direto para o login.
if (!findAccount()) {
    sessionStorage.removeItem(SESSION_KEY);
    location.replace(new URL("../pages/login.html", import.meta.url).href);
}

const services = employee => [employee.specialty1, employee.specialty2, employee.specialty3].filter(Boolean);

export function getCurrentAccount() {
    const account = findAccount();
    if (!account) return null;
    const { employee, loginRow } = account;
    return { id: employee.id_employee, login: loginRow.nickname, name: employee.name, email: employee.email, phone: employee.phone, services: services(employee) };
}

export function getSessionUser() {
    const account = getCurrentAccount();
    if (!account) return { id: null, name: "Usuário", firstName: "Usuário", role: "Profissional Rituá", services: [] };
    return { id: account.id, name: account.name, firstName: account.name.split(" ")[0], role: "Profissional Rituá", services: account.services };
}

export async function saveAccountSettings(data, passwords) {
    const account = findAccount();
    if (!account) return { error: "Não foi possível localizar o cadastro deste usuário." };
    const { employee, loginRow } = account;

    const hasPasswordChange = passwords.current || passwords.next || passwords.confirm;
    let newHash = null;
    if (hasPasswordChange) {
        if (!passwords.current || !passwords.next || !passwords.confirm) return { error: "Preencha os três campos para alterar a senha." };
        if (passwords.next.length < 8 || !/[A-Za-z]/.test(passwords.next) || !/\d/.test(passwords.next)) return { error: "A nova senha precisa ter 8 caracteres, com letras e números." };
        if (passwords.next !== passwords.confirm) return { error: "A confirmação da nova senha não confere." };
        if (!await checkPassword(passwords.current, loginRow.password)) return { error: "A senha atual está incorreta." };
        newHash = await makePasswordHash(passwords.next);
    }
    if (!data.services?.length) return { error: "Adicione pelo menos 1 serviço." };

    try {
        update("employees", employee.id_employee, {
            name: data.name, email: data.email, phone: data.phone,
            specialty1: data.services[0], specialty2: data.services[1] || null, specialty3: data.services[2] || null
        });
        if (newHash) update("login", loginRow.id_login, { password: newHash });
    } catch (error) {
        if (!(error instanceof DbError)) throw error;
        return { error: error.code === "unique" ? "Este e-mail já está cadastrado." : error.message };
    }
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...readSession(), name: data.name }));
    return { success: true };
}
