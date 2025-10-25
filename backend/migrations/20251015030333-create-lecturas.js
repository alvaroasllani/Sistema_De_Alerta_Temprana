'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('lecturas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      device_name: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      estacion_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'estaciones',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      temperatura: {
        type: Sequelize.DECIMAL(4, 1)   // -999.9 a 999.9%
      },
      humedad: {
        type: Sequelize.DECIMAL(4, 1)   // -999.9 a 999.9%
      },
      caudal: {
        type: Sequelize.DECIMAL(6, 3)   // -999.999 a 999.999L/s
      },
      precipitacion: {
        type: Sequelize.DECIMAL(5, 1)   // -99999.9 a 99999.9hPa
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('lecturas');
  }
};
