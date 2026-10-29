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

        
    }
}

customElements.define('subheader-ritua', createSubHeader);