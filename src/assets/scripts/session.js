const USERS_KEY = "ritua-users";
const SESSION_KEY = "ritua-session";

function readSession() {
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)) || null; } catch { return null; }
}

function readUsers() {
    try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; } catch { return []; }
}

export function getCurrentAccount() {
    const session = readSession();
    if (!session?.login) return null;
    return readUsers().find(user => user.login === session.login) || null;
}

export function getSessionUser() {
    const session = readSession();
    if (!session?.name) return { name: "Usuário", firstName: "Usuário", role: "Profissional Rituá" };
    return { name: session.name, firstName: session.name.split(" ")[0], role: "Profissional Rituá" };
}

async function hashPassword(password, salt) {
    const data = new TextEncoder().encode(`${salt}:${password}`);
    const buffer = await crypto.subtle.digest("SHA-256", data);
    return [...new Uint8Array(buffer)].map(byte => byte.toString(16).padStart(2, "0")).join("");
}

export async function saveAccountSettings(data, passwords) {
    const session = readSession();
    const users = readUsers();
    const index = users.findIndex(user => user.login === session?.login);
    if (index < 0) return { error: "Não foi possível localizar o cadastro deste usuário." };

    const hasPasswordChange = passwords.current || passwords.next || passwords.confirm;
    let passwordUpdate = null;
    if (hasPasswordChange) {
        if (!passwords.current || !passwords.next || !passwords.confirm) return { error: "Preencha os três campos para alterar a senha." };
        if (passwords.next.length < 8 || !/[A-Za-z]/.test(passwords.next) || !/\d/.test(passwords.next)) return { error: "A nova senha precisa ter 8 caracteres, com letras e números." };
        if (passwords.next !== passwords.confirm) return { error: "A confirmação da nova senha não confere." };
        const currentHash = await hashPassword(passwords.current, users[index].salt);
        if (currentHash !== users[index].hash) return { error: "A senha atual está incorreta." };
        const salt = crypto.randomUUID();
        passwordUpdate = { salt, hash: await hashPassword(passwords.next, salt) };
    }

    users[index] = { ...users[index], ...data, ...(passwordUpdate || {}) };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...session, name: data.name }));
    return { success: true };
}
