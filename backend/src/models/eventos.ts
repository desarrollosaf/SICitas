import { Model, DataTypes, CreationOptional, ForeignKey } from 'sequelize';
import sequelize from '../database/cuestionariosConnection';
import citasIssemym from './citas_issemym';
import citasLicencia from './citas_licencias';
import citasSalud from './citas_salud';
import CitaSep from './citas_sep';
import Tramites from './tramites';
import Sede from './sedes';

class agendaEventos extends Model {
  declare id: CreationOptional<number>;
  declare fecha_cita: string;
  declare evento: string;
  declare hora_inicio: string;
  declare hora_termino: string;
  declare sede: number;
  declare horarios: Boolean;
  declare table_horarios: string;
  declare total_citas_dia: number;
  declare limite_horario: number;
  declare organizador: string;
  declare genero: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare mSede?: Sede; 
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
    hora_inicio: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    hora_termino: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    sede: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    horarios: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    table_horarios: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    total_citas_dia:{
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    limite_horario:{
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    organizador:{
      type: DataTypes.STRING,
      allowNull: true,
    },
    genero:{
      type: DataTypes.STRING(1),
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


agendaEventos.hasMany(citasSalud,{
    foreignKey: "fecha_cita",
    sourceKey: "fecha_cita",
    as: "m_citasS"
});

agendaEventos.hasMany(CitaSep,{
    foreignKey: "fecha_cita",
    sourceKey: "fecha_cita",
    as: "m_citasSep"
});

agendaEventos.hasMany(Tramites,{
    foreignKey: "evento_id",
    as: "m_tramites"
});


agendaEventos.belongsTo(Sede, { foreignKey: "sede", as: "mSede" });


export default agendaEventos;