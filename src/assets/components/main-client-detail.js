import { getClient, getClientHistory, getNextAppointment } from "../scripts/clients-store.js";

class MainClientDetail extends HTMLElement {
    connectedCallback() {
        this.render();
        window.addEventListener("db-changed", () => this.render());
    }

    render() {
        const parametrosURL = new URLSearchParams(window.location.search);
        const idCliente = Number(parametrosURL.get("id"));

        const subheader = document.querySelector("subheader-ritua");
        subheader.setAttribute("client-id", idCliente);

        const clienteSelecionado = getClient(idCliente);
        const proximo = clienteSelecionado ? getNextAppointment(idCliente) : null;

        if (clienteSelecionado) {
            document.querySelector(".information-page").textContent =
                `Consulte dados e atendimentos de ${clienteSelecionado.nome}.`;
        }

        if (!clienteSelecionado) {
            this.innerHTML = `
                <p>Cliente não encontrado.</p>
            `;
            return;
        }

        const botaoEditar = document.querySelector(".button-edit-client");
        const modalEditar = document.querySelector("modal-edit-client");
        

        botaoEditar.onclick = () => {
            modalEditar.abrirComCliente(clienteSelecionado);
        };

        const historicoCliente = getClientHistory(idCliente);

        const formataData = (data) => {
            if (!data) return "Data não informada";

            const partesData = data.split("/");

            const dataFormatada = new Date(
                Number(partesData[2]),
                Number(partesData[1]) - 1,
                Number(partesData[0])
            );

            return dataFormatada.toLocaleDateString("pt-BR", {
                day: "numeric",
                month: "short",
                year: "numeric"
            }).replace(".", "").replace("de", "").replace("de", "");
        };

        const historicoHTML = historicoCliente.length > 0
            ? historicoCliente.map(agendamento => `
                <div class="card-history-appointments">
                    <main class= "main-card-history-appointmens">
                        <div class="img-history-appointments">
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 1.49939V4.49963M12 1.49939V4.49963M2.25 7.49987H15.75M6 10.5001H6.0075M9 10.5001H9.0075M12 10.5001H12.0075M6 13.5003H6.0075M9 13.5003H9.0075M12 13.5003H12.0075M3.75 2.99951H14.25C15.0784 2.99951 15.75 3.67114 15.75 4.49963V15.0005C15.75 15.829 15.0784 16.5006 14.25 16.5006H3.75C2.92157 16.5006 2.25 15.829 2.25 15.0005V4.49963C2.25 3.67114 2.92157 2.99951 3.75 2.99951Z" stroke="#FFFFF1" stroke-width="1.6" stroke-linecap="round"/>
                            </svg>
                        </div>
                        <div class="info-history-appointments">
                            <p class="info-history-appointments">${formataData(agendamento.data)}  ·  ${agendamento.reservation} </p>
                            <p class="info-history-appointments">${agendamento.service}  ·  ${agendamento.duration} min</p>
                            <p class="info-history-appointments">${agendamento.room}</p>
                        </div>
                    </main>
                    <div class="status-history-appointments">
                        <p class="status">${agendamento.status}</p>
                    </div>
                </div>
            `).join("")
            : `<p class="empty-history">Este cliente ainda não possui agendamentos.</p>`;

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
                                <p class="info-registration-fingers">${clienteSelecionado.nome}</p>
                            </div>

                            <div class="group-info-registration-fingers">
                                <div class="info-registration-fingers">
                                    <span class="info-registration-fingers">Genero</span>
                                    <p class="info-registration-fingers">${clienteSelecionado.genero}</p>
                                </div>

                                <div class="info-registration-fingers">
                                    <span class="info-registration-fingers">Data de nascimento</span>
                                    <p class="info-registration-fingers">${clienteSelecionado.dataNascimento}</p>
                                </div>

                                <div class="info-registration-fingers">
                                    <span class="info-registration-fingers">Email</span>
                                    <p class="info-registration-fingers">${clienteSelecionado.email || "Não informado"}</p>
                                </div>

                                <div class="info-registration-fingers">
                                    <span class="info-registration-fingers">Telefone</span>
                                    <p class="info-registration-fingers">${clienteSelecionado.telefone || "Não informado"}</p>
                                </div>
                            </div>
                        </section>
                    </section>
                    <card-next-service
                        appointment-id="${proximo?.id || ''}"
                        nome="${clienteSelecionado.nome}"
                        data="${proximo?.data || ''}"
                        horario="${proximo?.horario || ''}"
                        servico="${proximo?.servico || ''}"
                        room="${proximo?.sala || ''}"
                        status="${proximo?.status || ''}"
                        duracao="${proximo?.duracao || ''} min">
                    </card-next-service>
                </section>

                <section class="section-registration-observations">
                    <header class="header-registration-observations">
                        <h4 class="title-registration-observations">Observações</h4>
                    </header>

                    <p class="info-registration-observations">${clienteSelecionado.observacoes || "Sem observações."}</p>
                </section>

                <section class="section-history-appointments">
                    <header class="header-history-appointments">
                        <h4 class="title-history-appointments">Histórico de agendamentos</h4>
                        <p>Agendamentos passados com você.</p>
                    </header>

                    <div class="group-history-appointments">
                        ${historicoHTML}
                    </div>
                </section>
            </main>
        `;

    }

    
}

customElements.define('main-client-detail', MainClientDetail);