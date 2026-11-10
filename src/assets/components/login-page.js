const USERS_KEY = "ritua-users";
const SESSION_KEY = "ritua-session";

const escapeText = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const digits = value => String(value || "").replace(/\D/g, "");
const normalizeLogin = value => { const text = String(value || "").trim(); return digits(text).length === 11 && /^[\d.\-\s]+$/.test(text) ? digits(text) : text.toLowerCase(); };
const getUsers = () => { try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; } catch { return []; } };
const hashPassword = async (password, salt) => {
    const data = new TextEncoder().encode(`${salt}:${password}`);
    const buffer = await crypto.subtle.digest("SHA-256", data);
    return [...new Uint8Array(buffer)].map(byte => byte.toString(16).padStart(2, "0")).join("");
};
const maskPhone = value => {
    const d = digits(value).slice(0, 11);
    if (d.length <= 2) return d;
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};

class LoginPage extends HTMLElement {
    connectedCallback() {
        this.mode = "login";
        this.render();
    }

    render() {
        const isLogin = this.mode === "login";
        this.innerHTML = `
            <main class="login-page">
                <section class="login-visual" aria-hidden="true"><img src="../images/img-login-ritua.jpg" alt=""></section>
                <section class="login-panel">
                    <div class="login-card">
                        <img class="login-logo" src="../images/logotipo-ritua.svg" alt="Rituá Terapias">
                        <div class="login-tabs" role="tablist">
                            <button type="button" role="tab" data-mode="login" aria-selected="${isLogin}">Entrar</button>
                            <button type="button" role="tab" data-mode="signup" aria-selected="${!isLogin}">Primeiro acesso</button>
                        </div>
                        <h1>${isLogin ? "Bem-vindo(a) de volta" : "Crie seu acesso"}</h1>
                        <p class="login-subtitle">${isLogin ? "Entre com seu usuário e sua senha." : "Preencha seus dados para o primeiro acesso."}</p>
                        <form class="login-form" novalidate>
                            ${isLogin ? this.loginFields() : this.signupFields()}
                            <p class="login-message" role="alert" hidden></p>
                            <button class="login-submit" type="submit">${isLogin ? "Entrar" : "Criar acesso"}</button>
                        </form>
                    </div>
                </section>
            </main>`;
        this.querySelectorAll("[data-mode]").forEach(button => button.addEventListener("click", () => { this.mode = button.dataset.mode; this.render(); }));
        this.querySelectorAll("[data-toggle-password]").forEach(button => button.addEventListener("click", () => {
            const input = button.parentElement.querySelector("input");
            const show = input.type === "password";
            input.type = show ? "text" : "password";
            button.textContent = show ? "Ocultar" : "Mostrar";
        }));
        this.querySelector("[name=phone]")?.addEventListener("input", event => { event.target.value = maskPhone(event.target.value); });
        this.querySelector("form").addEventListener("submit", event => { event.preventDefault(); isLogin ? this.login(event.target) : this.signup(event.target); });
    }

    passwordField(name, label, autocomplete) {
        return `<label class="login-field"><span>${label}</span><div class="login-password"><input name="${name}" type="password" autocomplete="${autocomplete}" placeholder="••••••••"><button type="button" data-toggle-password>Mostrar</button></div></label>`;
    }

    loginFields() {
        return `
            <label class="login-field"><span>Usuário</span><input name="user" autocomplete="username" placeholder="CPF ou nome de usuário"></label>
            ${this.passwordField("password", "Senha", "current-password")}`;
    }

    signupFields() {
        return `
            <label class="login-field"><span>Nome *</span><input name="name" autocomplete="name" placeholder="Seu nome completo"></label>
            <div class="login-row">
                <label class="login-field"><span>Celular *</span><input name="phone" inputmode="tel" autocomplete="tel" placeholder="(00) 00000-0000"></label>
                <label class="login-field"><span>E-mail *</span><input name="email" type="email" autocomplete="email" placeholder="voce@email.com"></label>
            </div>
            <label class="login-field"><span>Usuário *</span><input name="user" autocomplete="username" placeholder="CPF ou nome de usuário"></label>
            <div class="login-row">
                ${this.passwordField("password", "Senha *", "new-password")}
                ${this.passwordField("confirm", "Digitar senha novamente *", "new-password")}
            </div>
            <p class="login-hint">Você poderá confirmar seu e-mail depois, caso precise redefinir a senha.</p>`;
    }

    showMessage(text, type = "error") {
        const box = this.querySelector(".login-message");
        box.textContent = text;
        box.dataset.type = type;
        box.hidden = !text;
    }

    async login(form) {
        const user = normalizeLogin(form.user.value);
        const password = form.password.value;
        if (!user || !password) return this.showMessage("Informe usuário e senha.");
        const found = getUsers().find(item => item.login === user);
        const hash = found && await hashPassword(password, found.salt);
        if (!found || hash !== found.hash) return this.showMessage("Usuário ou senha incorretos.");
        sessionStorage.setItem(SESSION_KEY, JSON.stringify({ login: found.login, name: found.name }));
        location.href = "../../../index.html";
    }

    async signup(form) {
        const data = { name: form.name.value.trim(), phone: digits(form.phone.value), email: form.email.value.trim(), login: normalizeLogin(form.user.value) };
        if (!data.name || !data.phone || !data.email || !data.login || !form.password.value || !form.confirm.value) return this.showMessage("Preencha todos os campos obrigatórios.");
        if (data.phone.length < 10) return this.showMessage("Informe um celular válido, com DDD.");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return this.showMessage("Informe um e-mail válido.");
        if (form.password.value.length < 6) return this.showMessage("A senha deve ter pelo menos 6 caracteres.");
        if (form.password.value !== form.confirm.value) return this.showMessage("As senhas não são iguais.");
        const users = getUsers();
        if (users.some(item => item.login === data.login)) return this.showMessage("Este usuário já possui cadastro.");
        const salt = crypto.randomUUID();
        users.push({ ...data, salt, hash: await hashPassword(form.password.value, salt) });
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        this.mode = "login";
        this.render();
        this.querySelector("[name=user]").value = data.login;
        this.showMessage(`Acesso criado, ${escapeText(data.name.split(" ")[0])}! Agora é só entrar.`, "success");
    }
}

customElements.define("login-page", LoginPage);
