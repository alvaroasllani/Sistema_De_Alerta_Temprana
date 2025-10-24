'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('estaciones', [
      {
        codigo: 'esp32-01',
        nombre: 'Estacion 1',
        ubicacion: 'Cualquier Punto',
        latitud: 122.65,
        longitud: 232.78
      },
      {
        codigo: 'esp32-02',
        nombre: 'Estacion 2',
        ubicacion: 'Cualquier Punto',
        latitud: 932.65,
        longitud: 132.78
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('estaciones', null, {});
  }
};
