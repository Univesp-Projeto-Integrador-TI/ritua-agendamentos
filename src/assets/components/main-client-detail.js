class MainClientDetail extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <main class="main-detalhe-cliente">
                <section class="section-registration-initial">
                    <section class="card-registration-fingers">
                        <header class="header-registration-fingers">
                            <h4 class="title-registration-fingers">Dados cadastrais</h4>
                        </header>

                        <section class="detail-registration-fingers">
                            <div class="info-registration-fingers">
                                <span class="info-registration-fingers">Nome</span>
                                <p class="info-registration-fingers">Ana Souza</p>
                            </div>

                            <div class="group-info-registration-fingers">
                                <div class="info-registration-fingers">
                                    <span class="info-registration-fingers">Genero</span>
                                    <p class="info-registration-fingers">Feminino</p>
                                </div>

                                <div class="info-registration-fingers">
                                    <span class="info-registration-fingers">Data de nascimento</span>
                                    <p class="info-registration-fingers">05/10/1990</p>
                                </div>

                                <div class="info-registration-fingers">
                                    <span class="info-registration-fingers">Email</span>
                                    <p class="info-registration-fingers">ana.souza@example.com</p>
                                </div>

                                <div class="info-registration-fingers">
                                    <span class="info-registration-fingers">Telefone</span>
                                    <p class="info-registration-fingers">(11) 99999-9999</p>
                                </div>
                            </div>
                        </section>
                    </section>
                    <card-next-service></card-next-service>
                </section>

                <section class="section-registration-observations">
                    <header class="header-registration-observations">
                        <h4 class="title-registration-observations">Observações</h4>
                    </header>

                    <p class="info-registration-observations">Prefere receber confirmações por WhatsApp. Avisar com antecedência em caso de alteração de horário.</p>
                </section>
            </main>
        `;
    }
}

customElements.define('main-client-detail', MainClientDetail);