class createCardNextService extends HTMLElement {
    connectedCallback(){
        this.innerHTML = `
            <section class="container-card-next-service">
                <header class="header-card-next-service">
                    <div class="info-header-card-next-service">
                        <span>PROXÍMO AGENDAMENTO</span>
                        <svg width="19" height="22" viewBox="0 0 19 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11.6323 7.88072V5.13338C11.6323 3.98411 12.0888 2.88191 12.9014 2.06925C13.714 1.25659 14.816 0.800049 15.9652 0.800049H17.59C17.7337 0.800049 17.8714 0.857117 17.973 0.958699C18.0746 1.06028 18.1316 1.19806 18.1316 1.34172V2.96672C18.1316 4.11599 17.6751 5.21819 16.8626 6.03085C16.05 6.8435 14.9479 7.30005 13.7987 7.30005C12.6496 7.30005 11.5475 7.7566 10.7349 8.56925C9.92235 9.38191 9.46585 10.4841 9.46585 11.6334M9.46585 11.6334C9.46585 13.8 10.5491 14.8834 10.5491 17.05C10.5491 18.2221 10.169 19.3624 9.46585 20.3M9.46585 11.6334C9.46585 10.6274 9.18576 9.64138 8.65695 8.78567C8.12815 7.92997 7.37154 7.23844 6.47189 6.78857C5.57224 6.3387 4.5651 6.14827 3.56333 6.23861C2.56155 6.32894 1.60472 6.69649 0.800049 7.30005C0.800049 8.30599 1.08014 9.29206 1.60894 10.1478C2.13774 11.0035 2.89436 11.695 3.79401 12.1449C4.69366 12.5947 5.7008 12.7852 6.70257 12.6948C7.70435 12.6045 8.66118 12.2369 9.46585 11.6334ZM1.88327 20.3H17.0484" stroke="#9A9E80" stroke-width="1.6" stroke-linecap="round"/>
                        </svg>
                    </div>
                    <div class="detail-header-card-next-service">
                        <h2 class="txt-name-client">Ana Souza</h2>
                        <span class="info-service">Massagem relaxante · 60 min</span>
                    </div>
                </header>

                <div class="detail-card-next-service">
                    <span class="info-card-next-service">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 1.49939V4.49963M12 1.49939V4.49963M2.25 7.49987H15.75M6 10.5001H6.0075M9 10.5001H9.0075M12 10.5001H12.0075M6 13.5003H6.0075M9 13.5003H9.0075M12 13.5003H12.0075M3.75 2.99951H14.25C15.0784 2.99951 15.75 3.67114 15.75 4.49963V15.0005C15.75 15.829 15.0784 16.5006 14.25 16.5006H3.75C2.92157 16.5006 2.25 15.829 2.25 15.0005V4.49963C2.25 3.67114 2.92157 2.99951 3.75 2.99951Z" stroke="#FFFFF1" stroke-width="1.6" stroke-linecap="round"/>
                        </svg>
                        <p>Hoje, 05 out · 10:00–11:00</p>
                    </span>

                    <span class="info-card-next-service">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8.25005 15.0007H1.49951M14.2505 15.0009L9.18163 16.2677C9.07108 16.2952 8.95571 16.2973 8.84426 16.2736C8.73281 16.2499 8.62823 16.2012 8.53843 16.131C8.44864 16.0609 8.376 15.9713 8.32604 15.8689C8.27607 15.7665 8.25008 15.6541 8.25005 15.5402V3.42217C8.2502 3.1943 8.30226 2.96871 8.40229 2.76396C8.50232 2.55922 8.64768 2.37996 8.82734 2.23978C9.007 2.0996 9.21624 2.00219 9.43917 1.95495C9.6621 1.90771 9.89287 1.91188 10.114 1.96714L13.1142 2.71715C13.4387 2.79827 13.7268 2.98553 13.9327 3.24916C14.1386 3.5128 14.2505 3.83768 14.2505 4.17218V15.0009ZM14.2505 15.0009L16.5007 15.0007M8.25005 3.00051H5.99987C5.60201 3.00051 5.22045 3.15855 4.93913 3.43986C4.6578 3.72117 4.49975 4.10271 4.49975 4.50054V15.0007M10.5002 9.00063H10.5077" stroke="#FFFFF1" stroke-width="1.6" stroke-linecap="round"/>
                        </svg>
                        <p>Sala Bambu</p>
                        <span class="status-card-next-service">Confirmado</span>
                    </span>
                </div>

                <div class="link-card-next-service">
                    <a href="agendamento.html">
                        Ver agendamento
                        <svg width="9" height="9" viewBox="0 0 9 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7.88225 7.88225V0.800049H0.800049M7.88225 0.800049L0.800049 7.88225" stroke="#FFFFF1" stroke-width="1.6" stroke-linecap="round"/>
                        </svg>
                    </a>
                </div>
            </section>
        `;
    };
}

customElements.define("card-next-service", createCardNextService)