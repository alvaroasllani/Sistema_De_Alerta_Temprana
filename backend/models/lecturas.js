'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class lecturas extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      lecturas.belongsTo(models.estaciones, {
        foreignKey: 'estacion_id',
        as: 'estacion'
      });
    }
  }
  lecturas.init({
    device_name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    estacion_id: DataTypes.INTEGER,
    temperatura: DataTypes.DECIMAL(4, 1),   // -999.9 a 999.9%
    humedad: DataTypes.DECIMAL(4, 1),       // -999.9 a 999.9%
    caudal: DataTypes.DECIMAL(6, 3),        // -999.999 a 999.999L/s
    precipitacion: DataTypes.DECIMAL(5, 1)  // -99999.9 a 99999.9hPa
  }, {
    sequelize,
    modelName: 'lecturas',
  });
  return lecturas;
};