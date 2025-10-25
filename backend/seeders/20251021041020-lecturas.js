'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return await queryInterface.bulkInsert('lecturas', [
      {
        device_name: 'esp32-01',
        estacion_id: 1,
        temperatura: 24.5,
        humedad: 50.9,
        precipitacion: 600.3,
        caudal: 80.5
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    return await queryInterface.bulkDelete('lecturas', null, {});
  }
};
