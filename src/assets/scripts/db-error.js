// Erro de regra de dados, usado tanto na base local quanto na API.
export class DbError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
    }
}
