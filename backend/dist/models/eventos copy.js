"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const cuestionariosConnection_1 = __importDefault(require("../database/cuestionariosConnection"));
const citas_issemym_1 = __importDefault(require("./citas_issemym"));
const citas_licencias_1 = __importDefault(require("./citas_licencias"));
const citas_salud_1 = __importDefault(require("./citas_salud"));
const citas_sep_1 = __importDefault(require("./citas_sep"));
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
    table: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    funcionController: {
        type: sequelize_1.DataTypes.STRING,
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
agendaEventos.hasMany(citas_salud_1.default, {
    foreignKey: "fecha_cita",
    sourceKey: "fecha_cita",
    as: "m_citasS"
});
agendaEventos.hasMany(citas_sep_1.default, {
    foreignKey: "fecha_cita",
    sourceKey: "fecha_cita",
    as: "m_citasSep"
});
agendaEventos.hasMany(Tramites, {
    foreignKey: "fecha_cita",
    sourceKey: "fecha_cita",
    as: "m_citasSep"
});
exports.default = agendaEventos;
