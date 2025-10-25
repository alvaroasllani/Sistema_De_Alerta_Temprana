'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class estaciones extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      estaciones.hasMany(models.alertas, {
        foreignKey: 'estacion_id',
        as: 'alertas'
      });

      estaciones.hasMany(models.lecturas, {
        foreignKey: 'estacion_id',
        as: 'lecturas'
      });
    }
  }
  estaciones.init({
    codigo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    ubicacion: DataTypes.STRING(150)
  }, {
    sequelize,
    modelName: 'estaciones',
  });
  return estaciones;
};