const express = require('express');
const db = require('../db');

const router_sensor = express.Router();

router_sensor.use(express.json());

/**
 * 1️⃣ Listar estaciones de monitoreo
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
 * 3️⃣ Obtener las lecturas actuales de todos los sensores
 */
router_sensor.get('/lecturas/actuales', async (req, res) => {
  try {
    const rows = await db.getLecturasActuales();
    return res.send(rows);
  } catch (err) {
    console.error('Error al obtener las lecturas actuales:', err);
    res.status(500).json({ error: 'Error al obtener datos de sensores' });
  }
});

/**
 * 4️⃣ Marcar alerta como atendida
 */
router_sensor.put('/alertas/:id/atender', async (req, res) => {
  try {
    const id = req.params.id;
    const result = await db.atenderAlerta(id);
    if (!result) {
      return res.status(204).json({ message: 'Alerta no encontrada' });
    }
    return res.status(200).json({ message: `Alerta ${id} marcada como atendida` });
  } catch (err) {
    res.status(500).json({ error: 'Error al marcar alerta como atendida' });
  }
});

/**
 * 5️⃣ (Opcional) Obtener estadísticas simples
 */
// router_sensor.get('/estadisticas', async (req, res) => {});

module.exports = router_sensor;
