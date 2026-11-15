import pool from '../config/db.js';

// GET /clients?search=ana&page=1
export async function listClients(req, res) {
  const { search = '', page = 1 } = req.query;
  const limit = 10;
  const offset = (Math.max(1, Number(page)) - 1) * limit;

  try {
    const query = `
      SELECT * FROM clients 
      WHERE name ILIKE $1 OR number ILIKE $1 
      ORDER BY name ASC 
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [`%${search}%`, limit, offset]);

    return res.status(200).json({ 
      success: true, 
      page: Number(page), 
      count: result.rows.length,
      data: result.rows 
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// GET /clients/:id
export async function getClientById(req, res) {
  try {
    const result = await pool.query('SELECT * FROM clients WHERE client_id = $1', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Cliente não encontrado.' });
    }
    
    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// POST /clients
export async function createClient(req, res) {
  const { name, number, email, birth_date, gender, notes, client_status } = req.body;

  if (!name || !number || !birth_date || !gender || !client_status) {
    return res.status(400).json({ 
      success: false, 
      message: 'Nome, número, data de nascimento, gênero e status do cliente são obrigatórios.' 
    });
  }

  try {
    const query = `
      INSERT INTO clients (name, number, email, birth_date, gender, notes, client_status) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING *;
    `;
    const values = [name, number, email, birth_date, gender, notes, client_status];
    const result = await pool.query(query, values);

    return res.status(201).json({ 
      success: true, 
      message: 'Cliente cadastrado com sucesso!', 
      data: result.rows[0] 
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// PATCH /clients/:id
export async function updateClient(req, res) {
  const { name, number, email, birth_date, gender, notes, client_status } = req.body;

  try {
    const query = `
      UPDATE clients 
      SET name = COALESCE($1, name), 
          number = COALESCE($2, number), 
          email = COALESCE($3, email),
          birth_date = COALESCE($4, birth_date),
          gender = COALESCE($5, gender),
          notes = COALESCE($6, notes),
          client_status = COALESCE($7, client_status)
      WHERE client_id = $8 
      RETURNING *;
    `;
    const values = [name, number, email, birth_date, gender, notes, client_status, req.params.id];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Cliente não encontrado.' });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Cliente atualizado com sucesso!', 
      data: result.rows[0] 
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// GET /clients/:id/appointments
export async function getClientAppointments(req, res) {
  try {
    const query = `
      SELECT a.*, r.name AS room_name, e.name AS employee_name
      FROM appointments a
      LEFT JOIN rooms r ON a.room_id = r.room_id
      LEFT JOIN employees e ON a.employee_id = e.employee_id
      WHERE a.client_id = $1 
      ORDER BY a.date_hour_start DESC;
    `;
    const result = await pool.query(query, [req.params.id]);

    return res.status(200).json({ 
      success: true, 
      count: result.rows.length, 
      data: result.rows 
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}