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
        if (!Validacion) {
            throw new Error("No se encontró información para el RFC proporcionado");
        }
        const nombreCompleto = [
            Validacion.f_nombre,
            Validacion.f_primer_apellido,
            Validacion.f_segundo_apellido
        ].filter(Boolean).join(" ");
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
            doc.image(path_1.default.join(__dirname, "../assets/salud_page_v.jpeg"), 0, 0, {
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
            doc.moveDown(2);
            doc.font("Helvetica").fontSize(12).text(`Folio: ${data.folio}`, { align: "right" });
            doc.font("Helvetica").fontSize(12).text(`Fecha cita: ${data.fecha}`, { align: "right" });
            doc.fontSize(12)
                .font("Helvetica")
                .text(`Servidor público: ${data.nombreCompleto} | Edad: ${data.edad} años`, { align: "left" })
                .text(`CURP: ${data.curp}`, { align: "left" })
                .text(`Correo electrónico: ${data.correo} | Teléfono: ${data.telefono}`, { align: "left" })
                .text(`Ubicación: Av. Hidalgo #1012, Barrio San Benardino, Toluca, México.`, { align: "left" });
            doc.moveDown();
            doc.fontSize(11).text("El sindicato del Poder Legislativo del Estado de México organiza la jornada de salud y prevención SUTEyM 2026.", { align: "justify" });
            doc.moveDown();
            doc.fontSize(11).text("Actividad dirigida exclusivamente a las personas servidoras públicas del Poder Legislativo del Estado de México. Encaso de presentarse alguna duda, error o requerir asistencia relacionada con el acceso, comunícate a las extensiones 5506 y 5517 del Departamento de Desarrollo y Actualización Tecnológica.", { align: "justify" });
            doc.moveDown();
            doc.fontSize(11).text("Para acceder a este beneficio, es indispensable presentar en el día y hora asignados.", { align: "justify" });
            doc.moveDown();
            doc.fontSize(11).text("Durante la jornada se llevará a cabo evaluaciones médicas y acciones preventivas de salud, consistentes en: ", { align: "justify" });
            doc.moveDown();
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
