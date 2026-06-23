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
exports.generarPdfAcuse = exports.savecita = exports.getCita = void 0;
exports.generarPDFBufferSalud = generarPDFBufferSalud;
const citas_salud_1 = __importDefault(require("../models/citas_salud"));
const dp_fum_datos_generales_1 = require("../models/fun/dp_fum_datos_generales");
const s_usuario_1 = __importDefault(require("../models/saf/s_usuario"));
const t_departamento_1 = __importDefault(require("../models/saf/t_departamento"));
const pdfkit_1 = __importDefault(require("pdfkit"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const getCita = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params; // Este es el RFC
    try {
        // Traemos todas las citas asociadas al RFC
        const citasser = yield citas_salud_1.default.findAll({
            where: { rfc: id },
            order: [["fecha_cita", "ASC"]]
        });
        // Convertimos el resultado para incluir el rango horario
        const citasConHorario = citasser.map(cita => {
            const citaAny = cita; // Tipo flexible para TS
            return {
                id: cita.id,
                rfc: cita.rfc,
                fecha_cita: cita.fecha_cita,
                correo: cita.correo,
                telefono: cita.telefono,
                folio: cita.folio,
                path: cita.path,
            };
        });
        const usuario = yield s_usuario_1.default.findAll({
            where: { N_Usuario: id },
            attributes: [
                "Nombre",
            ],
            raw: true
        });
        return res.json({
            msg: "Cita obtenida",
            citas: citasConHorario,
            datosUser: usuario
        });
    }
    catch (error) {
        console.error("Error al obtener citas:", error);
        return res.status(500).json({ error: "Ocurrió un error al obtener los registros" });
    }
});
exports.getCita = getCita;
const savecita = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { body } = req;
        const limite = 120;
        const citaExistente = yield citas_salud_1.default.findOne({
            where: { rfc: body.rfc }
        });
        if (citaExistente) {
            return res.json({
                status: 201,
                msg: "Ya existe una cita registrada con ese RFC",
            });
        }
        const cantidadCitas = yield citas_salud_1.default.count({
            where: {
                fecha_cita: body.fecha_cita
            }
        });
        if (cantidadCitas >= limite) {
            return res.json({
                status: 202,
                msg: "La fecha seleccionada ya no tiene lugares disponibles.",
            });
        }
        const folio = Math.floor(10000000 + Math.random() * 90000000);
        const cita = yield citas_salud_1.default.create({
            rfc: body.rfc,
            fecha_cita: body.fecha_cita,
            correo: body.correo,
            telefono: body.telefono,
            folio: folio,
            path: '1'
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
const generarPdfAcuse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { rfc } = req.params;
        const cita = yield citas_salud_1.default.findOne({
            where: { rfc: rfc },
            order: [["fecha_cita", "ASC"]]
        });
        const Validacion = yield dp_fum_datos_generales_1.dp_fum_datos_generales.findOne({
            where: { f_rfc: rfc },
            attributes: ["f_nombre", "f_primer_apellido", "f_segundo_apellido", "f_sexo", "f_fecha_nacimiento", "f_curp"]
        });
        const ads = yield s_usuario_1.default.findOne({
            where: {
                N_Usuario: rfc
            },
            include: [
                {
                    model: t_departamento_1.default,
                    as: "departamento"
                }
            ]
        });
        if (!Validacion) {
            throw new Error("No se encontró información para el RFC proporcionado");
        }
        const nombreCompleto = [
            Validacion.f_nombre,
            Validacion.f_primer_apellido,
            Validacion.f_segundo_apellido
        ].filter(Boolean).join(" ");
        const adscripcion = ads === null || ads === void 0 ? void 0 : ads.departamento.nombre_completo;
        // const adscripcion = ads?.
        const sexo = Validacion.f_sexo || "";
        let curp1 = Validacion.f_curp || "";
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
        if (!cita) {
            return res.status(404).json({ error: "No se encontró la cita" });
        }
        const pdfBuffer = yield generarPDFBufferSalud({
            folio: cita.folio,
            nombreCompleto: nombreCompleto,
            sexo: '',
            edad: edad,
            correo: cita.correo,
            curp: curp1,
            fecha: cita.fecha_cita,
            telefono: cita.telefono,
            adscripcion: adscripcion,
            citaId: cita.id
        });
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="Reporte.pdf"`);
        res.send(pdfBuffer);
    }
    catch (error) {
        console.error("❌ Error generando Excel:", error);
        res.status(500).json({ error: "Error generando Excel" });
    }
});
exports.generarPdfAcuse = generarPdfAcuse;
function generarPDFBufferSalud(data) {
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
                .text("JORNADA DE SALUD Y PREVENCIÓN SUTEyM 2026", {
                align: "center",
            })
                .fillColor("black");
            doc.moveDown();
            doc.font("Helvetica").fontSize(12).text(`Folio: ${data.folio}`, { align: "right" });
            doc.font("Helvetica").fontSize(12).text(`Fecha cita: ${data.fecha}`, { align: "right" });
            doc.font("Helvetica").fontSize(12).text(`Sede: Estacionamiento longares`, { align: "right" });
            doc.moveDown();
            doc.fontSize(11)
                .font("Helvetica")
                .text(`SERVIDOR PÚBLICO: ${data.nombreCompleto} | EDAD: ${data.edad} AÑOS`, { align: "left" })
                .text(`CURP: ${data.curp}`, { align: "left" })
                .text(`CORREO ELECTRÓNICO: ${data.correo} | TELÉFONO: ${data.telefono}`, { align: "left" })
                .text(`ADSCRIPCIÓN: ${data.adscripcion}`, { align: "left" });
            doc.moveDown();
            doc.fontSize(11).text("La delegación SUTEyM-Poder Legislativo invita a la 'Jornada de salud y prevención SUTEyM 2026' con el propósito de fortalecer las acciones preventivas y contribuir a la protección y al cuidado de la salud de las personas servidoras públicas del Poder Legislativo.", { align: "justify" });
            doc.moveDown();
            doc.fontSize(11).text("El checkup SUTEyM incluye: ", { align: "justify" });
            doc.fontSize(11).list([
                "Examen de laboratorios (glucosa, colesterol, triglicéridos);",
                "Somatometría (toma de peso y talla);",
                "Papanicolau;",
                "Exploración de mama;",
                "Antígeno prostático (únicamente para hombres mayores de 40 años);",
                "Medicina general;",
                "Psicología; y ;",
                "Nutrición (hábitos alimenticios);",
            ], { bulletIndent: 20 });
            doc.moveDown(1);
            doc.fontSize(11).text("Condiciones en las que se tiene que presentar los servidores públicos para la evaluación médica:", { align: "justify" });
            doc.rect(50, doc.y + 5, 10, 10).stroke();
            doc.font('Helvetica-Bold').text('X', 52, doc.y + 15 - 10);
            doc.font('Helvetica').text('Credencial de afiliación ISSEMYM o talón de pago', 70, doc.y - 10);
            doc.rect(50, doc.y, 10, 10).stroke();
            doc.font('Helvetica-Bold').text('X', 52, doc.y + 12 - 10);
            doc.font('Helvetica').text('Ayuno mínimo de 8 horas', 70, doc.y - 10);
            doc.rect(50, doc.y, 10, 10).stroke();
            doc.font('Helvetica-Bold').text('X', 52, doc.y + 12 - 10);
            doc.font('Helvetica').text('Aseo general', 70, doc.y - 10);
            doc.moveDown();
            doc.font('Helvetica').text('', 50, doc.y - 10);
            doc.moveDown();
            doc.font('Helvetica-Bold').fontSize(11).text("Mujeres", { continued: true });
            doc.font('Helvetica').text(' en condiciones para Papanicolaou:', {
                align: 'justify'
            });
            doc.fontSize(11).list([
                "Baño corporal",
                "Ropa de dos piezas",
                "Tres días sin haber tenido contacto sexual, no haberse aplicado ningun tratamiento vaginal en las últimas 48 horas como: duchas vaginales, cremas y óvulos",
                "Ocho días despúes del último día de menstrución"
            ], { bulletIndent: 20 });
            doc.moveDown();
            doc.font('Helvetica-Bold').fontSize(9).list([
                "Servicio exclusivo para servidores públicos del Poder Legislativo.",
                "Indispensable presentarse atendiendo las condiciones para la evaluación médica.",
                "Se atenderá a los servidores públicos conforme la llegada y presentación en la unidad móvil.",
                "Mayor información de la Jornada de salud en la delegación sindical, en edificio San Rafael, Av. Independencia #108, ext. 1905",
                "En caso de presentar alguna duda, error o requerir asistencia relacionada con el acceso comunicate a las extensiones 5506, 5517 del Departamento de Desarrollo y Actualización Tecnológica"
            ], { bulletIndent: 20 });
            doc.end();
        }));
    });
}
