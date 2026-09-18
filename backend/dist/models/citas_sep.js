"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const cuestionariosConnection_1 = __importDefault(require("../database/cuestionariosConnection"));
const sedes_1 = __importDefault(require("./sedes"));
const horarios_citas_sep_1 = __importDefault(require("./horarios_citas_sep"));
class CitaSep extends sequelize_1.Model {
}
CitaSep.init({
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
    folio: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    fecha_cita: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
    },
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE,
}, {
    sequelize: cuestionariosConnection_1.default,
    tableName: 'citas_sep26',
    timestamps: true,
});
// 👇 Asociaciones
CitaSep.belongsTo(horarios_citas_sep_1.default, { foreignKey: "horario_id", as: "HorarioCita" });
CitaSep.belongsTo(sedes_1.default, { foreignKey: 'sede_id', as: 'Sede' });
exports.default = CitaSep;
