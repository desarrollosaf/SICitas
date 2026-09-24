"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const cuestionariosConnection_1 = __importDefault(require("../database/cuestionariosConnection"));
const eventos_1 = __importDefault(require("./eventos"));
class CitasGeneral extends sequelize_1.Model {
}
CitasGeneral.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    folio: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    rfc_solicitante: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    evento_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    fecha_cita: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    horario_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    tramite: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE,
}, {
    sequelize: cuestionariosConnection_1.default,
    tableName: 'citas_general',
    timestamps: true,
});
CitasGeneral.belongsTo(eventos_1.default, { foreignKey: "evento_id", as: "mEvento" });
exports.default = CitasGeneral;
