import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, 
    auth: {
        user: 'seu-email@gmail.com',         // Substitua pelo seu e-mail
        pass: 'sua-senha-de-app-do-google'   // Senha de aplicativo gerada no Google
    }
});

const enviarEmailAgendamento = async (clienteEmail, clienteNome, dataAgendamento, servico) => {
    try {
        await transporter.sendMail({
            from: '"Rituá Terapias" <seu-email@gmail.com>',
            to: clienteEmail,
            subject: 'Confirmação do seu Agendamento - Rituá Terapias',
            html: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h2>Olá, ${clienteNome}!</h2>
                    <p>O seu agendamento para o serviço de <strong>${servico}</strong> foi confirmado com sucesso.</p>
                    <p><strong>Data e Horário:</strong> ${dataAgendamento}</p>
                    <p>Esperamos por si no Rituá Terapias!</p>
                </div>
            `
        });
        console.log('E-mail de confirmação enviado com sucesso!');
    } catch (error) {
        console.error('Erro ao enviar e-mail:', error);
    }
};

export { enviarEmailAgendamento };