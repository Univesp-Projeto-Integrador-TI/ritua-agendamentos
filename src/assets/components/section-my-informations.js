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
                            <p class="message-services-offered" aria-live="polite">Massoterapia</p>
                        </div>
                    </section>

                </section>
            </section>
        `
    }
}

customElements.define('section-my-informations', createSectionMyInformation);