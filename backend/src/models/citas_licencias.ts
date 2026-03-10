import { Model, DataTypes, CreationOptional, ForeignKey } from 'sequelize';
import sequelize from '../database/cuestionariosConnection';
import HorarioLicencia from './horarios_licencias';
import Sede from './sedes';

class citasLicencia extends Model {
  declare id: CreationOptional<number>;
  declare horario_id: ForeignKey<number>;
  declare sede_id: ForeignKey<number>;
  declare rfc: string | null;
  declare fecha_cita: string;
  declare correo: string;
  declare telefono: string;
  declare folio: string;
  declare path: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare HorarioLicencia?: import('./horarios_licencias').default;
}



citasLicencia.init(
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
    tableName: 'citas_licencias',
    timestamps: true,
  }
);

// 👇 Asociaciones
citasLicencia.belongsTo(HorarioLicencia, { foreignKey: "horario_id", as: "HorarioLicencia" });
citasLicencia.belongsTo(Sede, { foreignKey: 'sede_id', as: 'Sede' });

export default citasLicencia;

