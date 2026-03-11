import { Model, DataTypes, CreationOptional, ForeignKey } from 'sequelize';
import sequelize from '../database/cuestionariosConnection';
import citasIssemym from './citas_issemym';
import citasLicencia from './citas_licencias';

class agendaEventos extends Model {
  declare id: CreationOptional<number>;
  declare fecha_cita: string;
  declare evento: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}



agendaEventos.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    fecha_cita: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    evento: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'agenda_eventos',
    timestamps: true,
  }
);

agendaEventos.hasMany(citasIssemym,{
    foreignKey: "fecha_cita",
    sourceKey: "fecha_cita",
    as: "m_citasI"
});

agendaEventos.hasMany(citasLicencia,{
    foreignKey: "fecha_cita",
    sourceKey: "fecha_cita",
    as: "m_citasL"
});

export default agendaEventos;