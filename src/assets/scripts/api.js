// Cliente HTTP da API do backend (backend/server.js).
// Endereço padrão: a API publicada no Render. Para apontar para outro servidor, use ?api=http://host:porta
// na URL (fica guardado) ou defina window.RITUA_API_URL antes de carregar os scripts.

const URL_KEY = "ritua-api-url";
const TOKEN_KEY = "ritua-token";
const DEFAULT_API_URL = "https://ritua-agendamentos.onrender.com";

const fromQuery = new URLSearchParams(location.search).get("api");
if (fromQuery) localStorage.setItem(URL_KEY, fromQuery);

export const API_URL = String(
    fromQuery || localStorage.getItem(URL_KEY) || window.RITUA_API_URL || DEFAULT_API_URL
).replace(/\/+$/, "");

export const getToken = () => sessionStorage.getItem(TOKEN_KEY) || "";
export const setToken = token => {
    if (token) sessionStorage.setItem(TOKEN_KEY, token);
    else sessionStorage.removeItem(TOKEN_KEY);
};

export class ApiError extends Error {
    constructor(message, status = 0) {
        super(message);
        this.status = status;
    }
}

function withTimeout(ms) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);
    return { signal: controller.signal, done: () => clearTimeout(timer) };
}

export async function apiFetch(path, { method = "GET", body, auth = true, timeout = 30000 } = {}) {
    const { signal, done } = withTimeout(timeout);
    const token = getToken();
    try {
        const response = await fetch(`${API_URL}${path}`, {
            method,
            headers: {
                ...(body ? { "Content-Type": "application/json" } : {}),
                ...(auth && token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: body ? JSON.stringify(body) : undefined,
            signal
        });
        const text = await response.text();
        let data = {};
        try { data = text ? JSON.parse(text) : {}; } catch { data = {}; }
        if (!response.ok || data.success === false) {
            throw new ApiError(data.message || data.error || "Não foi possível concluir a operação.", response.status);
        }
        return data;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        if (error.name === "AbortError") throw new ApiError("O servidor demorou para responder. Tente novamente.", 0);
        throw new ApiError("Não foi possível falar com o servidor. Verifique se a API está no ar.", 0);
    } finally {
        done();
    }
}

// Confere se a API está no ar antes de decidir o modo de trabalho.
// O plano gratuito do Render hiberna: a primeira chamada pode levar até ~50s para acordar.
export async function detectApi() {
    const { signal, done } = withTimeout(45000);
    try {
        const response = await fetch(`${API_URL}/`, { signal });
        if (!response.ok) return false;
        const data = await response.json();
        return data?.success === true;
    } catch {
        return false;
    } finally {
        done();
    }
}
