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

class createSubHeader extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <section class="container-subheader">
                <div class="description-subheader">
                    <p class="description-page"></p>
                    <h1 class="title-page"></h1>
                    <p class="information-page"></p>
                </div>
            </section>
        `;
        const description_page = this.getAttribute("description-page");
        const title_page = this.getAttribute("title-page");
        const information_page = this.getAttribute("information-page");

        this.querySelector(".description-page").textContent = description_page;
        this.querySelector(".title-page").textContent = title_page;
        this.querySelector(".information-page").textContent = information_page;


        
        if (this.hasAttribute("button-back")) {
            const button_back = document.createElement("button");

            button_back.classList.add("button-back");
            button_back.innerHTML = "&#10094 Voltar";

            button_back.addEventListener("click", () => {
                window.location.href = "./clients-page.html";
            });

            this.querySelector(".description-page").replaceWith(button_back);
        }
    }
}

customElements.define('subheader-ritua', createSubHeader);