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
            </main>
        `;
    }
}

customElements.define('main-client-detail', MainClientDetail);