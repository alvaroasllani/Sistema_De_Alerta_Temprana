'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class alertas extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      alertas.belongsTo(models.estaciones, {
        foreignKey: 'estacion_id',
        as: 'estacion'
      });
    }
  }
  alertas.init({
    titulo: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    descripcion: DataTypes.TEXT,
    tipo: {
      type: DataTypes.ENUM('informative', 'warning', 'critical'),
      allowNull: false,
      defaultValue: 'informative'
    },
    estacion_id:DataTypes.INTEGER,
    activa: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    atendida: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'alertas',
  });
  return alertas;
};