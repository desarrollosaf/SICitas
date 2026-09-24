import { Model, DataTypes, CreationOptional } from 'sequelize';
import sequelize from '../database/cuestionariosConnection';
import agendaEventos from './eventos';
import Tramites from './tramites';


class CitasGeneral extends Model {
  declare id: CreationOptional<number>;
  declare folio: string;
  declare rfc_solicitante: string;
  declare evento_id: string;
  declare fecha_cita: string;
  declare horario_id: number;
  declare tramite: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare mEvento?: agendaEventos;
}

CitasGeneral.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    folio: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    rfc_solicitante: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    evento_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    fecha_cita: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    horario_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    tramite: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'citas_general',
    timestamps: true,
  }
);

CitasGeneral.belongsTo(agendaEventos, { foreignKey: "evento_id", as: "mEvento" });




export default CitasGeneral;
