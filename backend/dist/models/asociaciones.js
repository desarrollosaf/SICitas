"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HorarioCita = exports.Cita = exports.Sede = void 0;
// asociaciones.ts o index de modelos
const sedes_1 = __importDefault(require("./sedes"));
exports.Sede = sedes_1.default;
const citas_1 = __importDefault(require("./citas"));
exports.Cita = citas_1.default;
const horarios_citas_1 = __importDefault(require("./horarios_citas"));
exports.HorarioCita = horarios_citas_1.default;
// Definir asociaciones aquí (solo aquí, para evitar ciclos)
sedes_1.default.hasMany(citas_1.default, { foreignKey: 'sede_id', as: 'Citas' });
citas_1.default.belongsTo(sedes_1.default, { foreignKey: 'sede_id', as: 'Sede' });
citas_1.default.belongsTo(horarios_citas_1.default, { foreignKey: 'horario_id', as: 'HorarioCita' });
