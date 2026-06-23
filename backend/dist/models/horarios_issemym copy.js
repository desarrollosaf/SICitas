"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const cuestionariosConnection_1 = __importDefault(require("../database/cuestionariosConnection"));
class HorarioIssemym extends sequelize_1.Model {
}
HorarioIssemym.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    horario_inicio: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    horario_fin: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE,
}, {
    sequelize: cuestionariosConnection_1.default,
    tableName: 'horarios_issemym',
    timestamps: true,
});
exports.default = HorarioIssemym;
