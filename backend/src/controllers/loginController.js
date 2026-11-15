import pool from '../config/db.js';
import bcrypt from 'bcrypt';

// 1. Listar todos os logins (com os dados do funcionário associado)
export async function listLogins(req, res) {
  try {
    const query = `
      SELECT l.login_id, l.nickname, l.employee_id, 
             e.name AS employee_name, e.email AS employee_email
      FROM login l
      LEFT JOIN employees e ON l.employee_id = e.employee_id
      ORDER BY l.nickname ASC;
    `;
    const result = await pool.query(query);
    return res.status(200).json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 2. Buscar login específico por ID
export async function getLoginById(req, res) {
  try {
    const query = `
      SELECT l.login_id, l.nickname, l.employee_id, 
             e.name AS employee_name, e.email AS employee_email
      FROM login l
      LEFT JOIN employees e ON l.employee_id = e.employee_id
      WHERE l.login_id = $1;
    `;
    const result = await pool.query(query, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Registro de login não encontrado.' });
    }

    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 3. Atualizar dados de login (nickname ou senha de um usuário)
export async function updateLogin(req, res) {
  const { nickname, password } = req.body;
  const { id } = req.params;

  try {
    let query = 'UPDATE login SET ';
    const values = [];
    const fields = [];

    if (nickname) {
      values.push(nickname);
      fields.push(`nickname = $${values.length}`);
    }

    if (password) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      values.push(hashedPassword);
      fields.push(`password = $${values.length}`);
    }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'Nenhum campo para atualizar foi enviado.' });
    }

    values.push(id);
    query += fields.join(', ') + ` WHERE login_id = $${values.length} RETURNING login_id, nickname, employee_id;`;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Registro de login não encontrado.' });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Credenciais de login atualizadas com sucesso!', 
      data: result.rows[0] 
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 4. Deletar registro de login
export async function deleteLogin(req, res) {
  try {
    const result = await pool.query('DELETE FROM login WHERE login_id = $1 RETURNING login_id', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Registro de login não encontrado.' });
    }

    return res.status(200).json({ success: true, message: 'Credencial de login removida com sucesso.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}