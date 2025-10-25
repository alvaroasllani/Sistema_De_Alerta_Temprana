'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('estaciones', [
      {
        codigo: 'esp32-01',
        nombre: 'Estacion 1',
        ubicacion: 'Cualquier Punto'
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('estaciones', null, {});
  }
};
