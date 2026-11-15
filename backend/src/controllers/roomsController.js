import pool from '../config/db.js';

// 1. Listar salas
export async function listRooms(req, res) {
  const { status } = req.query;

  try {
    let query = `
      SELECT r.*, 
             COALESCE(
               json_agg(
                 json_build_object(
                   'room_operating_hour_id', h.room_operating_hour_id,
                   'day_of_week', h.day_of_week,
                   'opening_time', h.opening_time,
                   'closing_time', h.closing_time
                 )
               ) FILTER (WHERE h.room_operating_hour_id IS NOT NULL), '[]'
             ) AS operating_hours
      FROM rooms r
      LEFT JOIN room_operating_hours h ON r.room_id = h.room_id
    `;
    const params = [];

    if (status) {
      params.push(status);
      query += ` WHERE r.room_status ILIKE $1`;
    }

    query += ` GROUP BY r.room_id ORDER BY r.name ASC;`;

    const result = await pool.query(query, params);
    return res.status(200).json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 2. Buscar sala por ID
export async function getRoomById(req, res) {
  try {
    const roomResult = await pool.query('SELECT * FROM rooms WHERE room_id = $1', [req.params.id]);
    
    if (roomResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Sala não encontrada.' });
    }

    const hoursResult = await pool.query(
      'SELECT * FROM room_operating_hours WHERE room_id = $1 ORDER BY room_operating_hour_id ASC',
      [req.params.id]
    );

    return res.status(200).json({ 
      success: true, 
      data: {
        ...roomResult.rows[0],
        operating_hours: hoursResult.rows
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 3. Cadastrar sala
export async function createRoom(req, res) {
  const { 
    name, 
    description, 
    capacity, 
    has_interval, 
    interval_minutes, 
    default_duration_minutes, 
    amenities, 
    room_status, 
    operating_hours 
  } = req.body;

  if (!name || !default_duration_minutes || !room_status) {
    return res.status(400).json({ 
      success: false, 
      message: 'Nome, duração padrão (em minutos) e status da sala são obrigatórios.' 
    });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const roomQuery = `
      INSERT INTO rooms (name, description, capacity, has_interval, interval_minutes, default_duration_minutes, amenities, room_status) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *;
    `;
    const roomResult = await client.query(roomQuery, [
      name, description, capacity || null, has_interval || false, interval_minutes || 0, default_duration_minutes, amenities, room_status
    ]);
    const newRoom = roomResult.rows[0];

    const insertedHours = [];
    if (Array.isArray(operating_hours) && operating_hours.length > 0) {
      const hourQuery = `
        INSERT INTO room_operating_hours (room_id, day_of_week, opening_time, closing_time) 
        VALUES ($1, $2, $3, $4) 
        RETURNING *;
      `;
      for (const item of operating_hours) {
        const hRes = await client.query(hourQuery, [
          newRoom.room_id, item.day_of_week, item.opening_time, item.closing_time
        ]);
        insertedHours.push(hRes.rows[0]);
      }
    }

    await client.query('COMMIT');

    return res.status(201).json({ 
      success: true, 
      message: 'Sala cadastrada com sucesso!', 
      data: { ...newRoom, operating_hours: insertedHours } 
    });
  } catch (err) {
    await client.query('ROLLBACK');
    return res.status(500).json({ success: false, error: err.message });
  } finally {
    client.release();
  }
}

// 4. Atualizar sala
export async function updateRoom(req, res) {
  const { 
    name, 
    description, 
    capacity, 
    has_interval, 
    interval_minutes, 
    default_duration_minutes, 
    amenities, 
    room_status 
  } = req.body;

  try {
    const query = `
      UPDATE rooms 
      SET name = COALESCE($1, name),
          description = COALESCE($2, description),
          capacity = COALESCE($3, capacity),
          has_interval = COALESCE($4, has_interval),
          interval_minutes = COALESCE($5, interval_minutes),
          default_duration_minutes = COALESCE($6, default_duration_minutes),
          amenities = COALESCE($7, amenities),
          room_status = COALESCE($8, room_status)
      WHERE room_id = $9 
      RETURNING *;
    `;
    const result = await pool.query(query, [
      name, description, capacity, has_interval, interval_minutes, default_duration_minutes, amenities, room_status, req.params.id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Sala não encontrada.' });
    }

    return res.status(200).json({ success: true, message: 'Sala atualizada com sucesso!', data: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 5. Atualizar horários da sala
export async function updateRoomHours(req, res) {
  const { operating_hours } = req.body;
  const { id } = req.params;

  if (!Array.isArray(operating_hours)) {
    return res.status(400).json({ success: false, message: 'Envie uma lista válida em operating_hours.' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await client.query('DELETE FROM room_operating_hours WHERE room_id = $1', [id]);

    const insertedHours = [];
    const hourQuery = `
      INSERT INTO room_operating_hours (room_id, day_of_week, opening_time, closing_time) 
      VALUES ($1, $2, $3, $4) 
      RETURNING *;
    `;

    for (const item of operating_hours) {
      const hRes = await client.query(hourQuery, [
        id, item.day_of_week, item.opening_time, item.closing_time
      ]);
      insertedHours.push(hRes.rows[0]);
    }

    await client.query('COMMIT');
    return res.status(200).json({ success: true, message: 'Horários atualizados!', data: insertedHours });
  } catch (err) {
    await client.query('ROLLBACK');
    return res.status(500).json({ success: false, error: err.message });
  } finally {
    client.release();
  }
}

// 6. Verificar disponibilidade de salas
export async function checkAvailability(req, res) {
  const { date, startTime, durationMinutes, dayOfWeek } = req.query;

  if (!date || !startTime || !dayOfWeek) {
    return res.status(400).json({ 
      success: false, 
      message: 'Informe date (YYYY-MM-DD), startTime (HH:MM) e dayOfWeek (ex: segunda).' 
    });
  }

  try {
    const query = `
      SELECT r.* 
      FROM rooms r
      INNER JOIN room_operating_hours h ON r.room_id = h.room_id
      WHERE r.room_status ILIKE 'Ativa'
        AND h.day_of_week ILIKE $1
        AND h.opening_time <= $2::time
        AND h.closing_time >= ($2::time + (COALESCE($3, r.default_duration_minutes) || ' minutes')::interval)
        AND NOT EXISTS (
          SELECT 1 FROM appointments a
          WHERE a.room_id = r.room_id
            AND a.date = $4::date
            AND LOWER(a.appointment_status) NOT IN ('cancelado', 'desmarcado')
            AND (
              TIME(a.date_hour_start) < ($2::time + (COALESCE($3, r.default_duration_minutes) || ' minutes')::interval)
              AND TIME(a.date_hour_finish) > $2::time
            )
        )
      ORDER BY r.name ASC;
    `;

    const result = await pool.query(query, [
      dayOfWeek, 
      startTime, 
      durationMinutes || null, 
      date
    ]);

    return res.status(200).json({ 
      success: true, 
      count: result.rows.length, 
      availableRooms: result.rows 
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 7. Remover sala
export async function deleteRoom(req, res) {
  try {
    const check = await pool.query('SELECT 1 FROM appointments WHERE room_id = $1 LIMIT 1', [req.params.id]);
    if (check.rows.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Sala possui histórico de agendamentos. Altere o status para Inativa em vez de excluir.' 
      });
    }

    const result = await pool.query('DELETE FROM rooms WHERE room_id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Sala não encontrada.' });
    }

    return res.status(200).json({ success: true, message: 'Sala removida com sucesso.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}