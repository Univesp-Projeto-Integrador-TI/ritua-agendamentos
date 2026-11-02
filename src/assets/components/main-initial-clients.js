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

class MainInicialClientes extends HTMLElement {
    itensPorPagina = 6;
    paginaAtual = 1;
    clientesFiltrados = clientes;

    connectedCallback() {
        this.innerHTML = `
            <main class="main-inicial-clientes">
            
                <section class="section-tabela-clientes">
                    <header class="header-tabela-clientes">
                        <h4 class="quantidade-clientes">0 clientes</h4>

                        <span class="ordenacao-clientes">
                            Nome A-Z
                        </span>
                    </header>

                    <div class="content-busca-clientes">
                        <input type="search" class="input-busca-clientes" placeholder="Buscar nome do cliente" aria-label="Buscar clientes por nome ou contato">
                        <div class="icon-busca-clientes">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14.2999 14.3002L11.0449 11.0452M12.7998 6.80005C12.7998 10.1138 10.1135 12.8 6.7998 12.8C3.4861 12.8 0.799805 10.1138 0.799805 6.80005C0.799805 3.48634 3.4861 0.800049 6.7998 0.800049C10.1135 0.800049 12.7998 3.48634 12.7998 6.80005Z" stroke-width="1.6" stroke-linecap="round" stroke="#747767"/>
                            </svg>
                        </div>

                    </div>

                    <div class="container-tabela-clientes">
                        <table class="tabela-clientes">
                            <thead>
                                <tr>
                                    <th>CLIENTE</th>
                                    <th>CONTATO</th>
                                    <th>PRÓXIMO ATENDIMENTO</th>
                                    <th>DETALHES</th>
                                </tr>
                            </thead>

                            <tbody class="body-tabela-clientes">
                                 <!-- Renderizar clientes -->
                            </tbody>

                        </table>
                    </div>

                    <footer class="footer-tabela-clientes">
                        
                    </footer>
                </section>
            </main>
        `;

        const inputBusca = this.querySelector(".input-busca-clientes");

        inputBusca.addEventListener("input", (event) => {
            this.filtrarClientes(event.target.value);
        });

        this.renderizarClientes();
    }

    renderizarPaginacao(totalPaginas) {
        const footer = this.querySelector(".footer-tabela-clientes");

        if (totalPaginas <= 1) {
            footer.innerHTML = "";
            return;
        }

        let botoesPaginas = "";

        for (let pagina = 1; pagina <= totalPaginas; pagina++) {
            botoesPaginas += `
                <button
                    type="button"
                    class="${pagina === this.paginaAtual ? "pagina-atual" : ""}"
                    data-pagina="${pagina}"
                    ${pagina === this.paginaAtual ? 'aria-current="page"' : ""}
                >
                    ${pagina}
                </button>
            `;
        }

        footer.innerHTML = `
            <span class="informacao-paginacao">
                Página ${this.paginaAtual} de ${totalPaginas}
            </span>

            <nav class="paginacao-clientes" aria-label="Paginação dos clientes">
                <button
                    type="button"
                    data-acao="anterior"
                    ${this.paginaAtual === 1 ? "disabled" : ""}
                    aria-label="Página anterior"
                >
                    &lt;
                </button>

                ${botoesPaginas}

                <button
                    type="button"
                    data-acao="proxima"
                    ${this.paginaAtual === totalPaginas ? "disabled" : ""}
                    aria-label="Próxima página"
                >
                    &gt;
                </button>
            </nav>
        `;

        footer.querySelectorAll("[data-pagina]").forEach(botao => {
            botao.addEventListener("click", () => {
                this.paginaAtual = Number(botao.dataset.pagina);
                this.renderizarClientes();
            });
        });

        footer.querySelector('[data-acao="anterior"]').addEventListener("click", () => {
            if (this.paginaAtual > 1) {
                this.paginaAtual--;
                this.renderizarClientes();
            }
        });

        footer.querySelector('[data-acao="proxima"]').addEventListener("click", () => {
            if (this.paginaAtual < totalPaginas) {
                this.paginaAtual++;
                this.renderizarClientes();
            }
        });
    }


    filtrarClientes(termo) {
        const termoBusca = termo.trim().toLowerCase();

        this.clientesFiltrados = clientes.filter(cliente => {
            return (
                cliente.nome.toLowerCase().includes(termoBusca) ||
                cliente.email.toLowerCase().includes(termoBusca) ||
                cliente.telefone.includes(termoBusca)
            );
        });

        this.paginaAtual = 1;

        this.renderizarClientes();
    }   

    renderizarClientes(clientesRenderizados = this.clientesFiltrados) {
        const tbody = this.querySelector(".body-tabela-clientes");

        const quantidadeClientes = this.querySelector(".quantidade-clientes");

        quantidadeClientes.textContent =
            `${clientesRenderizados.length} ${clientesRenderizados.length === 1 ? "cliente" : "clientes"}`;

        if (clientesRenderizados.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="mensagem-sem-clientes">
                        <div class="content-sem-clientes">
                            <div class="icon-sem-clientes">
                                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M13.5006 15.75C13.5006 14.1587 12.8684 12.6326 11.7431 11.5074C10.6178 10.3821 9.09149 9.75 7.50005 9.75M7.50005 9.75C5.90861 9.75 4.38235 10.3821 3.25703 11.5074C2.13171 12.6326 1.49951 14.1587 1.49951 15.75M7.50005 9.75C9.5713 9.75 11.2504 8.07107 11.2504 6C11.2504 3.92893 9.5713 2.25 7.50005 2.25C5.4288 2.25 3.74971 3.92893 3.74971 6C3.74971 8.07107 5.4288 9.75 7.50005 9.75ZM16.5007 15.0001C16.5007 12.4726 15.0006 10.1251 13.5004 9.00015C13.9936 8.63022 14.3879 8.14446 14.6485 7.58585C14.9091 7.02723 15.028 6.413 14.9946 5.7975C14.9612 5.182 14.7766 4.58421 14.4571 4.05705C14.1376 3.52988 13.6931 3.08959 13.1629 2.77515" stroke="#FFFFF1" stroke-width="1.6" stroke-linecap="round"/>
                                </svg>
                            </div>

                            <p>
                                Ops! Nenhum cliente encontrado.
                                Adicione novos clientes para começar a gerenciar.
                            </p>
                        </div>
                    </td>
                </tr>
            `;

            this.querySelector(".footer-tabela-clientes").innerHTML = "";

            return;
        }

        const totalPaginas = Math.ceil(
            clientesRenderizados.length / this.itensPorPagina
        );

        if (this.paginaAtual > totalPaginas) {
            this.paginaAtual = totalPaginas;
        }

        const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
        const fim = inicio + this.itensPorPagina;

        const clientesDaPagina = clientesRenderizados.slice(inicio, fim);

        this.renderizarPaginacao(totalPaginas);

        tbody.innerHTML = clientesDaPagina.map(cliente => {
            let atendimento = "";

            if (cliente.proximoAtendimento) {
                const { data, horario, servico, duracao } = cliente.proximoAtendimento;

                const [dia, mes, ano] = data.split("/");
                const dataFormatada = new Date(ano, mes - 1, dia);

                const dataExibicao = dataFormatada.toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short"
                }).replace(".", "");

                const horarioFormatado = `${Number(horario.split(":")[0])}h`;

                atendimento = `
                    <div class="info-proximo-atendimento">
                        <span class="descricao-proximo-atendimento">
                            ${dataExibicao}, ${horarioFormatado} · ${servico}
                        </span>

                        <span class="duracao-atendimento">
                            ${duracao} minutos
                        </span>
                    </div>
                `;
            } else {
                atendimento = `
                    <span class="sem-proximo-atendimento">
                        Sem próximo atendimento
                    </span>
                `;
            }

            return `
                <tr>
                    <td>
                        <div class="info-cliente">
                            <div class="foto-cliente">
                                <img src="/src/assets/images/icon-user.svg" alt="">
                            </div>

                            <span class="nome-cliente">${cliente.nome}</span>
                        </div>
                    </td>

                    <td>
                        <div class="info-contato">
                            <span class="email-cliente">${cliente.email}</span>
                            <span class="telefone-cliente">${cliente.telefone}</span>
                        </div>
                    </td>

                    <td>
                        ${atendimento}
                    </td>

                    <td>
                        <ahref="./user-page.html?id=${encodeURIComponent(cliente.id)}" class="link-detalhes-cliente">
                            Ver detalhes
                        </a>
                    </td>
                </tr>
            `;
        }).join("");
    }
    
}



customElements.define("main-initial-clients", MainInicialClientes);