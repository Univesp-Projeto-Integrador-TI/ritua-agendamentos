import pool from '../config/db.js';
import bcrypt from 'bcrypt';

// PATCH /users/me (Atualizar dados do funcionário logado)
export async function updateMe(req, res) {
  const { name, email, phone, specialty1, specialty2, specialty3 } = req.body;
  const employee_id = req.user.employee_id;

  try {
    const query = `
      UPDATE employees 
      SET name = COALESCE($1, name),
          email = COALESCE($2, email),
          phone = COALESCE($3, phone),
          specialty1 = COALESCE($4, specialty1),
          specialty2 = COALESCE($5, specialty2),
          specialty3 = COALESCE($6, specialty3)
      WHERE employee_id = $7
      RETURNING employee_id, name, email, phone, specialty1, specialty2, specialty3, employee_status;
    `;

    const result = await pool.query(query, [
      name, email, phone, specialty1, specialty2, specialty3, employee_id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Funcionário não encontrado.' });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Dados atualizados com sucesso!', 
      data: result.rows[0] 
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// PATCH /users/me/password (Alterar senha)
export async function updatePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  const employee_id = req.user.employee_id;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Informe a senha atual e a nova senha.' });
  }

  try {
    const loginQuery = 'SELECT password FROM login WHERE employee_id = $1';
    const loginResult = await pool.query(loginQuery, [employee_id]);

    if (loginResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Credenciais não encontradas.' });
    }

    const storedHash = loginResult.rows[0].password;

    const passwordMatch = await bcrypt.compare(currentPassword, storedHash);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'A senha atual está incorreta.' });
    }

    const saltRounds = 10;
    const newHashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await pool.query(
      'UPDATE login SET password = $1 WHERE employee_id = $2',
      [newHashedPassword, employee_id]
    );

    return res.status(200).json({ success: true, message: 'Senha alterada com sucesso!' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}