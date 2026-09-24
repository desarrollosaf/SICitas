"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.acuse = exports.savecita = exports.getEvento = exports.getGeneral = void 0;
exports.generarPDFBufferSep = generarPDFBufferSep;
exports.generarPDFBufferGen = generarPDFBufferGen;
const sequelize_1 = require("sequelize");
const dp_fum_datos_generales_1 = require("../models/fun/dp_fum_datos_generales");
const dp_datospersonales_1 = require("../models/fun/dp_datospersonales");
const fun_1 = __importDefault(require("../database/fun"));
const pdfkit_1 = __importDefault(require("pdfkit"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const horarios_diez_1 = __importDefault(require("../models/horarios_diez"));
const citas_general_1 = __importDefault(require("../models/citas_general"));
const eventos_1 = __importDefault(require("../models/eventos"));
const cuestionariosConnection_1 = __importDefault(require("../database/cuestionariosConnection"));
const tramites_1 = __importDefault(require("../models/tramites"));
const sedes_1 = __importDefault(require("../models/sedes"));
console.log('MODELO DIRECTO:', horarios_diez_1.default);
dp_datospersonales_1.dp_datospersonales.initModel(fun_1.default);
dp_fum_datos_generales_1.dp_fum_datos_generales.initModel(fun_1.default);
const getGeneral = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { rfc } = req.params;
    const citas = yield citas_general_1.default.findAll({
        where: {
            'rfc_solicitante': rfc
        },
        include: {
            model: eventos_1.default,
            as: 'mEvento'
        }
    });
    for (const cita of citas) {
        if (cita.tramite != '' && cita.tramite != null) {
            const idsTramites = String(cita.tramite)
                .split(',')
                .map(Number);
            const tramites = yield tramites_1.default.findAll({
                where: {
                    id: idsTramites
                }
            });
            cita.setDataValue('nombres_tramites', tramites.map((tramite) => tramite.tramite).join(', '));
        }
        else {
            console.log('******* cita.tramite else', (_a = cita.mEvento) === null || _a === void 0 ? void 0 : _a.evento);
            cita.setDataValue('nombres_tramites', (_b = cita.mEvento) === null || _b === void 0 ? void 0 : _b.evento);
            console.log(cita);
        }
    }
    const eventos = yield eventos_1.default.findAll({
        where: {
            organizador: { [sequelize_1.Op.notIn]: ['0', ''] }
        }
    });
    const resultados = {
        'citas': citas,
        'eventos': eventos
    };
    console.log('resultados ', resultados);
    return res.json({ resultados });
});
exports.getGeneral = getGeneral;
const getEvento = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { fecha } = req.params;
    const resultado = [];
    const evento = yield eventos_1.default.findOne({
        where: {
            'fecha_cita': fecha
        },
        include: {
            model: tramites_1.default,
            as: 'm_tramites'
        }
    });
    const citas = yield citas_general_1.default.count({
        where: {
            fecha_cita: fecha,
            evento_id: evento === null || evento === void 0 ? void 0 : evento.id
        },
    });
    if ((evento === null || evento === void 0 ? void 0 : evento.horarios) === true) {
        console.log('********* evento.table_horarios ********* ', evento.table_horarios);
        const modeloHorarios = cuestionariosConnection_1.default.models[evento.table_horarios];
        if (!modeloHorarios) {
            throw new Error(`No existe el modelo: ${evento.table_horarios}`);
        }
        const horariosDisponibles = yield modeloHorarios.findAll({
            order: [['id', 'ASC']]
        });
        const horaInicioEvento = (_a = evento.hora_inicio) === null || _a === void 0 ? void 0 : _a.slice(0, 5);
        const horaTerminoEvento = (_b = evento.hora_termino) === null || _b === void 0 ? void 0 : _b.slice(0, 5);
        const horariosEnRango = horariosDisponibles.filter((h) => {
            if (!horaInicioEvento || !horaTerminoEvento)
                return true;
            return h.horario_inicio >= horaInicioEvento && h.horario_fin <= horaTerminoEvento;
        });
        const sinTopeDiario = !evento.total_citas_dia || citas < evento.total_citas_dia;
        if (sinTopeDiario) {
            const limitePorHorario = evento.limite_horario || 1;
            const citasPorHorario = yield citas_general_1.default.findAll({
                where: { evento_id: evento.id },
                attributes: ['horario_id']
            });
            const conteoPorHorario = {};
            citasPorHorario.forEach((c) => {
                conteoPorHorario[c.horario_id] = (conteoPorHorario[c.horario_id] || 0) + 1;
            });
            horariosEnRango
                .filter((h) => (conteoPorHorario[h.id] || 0) < limitePorHorario)
                .forEach((h) => {
                resultado.push({
                    horario_id: h.id,
                    horario_texto: `${h.horario_inicio} - ${h.horario_fin}`,
                });
            });
        }
    }
    const respuesta = {
        'horarios': resultado,
        'evento': evento
    };
    console.log('********** respuesta ', respuesta);
    return res.json(respuesta);
});
exports.getEvento = getEvento;
const savecita = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { body } = req;
        console.log('** body ', body);
        const citaExistente = yield citas_general_1.default.findOne({
            where: {
                rfc_solicitante: body.rfc,
                evento_id: body.evento
            }
        });
        console.log('citaExistente ', citaExistente);
        const evento = yield eventos_1.default.findOne({
            where: {
                'id': body.evento
            }
        });
        console.log('evento  ', evento);
        let limite = 1;
        if (evento === null || evento === void 0 ? void 0 : evento.limite_horario) {
            limite = evento === null || evento === void 0 ? void 0 : evento.limite_horario;
        }
        console.log('limite ', limite);
        if (citaExistente) {
            return res.status(400).json({
                status: 400,
                msg: "Ya existe una cita registrada con ese RFC"
            });
        }
        const cantidadCitas = yield citas_general_1.default.count({
            where: {
                horario_id: body.horario_id,
                evento_id: body.evento
            }
        });
        console.log('cantidadCitas ', cantidadCitas);
        if (cantidadCitas >= limite) {
            return res.status(400).json({
                status: 400,
                msg: "Este horario ya no tiene ocupo para la fecha seleccionada"
            });
        }
        const folio = Math.floor(10000000 + Math.random() * 90000000);
        console.log('folio ', folio);
        let tramites = '';
        if (body.tramite) {
            tramites = body.tramite.join(',');
        }
        const cita = yield citas_general_1.default.create({
            rfc_solicitante: body.rfc,
            evento_id: body.evento,
            fecha_cita: body.fecha_cita,
            horario_id: body.horario_id,
            folio: folio,
            tramite: tramites
        });
        const Validacion = yield dp_fum_datos_generales_1.dp_fum_datos_generales.findOne({
            where: { f_rfc: body.rfc },
            attributes: ["f_nombre", "f_primer_apellido", "f_segundo_apellido", "f_sexo", "f_fecha_nacimiento"]
        });
        if (!Validacion) {
            throw new Error("No se encontró información para el RFC proporcionado");
        }
        const nombreCompleto = [
            Validacion.f_nombre,
            Validacion.f_primer_apellido,
            Validacion.f_segundo_apellido
        ].filter(Boolean).join(" ");
        const sexo = Validacion.f_sexo || "";
        let edad = "";
        if (Validacion.f_fecha_nacimiento) {
            const nacimiento = new Date(Validacion.f_fecha_nacimiento);
            const hoy = new Date();
            edad = (hoy.getFullYear() - nacimiento.getFullYear()).toString();
            const mes = hoy.getMonth() - nacimiento.getMonth();
            if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
                edad = (parseInt(edad) - 1).toString();
            }
        }
        return res.json({
            status: 200,
            msg: "Cita registrada correctamente",
        });
    }
    catch (error) {
        console.error('Error al guardar la cita:', error);
        return res.status(500).json({ msg: 'Error interno del servidor' });
    }
});
exports.savecita = savecita;
const acuse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    try {
        const { id } = req.params;
        const cita = yield citas_general_1.default.findOne({
            where: { id: id },
            include: {
                model: eventos_1.default,
                as: 'mEvento'
            }
        });
        const Validacion = yield dp_fum_datos_generales_1.dp_fum_datos_generales.findOne({
            where: { f_rfc: cita === null || cita === void 0 ? void 0 : cita.rfc_solicitante },
            attributes: ["f_nombre", "f_primer_apellido", "f_segundo_apellido", "f_sexo", "f_fecha_nacimiento", "f_curp"]
        });
        if (!Validacion) {
            throw new Error("No se encontró información para el RFC proporcionado");
        }
        const sede2 = ((_b = (yield sedes_1.default.findOne({ where: { id: (_a = cita === null || cita === void 0 ? void 0 : cita.mEvento) === null || _a === void 0 ? void 0 : _a.sede } }))) === null || _b === void 0 ? void 0 : _b.sede) || "";
        const nombreCompleto = [
            Validacion.f_nombre,
            Validacion.f_primer_apellido,
            Validacion.f_segundo_apellido
        ].filter(Boolean).join(" ");
        const sexo = Validacion.f_sexo || "";
        let curp1 = Validacion.f_curp || "";
        console.log(Validacion);
        let edad = "";
        let citaHora = '';
        if (Validacion.f_fecha_nacimiento) {
            const nacimiento = new Date(Validacion.f_fecha_nacimiento);
            const hoy = new Date();
            edad = (hoy.getFullYear() - nacimiento.getFullYear()).toString();
            const mes = hoy.getMonth() - nacimiento.getMonth();
            if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
                edad = (parseInt(edad) - 1).toString();
            }
        }
        if (!cita) {
            return res.status(404).json({ error: "No se encontró la cita" });
        }
        let tramites;
        if (cita.tramite != null && cita.tramite != '') {
            tramites = cita.tramite.split(',').map((tramite) => {
                const id = Number(tramite.trim());
                const tram = tramites_1.default.findByPk(id);
                return tram.tramite;
            }).filter((tramite) => tramite !== undefined);
        }
        else {
            tramites = (_c = cita.mEvento) === null || _c === void 0 ? void 0 : _c.evento;
        }
        if (((_d = cita.mEvento) === null || _d === void 0 ? void 0 : _d.horarios) === true) {
            console.log('cita.mEvento?.table_horarios ', (_e = cita.mEvento) === null || _e === void 0 ? void 0 : _e.table_horarios);
            const model = cuestionariosConnection_1.default.models[(_f = cita.mEvento) === null || _f === void 0 ? void 0 : _f.table_horarios];
            if (!model) {
                throw new Error(`No existe el modelo: ${(_g = cita.mEvento) === null || _g === void 0 ? void 0 : _g.table_horarios}`);
            }
            const horario = yield model.findByPk(cita.horario_id);
            citaHora = horario.horario_inicio + '-' + horario.horario_fin;
        }
        else {
            citaHora = 'Presentarse en la sede indicada a las ' + ((_h = cita.mEvento) === null || _h === void 0 ? void 0 : _h.hora_inicio);
        }
        const pdfBuffer = yield generarPDFBufferGen({
            folio: cita.folio,
            nombreCompleto: nombreCompleto,
            sexo: '',
            edad: edad,
            curp: curp1,
            fecha: cita.fecha_cita,
            sede: (_k = (_j = cita.mEvento) === null || _j === void 0 ? void 0 : _j.mSede) === null || _k === void 0 ? void 0 : _k.sede,
            horario: citaHora,
            citaId: cita.id,
            tramites: tramites,
            evento: (_l = cita.mEvento) === null || _l === void 0 ? void 0 : _l.evento,
            organizador: (_m = cita.mEvento) === null || _m === void 0 ? void 0 : _m.organizador,
        });
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="acuse.pdf"`);
        res.send(pdfBuffer);
    }
    catch (error) {
        console.error("❌ Error generando Acuse:", error);
        res.status(500).json({ error: "Error generando Acuse" });
    }
});
exports.acuse = acuse;
function generarPDFBufferSep(data) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const doc = new pdfkit_1.default({ size: "LETTER", margin: 50 });
            const chunks = [];
            const pdfDir = path_1.default.join(process.cwd(), "storage/public/pdfs");
            if (!fs_1.default.existsSync(pdfDir)) {
                fs_1.default.mkdirSync(pdfDir, { recursive: true });
            }
            const fileName = `acuse_${data.folio}.pdf`;
            const filePath = path_1.default.join(pdfDir, fileName);
            const relativePath = path_1.default.join("storage", "public", "pdfs", fileName);
            console.log(relativePath);
            // const writeStream = fs.createWriteStream(filePath);
            // doc.pipe(writeStream);
            doc.on("data", (chunk) => chunks.push(chunk));
            doc.on("end", () => __awaiter(this, void 0, void 0, function* () {
                try {
                    // Guardar la ruta del PDF en la tabla citas
                    // await Cita.update(
                    //   { path: relativePath },
                    //   { where: { id: data.citaId } }
                    // );
                    resolve(Buffer.concat(chunks));
                }
                catch (error) {
                    reject(error);
                }
            }));
            doc.on("error", reject);
            // ===== CONTENIDO DEL PDF =====
            doc.image(path_1.default.join(__dirname, "../assets/salud_page_mem.jpg"), 0, 0, {
                width: doc.page.width,
                height: doc.page.height,
            });
            doc.moveDown(6);
            doc
                .fontSize(18)
                .font("Helvetica-Bold")
                .fillColor("#7d0037") // ✅ Aplica el color
                .text("PROGRAMA DE CREDENCIALIZACIÓN Y ACTUALIZACIÓN DE CARTA TESTAMENTARIA DEL ISSEMYM", {
                align: "center",
            })
                .fillColor("black");
            doc.moveDown(2);
            doc.font("Helvetica").fontSize(12).text(`Folio: ${data.folio}`, { align: "right" });
            doc.font("Helvetica").fontSize(12).text(`Fecha cita: ${data.fecha}`, { align: "right" });
            doc.fontSize(12)
                .font("Helvetica")
                .text(`Servidor público: ${data.nombreCompleto} | Edad: ${data.edad} años`, { align: "left" })
                .text(`CURP: ${data.curp}`, { align: "left" })
                .text(`Ubicación: ${data.sede}`, { align: "left" })
                .text(`Horario: ${data.horario}`, { align: "left" })
                .text(`Tramites: ${data.tramites}`, { align: "left" });
            doc.moveDown();
            doc.fontSize(12).text("REQUISITOS NUEVO INGRESO DE SERVIDOR PÚBLICO.", { align: "center" });
            doc.moveDown();
            doc.fontSize(10)
                .font("Helvetica")
                .text(`1) Original del Aviso de Movimiento de Alta (emitido por Recursos Humanos de la dependencia y contiene clave ISSEMYM)`, { align: "justify" })
                .text(`2) Original del comprobante de pago, debe ser de la última quincena vigente y que contenga la clave ISSEMyM.`, { align: "justify" })
                .text(`3) Original o copia certificada del acta de nacimiento.`, { align: "justify" })
                .text(`4) Original de identificación oficial vigente (pasaporte expedido por autoridad competente, credencial para votar expedida por el Instituto Nacional Electoral (INE), matrícula consular expedida por la Secretaría de Relaciones Exteriores a ciudadanos mexicanos domiciliados en el extranjero, Cartilla Militar liberada o Constancia de Identidad expedida por el Secretario del Ayuntamiento según corresponda el domicilio del derechohabiente, con sello sobre la fotografía y con una antigüedad no mayor a tres meses a la fecha del trámite).`, { align: "justify" });
            doc.moveDown();
            doc.fontSize(11).text("NOTA:", { align: "justify" });
            doc.fontSize(10)
                .text(`• No se generará el pago de derechos si tramita la expedición de su identificación institucional del ISSEMYM y en su caso, la de sus dependientes económicos dentro del plazo de 30 días hábiles posteriores a la fecha de su alta como servidor público.`, { align: "justify" })
                .text(`• En caso de no estar vigente en la base de datos, y de credencializarse por primera vez se solicitará comprobante de pago de la última quincena.`, { align: "justify" })
                .text(`• En caso de que el comprobante de pago del Servidor Público no cuente con la clave ISSEMYM, no se realizará ningún tipo de trámite.`, { align: "justify" })
                .text(`• Para asignar adscripción médica, deberán presentar comprobante de domicilio (pago de luz, predio, agua, teléfono o constancia domiciliaria firmada y sellada por autoridad municipal) a nombre del servidor público.`, { align: "justify" })
                .text(`• En caso de que la CURP, no se encuentre registrada en sistema se le solicitará la presente al momento de realizar el trámite.`, { align: "justify" })
                .text(`• Todos los documentos deben presentarse en original sin excepción alguna (legibles, en buen estado, sin tachaduras ni enmendaduras).`, { align: "justify" })
                .text(`• Para asignar adscripción médica, deberán presentar comprobante de domicilio (pago de luz, predio, agua, teléfono o constancia domiciliaria firmada y sellada por autoridad municipal) a nombre de la o del servidor público.`, { align: "justify" })
                .text(`• En caso de que la o el derechohabiente se encuentre imposibilitado de acudir a realizar el trámite; se solicitara constancia de hospitalización o en su caso constancia médica que indique la imposibilidad para moverse. Para estos casos solo se emitirá una constancia de identificación provisional por 30 días naturales contados a partir de la fecha de expedición de la constancia de hospitalización.`, { align: "justify" });
            doc.moveDown(5);
            doc.fontSize(12).text("REQUISITOS RENOVACIÓN DE CREDENCIAL- SERVIDOR PÚBLICO.", { align: "center" });
            doc.moveDown();
            doc.fontSize(10)
                .font("Helvetica")
                .text(`1) Original de Credencial de Identificación Institucional expedida por el Instituto (ISSEMyM).`, { align: "justify" })
                .text(`2) Original de identificación oficial vigente (pasaporte expedido por autoridad competente, credencial para votar expedida por el Instituto Nacional Electoral (INE), matrícula consular expedida por la Secretaría de Relaciones Exteriores a ciudadanos mexicanos domiciliados en el extranjero, Cartilla Militar liberada o Constancia de Identidad expedida por el Secretario del Ayuntamiento según corresponda el domicilio del derechohabiente, con sello sobre la fotografía y con una antigüedad no mayor a tres meses a la fecha del trámite).`, { align: "justify" })
                .text(`3) Original del comprobante de pago, debe ser de la última quincena vigente y que contenga la clave ISSEMyM.`, { align: "justify" });
            doc.moveDown();
            doc.fontSize(11).text("NOTA:", { align: "justify" });
            doc.fontSize(10)
                .text(`• En caso de realizar la renovación de la Identificación Institucional expedida por el Instituto (ISSEMyM) o cambio de adscripción médica y este se realice dentro de los 10 años contados a partir de la fecha de emisión. Deberá cubrir las tarifas establecidas en el artículo 78 del Código Financiero del Estado de México y Municipios vigente.`, { align: "justify" })
                .text(`• Para asignar adscripción médica, deberán presentar comprobante de domicilio (pago de luz, predio, agua, teléfono o constancia domiciliaria firmada y sellada por autoridad municipal) a nombre del servidor público.`, { align: "justify" })
                .text(`• En caso de que la o el solicitante sea personal de Sustitución o Suplencia de ISSEMyM, deberá presentar la constancia original vigente, emitida por el Departamento de Administración de Personal.`, { align: "justify" })
                .text(`• En caso de que la CURP, no se encuentre registrada en sistema se le solicitará la presente al momento de realizar el trámite.`, { align: "justify" })
                .text(`• En caso de que la o el derechohabiente se encuentre imposibilitado de acudir a realizar el trámite; se solicitara constancia de hospitalización o en su caso constancia médica que indique la imposibilidad para moverse. Para estos casos solo se emitirá una constancia de identificación provisional por 30 días naturales contados a partir de la fecha de expedición de la constancia de hospitalización.`, { align: "justify" });
            doc.moveDown();
            doc.fontSize(12).text("IMPORTANTE:", { align: "justify" });
            doc.fontSize(10)
                .text(`• Todos los documentos deben presentarse en original, sin excepción alguna (legibles, en buen estado, sin tachaduras ni enmendaduras).`, { align: "justify" })
                .text(`• No se hace ningún tipo de trámite si el comprobante de pago NO cuenta con clave ISSEMyM.`, { align: "justify" })
                .text(`• El trámite debe ser presencial y personal.`, { align: "justify" });
            doc.moveDown();
            doc.fontSize(12).text("COSTOS:", { align: "center" });
            doc.moveDown();
            doc.fontSize(10).text("Para el trámite que amerite un pago monetario, será necesario realizarlo con moneda fraccionaria, cabe mencionar que, para afiliación extemporánea o renovación de credencial aún vigente, se requiere el pago de $288.00 y en caso de reportar como robo o extravío de la credencial, su costo ascenderá a $391.00, debido a que es necesario generar un acta informativa que establezca el hecho del robo o extravío.", { align: "justify" });
            doc.moveDown();
            doc.fontSize(12).text("REQUISITOS RENOVACIÓN DE CARTA TESTAMENTARIA", { align: "center" });
            doc.moveDown();
            doc.fontSize(10)
                .text(`1) Original de identificación oficial vigente de la o del servidor público, de la o del pensionado (pasaporte expedido por autoridad competente, credencial para votar expedida por el Instituto Nacional Electoral (INE), matrícula consular expedida por la Secretaría de Relaciones Exteriores a ciudadanos mexicanos domiciliados en el extranjero, cartilla Militar liberada, licencia de conducir expedida por la Secretaría de Movilidad del Gobierno del Estado de México, la cual deberá ser verificada mediante QR o Constancia de identidad expedida por el Secretario del Ayuntamiento según corresponda el domicilio del derechohabiente, con sello sobre la fotografía y con una antigüedad no mayor a tres meses a la fecha del trámite).`, { align: "justify" })
                .text(`2) Original de Credencial de Identificación expedida por el Instituto (ISSEMyM).`, { align: "justify" })
                .text(`3) Original del comprobante de pago, debe ser de la última quincena vigente y que contenga la clave ISSEMyM.`, { align: "justify" })
                .text(`4) Copia simple de identificación oficial vigente del beneficiario o los Beneficiarios por ambos lados (pasaporte expedido por autoridad competente, credencial para votar expedida por el Instituto Nacional Electoral (INE), matrícula consular expedida por la Secretaría de Relaciones Exteriores a ciudadanos mexicanos domiciliados en el extranjero, cartilla Militar liberada, licencia de conducir expedida por la Secretaría de Movilidad del Gobierno del Estado de México, la cual deberá ser verificada mediante QR o Constancia de identidad expedida por el Secretario del Ayuntamiento según corresponda el domicilio del derechohabiente, con sello sobre la fotografía y con una antigüedad no mayor a tres meses a la fecha del trámite).`, { align: "justify" });
            doc.moveDown(5);
            doc.fontSize(12).text("NOTA:", { align: "justify" });
            doc.fontSize(10)
                .text(`• En caso de no estar vigente el servidor público o pensionado en la base de datos, se solicitará comprobante de pago de la última quincena.`, { align: "justify" })
                .text(`• En caso de que la CURP, no se encuentre registrada en sistema se le solicitará la presente al momento de realizar el trámite.`, { align: "justify" });
            doc.moveDown();
            doc.fontSize(12).text("IMPORTANTE:", { align: "justify" });
            doc.fontSize(10)
                .text(`• Todos los documentos deben presentarse en original, sin excepción alguna (legibles, en buen estado, sin tachaduras ni enmendaduras).`, { align: "justify" })
                .text(`• No se hace ningún tipo de trámite si el comprobante de pago NO cuenta con clave ISSEMyM.`, { align: "justify" })
                .text(`• El trámite debe ser presencial y personal.`, { align: "justify" })
                .text(`• La designación y el llenado deberá ser realizado por la o el servidor público o la o el pensionado y solo en caso de imposibilidad para escribir se pedirá requisitar a su acompañante.`, { align: "justify" });
            doc.moveDown();
            doc.fontSize(11).text("SUTEYM Poder Legislativo del Estado de México organiza el programa de Credencialización y actualización de Carta Testamentaria del ISSEMYM.", { align: "justify" });
            doc.moveDown();
            doc.fontSize(11).text(" En caso de presentarse alguna duda, error o requerir asistencia relacionada con el acceso, comunícate a las extensiones 5506 y 5517 del Departamento de Desarrollo y Actualización Tecnológica.", { align: "justify" });
            doc.moveDown();
            doc.fontSize(11).text("Para acceder a este beneficio, es indispensable presentar en el día y hora asignados.", { align: "justify" });
            doc.moveDown();
            // doc.fontSize(11).text(
            //   "Si no se presenta alguno de estos documentos el día de la cita, no podrá realizar su examen y este se dará por perdido. Aviso de Privacidad",
            //   { align: "justify" }
            // );
            // doc.moveDown();
            // doc.font("Helvetica-Bold").fontSize(10).text("Aviso de Privacidad", { align: "left" });
            // doc.font("Helvetica").fontSize(9).text("Consúltalo en:", { align: "left" });
            // doc.font("Helvetica")
            //   .fontSize(9)
            //   .text(
            //     "https://legislacion.legislativoedomex.gob.mx/storage/documentos/avisosprivacidad/expediente-clinico.pdf",
            //     { align: "left" }
            //   );
            doc.end();
        }));
    });
}
function generarPDFBufferGen(data) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const doc = new pdfkit_1.default({ size: "LETTER", margin: 50 });
            const chunks = [];
            const pdfDir = path_1.default.join(process.cwd(), "storage/public/pdfs");
            if (!fs_1.default.existsSync(pdfDir)) {
                fs_1.default.mkdirSync(pdfDir, { recursive: true });
            }
            const fileName = `acuse_${data.folio}.pdf`;
            const filePath = path_1.default.join(pdfDir, fileName);
            const relativePath = path_1.default.join("storage", "public", "pdfs", fileName);
            console.log(relativePath);
            doc.on("data", (chunk) => chunks.push(chunk));
            doc.on("end", () => __awaiter(this, void 0, void 0, function* () {
                try {
                    resolve(Buffer.concat(chunks));
                }
                catch (error) {
                    reject(error);
                }
            }));
            doc.on("error", reject);
            // ===== CONTENIDO DEL PDF =====
            doc.image(path_1.default.join(__dirname, "../assets/salud_page_mem.jpg"), 0, 0, {
                width: doc.page.width,
                height: doc.page.height,
            });
            doc.moveDown(6);
            doc
                .fontSize(18)
                .font("Helvetica-Bold")
                .fillColor("#7d0037") // ✅ Aplica el color
                .text(data.evento, {
                align: "center",
            })
                .fillColor("black");
            doc.moveDown(2);
            doc.font("Helvetica").fontSize(12).text(`Folio: ${data.folio}`, { align: "right" });
            doc.font("Helvetica").fontSize(12).text(`Fecha cita: ${data.fecha}`, { align: "right" });
            doc.fontSize(12)
                .font("Helvetica")
                .text(`Servidor público: ${data.nombreCompleto} | Edad: ${data.edad} años`, { align: "left" })
                .text(`CURP: ${data.curp}`, { align: "left" })
                .text(`Ubicación: ${data.sede}`, { align: "left" })
                .text(`Horario: ${data.horario}`, { align: "left" })
                .text(`Tramites: ${data.tramites}`, { align: "left" });
            doc.moveDown();
            doc.fontSize(11).text(data.organizador + " organiza " + data.evento, { align: "justify" });
            doc.moveDown();
            doc.fontSize(11).text(" En caso de presentarse alguna duda, error o requerir asistencia relacionada con el acceso, comunícate a las extensiones 5506 y 5517 del Departamento de Desarrollo y Actualización Tecnológica.", { align: "justify" });
            doc.moveDown();
            doc.fontSize(11).text("Para acceder a este beneficio, es indispensable presentar en el día y hora asignados.", { align: "justify" });
            doc.moveDown();
            doc.end();
        }));
    });
}
