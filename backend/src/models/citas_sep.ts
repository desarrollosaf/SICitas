import { Model, DataTypes, CreationOptional, ForeignKey } from 'sequelize';
import sequelize from '../database/cuestionariosConnection';
import Sede from './sedes';
import HorarioCitasSep from './horarios_citas_sep';

class CitaSep extends Model {
  declare id: CreationOptional<number>;
  declare horario_id: ForeignKey<number>;
  declare sede_id: ForeignKey<number>;
  declare rfc: string | null;
  declare fecha_cita: string;
  declare folio: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare HorarioCita?: import('./horarios_citas_sep').default;
}



CitaSep.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    horario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    sede_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    rfc: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    folio: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fecha_cita: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'citas_sep26',
    timestamps: true,
  }
);

// 👇 Asociaciones
CitaSep.belongsTo(HorarioCitasSep, { foreignKey: "horario_id", as: "HorarioCita" });
CitaSep.belongsTo(Sede, { foreignKey: 'sede_id', as: 'Sede' });

export default CitaSep;

