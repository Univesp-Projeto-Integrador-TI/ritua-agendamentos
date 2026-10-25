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

