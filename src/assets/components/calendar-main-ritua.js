class createCalendar extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <section class="section-calendar">

                <header class="calendar-header">
                    <div class="label-calendar-header">
                        <h2 class="calendar-title">Minha agenda</h2>
                        <button class="btn-current-date">Hoje</button>
                    </div>

                    <div class="calendar-navigation">
                        <p id="calendar-current-month" class="calendar-current-month">...</p>

                        <div class="calendar-navigation-buttons">
                            <button class="btn-calendar calendar-prev">
                                <svg width="7" height="11" viewBox="0 0 7 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5.63135 9.80005L1.13135 5.30005L5.63135 0.800049" stroke="#3E4228" stroke-width="1.6" stroke-linecap="round"/>
                                </svg>
                            </button>

                            <button class="btn-calendar calendar-next">
                                <svg width="7" height="11" viewBox="0 0 7 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M0.800049 9.80005L5.30005 5.30005L0.800049 0.800049" stroke="#3E4228" stroke-width="1.6" stroke-linecap="round"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </header>

                <section class="calendar">
                    <div class="calendar-weekdays">
                        <span>DOM</span>
                        <span>SEG</span>
                        <span>TER</span>
                        <span>QUA</span>
                        <span>QUI</span>
                        <span>SEX</span>
                        <span>SÁB</span>
                    </div>

                    <div class="calendar-days"></div>
                </section>
            </section>
        `;
        //Incia a variável da data atual
        this.currentDate = new Date();

        // Botões para avançar o mês e retornar o mês atual
        this.querySelector(".calendar-prev").addEventListener("click", () => {
            this.currentDate.setMonth(
                this.currentDate.getMonth() -1
            );

            this.renderCalendar();
        });

        this.querySelector(".calendar-next").addEventListener("click", () => {
            this.currentDate.setDate(1)

            this.currentDate.setMonth(
                this.currentDate.getMonth() + 1
            );

            this.renderCalendar();
        });

        this.querySelector(".btn-current-date").addEventListener("click", () => {
            this.currentDate = new Date();
            this.renderCalendar();
        });

        this.renderCalendar()
    }

    renderCalendar(){
        // Atualizando o subtitulo do calendário
        const date = this.currentDate;

        this.querySelector("#calendar-current-month").textContent =
            date.toLocaleDateString("pt-BR", {
                month: "long",
                year: "numeric"
            });

        //Limpar os dias anteriores
        const calendarDays = this.querySelector(".calendar-days");
        calendarDays.innerHTML = "";

        // Criando o calendário
        const firstDay = new Date(
            date.getFullYear(),
            date.getMonth(),
            1
        );

        const startDay = firstDay.getDay();

        const totalDays = new Date(
            date.getFullYear(),
            date.getMonth() + 1,
            0
        ).getDate();


        // Dias restantes do mês anterior
        const previousMonthLastDay = new Date(
            date.getFullYear(),
            date.getMonth(),
            0
        ).getDate();

        
        for (let i = startDay - 1; i >= 0; i--){
            const day = previousMonthLastDay -i
            calendarDays.innerHTML += `<span class="days-datail-final calendar-day">${day}</span>`
        }

        // Dias do mês atual
        const today = new Date();
        
        for (let day = 1; day <= totalDays; day++) {
            if(day === date.getDate() && today.getMonth() === date.getMonth() && today.getFullYear() === date.getFullYear()){
                calendarDays.innerHTML += `<span class="today calendar-day">${day}</span>`
            } else {
                calendarDays.innerHTML += `<span class="calendar-day">${day}</span>`
            };
        }

        //Dias do mês que vem
        const remainingDays = (7 - ((startDay + totalDays) % 7)) % 7;

        for (let day = 1; day <= remainingDays; day++) {
            calendarDays.innerHTML +=
                `<span class="days-datail-final calendar-day">${day}</span>`;
        }
    }
}

customElements.define('calendar-main-ritua', createCalendar);


