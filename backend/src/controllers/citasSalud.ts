import { Request, Response } from "express";
import { Op } from "sequelize";
import { Sequelize, Model, DataTypes } from 'sequelize';
import HorariosSalud from "../models/horarios_salud";
import citasSalud from "../models/citas_salud";
import { dp_fum_datos_generales } from "../models/fun/dp_fum_datos_generales";
import SUsuario from "../models/saf/s_usuario";
import Dependencia from "../models/saf/t_dependencia";
import Direccion from "../models/saf/t_direccion";
import Departamento from "../models/saf/t_departamento";
import { generarPDFBuffer } from "./citas";
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import models from "..";


export const getCita = async (req: Request, res: Response): Promise<any> => {
 const { id } = req.params; // Este es el RFC
  try {
    // Traemos todas las citas asociadas al RFC
    const citasser = await citasSalud.findAll({
      where: { rfc: id },
      order: [["fecha_cita", "ASC"]]
    });

    // Convertimos el resultado para incluir el rango horario
    const citasConHorario = citasser.map(cita => {
      const citaAny = cita as any; // Tipo flexible para TS
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


    const usuario = await SUsuario.findAll({
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
  } catch (error) {
    console.error("Error al obtener citas:", error);
    return res.status(500).json({ error: "Ocurrió un error al obtener los registros" });
  }
}


export const savecita = async (req: Request, res: Response): Promise<any> => {
  try {
    const { body } = req;
    const limite = 120;

    const citaExistente = await citasSalud.findOne({
      where: { rfc: body.rfc }
    });

    if (citaExistente) {
        return res.json({
        status: 201,
        msg: "Ya existe una cita registrada con ese RFC",
        });
    }

    const cantidadCitas = await citasSalud.count({
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

    const folio: number = Math.floor(10000000 + Math.random() * 90000000);

    const cita = await citasSalud.create({
      rfc: body.rfc,
      fecha_cita: body.fecha_cita,
      correo: body.correo,
      telefono: body.telefono,
      folio: folio,
      path: '1'
    });

    const Validacion = await dp_fum_datos_generales.findOne({
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
  } catch (error) {
    console.error('Error al guardar la cita:', error);
    return res.status(500).json({ msg: 'Error interno del servidor' });
  }
};


export const generarPdfAcuse = async (req: Request, res: Response) => {
  try {
    const { rfc } = req.params;


    const cita = await citasSalud.findOne({
      where: { rfc: rfc },
      order: [["fecha_cita", "ASC"]]
    });

    const Validacion = await dp_fum_datos_generales.findOne({
      where: { f_rfc: rfc },
      attributes: ["f_nombre", "f_primer_apellido", "f_segundo_apellido", "f_sexo", "f_fecha_nacimiento", "f_curp", "f_clave_issemym"]
    });

    const ads = await SUsuario.findOne({
      where:{
        N_Usuario: rfc
      }, 
      include: [
        {
          model: Departamento, 
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

    const adscripcion = ads?.departamento.nombre_completo;
    const issemym = Validacion.f_clave_issemym || "";

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

    const pdfBuffer = await generarPDFBufferSalud({
      folio: cita.folio,
      nombreCompleto: nombreCompleto,
      sexo: '',
      edad: edad,
      correo: cita.correo,
      curp: curp1,
      fecha: cita.fecha_cita,
      telefono: cita.telefono,
      adscripcion: adscripcion,
      issemym: issemym,
      citaId: cita.id
    });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="Reporte.pdf"`);
    res.send(pdfBuffer);


  } catch (error) {
    console.error("❌ Error generando Excel:", error);
    res.status(500).json({ error: "Error generando Excel" });
  }
};


interface PDFData {
  folio: string;
  nombreCompleto: string;
  sexo: string;
  edad: string;
  correo: string;
  curp: string;
  fecha: string;
  telefono: string;
  adscripcion: string;
  issemym: string;
  citaId: number; // <-- ID de la cita para actualizar
}

export async function generarPDFBufferSalud(data: PDFData): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    const doc = new PDFDocument({ size: "LETTER", margin: 50 });
    const chunks: any[] = [];

    const pdfDir = path.join(process.cwd(), "storage/public/pdfs");
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true });
    }

    const fileName = `acuse_${data.folio}.pdf`;
    const filePath = path.join(pdfDir, fileName);
    const relativePath = path.join("storage", "public", "pdfs", fileName);
    console.log(relativePath)
    // const writeStream = fs.createWriteStream(filePath);
    // doc.pipe(writeStream);

    doc.on("data", (chunk: any) => chunks.push(chunk));
    doc.on("end", async () => {
      try {
        // Guardar la ruta del PDF en la tabla citas
        // await Cita.update(
        //   { path: relativePath },
        //   { where: { id: data.citaId } }
        // );


        resolve(Buffer.concat(chunks));
      } catch (error) {
        reject(error);
      }
    });
    doc.on("error", reject);

    // ===== CONTENIDO DEL PDF =====
    doc.image(path.join(__dirname, "../assets/salud_page_mem.jpg"), 0, 0, {
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
    doc.font("Helvetica").fontSize(12).text(`Sede: Estacionamiento Longares`, { align: "right" });
    doc.moveDown();

    doc.fontSize(11)
      .font("Helvetica")
      .text(`Servidor Público: ${data.nombreCompleto} | Edad: ${data.edad} años` , { align: "left" })
      .text(`CURP: ${data.curp} | Clave ISSEMYM: ${data.issemym}`, { align: "left" }) 
      .text(`Correo Electrónico: ${data.correo} | Teléfono: ${data.telefono}`, { align: "left" })
      .text(`Adscripción: ${data.adscripcion}`, { align: "left" });

    doc.moveDown();
    doc.fontSize(11).text(
      'La Delegación SUTEyM-Poder Legislativo invita a la "Jornada de Salud y Prevención SUTEyM 2026" con el propósito de fortalecer las acciones preventivas y contribuir a la protección y al cuidado de la salud de las personas servidoras públicas del Poder Legislativo.',
      { align: "justify" }
    );

    doc.moveDown();
    doc.fontSize(11).text(
      "El check-up médico SUTEyM incluye: ",
      { align: "justify" }
    );
    doc.fontSize(11).list(
      [
        "Examen de laboratorio (glucosa, colesterol, triglicéridos);",
        "Somatometría (toma de peso y talla);",
        "Papanicolaou;",
        "Exploración de mama;",
        "Antígeno prostático (únicamente hombres mayores de 40 años);",
        "Medico general;",
        "Psicología; y ",
        "Nutrición (hábitos alimenticios).",
      ],
      { bulletIndent: 20 }
    );
    doc.moveDown(1);

    doc.font('Helvetica-Bold').fontSize(11).text(
      "Condiciones en las que se tiene que presentar los servidores públicos para la evaluación médica:",
      { align: "justify" }
    );

    doc.rect(50, doc.y+5, 10, 10).stroke();
    doc.font('Helvetica-Bold').text('X', 52, doc.y+15 - 10);
    doc.font('Helvetica').text('Credencial de afiliación ISSEMYM o último talón de pago;', 70, doc.y - 10);

    doc.rect(50, doc.y, 10, 10).stroke();
    doc.font('Helvetica-Bold').text('X', 52, doc.y+12 - 10);
    doc.font('Helvetica').text('Ayuno mínimo de 8 horas;', 70, doc.y - 10);

    doc.rect(50, doc.y, 10, 10).stroke();
    doc.font('Helvetica-Bold').text('X', 52, doc.y+12 - 10);
    doc.font('Helvetica').text('Aseo general.', 70, doc.y - 10);
   
    doc.moveDown();
    doc.font('Helvetica').text('', 50, doc.y - 10);
    doc.moveDown();
    doc.font('Helvetica-Bold').fontSize(11).text(
      "Mujeres" , { continued: true });
    
    doc.font('Helvetica').text('(condiciones para Papanicolaou):', {
      align: 'justify'
    });
    doc.fontSize(11).list(
      [
        "Baño corporal;",
        "Ropa de dos piezas;",
        "Tres días sin haber tenido contacto sexual, no haberse aplicado ningun tratamiento vaginal en las últimas 48 horas como: duchas vaginales, cremas u óvulos;",
        "Ocho días despúes del último día de menstrución."
      ],
      { bulletIndent: 20 }
    );

    doc.moveDown();
    doc.font('Helvetica-Bold').fontSize(9).text("Servicio exclusivo para servidores públicos del Poder Legislativo.", {
      align: 'justify'
    });
    doc.text("Indispensable presentarse atendiendo las condiciones para la evaluación médica.", {
      align: 'justify'
    });
    doc.text("Se atenderá a los servidores públicos conforme su llegada y presentación en la unidad móvil.", {
      align: 'justify'
    });
    doc.text("Mayor información de la Jornada de Salud en la delegación sindical, en edificio San Rafael, Av. Independencia #108, Col. Centro, Toluca, México. Ext. 1905.", {
      align: 'justify'
    });
    doc.text("En caso de presentar alguna duda, error o requerir asistencia relacionada con el acceso ó registro comunicate a las extensiones 5506, 5517 del Departamento de Desarrollo y Actualización Tecnológica", {
      align: 'justify'
    });
    
    doc.end();
  });
}
