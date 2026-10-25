const appointments = [
    {
        initialHour: "10:00",
        finalHour: "11:00",
        data: "22/10/2026",
        client: "Ana Souza",
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
        client: "Maria Oliveira",
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
        client: "Julia Santos",
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
        client: "Guilherme Manso",
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
        client: "Ruan Carlos",
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
        client: "Julia Claudia",
        service: "Massagem relaxante",
        duration: 50,
        room: "Sala Ipê",
        reservation: "15:00-16:00",
        status: "Confirmado"
    }
];

class createAppointmentsDay extends HTMLElement {
    connectedCallback(){
        this.innerHTML = `
            <section class="container-appointments-day">
                <header class="header-appointments-day">
                    <div class="info-header-appointments-day">
                        <h3 class="current-date-appointments"></h3>
                        <span>Hoje · 3 atendimentos · 3h30 de cuidado</span>
                    </div>
                </header>

                <section class="group-cards-appointments-day">
                </section>

                <section class="info-section-appointments-day">
                    <svg width="13" height="15" viewBox="0 0 13 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4.13305 7.46687L5.46625 8.80025L8.13265 6.13349M11.4656 8.13386C11.4656 11.4673 9.13255 13.134 6.35949 14.1007C6.21428 14.1499 6.05655 14.1476 5.91287 14.0941C3.13315 13.134 0.800049 11.4673 0.800049 8.13386V3.46704C0.800049 3.29022 0.87028 3.12065 0.995292 2.99562C1.1203 2.87059 1.28986 2.80035 1.46665 2.80035C2.79985 2.80035 4.46635 2.00033 5.62623 0.98696C5.76746 0.866289 5.9471 0.799988 6.13285 0.799988C6.31859 0.799988 6.49824 0.866289 6.63946 0.98696C7.80601 2.00699 9.46585 2.80035 10.799 2.80035C10.9758 2.80035 11.1454 2.87059 11.2704 2.99562C11.3954 3.12065 11.4656 3.29022 11.4656 3.46704V8.13386Z" stroke="#3E4228" stroke-width="1.6" stroke-linecap="round"/>
                    </svg>

                    <p>Todos os atendimentos têm uma reserva confirmada vinculada.</p>
                </section>
            </section>
        `;

        // Escuta as informações recebidas e filtradas de calendar-main-ritua.js
        document.addEventListener("date-selected", event => {
            this.renderAppointments(event.detail.date);
        });

        //Criando a data atual
        const date = new Date();

        //Atualiza o cabeçalho da seção
        this.querySelector(".current-date-appointments").textContent =
            date.toLocaleDateString("pt-BR", {
                weekday: "long",
                month: "long",
                day: "numeric"
            }).replace("-feira", "");

        //Mostra os agendamentos de hoje
        this.renderAppointments(date);
    };

    // Recebe as informações seleciondas de calendar-main-ritua.js
    renderAppointments(selectedDate) {
        const formattedDate = [
            String(selectedDate.getDate()).padStart(2, "0"),
            String(selectedDate.getMonth() + 1).padStart(2, "0"),
            selectedDate.getFullYear()
        ].join("/");

        const filteredAppointments = appointments.filter(appointment => {
            return appointment.data === formattedDate;
        });

        //Mostra os agendamentos da data selecionada
        this.renderCards(filteredAppointments);
    }

    renderCards(appointmentsToShow) {
        const listCards = this.querySelector(
            ".group-cards-appointments-day"
        );

        listCards.innerHTML = "";

        if (appointmentsToShow.length === 0) {
            listCards.innerHTML = `
                <div class="section-empty-appointments">
                    <div class="icon-calendar">
                        <svg width="26" height="23" viewBox="0 0 26 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <mask id="stroke0_76_229" fill="white">
                                <path d="M2.88889 5.96046e-06H4.33333H21.6667H23.1111C25.037 5.96046e-06 26 0.866673 26 2.60001V6.50001V19.5C26 21.2333 25.037 22.1 23.1111 22.1H2.88889C0.962963 22.1 0 21.2333 0 19.5V6.50001V2.60001C0 0.866673 0.962963 5.96046e-06 2.88889 5.96046e-06Z"/>
                            </mask>
                            <path d="M5.08333 -3.89999C5.08333 -4.31421 4.74755 -4.64999 4.33333 -4.64999C3.91912 -4.64999 3.58333 -4.31421 3.58333 -3.89999H4.33333H5.08333ZM3.58333 2.60001C3.58333 3.01422 3.91912 3.35001 4.33333 3.35001C4.74755 3.35001 5.08333 3.01422 5.08333 2.60001H4.33333H3.58333ZM22.4167 -3.89999C22.4167 -4.31421 22.0809 -4.64999 21.6667 -4.64999C21.2525 -4.64999 20.9167 -4.31421 20.9167 -3.89999H21.6667H22.4167ZM20.9167 2.60001C20.9167 3.01422 21.2525 3.35001 21.6667 3.35001C22.0809 3.35001 22.4167 3.01422 22.4167 2.60001H21.6667H20.9167ZM0 5.75001C-0.414214 5.75001 -0.75 6.08579 -0.75 6.50001C-0.75 6.91422 -0.414214 7.25001 0 7.25001V6.50001V5.75001ZM26 7.25001C26.4142 7.25001 26.75 6.91422 26.75 6.50001C26.75 6.08579 26.4142 5.75001 26 5.75001V6.50001V7.25001ZM8.66667 13.55C8.25245 13.55 7.91667 13.8858 7.91667 14.3C7.91667 14.7142 8.25245 15.05 8.66667 15.05V14.3V13.55ZM17.3333 15.05C17.7475 15.05 18.0833 14.7142 18.0833 14.3C18.0833 13.8858 17.7475 13.55 17.3333 13.55V14.3V15.05ZM4.33333 -3.89999H3.58333V5.96046e-06H4.33333H5.08333V-3.89999H4.33333ZM4.33333 5.96046e-06H3.58333V2.60001H4.33333H5.08333V5.96046e-06H4.33333ZM21.6667 -3.89999H20.9167V5.96046e-06H21.6667H22.4167V-3.89999H21.6667ZM21.6667 5.96046e-06H20.9167V2.60001H21.6667H22.4167V5.96046e-06H21.6667ZM0 6.50001V7.25001H26V6.50001V5.75001H0V6.50001ZM8.66667 14.3V15.05H17.3333V14.3V13.55H8.66667V14.3ZM2.88889 5.96046e-06V1.50001H4.33333V5.96046e-06V-1.49999H2.88889V5.96046e-06ZM4.33333 5.96046e-06V1.50001H21.6667V5.96046e-06V-1.49999H4.33333V5.96046e-06ZM21.6667 5.96046e-06V1.50001H23.1111V5.96046e-06V-1.49999H21.6667V5.96046e-06ZM23.1111 5.96046e-06V1.50001C23.8796 1.50001 24.1759 1.67633 24.2743 1.76495C24.3427 1.82652 24.5 2.00777 24.5 2.60001H26H27.5C27.5 1.45891 27.1758 0.340157 26.2812 -0.464935C25.4167 -1.24299 24.2686 -1.49999 23.1111 -1.49999V5.96046e-06ZM26 2.60001H24.5V6.50001H26H27.5V2.60001H26ZM26 6.50001H24.5V19.5H26H27.5V6.50001H26ZM26 19.5H24.5C24.5 20.0922 24.3427 20.2735 24.2743 20.3351C24.1759 20.4237 23.8796 20.6 23.1111 20.6V22.1V23.6C24.2686 23.6 25.4167 23.343 26.2812 22.5649C27.1758 21.7599 27.5 20.6411 27.5 19.5H26ZM23.1111 22.1V20.6H2.88889V22.1V23.6H23.1111V22.1ZM2.88889 22.1V20.6C2.12041 20.6 1.82413 20.4237 1.72567 20.3351C1.65725 20.2735 1.5 20.0922 1.5 19.5H0H-1.5C-1.5 20.6411 -1.17577 21.7599 -0.281225 22.5649C0.583275 23.343 1.73144 23.6 2.88889 23.6V22.1ZM0 19.5H1.5V6.50001H0H-1.5V19.5H0ZM0 6.50001H1.5V2.60001H0H-1.5V6.50001H0ZM0 2.60001H1.5C1.5 2.00777 1.65725 1.82652 1.72567 1.76495C1.82413 1.67633 2.12041 1.50001 2.88889 1.50001V5.96046e-06V-1.49999C1.73145 -1.49999 0.583275 -1.24299 -0.281225 -0.464935C-1.17577 0.340157 -1.5 1.45891 -1.5 2.60001H0Z" fill="#3E4228" mask="url(#stroke0_76_229)"/>
                        </svg>
                    </div>

                    <div class="text-empty-appointments">
                        <p>Nenhum atendimento neste dia!</p>
                        <p>Você não possuí agendamentos para o dia selecionado.</p>
                    </div>
                </div>
            `;

            return;
        }

        appointmentsToShow.forEach(agendamento => {
            listCards.innerHTML += `
                <div class="card-appointments-day">
                    <div class="service-time-card">
                        <p class="initial-hour-card">${agendamento.initialHour}</p>
                        <p class="final-hour-card">${agendamento.finalHour}</p>
                    </div>

                    <span class="line-card-appointments"></span>

                    <div class="detail-appointments-card">
                        <p class="name-client-card">${agendamento.client}</p>
                        <span>${agendamento.service} · ${agendamento.duration} min</span>
                        <span>${agendamento.room} · reserva ${agendamento.reservation}</span>
                    </div>

                    <div class="info-appointments-card">
                        <p class="status-appointments-card">${agendamento.status}</p>
                        <a href="more-detail.html">Ver detalhes</a>
                    </div>
                </div>
            `;
        });
    }
}

customElements.define('section-appointments-day', createAppointmentsDay);

