import { asset } from "../scripts/paths.js";
class ModalEditClient extends HTMLElement {
    abrirComCliente(cliente) {

        const partesData = cliente.dataNascimento.split("/");

        const dataFormatada = `${partesData[2]}-${partesData[1]}-${partesData[0]}`;

        this.querySelector("#genero-cliente").value =cliente.genero.toLowerCase();
        this.querySelector("#nascimento-cliente").value = dataFormatada;
        this.querySelector("#nome-cliente").value = cliente.nome;
        this.querySelector("#email-cliente").value = cliente.email;
        this.querySelector("#telefone-cliente").value = cliente.telefone;

        this.querySelector("#observacoes-cliente").value =
            cliente.observacoes || "";

        
        this.classList.add("modal-open");
    };

    connectedCallback() {
        this.innerHTML = `
            <div class="overlay-modal-client">
                <section class="modal-edit-client" role="dialog" aria-modal="true" aria-labelledby="title-modal-client">
                
                    <header class="header-modal-client">
                        <div class="icon-modal-client">
                            <img src="${asset('icon-user.svg')}" alt="Ícone de cliente">
                        </div>

                        <div class="information-modal-client">
                            <h4 id="title-modal-client">Editar dados do cliente</h4>
                            <p>Edite as informações para organizar seus atendimentos e contatos.</p>                         
                        </div>

                        <button type="button" class="btn-close-modal-client" aria-label="Fechar modal"> &times; </button>
                    </header>

                    <form class="form-edit-client">
                        <p class="form-required-information">* Campos obrigatórios.</p>
            
                        <div class="field-client field-client-full">
                            <label for="nome-cliente">Nome completo *</label>
                            <input type="text" id="nome-cliente" name="nome" placeholder="Digite o nome completo" required>
                        </div>

                        <div class="group-fields-client">
                            <div class="field-client">
                                <label for="nascimento-cliente"> Data de nascimento *</label>
                                <input type="date" id="nascimento-cliente" name="nascimento" required>
                            </div>

                            <div class="field-client">
                                <label for="genero-cliente">Gênero *</label>
                                <select id="genero-cliente" name="genero" required>
                                    <option value="">Selecione, se desejar</option>
                                    <option value="feminino">Feminino</option>
                                    <option value="masculino">Masculino</option>
                                    <option value="outro">Outro</option>
                                    <option value="nao-informado">
                                        Prefiro não informar
                                    </option>
                                </select>
                            </div>
                        </div>

                        <div class="group-fields-client">
                            <div class="field-client">
                                <label for="email-cliente">E-mail</label>
                                <input type="email" id="email-cliente" name="email" placeholder="nome@exemplo.com">
                            </div>

                            <div class="field-client">
                                <label for="telefone-cliente">Telefone*</label>
                                <input type="tel" id="telefone-cliente" name="telefone" placeholder="(00) 00000-0000" required>
                            </div>
                        </div>

                        <div class="field-client field-client-full">
                            <label for="observacoes-cliente">Observações</label>
                            <textarea id="observacoes-cliente" name="observacoes" placeholder="Adicione uma observação sobre contato ou organização dos atendimentos"></textarea>

                            <small> Use este espaço para informações operacionais, sem dados clínicos.</small>
                        </div>

                        <footer class="footer-modal-client">
                            <button type="button" class="btn-cancel-modal-client"> Cancelar</button>

                            <button type="submit" class="btn-save-modal-client">Salvar alterações</button>
                        </footer>
                    </form>
                </section>
            </div>
        `;

        const overlay = this.querySelector(".overlay-modal-client");
        const botaoFechar = this.querySelector(".btn-close-modal-client");
        const botaoCancelar = this.querySelector(".btn-cancel-modal-client");

        botaoFechar.addEventListener("click", () => {
            this.classList.remove("modal-open");
        });

        botaoCancelar.addEventListener("click", () => {
            this.classList.remove("modal-open");
        });

        overlay.addEventListener("click", event => {
            if (event.target === overlay) {
                this.classList.remove("modal-open");
            }
        });
    }
}

customElements.define("modal-edit-client", ModalEditClient);
