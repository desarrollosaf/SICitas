"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const cuestionariosConnection_1 = __importDefault(require("../database/cuestionariosConnection"));
const horarios_licencias_1 = __importDefault(require("./horarios_licencias"));
const sedes_1 = __importDefault(require("./sedes"));
class citasLicencia extends sequelize_1.Model {
}
citasLicencia.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    horario_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    sede_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    rfc: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    fecha_cita: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
    },
    correo: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    telefono: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    folio: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    path: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE,
}, {
    sequelize: cuestionariosConnection_1.default,
    tableName: 'citas_licencias',
    timestamps: true,
});
// 👇 Asociaciones
citasLicencia.belongsTo(horarios_licencias_1.default, { foreignKey: "horario_id", as: "HorarioLicencia" });
citasLicencia.belongsTo(sedes_1.default, { foreignKey: 'sede_id', as: 'Sede' });
exports.default = citasLicencia;
