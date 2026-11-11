import { getSessionUser } from "../scripts/session.js";
class createSectionMyProfile extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <section class="section-my-profile">
                <div class="card-my-profile">
                    <p class="title-card-my-profile">MEU PERFIL</p>
                    <img class="img-user-profile" src="/src/assets/images/icon-profile-user.svg">
                    <div class="info-card-my-profile">
                        <h4 class="card-name-user">${getSessionUser().name}</h4>
                        <p class="profission-primary">${getSessionUser().role}</p>
                    </div>
                    <button class="profile-logout-button" type="button">Sair</button>
                </div>

                <div class="iformation-my-profile">
                    <img class="icon-lock-keyhole-profile" src="/src/assets/images/icon-lock-keyhole.svg">
                    <p class="title-card-information-profile">Sua conta, seu cuidado</p>
                    <p class="info-card-information-profile">As alterações nesta página se aplicam apenas ao seu perfil pessoal.</p>
                </div>
            </section>
        `;
        this.querySelector(".profile-logout-button").addEventListener("click", () => {
            sessionStorage.removeItem("ritua-session");
            location.href = "./login.html";
        });
    }
}

customElements.define('section-my-profile', createSectionMyProfile);