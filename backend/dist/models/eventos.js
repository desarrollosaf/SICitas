"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const cuestionariosConnection_1 = __importDefault(require("../database/cuestionariosConnection"));
class agendaEventos extends sequelize_1.Model {
}
agendaEventos.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    fecha_cita: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
    },
    evento: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    hora_inicio: {
        type: sequelize_1.DataTypes.TIME,
        allowNull: true,
    },
    hora_termino: {
        type: sequelize_1.DataTypes.TIME,
        allowNull: true,
    },
    sede: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    horarios: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: true,
    },
    table_horarios: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    total_citas_dia: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    limite_horario: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    organizador: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    genero: {
        type: sequelize_1.DataTypes.STRING(1),
        allowNull: true,
    },
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE,
}, {
    sequelize: cuestionariosConnection_1.default,
    tableName: 'agenda_eventos',
    timestamps: true,
});
exports.default = agendaEventos;
