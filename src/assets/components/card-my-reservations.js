const reservations = [
    {
        nameSala: "Bambu",
        dataReserva: "05/10/2026",
        reservation: "09:45-11:15",
        statusReserva: "Confirmada",
        nameClient: ""
    },
    {
        nameSala: "Ipê",
        dataReserva: "06/10/2026",
        reservation: "12:15-13:00",
        statusReserva: "Reservada",
        nameClient: "Ana Souza"
    },
    {
        nameSala: "Jabuticaba",
        dataReserva: "11/10/2026",
        reservation: "14:35-15:30",
        statusReserva: "Confirmada",
        nameClient: ""
    }
]

class createCardMyResevations extends HTMLElement {
    connectedCallback(){
        this.innerHTML = `
            <section class="section-card-my-resevations">
                <header class="header-my-resevations">
                    <h2 class="title-my-resevations">Minhas reservas</h2>
                </header>

                <section class="group-items-my-resevations">
                </section>

                <footer class="footer-card-my-resevations">
                    <p class="info-card-my-resevation">Para agendar um atendimento, escolha uma sala já reservada.</p>

                    <a href="reservas.html" class="btn-reservas-salas">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8.25005 15.0007H1.49951M14.2505 15.0009L9.18163 16.2677C9.07108 16.2952 8.95571 16.2973 8.84426 16.2736C8.73281 16.2499 8.62823 16.2012 8.53843 16.131C8.44864 16.0609 8.376 15.9713 8.32604 15.8689C8.27607 15.7665 8.25008 15.6541 8.25005 15.5402V3.42217C8.2502 3.1943 8.30226 2.96871 8.40229 2.76396C8.50232 2.55922 8.64768 2.37996 8.82734 2.23978C9.007 2.0996 9.21624 2.00219 9.43917 1.95495C9.6621 1.90771 9.89287 1.91188 10.114 1.96714L13.1142 2.71715C13.4387 2.79827 13.7268 2.98553 13.9327 3.24916C14.1386 3.5128 14.2505 3.83768 14.2505 4.17218V15.0009ZM14.2505 15.0009L16.5007 15.0007M8.25005 3.00051H5.99987C5.60201 3.00051 5.22045 3.15855 4.93913 3.43986C4.6578 3.72117 4.49975 4.10271 4.49975 4.50054V15.0007M10.5002 9.00063H10.5077" stroke="#FFFFF1" stroke-width="1.6" stroke-linecap="round"/>
                        </svg>
                        <p>Reservar sala</p>
                    </a>
                </footer>
            </section>
        `;

        reservations.forEach( reservas => {
            const groupReservations = this.querySelector(".group-items-my-resevations")

            // Validação do status da sala
            let statusReservation;
            let infoStatusReservation;
            
            if(reservas.statusReserva === "Confirmada"){
                statusReservation = "";
                infoStatusReservation = `Sem agendamento vinculado`;
            } else {
                statusReservation = "reserved";
                infoStatusReservation = `Vinculado a ${reservas.nameClient}`;
            }
            
            //Formatando data da reserva
            const [dia, mes, ano] = reservas.dataReserva.split("/");
            const data = new Date(ano, mes - 1, dia);
            const formatDate = data.toLocaleDateString("pt-BR", {
                day: "numeric",
                month: "short"
            }).replace(".", "").replace("de", "");

            // Iserção no item
            groupReservations.innerHTML += `
                <div class="item-my-resevations">
                    <img src="src/assets/images/img-exe-ambiente-sala.svg" alt="Imagem do espaço">
                    <div class="content-item-my-resevation">
                        <span class="title-item-my-resevation">
                            <p class="title-item">${reservas.nameSala}</p>
                            <span class="status-item ${statusReservation}">${reservas.statusReserva}</span>
                        </span>
                        <p class="info-room-item">${formatDate} · ${reservas.reservation}</p>
                        <p class="detail-room-item">${infoStatusReservation}</p>
                    </div>
                </div>
            `
        })
    };
};

customElements.define("card-my-reservations", createCardMyResevations);