import pool from '../config/db.js';

export async function listAppointments(req, res) {
  const { date, status } = req.query;
  let query = `
    SELECT 
      a.*, 
      c.name AS client_name, 
      r.room_description 
    FROM appointments a
    LEFT JOIN customers c ON a.id_customer = c.id_customer
    LEFT JOIN rooms r ON a.id_room = r.id_room
    WHERE 1=1
  `;
  const params = [];

  if (date) {
    params.push(date);
    query += ` AND a.appointment_date = $${params.length}`;
  }

  if (status) {
    params.push(status);
    query += ` AND a.status ILIKE $${params.length}`;
  }

  query += ' ORDER BY a.appointment_date ASC, a.start_time ASC';

  try {
    const result = await pool.query(query, params);
    return res.status(200).json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getAppointmentById(req, res) {
  try {
    const result = await pool.query(
      `SELECT a.*, c.name AS client_name, r.room_description 
       FROM appointments a
       LEFT JOIN customers c ON a.id_customer = c.id_customer
       LEFT JOIN rooms r ON a.id_room = r.id_room
       WHERE a.id_appointment = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Agendamento não encontrado.' });
    return res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function createAppointment(req, res) {
  const { id_customer, id_room, appointment_date, start_time, duration_minutes = 60, service } = req.body;

  if (!id_customer || !id_room || !appointment_date || !start_time) {
    return res.status(400).json({ success: false, message: 'Campos obrigatórios ausentes.' });
  }

  try {
    const conflictQuery = `
      SELECT 1 FROM appointments
      WHERE id_room = $1
        AND appointment_date = $2
        AND status != 'Cancelado'
        AND (
          start_time < ($3::time + ($4 || ' minutes')::interval)
          AND (start_time + (duration_minutes || ' minutes')::interval) > $3::time
        )
      LIMIT 1;
    `;
    const conflictCheck = await pool.query(conflictQuery, [id_room, appointment_date, start_time, duration_minutes]);

    if (conflictCheck.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Conflito de horário: esta sala já está ocupada neste período.' });
    }

    const result = await pool.query(
      `INSERT INTO appointments (id_customer, id_room, appointment_date, start_time, duration_minutes, service, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'Agendado') RETURNING *`,
      [id_customer, id_room, appointment_date, start_time, duration_minutes, service]
    );

    return res.status(201).json({ success: true, message: 'Agendamento criado com sucesso!', data: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateAppointment(req, res) {
  const { id_customer, id_room, appointment_date, start_time, duration_minutes, service } = req.body;
  try {
    const result = await pool.query(
      `UPDATE appointments 
       SET id_customer = COALESCE($1, id_customer),
           id_room = COALESCE($2, id_room),
           appointment_date = COALESCE($3, appointment_date),
           start_time = COALESCE($4, start_time),
           duration_minutes = COALESCE($5, duration_minutes),
           service = COALESCE($6, service)
       WHERE id_appointment = $7 RETURNING *`,
      [id_customer, id_room, appointment_date, start_time, duration_minutes, service, req.params.id]
    );
    return res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateAppointmentStatus(req, res) {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ success: false, message: 'O status é obrigatório.' });
  }

  try {
    const result = await pool.query(
      'UPDATE appointments SET status = $1 WHERE id_appointment = $2 RETURNING *',
      [status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Agendamento não encontrado.' });
    return res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function deleteAppointment(req, res) {
  try {
    const check = await pool.query('SELECT status FROM appointments WHERE id_appointment = $1', [req.params.id]);
    if (check.rows.length === 0) return res.status(404).json({ success: false, message: 'Agendamento não encontrado.' });

    if (check.rows[0].status === 'Concluido') {
      return res.status(400).json({ success: false, message: 'Não é permitido excluir agendamentos já concluídos.' });
    }

    await pool.query('DELETE FROM appointments WHERE id_appointment = $1', [req.params.id]);
    return res.json({ success: true, message: 'Agendamento removido com sucesso.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}