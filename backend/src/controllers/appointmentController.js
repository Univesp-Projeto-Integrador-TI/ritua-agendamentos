import pool from '../config/db.js';

// 1. GET /appointments?date=AAAA-MM-DD&status=Agendado (Listar e filtrar)
export async function listAppointments(req, res) {
  const { date, status, client_id, employee_id, room_id } = req.query;

  try {
    let query = `
      SELECT a.*, 
             c.name AS client_name, c.number AS client_number,
             e.name AS employee_name, 
             r.name AS room_name
      FROM appointments a
      JOIN clients c ON a.client_id = c.client_id
      JOIN employees e ON a.employee_id = e.employee_id
      JOIN rooms r ON a.room_id = r.room_id
      WHERE 1=1
    `;
    const params = [];

    if (date) {
      params.push(date);
      query += ` AND a.date = $${params.length}`;
    }

    if (status) {
      params.push(status);
      query += ` AND a.appointment_status ILIKE $${params.length}`;
    }

    if (client_id) {
      params.push(client_id);
      query += ` AND a.client_id = $${params.length}`;
    }

    if (employee_id) {
      params.push(employee_id);
      query += ` AND a.employee_id = $${params.length}`;
    }

    if (room_id) {
      params.push(room_id);
      query += ` AND a.room_id = $${params.length}`;
    }

    query += ` ORDER BY a.date_hour_start ASC;`;

    const result = await pool.query(query, params);
    return res.status(200).json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 2. GET /appointments/:id (Ler os detalhes de um agendamento)
export async function getAppointmentById(req, res) {
  try {
    const query = `
      SELECT a.*, 
             c.name AS client_name, c.number AS client_number,
             e.name AS employee_name, 
             r.name AS room_name
      FROM appointments a
      JOIN clients c ON a.client_id = c.client_id
      JOIN employees e ON a.employee_id = e.employee_id
      JOIN rooms r ON a.room_id = r.room_id
      WHERE a.id_schedule = $1;
    `;
    const result = await pool.query(query, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Agendamento não encontrado.' });
    }

    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 3. POST /appointments (Criar agendamento)
export async function createAppointment(req, res) {
  const { 
    service, 
    description, 
    date, 
    date_hour_start, 
    date_hour_finish, 
    appointment_status, 
    notes, 
    client_id, 
    employee_id, 
    room_id 
  } = req.body;

  if (!service || !date || !date_hour_start || !date_hour_finish || !appointment_status || !client_id || !employee_id || !room_id) {
    return res.status(400).json({ 
      success: false, 
      message: 'Preencha todos os campos obrigatórios do agendamento.' 
    });
  }

  try {
    const query = `
      INSERT INTO appointments (
        service, description, date, date_hour_start, date_hour_finish, 
        appointment_status, notes, client_id, employee_id, room_id
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
      RETURNING *;
    `;
    const values = [
      service, description, date, date_hour_start, date_hour_finish, 
      appointment_status, notes, client_id, employee_id, room_id
    ];

    const result = await pool.query(query, values);

    return res.status(201).json({ 
      success: true, 
      message: 'Agendamento realizado com sucesso!', 
      data: result.rows[0] 
    });
  } catch (err) {
    if (err.code === '23P01') {
      return res.status(400).json({ 
        success: false, 
        message: 'Conflito de horário detectado: O cliente, o profissional ou a sala já possuem agendamento ativo neste intervalo[cite: 2].' 
      });
    }
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 4. PATCH /appointments/:id (Alterar horário, cliente, sala ou serviço)
export async function updateAppointment(req, res) {
  const { 
    service, 
    description, 
    date, 
    date_hour_start, 
    date_hour_finish, 
    notes, 
    client_id, 
    employee_id, 
    room_id 
  } = req.body;

  try {
    const query = `
      UPDATE appointments 
      SET service = COALESCE($1, service),
          description = COALESCE($2, description),
          date = COALESCE($3, date),
          date_hour_start = COALESCE($4, date_hour_start),
          date_hour_finish = COALESCE($5, date_hour_finish),
          notes = COALESCE($6, notes),
          client_id = COALESCE($7, client_id),
          employee_id = COALESCE($8, employee_id),
          room_id = COALESCE($9, room_id)
      WHERE id_schedule = $10 
      RETURNING *;
    `;
    const values = [
      service, description, date, date_hour_start, date_hour_finish, 
      notes, client_id, employee_id, room_id, req.params.id
    ];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Agendamento não encontrado.' });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Agendamento atualizado com sucesso!', 
      data: result.rows[0] 
    });
  } catch (err) {
    if (err.code === '23P01') {
      return res.status(400).json({ 
        success: false, 
        message: 'Conflito de horário detectado na atualização[cite: 2].' 
      });
    }
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 5. PATCH /appointments/:id/status (Mudar o status)
export async function updateAppointmentStatus(req, res) {
  const { appointment_status } = req.body;

  if (!appointment_status) {
    return res.status(400).json({ success: false, message: 'O novo status é obrigatório.' });
  }

  try {
    const query = `
      UPDATE appointments 
      SET appointment_status = $1 
      WHERE id_schedule = $2 
      RETURNING *;
    `;
    const result = await pool.query(query, [appointment_status, req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Agendamento não encontrado.' });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Status do agendamento alterado com sucesso!', 
      data: result.rows[0] 
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 6. DELETE /appointments/:id (Remover, se a regra do sistema permitir)
export async function deleteAppointment(req, res) {
  try {
    // Exemplo de regra: verificar se o agendamento já foi concluído antes de permitir deletar
    const check = await pool.query('SELECT appointment_status FROM appointments WHERE id_schedule = $1', [req.params.id]);
    
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Agendamento não encontrado.' });
    }

    const currentStatus = check.rows[0].appointment_status;
    if (currentStatus.toLowerCase() === 'concluído') {
      return res.status(400).json({ 
        success: false, 
        message: 'Não é permitido remover agendamentos já concluídos. Utilize o cancelamento.' 
      });
    }

    await pool.query('DELETE FROM appointments WHERE id_schedule = $1', [req.params.id]);
    return res.status(200).json({ success: true, message: 'Agendamento removido com sucesso.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}