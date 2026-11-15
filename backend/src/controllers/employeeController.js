import pool from '../config/db.js';
import bcrypt from 'bcrypt';

// 1. Listar funcionários (com filtros opcionais)
export async function listEmployees(req, res) {
  const { status, specialty } = req.query;

  try {
    let query = 'SELECT * FROM employees WHERE 1=1';
    const params = [];

    if (status) {
      params.push(status);
      query += ` AND employee_status ILIKE $${params.length}`;
    }

    if (specialty) {
      params.push(`%${specialty}%`);
      query += ` AND (specialty1 ILIKE $${params.length} OR specialty2 ILIKE $${params.length} OR specialty3 ILIKE $${params.length})`;
    }

    query += ' ORDER BY name ASC';

    const result = await pool.query(query, params);
    return res.status(200).json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 2. Buscar funcionário por ID
export async function getEmployeeById(req, res) {
  try {
    const result = await pool.query('SELECT * FROM employees WHERE employee_id = $1', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Funcionário não encontrado.' });
    }
    
    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 3. Cadastrar funcionário junto com o Login (Transacional)
export async function createEmployee(req, res) {
  const { 
    cpf, email, phone, name, 
    specialty1, specialty2, specialty3, 
    employee_status, 
    nickname, password 
  } = req.body;

  if (!name || !email || !phone || !specialty1 || !employee_status || !nickname || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Todos os campos de cadastro e os dados de login (nickname e password) são obrigatórios.' 
    });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const employeeQuery = `
      INSERT INTO employees (cpf, email, phone, name, specialty1, specialty2, specialty3, employee_status) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *;
    `;
    const employeeValues = [cpf, email, phone, name, specialty1, specialty2, specialty3, employee_status];
    const employeeResult = await client.query(employeeQuery, employeeValues);
    const newEmployee = employeeResult.rows[0];

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const loginQuery = `
      INSERT INTO login (nickname, password, employee_id) 
      VALUES ($1, $2, $3) 
      RETURNING login_id, nickname;
    `;
    const loginValues = [nickname, hashedPassword, newEmployee.employee_id];
    const loginResult = await client.query(loginQuery, loginValues);
    const newLogin = loginResult.rows[0];

    await client.query('COMMIT');

    return res.status(201).json({
      success: true,
      message: 'Funcionário e credenciais de acesso cadastrados com sucesso!',
      data: {
        employee: newEmployee,
        login: newLogin
      }
    });

  } catch (err) {
    await client.query('ROLLBACK');
    return res.status(500).json({ success: false, error: err.message });
  } finally {
    client.release();
  }
}

// 4. Atualizar funcionário
export async function updateEmployee(req, res) {
  const { cpf, email, phone, name, specialty1, specialty2, specialty3, employee_status } = req.body;

  try {
    const result = await pool.query(
      `UPDATE employees 
       SET cpf = COALESCE($1, cpf),
           email = COALESCE($2, email),
           phone = COALESCE($3, phone),
           name = COALESCE($4, name),
           specialty1 = COALESCE($5, specialty1),
           specialty2 = COALESCE($6, specialty2),
           specialty3 = COALESCE($7, specialty3),
           employee_status = COALESCE($8, employee_status)
       WHERE employee_id = $9 RETURNING *`,
      [cpf, email, phone, name, specialty1, specialty2, specialty3, employee_status, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Funcionário não encontrado.' });
    }

    return res.status(200).json({ success: true, message: 'Funcionário atualizado com sucesso!', data: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 5. Deletar funcionário
export async function deleteEmployee(req, res) {
  try {
    const result = await pool.query('DELETE FROM employees WHERE employee_id = $1 RETURNING *', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Funcionário não encontrado.' });
    }

    return res.status(200).json({ success: true, message: 'Funcionário removido com sucesso.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}