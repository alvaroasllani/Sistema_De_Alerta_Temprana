const mysql = require('mysql2/promise');
require('dotenv').config();

// Centralized MySQL pool used across the backend
const pool = mysql.createPool({
	host: process.env.DB_HOST || 'localhost',
	user: process.env.DB_USER || 'root',
	password: process.env.DB_PASSWORD || '12qwaszx',
	database: process.env.DB_NAME || 'monitoreo_ambiental',
	waitForConnections: true,
	connectionLimit: Number(process.env.DB_CONN_LIMIT) || 10,
	queueLimit: 0,
});

async function insertReading(reading) {
	const conn = await pool.getConnection();
	try {
		const sql = `INSERT INTO readings (device_id, timestamp, temperature, humidity, pressure, metadata) VALUES (?, ?, ?, ?, ?, ?)`;
		const params = [
			reading.deviceId,
			reading.timestamp,
			reading.temperature,
			reading.humidity,
			reading.pressure,
			reading.metadata ? JSON.stringify(reading.metadata) : null,
		];
		const [result] = await conn.execute(sql, params);
		return result.insertId;
	} finally {
		conn.release();
	}
}

async function getLatest(deviceId) {
	const conn = await pool.getConnection();
	try {
		const sql = `SELECT id, device_id as deviceId, UNIX_TIMESTAMP(timestamp) as timestamp, temperature, humidity, pressure, metadata FROM readings WHERE device_id = ? ORDER BY timestamp DESC LIMIT 1`;
		const [rows] = await conn.execute(sql, [deviceId]);
		if (!rows || rows.length === 0) return null;
		const row = rows[0];
		try {
			row.metadata = row.metadata ? JSON.parse(row.metadata) : null;
		} catch (e) {
			row.metadata = null;
		}
		return row;
	} finally {
		conn.release();
	}
}

async function getSensoresActuales() {
	const conn = await pool.getConnection();
	try {
		const [rows] = await conn.query(`
			SELECT device_id AS id, temperatura, humedad, lluvia, caudal, presion, timestamp
			FROM readings
			WHERE id IN (SELECT MAX(id) FROM readings GROUP BY device_id)
		`);
		return rows;
	} finally {
		conn.release();
	}
}

async function getAlertasActivas() {
	const conn = await pool.getConnection();
	try {
		const [rows] = await conn.query(`
      SELECT alertas.id, titulo, descripcion, tipo, activa, timestamp, codigo AS estacion_id 
      FROM alertas, estaciones 
      WHERE alertas.estacion_id = estaciones.id and activa = TRUE
    `);
		return rows;
	} finally {
		conn.release();
	}
}

async function getEstaciones() {
	const conn = await pool.getConnection();
	try {
		const [rows] = await conn.query(`SELECT * FROM estaciones`);
		return rows;
	} finally {
		conn.release();
	}
}

async function atenderAlerta(id) {
	const conn = await pool.getConnection();
	try {
		const [result] = await conn.execute(
      'UPDATE alertas SET activa = FALSE, atendida = TRUE WHERE id = ?',
      [id]
    );
		return result;
	} finally {
		conn.release();
	}
}

module.exports = { pool, insertReading, getLatest, getSensoresActuales, getAlertasActivas, getEstaciones, atenderAlerta };

