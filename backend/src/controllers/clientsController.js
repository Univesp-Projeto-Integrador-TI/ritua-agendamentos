import { enviarEmailAgendamento } from '../service/emailService.js';
let clientsMockedData = [
    { id: 1, name: "Ana Souza", gender: "female", number: "11988887777" },
    { id: 2, name: "Carlos Lima", gender: "male", number: "11977776666" }
];

export const listsClients = (req, res) => {
    return res.status(200).json(clientes);
};

export const createsClients = async (req, res) => {
    const { name, gender, number } = req.body;

    if (!name || !gender || !number) {
        return res.status(400).json({ erro: "Os campos de nome, gênero e número de celular são obrigatórios." });
    }

    const newClient = {
        id: clientsMockedData.length + 1,
        name,
        gender,
        number
    };

    clientsMockedData.push(newClient);
    await enviarEmailAgendamento("a definir", name, "Data a definir", "Atendimento Rituá");

    return res.status(201).json({
        mensagem: "Cliente cadastrado.",
        client: newClient
    });
};