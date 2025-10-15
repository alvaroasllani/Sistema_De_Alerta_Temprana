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
      device_id: {
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
        type: Sequelize.DECIMAL(5, 2)
      },
      humedad: {
        type: Sequelize.DECIMAL(5, 2)
      },
      lluvia: {
        type: Sequelize.DECIMAL(5, 2)
      },
      caudal: {
        type: Sequelize.DECIMAL(5, 2)
      },
      presion: {
        type: Sequelize.DECIMAL(5, 2)
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
