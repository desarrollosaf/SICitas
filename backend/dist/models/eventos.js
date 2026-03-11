"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const cuestionariosConnection_1 = __importDefault(require("../database/cuestionariosConnection"));
const citas_issemym_1 = __importDefault(require("./citas_issemym"));
const citas_licencias_1 = __importDefault(require("./citas_licencias"));
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
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE,
}, {
    sequelize: cuestionariosConnection_1.default,
    tableName: 'agenda_eventos',
    timestamps: true,
});
agendaEventos.hasMany(citas_issemym_1.default, {
    foreignKey: "fecha_cita",
    sourceKey: "fecha_cita",
    as: "m_citasI"
});
agendaEventos.hasMany(citas_licencias_1.default, {
    foreignKey: "fecha_cita",
    sourceKey: "fecha_cita",
    as: "m_citasL"
});
exports.default = agendaEventos;
