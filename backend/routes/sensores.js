const express = require('express');
const db = require('../db');

const router_sensor = express.Router();

router_sensor.use(express.json());

/**
 * 1️⃣ Obtener las lecturas actuales de todos los sensores
 */
router_sensor.get('/sensores/actuales', async (req, res) => {
  try {
    const rows = await db.getSensoresActuales();
    return res.send(rows);
  } catch (err) {
    console.error('Error al obtener los sensores actuales:', err);
    res.status(500).json({ error: 'Error al obtener datos de sensores' });
  }
});

/**
 * 2️⃣ Obtener alertas activas
 */
router_sensor.get('/alertas/activas', async (req, res) => {
  try {
    const rows = await db.getAlertasActivas();
    return res.send(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener alertas activas' });
  }
});

/**
 * 3️⃣ Marcar alerta como atendida
 */
router_sensor.put('/alertas/:id/atender', async (req, res) => {
  try {
    const id = req.params.id;
    const result = await db.atenderAlerta(id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'error', message: 'Alerta no encontrada' });
    }
    return res.json({ status: 'ok', message: `Alerta ${id} marcada como atendida` });
  } catch (err) {
    res.status(500).json({ error: 'Error al marcar alerta como atendida' });
  }
});

/**
 * 4️⃣ Listar estaciones de monitoreo
 */
router_sensor.get('/estaciones', async (req, res) => {
  try {
    const rows = await db.getEstaciones();
    return res.send(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener estaciones' });
  }
});

/**
 * 5️⃣ (Opcional) Obtener estadísticas simples
 */
router_sensor.get('/estadisticas', async (req, res) => {
  try {
    const periodo = req.query.periodo || '7d';
    // interpret period like '7d' => 7 days
    let days = 7;
    const m = String(periodo).match(/(\d+)d/);
    if (m) days = parseInt(m[1], 10) || 7;

    const conn = await db.pool.getConnection();
    try {
      const [rows] = await conn.query(
        `SELECT 
          device_id AS id,
          AVG(temperature) AS temperatura_promedio,
          AVG(humidity) AS humedad_promedio
        FROM readings
        WHERE timestamp >= NOW() - INTERVAL ${days} DAY
        GROUP BY device_id`
      );
      conn.release();
      return res.json({ periodo, data: rows });
    } catch (e) {
      conn.release();
      throw e;
    }
  } catch (err) {
    console.error('Error al obtener estadísticas:', err);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

module.exports = router_sensor;
