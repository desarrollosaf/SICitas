import { Model, DataTypes, CreationOptional, ForeignKey } from 'sequelize';
import sequelize from '../database/cuestionariosConnection';

class agendaEventos extends Model {
  declare id: CreationOptional<number>;
  declare fecha_cita: string;
  declare evento: string;
  declare hora_inicio: string;
  declare hora_termino: string;
  declare sede: number;
  declare horarios: boolean;
  declare table_horarios: string;
  declare total_citas_dia: number;
  declare limite_horario: number;
  declare organizador: string;
  declare genero: string | null;
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


export default agendaEventos;