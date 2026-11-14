import pool from '../config/db.js';

export async function listClients(req, res) {
  const { search = '', page = 1 } = req.query;
  const limit = 10; 
  const offset = (Math.max(1, Number(page)) - 1) * limit;

  try {
    const result = await pool.query(
      `SELECT * FROM customers 
       WHERE name ILIKE $1 OR phone ILIKE $1 
       ORDER BY name ASC 
       LIMIT $2 OFFSET $3`,
      [`%${search}%`, limit, offset]
    );

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

export async function getClientById(req, res) {
  try {
    const result = await pool.query('SELECT * FROM customers WHERE id_customer = $1', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Cliente não encontrado.' });
    }
    
    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function createClient(req, res) {
  const { name, phone, email } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, message: 'O nome do cliente é obrigatório.' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO customers (name, phone, email) VALUES ($1, $2, $3) RETURNING *',
      [name, phone, email]
    );

    return res.status(201).json({ success: true, message: 'Cliente cadastrado com sucesso!', data: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateClient(req, res) {
  const { name, phone, email } = req.body;

  try {
    const result = await pool.query(
      `UPDATE customers 
       SET name = COALESCE($1, name), 
           phone = COALESCE($2, phone), 
           email = COALESCE($3, email)
       WHERE id_customer = $4 RETURNING *`,
      [name, phone, email, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Cliente não encontrado.' });
    }

    return res.status(200).json({ success: true, message: 'Cliente atualizado com sucesso!', data: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getClientAppointments(req, res) {
  try {
    const result = await pool.query(
      `SELECT a.*, r.room_description 
       FROM appointments a
       LEFT JOIN rooms r ON a.id_room = r.id_room
       WHERE a.id_customer = $1 
       ORDER BY a.appointment_date DESC, a.start_time DESC`,
      [req.params.id]
    );

    return res.status(200).json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}