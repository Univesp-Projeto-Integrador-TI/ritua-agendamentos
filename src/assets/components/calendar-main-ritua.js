class createCalendar extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <section class="section-calendar">

                <header class="calendar-header">
                    <div class="label-calendar-header">
                        <h3 class="calendar-title">Minha agenda</h3>
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
        this.selectedDate = new Date();

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

    // Método centralizador para seleção de datas
    selectDay(year, month, day, calendarDay) {
        const calendarDays = this.querySelector(".calendar-days");
        const selectedDay = calendarDays.querySelector(".day-selected");

        if (selectedDay) {
            selectedDay.classList.remove("day-selected");
        }

        calendarDay.classList.add("day-selected");

        this.selectedDate = new Date(year, month, day);

        this.dispatchEvent(
            new CustomEvent("date-selected", {
                detail: {
                    date: this.selectedDate
                },
                bubbles: true
            })
        );
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

        
        // for (let i = startDay - 1; i >= 0; i--){
        //     const day = previousMonthLastDay -i
        //     calendarDays.innerHTML += `<span class="days-datail-final calendar-day">${day}</span>`
        // }

        function previousMonth(){
            for (let i = startDay - 1; i >= 0; i--) {
                const day = previousMonthLastDay - i;

                const calendarDay = document.createElement("span");

                calendarDay.classList.add("days-datail-final", "calendar-day");
                calendarDay.textContent = day;

                calendarDay.addEventListener("click", () => {
                    const previousMonth = new Date(
                        date.getFullYear(),
                        date.getMonth() - 1,
                        day
                    );

                    this.selectDay(
                        previousMonth.getFullYear(),
                        previousMonth.getMonth(),
                        previousMonth.getDate(),
                        calendarDay
                    );
                });

                calendarDays.appendChild(calendarDay);
            }
        }

        function nextMonth(){ 
            //Dias do mês que vem             
            const remainingDays = (7 - ((startDay + totalDays) % 7)) % 7;

            for (let day = 1; day <= remainingDays; day++) {
                const calendarDay = document.createElement("span");

                calendarDay.classList.add("days-datail-final", "calendar-day");
                calendarDay.textContent = day;

                calendarDay.addEventListener("click", () => {
                    const nextMonth = new Date(
                        date.getFullYear(),
                        date.getMonth() + 1,
                        day
                    );

                    this.selectDay(
                        nextMonth.getFullYear(),
                        nextMonth.getMonth(),
                        nextMonth.getDate(),
                        calendarDay
                    );
                });

                calendarDays.appendChild(calendarDay);
            }
        }

        previousMonth();
        nextMonth();

        // Dias do mês atual
        const today = new Date();
        
        for (let day = 1; day <= totalDays; day++) {
            
            const calendarDay = document.createElement("span");

            if(day === date.getDate() && today.getMonth() === date.getMonth() && today.getFullYear() === date.getFullYear()){
                calendarDay.classList.add("calendar-day");
                calendarDay.classList.add("today");
            } else {
                calendarDay.classList.add("calendar-day");
            };

            calendarDay.textContent = day;
            calendarDay.addEventListener("click", () => {

                const selectedDay = calendarDays.querySelector(".day-selected");

                if(selectedDay){ 
                    selectedDay.classList.remove("day-selected"); 
                }

                calendarDay.classList.add("day-selected");

                this.selectedDate = new Date(
                    date.getFullYear(),
                    date.getMonth(),
                    day
                );

                this.dispatchEvent(
                    new CustomEvent("date-selected", {
                        detail: {
                            date: this.selectedDate
                        },
                        bubbles: true
                    })
                );
            });

            calendarDays.appendChild(calendarDay);
        }
    }
}

customElements.define('calendar-main-ritua', createCalendar);