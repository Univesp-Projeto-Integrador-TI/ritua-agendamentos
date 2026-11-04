const clientes = [
    {
        id: 1,
        nome: "Ana Souza",
        email: "ana.souza@email.com",
        telefone: "(11) 98765-4321",
        proximoAtendimento: {
            data: "05/11/2026",
            horario: "10:00",
            servico: "Massagem relaxante",
            duracao: 60
        }
    },
    {
        id: 2,
        nome: "Maria Oliveira",
        email: "maria.oliveira@email.com",
        telefone: "(11) 97654-3210",
        proximoAtendimento: null
    },
    {
        id: 3,
        nome: "João Silva",
        email: "joao.silva@email.com",
        telefone: "(11) 96543-2109",
        proximoAtendimento: {
            data: "06/11/2026",
            horario: "11:00",
            servico: "Massagem relaxante",
            duracao: 60
        }
    },
    {
        id: 4,
        nome: "Ana Souza",
        email: "ana.souza@email.com",
        telefone: "(11) 98765-4321",
        proximoAtendimento: {
            data: "05/11/2026",
            horario: "10:00",
            servico: "Massagem relaxante",
            duracao: 60
        }
    },
    {
        id: 5,
        nome: "Maria Oliveira",
        email: "maria.oliveira@email.com",
        telefone: "(11) 97654-3210",
        proximoAtendimento: null
    },
    {
        id: 6,
        nome: "João Silva",
        email: "joao.silva@email.com",
        telefone: "(11) 96543-2109",
        proximoAtendimento: {
            data: "06/11/2026",
            horario: "11:00",
            servico: "Massagem relaxante",
            duracao: 60
        }
    }, 
    {
        id: 7,
        nome: "Ana Souza",
        email: "ana.souza@email.com",
        telefone: "(11) 98765-4321",
        proximoAtendimento: {
            data: "05/11/2026",
            horario: "10:00",
            servico: "Massagem relaxante",
            duracao: 60
        }
    },
    {
        id: 8,
        nome: "Maria Oliveira",
        email: "maria.oliveira@email.com",
        telefone: "(11) 97654-3210",
        proximoAtendimento: null
    },
    {
        id: 9,
        nome: "João Silva",
        email: "joao.silva@email.com",
        telefone: "(11) 96543-2109",
        proximoAtendimento: {
            data: "06/11/2026",
            horario: "11:00",
            servico: "Massagem relaxante",
            duracao: 60
        }
    },
    {
        id: 10,
        nome: "Ana Souza",
        email: "ana.souza@email.com",
        telefone: "(11) 98765-4321",
        proximoAtendimento: {
            data: "05/11/2026",
            horario: "10:00",
            servico: "Massagem relaxante",
            duracao: 60
        }
    },
    {
        id: 11,
        nome: "Maria Oliveira",
        email: "maria.oliveira@email.com",
        telefone: "(11) 97654-3210",
        proximoAtendimento: null
    },
    {
        id: 12,
        nome: "Rhuan Carlos",
        email: "rhuan.carlos@email.com",
        telefone: "(11) 96543-2109",
        proximoAtendimento: {
            data: "06/11/2026",
            horario: "11:00",
            servico: "Massagem relaxante",
            duracao: 60
        }
    },
    {
        id: 13,
        nome: "Guilherme Santos",
        email: "guilherme.santos@email.com",
        telefone: "(11) 96543-2109",
        proximoAtendimento: {
            data: "06/11/2026",
            horario: "11:00",
            servico: "Massagem relaxante",
            duracao: 60
        }
    }
];

const appointments = [
    {
        initialHour: "10:00",
        finalHour: "11:00",
        data: "22/10/2026",
        clientId: 7,
        service: "Massagem relaxante",
        duration: 60,
        room: "Sala Bambu",
        reservation: "09:45-11:15",
        status: "Confirmado"
    },
    {
        initialHour: "11:30",
        finalHour: "12:30",
        data: "20/10/2026",
        clientId: 8,
        service: "Drenagem linfática",
        duration: 60,
        room: "Sala Orquídea",
        reservation: "11:15-12:45",
        status: "Agendado"
    },
    {
        initialHour: "14:00",
        finalHour: "15:00",
        data: "19/10/2026",
        clientId: 9,
        service: "Massagem terapêutica",
        duration: 60,
        room: "Sala Bambu",
        reservation: "13:45-15:15",
        status: "Confirmado"
    },
    {
        initialHour: "09:00",
        finalHour: "10:00",
        data: "19/10/2026",
        clientId: 11,
        service: "Massagem terapêutica",
        duration: 60,
        room: "Sala Ipê",
        reservation: "08:30-11:00",
        status: "Agendado"
    },
    {
        initialHour: "09:00",
        finalHour: "10:00",
        data: "18/10/2026",
        clientId: 11,
        service: "Massagem terapêutica",
        duration: 45,
        room: "Sala Ipê",
        reservation: "10:00-11:00",
        status: "Confirmado"
    },
    {
        initialHour: "09:00",
        finalHour: "10:00",
        data: "18/10/2026",
        clientId: 12,
        service: "Massagem relaxante",
        duration: 50,
        room: "Sala Ipê",
        reservation: "15:00-16:00",
        status: "Confirmado"
    }
];


class MainClientDetail extends HTMLElement {
    connectedCallback() {
        const parametrosURL = new URLSearchParams(window.location.search);
        const idCliente = Number(parametrosURL.get("id"));

        const subheader = document.querySelector("subheader-ritua");
        subheader.setAttribute("client-id", idCliente);

        const clienteSelecionado = clientes.find(
            cliente => cliente.id === idCliente
        );

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

        const historicoCliente = appointments.filter(
            agendamento => agendamento.clientId === idCliente
        );

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
                                    <p class="info-registration-fingers">${clienteSelecionado.email}</p>
                                </div>

                                <div class="info-registration-fingers">
                                    <span class="info-registration-fingers">Telefone</span>
                                    <p class="info-registration-fingers">${clienteSelecionado.telefone}</p>
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

                    <p class="info-registration-observations">${clienteSelecionado.observacoes}</p>
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