import pool from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// POST /auth/login
export async function login(req, res) {
  const { nickname, password } = req.body;

  if (!nickname || !password) {
    return res.status(400).json({ success: false, message: 'Nickname e senha são obrigatórios.' });
  }

  try {
    const query = `
      SELECT l.login_id, l.nickname, l.password, l.employee_id, 
             e.name, e.email, e.phone, e.specialty1, e.specialty2, e.specialty3, e.employee_status
      FROM login l
      JOIN employees e ON l.employee_id = e.employee_id
      WHERE l.nickname = $1
    `;
    const result = await pool.query(query, [nickname]);

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Usuário ou senha inválidos.' });
    }

    const user = result.rows[0];

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Usuário ou senha inválidos.' });
    }

    // Gera o token JWT guardando o employee_id
    const token = jwt.sign(
      { employee_id: user.employee_id, nickname: user.nickname },
      process.env.JWT_SECRET || 'sua_chave_secreta_super_segura',
      { expiresIn: '8h' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login realizado com sucesso!',
      token,
      user: {
        employee_id: user.employee_id,
        nickname: user.nickname,
        name: user.name,
        email: user.email,
        phone: user.phone,
        specialties: [user.specialty1, user.specialty2, user.specialty3].filter(Boolean)
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// POST /auth/logout
export async function logout(req, res) {
  return res.status(200).json({ success: true, message: 'Sessão encerrada com sucesso.' });
}

// GET /auth/me
export async function getMe(req, res) {
  try {
    const query = `
      SELECT e.employee_id, l.nickname, e.name, e.email, e.phone, 
             e.specialty1, e.specialty2, e.specialty3, e.employee_status
      FROM employees e
      JOIN login l ON e.employee_id = l.employee_id
      WHERE e.employee_id = $1
    `;
    const result = await pool.query(query, [req.user.employee_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
    }

    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}