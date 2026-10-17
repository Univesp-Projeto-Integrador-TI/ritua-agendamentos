const appointments = [
    { date: "12/10/2026" },
    { date: "12/10/2026" },
    { date: "13/10/2026" },
    { date: "15/10/2026" },
    { date: "15/10/2026" },
    { date: "15/10/2026" },
    { date: "16/10/2026" },
    { date: "09/09/2026" },
    { date: "10/09/2026" },
    { date: "11/09/2026" }
];

class createCardWeekRhythm extends HTMLElement {
    connectedCallback(){
        this.innerHTML = `
            <section class="card-week-rhythm">
                <header class="header-week-rhythm">
                    <p class="title-week-rhythm">Seu ritmo na semana</p>
                    <span class="info-week-rhythm"></span>
                </header>

                <section class="section-chart-week-rhythm">
                    <div class="group-chart-bars">
                        
                    </div>
                </section>

                <p class="analysis-chart-week-rhyth">Segunda e quarta concentram sua agenda.</p>
            </section>
        `
        //Inserindo a data no card.
        const currentDate = new Date();

        const daySinceModay = currentDate.getDay() > 0 ? currentDate.getDay() - 1 : currentDate.getDay() + 6;
        const dateMondayPrevious = currentDate.getDate() - daySinceModay;
        const dateMonday = new Date(currentDate.getFullYear(), currentDate.getMonth(), dateMondayPrevious);
        const dateSunday = new Date(dateMonday);
        dateSunday.setHours(23, 59, 59, 999);
        dateSunday.setDate(dateSunday.getDate() + 6);

        const formatDate = 
            dateMonday.toLocaleDateString("pt-BR", {
                day: "numeric"
            }).replace(".", "") + "-" +

            dateSunday.toLocaleDateString("pt-BR", {
                day: "numeric",
                month: "short"
            }).replace(".", "")

        //Percorrendo os agendamentos
        const arrayDate = [
            { day: "seg", count: 0 },
            { day: "ter", count: 0 },
            { day: "qua", count: 0 },
            { day: "qui", count: 0 },
            { day: "sex", count: 0 },
            { day: "sáb", count: 0 },
            { day: "dom", count: 0 }
        ];

        const createChart = () => {
            appointments.forEach(agendamento => {
                const splitDate = agendamento.date.split("/");

                const createDate = new Date(
                    Number(splitDate[2]), 
                    Number(splitDate[1]) - 1, 
                    Number(splitDate[0])
                );

                //Validando se é da semana atual.
                if(createDate >= dateMonday && createDate <= dateSunday) {
                    const weekDay = createDate.toLocaleDateString("pt-BR", {
                        weekday: "short"
                    }).replace(".", "").toLowerCase();

                    const appointmentsWeekDay = arrayDate.find(e => e.day === weekDay);
                    
                    if (appointmentsWeekDay) {
                        appointmentsWeekDay.count++;
                    }
                }
            });       
            
            const maxAppointments = Math.max(
                ...arrayDate.map(dia => dia.count)
            );

            let elementChartBars = this.querySelector(".group-chart-bars");
            elementChartBars.innerHTML = "";

            arrayDate.forEach(dia => {
                const height = dia.count === 0
                    ? 4
                    : (dia.count / maxAppointments) * 55;

                //Barra do dia atual
                const currentWeekDay = currentDate.toLocaleDateString("pt-BR", {
                    weekday:"short"
                }).replace(".", "").toLowerCase();

                const barClassCurrentWeek = dia.day === currentWeekDay ? "chart-bar today" : "chart-bar";

                elementChartBars.innerHTML += `
                    <div class="chart-day">
                        <div class="chart-bar-area">
                            <span class="chart-count">${dia.count}</span>
                            <div class="${barClassCurrentWeek}" style="height: ${height}%"></div>
                        </div>
                        <span class="chart-label">${dia.day}</span>
                    </div>
                `;
                console.log(dia.day, dia.count);
            });

            
        };

        createChart();

        //Insere o subtitule com informações no card.
        const totalAppointments = () => {
            const totalValue = arrayDate.reduce(
                (total, dia) => total + dia.count,
                0
            );

            const formatValue = totalValue === 1 ? `${totalValue} agendamento` : `${totalValue} agendamentos`;
            return formatValue;
        };

        let elementDateHTML = this.querySelector(".info-week-rhythm");
        elementDateHTML.innerHTML += `${formatDate} · ${totalAppointments()}`;
    };
};


customElements.define("card-week-rhythm", createCardWeekRhythm);