import { Model, DataTypes, CreationOptional } from 'sequelize';
import sequelize from '../database/cuestionariosConnection';
import citasIssemym from './citas_issemym';

class HorariosSalud extends Model {
  declare id: CreationOptional<number>;
  declare horario_inicio: string;
  declare horario_fin: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

HorariosSalud.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    horario_inicio: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    horario_fin: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'horarios_salud',
    timestamps: true,
  }
);

export default HorariosSalud;
