'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return await queryInterface.bulkInsert('lecturas', [
      {
        device_id: 'esp32-01',
        estacion_id: 1,
        temperatura: 22.5,
        humedad: 64,
        lluvia: 10.9,
        presion: 10.3,
        caudal: 19.5
      },
      {
        device_id: 'esp32-02',
        estacion_id: 2,
        temperatura: 24.5,
        humedad: 78,
        lluvia: 9.5,
        presion: 19.3,
        caudal: 21.5
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    return await queryInterface.bulkDelete('lecturas', null, {});
  }
};
