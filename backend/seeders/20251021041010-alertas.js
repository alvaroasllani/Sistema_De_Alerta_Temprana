'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('alertas', [
      {
        titulo: 'Nivel de caudal alto',
        descripcion: 'El río San Pedro ha superado el umbral crítico',
        tipo: 'critical',
        estacion_id: 1
      },
      {
        titulo: 'Lluvia intensa',
        descripcion: 'Precipitaciones superiores a 20 mm/h',
        tipo: 'warning',
        estacion_id: 2
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('alertas', null, {});
  }
};
