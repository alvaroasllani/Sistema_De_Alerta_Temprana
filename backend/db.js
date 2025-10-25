/**
 * Archivo de funciones de base de datos para el Sistema de Alerta Temprana
 * Contiene todas las operaciones CRUD y lógica de negocio relacionada con:
 * - Estaciones meteorológicas
 * - Lecturas de sensores
 * - Alertas del sistema
 */
require('dotenv').config();

const db = require('./models');
const { estaciones, alertas, sequelize, lecturas } = db;

/**
 * Obtiene todas las estaciones meteorológicas registradas en el sistema
 * @returns {Promise<Array>} Array de objetos con los datos de las estaciones
 * @throws {Error} Si ocurre un error al consultar la base de datos
 */
async function getEstaciones() {
	try {
		const lista = await estaciones.findAll();
		return lista.map(est => est.toJSON());
	} catch (err) {
		console.log('Error al obtener estaciones: ', err);
		throw err;
	}
}

/**
 * Obtiene todas las alertas activas del sistema con información de la estación asociada
 * @returns {Promise<Array>} Array de alertas activas con datos de la estación
 * @throws {Error} Si ocurre un error al consultar la base de datos
 * @todo Corregir la recepcion de datos con el frontend
 */
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

/**
 * Obtiene las lecturas más recientes de cada estación meteorológica
 * Utiliza una consulta SQL personalizada para obtener la última lectura de cada device_id
 * @returns {Promise<Array>} Array con las lecturas actuales de todas las estaciones
 * @throws {Error} Si ocurre un error al ejecutar la consulta
 * @todo Corregir las rutas en el frontend
 */
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

/**
 * Marca una alerta como atendida, desactivándola del sistema
 * @param {number} id - ID de la alerta a marcar como atendida
 * @returns {Promise<boolean>} true si la alerta fue marcada como atendida, false si no se encontró
 * @throws {Error} Si ocurre un error al actualizar la alerta
 */
async function atenderAlerta(id) {
	try {
		const alerta = await alertas.findByPk(id);
		if (alerta) {
			alerta.activa = false;
			await alerta.save();
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
 * Evalúa una nueva lectura y emite alertas si se superan los umbrales definidos
 * Evita generar alertas duplicadas por estación y tipo de condición.
 * Umbrales de alerta:
 * - Caudal
 * 		>=5.1 L/s (warning)
 * 		>=5.8 L/s (critical)
 * - Precipitacion 
 * 		>=730 mm/h (warning)
 * 		>=1000 mm/h (critical)
 * 
 * @param {object} lectura - Objeto con los datos de la lectura del sensor
 * @param {number} lectura.caudal - Caudal en litros por segundo
 * @param {number} lectura.estacion_id - ID de la estación que generó la lectura
 * @returns {Promise<Array|null>} Array de nuevas alertas creadas o null si no hay alertas
 * @throws {Error} Si ocurre un error al procesar la lectura o crear alertas
 */
async function emitirAlertaSiCorresponde(lectura) {
  try {
    const alertasDetectadas = [];

    if (lectura.caudal >= 5.8) {
      alertasDetectadas.push({
        tipo: 'critical',
        titulo: 'Caudal con nivel: Critico',
        descripcion: `Caudal de ${lectura.caudal} L/s registrado.`,
      });
		} else if (lectura.caudal >= 5.1) {
			alertasDetectadas.push({
        tipo: 'warning',
        titulo: 'Caudal con nivel: Moderado',
        descripcion: `Caudal de ${lectura.caudal} L/s registrado.`,
      });
    }
		
		if (lectura.precipitacion >= 1000.0) {
      alertasDetectadas.push({
        tipo: 'critical',
        titulo: 'Precipitacion con nivel: Critico',
        descripcion: `Precipitacion de ${lectura.precipitacion} mm/h registrado.`,
      });
		} else if (lectura.precipitacion >= 730.0) {
			alertasDetectadas.push({
        tipo: 'warning',
        titulo: 'Precipitacion con nivel: Moderado',
        descripcion: `Precipitacion de ${lectura.precipitacion} mm/h registrado.`,
      });
    } 

    if (alertasDetectadas.length === 0) return null; // Nada que alertar

    const nuevasAlertas = [];

    for (const alerta of alertasDetectadas) {
      const alertaExistente = await alertas.findOne({
        where: {
          estacion_id: lectura.estacion_id,
          titulo: alerta.titulo,
          activa: true
        }
      });

      if (alertaExistente) {
        console.log(`⚠️ Ya existe alerta activa "${alerta.titulo}" para estación ${lectura.estacion_id}`);
        continue;
      }

      const nuevaAlerta = await alertas.create({
        ...alerta,
        estacion_id: lectura.estacion_id
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

/**
 * Inserta una nueva lectura de sensor en la base de datos
 * @param {object} reading - Objeto con los datos de la lectura a insertar
 * @param {string} reading.device_name - Nombre del dispositivo/estación
 * @param {number} reading.temperatura - Temperatura registrada
 * @param {number} reading.humedad - Humedad registrada
 * @param {number} reading.caudal - Caudal registrado
 * @param {number} reading.precipitacion - Precipitacion registrada
 * @param {number} reading.estacion_id - ID de la estación asociada
 * @returns {Promise<object>} El objeto de lectura creado en la base de datos
 * @throws {Error} Si ocurre un error al insertar la lectura
 */
async function insertReading(reading) {
  try {
		const alerta = await lecturas.create(reading);
		return alerta;
	} catch (err) {
		console.log('Error al insertar la lectura', err);
		throw err;
	}
};

/**
 * Exporta todas las funciones de base de datos disponibles
 * @module db
 */
module.exports = { 
	getLecturasActuales,    		// Obtiene lecturas más recientes de cada estación
	getAlertasActivas,      		// Obtiene alertas activas con datos de estación
	getEstaciones,          		// Obtiene todas las estaciones registradas
	atenderAlerta,          		// Marca una alerta como atendida
	emitirAlertaSiCorresponde, 	// Evalúa lecturas y genera alertas si corresponde
  insertReading           		// Inserta una nueva lectura de sensor y retorna el objeto creado
};

