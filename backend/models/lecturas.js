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
    device_id: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    estacion_id: DataTypes.INTEGER,
    temperatura:DataTypes.DECIMAL(5,2),
    humedad:DataTypes.DECIMAL(5,2),
    lluvia:DataTypes.DECIMAL(5,2),
    caudal:DataTypes.DECIMAL(5,2),
    presion:DataTypes.DECIMAL(5,2)
  }, {
    sequelize,
    modelName: 'lecturas',
  });
  return lecturas;
};