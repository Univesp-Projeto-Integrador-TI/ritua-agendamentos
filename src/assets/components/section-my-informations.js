class createSectionMyInformation extends HTMLElement {
    connectedCallback(){
        this.innerHTML = `
            <section class="section-my-informations">

                <section class="card-personal-informations">
                    <header class="header-personal-informations">
                        <img class="img-user-profile" src="/src/assets/images/icon-profile-user.svg">
                        <div class="title-card-personal-informations">
                            <h4>Informações pessoais</h4>
                            <p>Mantenha seus dados de contato atualizados.</p>
                        </div>
                    </header>

                    <form class="forms-personal-informations" action="" method="">
                        <div class="container-name-user container-forms">
                            <label for="name-user">Nome completo</label>
                            <input class="input-name-user input" type="text" placeholder="Insira o nome completo" name="name-user">
                        </div>
                        <div class="container-contact-user">
                            <div class="container-contact-email container-forms">
                                <label for="email">E-mail</label>
                                <input type="email" class="input-email-user input" placeholder="exemplo@email.com.br" name="email">
                            </div>
                            <div class="container-contact-phone container-forms">
                                <label for="celular">Celular</label>
                                <input type="tel" class="input-celular-user input" placeholder="(00) 00000-0000" name="celular">
                            </div>
                        </div>
                    </form>

                    <section class="container-services-offered">
                        <header class="header-services-offered">
                            <div class="title-services-offered">
                                <p>Serviços fornecidos</p>
                                <p>Insira os serviços que você oferece. Adicione um a um ( máx: 3 serviços ).</p>
                            </div>
                        </header>

                        <div class="input-services-offered">
                            <input type="text" class="input-service input" placeholder="Digite um serviço" name="service">
                            <button class="btn-insert-service">Inserir</button>
                        </div>

                        <div class="content-services-offered">
                        </div>

                        <p class="message-services-offered" aria-live="polite"></p>

                    </section>
                </section>

                <section class="card-my-security">
                    <header class="header-my-security">
                        <img class="img-keyhole" src="/src/assets/images/icon-lock-keyhole.svg">
                        <div class="title-my-security">
                            <h4>Minha seguraça</h4>
                            <p>Para alterar sua senha, preencha os campos abaixo.</p>
                        </div>
                    </header>

                    <form class="forms-my-security" action="" method="">
                        <div class="container-current password container-forms">
                            <label for="current-password">Senha atual</label>
                            <input class="input-current-password input" type="password" placeholder="Digite sua senha atual" name="input-current-password">
                        </div>
                        <div class="container-news-password">
                            <div class="container-new-password container-forms">
                                <label for="new-password">Nova senha</label>
                                <input type="password" class="input-new-password input" placeholder="Crie uma nova senha" name="input-new-password">
                            </div>
                            <div class="container-confirm-password container-forms">
                                <label for="confirm-password">Confirmar nova senha</label>
                                <input type="password" class="input-confirm-password input" placeholder="Repita a nova senha" name="input-confirm-password">
                            </div>
                        </div>
                    </form>

                    <p class="info-my-security">Use pelo menos 8 caracteres, com letras e números. Deixe os campos em branco para manter sua senha atual.</p>
                </section>

            </section>
        `

        const inputService = this.querySelector(".input-service");
        const btnInsertService = this.querySelector(".btn-insert-service");
        const contentServices = this.querySelector(".content-services-offered");
        const messageServices = this.querySelector(".message-services-offered");

        const services = [];
        const maxServices = 3;

        const renderServices = () => {
            contentServices.innerHTML = "";

            services.forEach((service, index) => {
                const tag = document.createElement("span");
                tag.classList.add("service-tag");

                const serviceName = document.createElement("span");
                serviceName.textContent = service;

                const removeButton = document.createElement("button");
                removeButton.type = "button";
                removeButton.textContent = "×";
                removeButton.setAttribute(
                    "aria-label",
                    `Remover serviço ${service}`
                );

                removeButton.addEventListener("click", () => {
                    services.splice(index, 1);
                    renderServices();
                });

                tag.append(serviceName, removeButton);
                contentServices.appendChild(tag);
            });

            const limitReached = services.length >= maxServices;

            inputService.disabled = limitReached;
            btnInsertService.disabled = limitReached;

            messageServices.textContent = limitReached
                ? "Limite atingido: 3 serviços inseridos."
                : `Você pode adicionar mais ${maxServices - services.length} serviço(s).`;
        };

        const insertService = () => {
            const service = inputService.value.trim();

            if (service === "") {
                messageServices.textContent = "Digite o nome de um serviço.";
                inputService.focus();
                return;
            }

            if (services.length >= maxServices) {
                messageServices.textContent = "Você já atingiu o limite de 3 serviços.";
                return;
            }

            const alreadyExists = services.some(
                item => item.toLowerCase() === service.toLowerCase()
            );

            if (alreadyExists) {
                messageServices.textContent = "Esse serviço já foi adicionado.";
                inputService.focus();
                return;
            }

            services.push(service);

            inputService.value = "";

            renderServices();

            if (services.length < maxServices) {
                inputService.focus();
            }
        };

        btnInsertService.addEventListener("click", insertService);

        inputService.addEventListener("keydown", event => {
            if (event.key === "Enter") {
                event.preventDefault();
                insertService();
            }
        });

        renderServices();
    }
}

customElements.define('section-my-informations', createSectionMyInformation);