"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const citas_general_1 = __importDefault(require("./citas_general"));
const eventos_1 = __importDefault(require("./eventos"));
const sedes_1 = __importDefault(require("./sedes"));
const tramites_1 = __importDefault(require("./tramites"));
eventos_1.default.hasMany(tramites_1.default, {
    foreignKey: "evento_id",
    as: "m_tramites"
});
eventos_1.default.hasMany(citas_general_1.default, {
    foreignKey: "evento_id",
    as: "m_citasG"
});
eventos_1.default.belongsTo(sedes_1.default, { foreignKey: "sede", as: "mSede" });
citas_general_1.default.belongsTo(eventos_1.default, { foreignKey: "evento_id", as: "mEvento" });
