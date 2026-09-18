import { Model, DataTypes, CreationOptional } from 'sequelize';
import sequelize from '../database/cuestionariosConnection';


class HorarioCitasSep extends Model {
  declare id: CreationOptional<number>;
  declare horario_inicio: string;
  declare horario_fin: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

HorarioCitasSep.init(
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
    tableName: 'horarios_citas_sep',
    timestamps: true,
  }
);

export default HorarioCitasSep;
