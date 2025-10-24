require('dotenv').config();

const mysql = require('mysql2/promise');
const db = require('./models');
const { estaciones, alertas, sequelize, lecturas } = db;

async function getEstaciones() {
	try {
		const lista = await estaciones.findAll();
		return lista.map(est => est.toJSON());
	} catch (err) {
		console.log('Error al obtener estaciones: ', err);
		throw err;
	}
}

// TODO: Corregir la recepcion de datos con el frontend
async function getAlertasActivas() {
	try {
		const lista = await alertas.findAll({
			where: { activa: true },
			include: [
				{
					model: estaciones,
					as: 'estacion',
					attributes: ['nombre']
				}
			],
			order: [['createdAt', 'DESC']]
		});
		return lista.map(est => est.toJSON());
	} catch (err) {
		console.log('Error al obtener Alertas activas: ', err);
		throw err;
	}
}

// TODO: Corregir las rutas en el frontend
async function getLecturasActuales() {
	try {
		const [rows] = await sequelize.query(`
			SELECT device_id AS nombre, temperatura, humedad, lluvia, caudal, presion, createdAt as timestamp
			FROM lecturas 
			WHERE id IN (
				SELECT MAX(id) 
				FROM lecturas
				GROUP BY device_id
			)
		`);
		return rows;
	} catch (err) {
    console.error('Error al obtener últimas lecturas:', err);
    throw err;
  }
}

async function atenderAlerta(id) {
	try {
		const alerta = await alertas.findByPk(id);
		if (alerta) {
			alerta.activa = false;
			alerta.atendida = true;
			await alerta.save();
			console.log(`Alerta ${id} marcada como atendida.`);
			return true
		} 
		console.log(`No se encontro una alerta con id = ${id}`);
		return false;
	} catch (err) {
		console.log('Error al actualizar la alerta: ', err);
		throw err;
	}
};

/**
 * ✅ Evalúa una nueva lectura y emite una alerta si corresponde.
 * Evita generar alertas duplicadas por estación y tipo de condición.
 * @param {object} lectura - Objeto con los datos de la lectura
 */
async function emitirAlertaSiCorresponde(lectura) {
  try {
    // --- 1️⃣ Determinar si se supera algún umbral ---
    const alertasDetectadas = [];

    if (lectura.temperatura > 35) {
      alertasDetectadas.push({
        tipo: 'critical',
        titulo: 'Temperatura muy alta',
        descripcion: `Temperatura de ${lectura.temperatura}°C registrada.`,
      });
    }

    if (lectura.humedad < 20) {
      alertasDetectadas.push({
        tipo: 'warning',
        titulo: 'Humedad baja',
        descripcion: `Humedad de ${lectura.humedad}% registrada.`,
      });
    }

    if (lectura.caudal > 50) {
      alertasDetectadas.push({
        tipo: 'critical',
        titulo: 'Caudal elevado',
        descripcion: `Caudal de ${lectura.caudal} L/s registrado.`,
      });
    }

    if (alertasDetectadas.length === 0) return null; // nada que alertar

    // --- 2️⃣ Evitar alertas duplicadas ---
    const nuevasAlertas = [];

    for (const alerta of alertasDetectadas) {
      const alertaExistente = await alertas.findOne({
        where: {
          estacion_id: lectura.estacion_id,
          titulo: alerta.titulo,
          activa: true
        }
      });

      // Si ya existe una alerta activa similar, no la repetimos
      if (alertaExistente) {
        console.log(`⚠️ Ya existe alerta activa "${alerta.titulo}" para estación ${lectura.estacion_id}`);
        continue;
      }

      // --- 3️⃣ Crear la nueva alerta ---
      const nuevaAlerta = await alertas.create({
        ...alerta,
        estacion_id: lectura.estacion_id,
        activa: true,
        atendida: false
      });

      nuevasAlertas.push(nuevaAlerta.toJSON());
      console.log(`🚨 Nueva alerta generada: ${alerta.titulo}`);
    }

    return nuevasAlertas;

  } catch (error) {
    console.error('Error al emitir alerta:', error);
    throw error;
  }
}

async function insertReading(reading) {
  try {
		const alerta = await lecturas.create(reading);
			console.log("Lectura creada con exito");
			return true;

	} catch (err) {
		console.log('Error al insertar la lectura', err);
		throw err;
	}
};
// async function getLatest(deviceId) {};

module.exports = { 
	getLecturasActuales, 
	getAlertasActivas, 
	getEstaciones, 
	atenderAlerta,
	emitirAlertaSiCorresponde,
  insertReading
};

