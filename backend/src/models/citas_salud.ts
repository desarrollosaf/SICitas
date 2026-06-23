import { Model, DataTypes, CreationOptional, ForeignKey } from 'sequelize';
import sequelize from '../database/cuestionariosConnection';

import { dp_fum_datos_generales } from './fun/dp_fum_datos_generales';
import HorariosSalud from './horarios_salud';

class citasSalud extends Model {
  declare id: CreationOptional<number>;
  declare rfc: string | null;
  declare fecha_cita: string;
  declare correo: string;
  declare telefono: string;
  declare folio: string;
  declare path: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare HorarioSalud?: import('./horarios_salud').default;
}

citasSalud.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    rfc: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fecha_cita: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    correo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    telefono: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    folio: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    path: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'citas_salud',
    timestamps: true,
  }
);

export default citasSalud;

