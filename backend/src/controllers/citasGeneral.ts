import { Request, Response } from "express";
import { Op } from "sequelize";
import { Sequelize, Model, DataTypes } from 'sequelize';
import UsersSafs from '../models/saf/users';
import SUsuario from '../models/saf/s_usuario';
import Dependencia from '../models/saf/t_dependencia';
import Direccion from '../models/saf/t_direccion';
import Departamento from '../models/saf/t_departamento';
import { dp_fum_datos_generales } from '../models/fun/dp_fum_datos_generales';
import { dp_datospersonales } from '../models/fun/dp_datospersonales';
import sequelizefun from '../database/fun';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { generarReporteCitasPDF } from "./pdf.utils";
import ExcelJS from "exceljs";
import citasIssemym from "../models/citas_issemym";
import citasLicencia from "../models/citas_licencias";
import CitaSep from "../models/citas_sep";
import HorarioCitasSep from "../models/horarios_citas_sep";
import HorarioCita from "../models/horarios_citas";
import HorarioDiez from '../models/horarios_diez';
import CitasGeneral from "../models/citas_general";
import agendaEventos from "../models/eventos";
import { Console, count } from "console";
import { getHorariosDisponiblesSep } from "./citasIssemym";
import sequelize from "../database/connection";
import sequelizeCuestionarios from "../database/cuestionariosConnection";
import Tramites from "../models/tramites";
import Sede from "../models/sedes";

console.log('MODELO DIRECTO:', HorarioDiez);

dp_datospersonales.initModel(sequelizefun);
dp_fum_datos_generales.initModel(sequelizefun);

export const getGeneral = async (req: Request, res: Response): Promise<any> => {
     const { rfc } = req.params;

     const citas = await CitasGeneral.findAll({
        where: {
            'rfc_solicitante': rfc
        },
        include:{
            model: agendaEventos,
            as:'mEvento'
        }
     });

     
    for (const cita of citas) {
        if(cita.tramite != '' && cita.tramite != null){
            const idsTramites = String(cita.tramite)
            .split(',')
            .map(Number);

            const tramites = await Tramites.findAll({
                where: {
                id: idsTramites
                }
            });
            
            cita.setDataValue(
                'nombres_tramites',
                tramites.map((tramite: any) => tramite.tramite).join(', ')
            );
        }else{
              console.log('******* cita.tramite else', cita.mEvento?.evento)
            cita.setDataValue('nombres_tramites', cita.mEvento?.evento);
            console.log(cita)
        }
    }

    const eventos = await agendaEventos.findAll({
        where: {
            organizador: { [Op.notIn]: ['0', ''] }
        }
    });

    const resultados = {
        'citas': citas,
        'eventos': eventos
    }
    console.log('resultados ',resultados);
    return res.json({resultados });
}

export const getEvento = async (req: Request, res: Response): Promise<any> => {
    const { fecha } = req.params; 
    const resultado: any[] = [];
    const evento = await agendaEventos.findOne({
        where:{
            'fecha_cita': fecha
        },
        include:{
            model: Tramites,
            as: 'm_tramites'
        }
    });

    const citas = await CitasGeneral.count({
        where: { 
            fecha_cita: fecha,
            evento_id: evento?.id
        },
      });
  
      if(evento?.horarios === true){
        console.log('********* evento.table_horarios ********* ', evento.table_horarios)
            const modeloHorarios = sequelizeCuestionarios.models[evento.table_horarios];

            if (!modeloHorarios) {
                throw new Error(
                `No existe el modelo: ${evento.table_horarios}`
                );
            }

            const horariosDisponibles = await modeloHorarios.findAll({
                order: [['id', 'ASC']]
            });

            const horaInicioEvento = evento.hora_inicio?.slice(0, 5);
            const horaTerminoEvento = evento.hora_termino?.slice(0, 5);

            const horariosEnRango = horariosDisponibles.filter((h: any) => {
                if (!horaInicioEvento || !horaTerminoEvento) return true;
                return h.horario_inicio >= horaInicioEvento && h.horario_fin <= horaTerminoEvento;
            });

            const sinTopeDiario = !evento.total_citas_dia || citas < evento.total_citas_dia;

            if (sinTopeDiario) {
                horariosEnRango.forEach((h: any) => {
                    resultado.push({
                        horario_id: h.id,
                        horario_texto: `${h.horario_inicio} - ${h.horario_fin}`,
                    });
                });
            }

    }
  
    const respuesta = {
        'horarios': resultado,
        'evento':evento
    }

    console.log('********** respuesta ', respuesta)
    return res.json(respuesta);   
}


export const savecita = async (req: Request, res: Response): Promise<any> => {
  try {
    const { body } = req;
console.log('** body ', body)
    const citaExistente = await CitasGeneral.findOne({
      where: { 
        rfc_solicitante: body.rfc,
        evento_id: body.evento
        }
    });
console.log('citaExistente ',citaExistente);
    const evento = await agendaEventos.findOne({
        where:{
            'id': body.evento
        }
    });
    console.log('evento  ',evento);
    let limite = 1;

    if(evento?.limite_horario){
        limite = evento?.limite_horario;
    }
    
    console.log('limite ', limite)
    
    if (citaExistente) {
      return res.status(400).json({
        status: 400,
        msg: "Ya existe una cita registrada con ese RFC"
      });
    }

    const cantidadCitas = await CitasGeneral.count({
      where: {
        horario_id: body.horario_id,
        evento_id: body.evento
      }
    });

    console.log('cantidadCitas ',cantidadCitas)

    if (cantidadCitas >= limite) {
      return res.status(400).json({
        status: 400,
        msg: "Este horario ya no tiene ocupo para la fecha seleccionada"
      });
    }


    const folio: number = Math.floor(10000000 + Math.random() * 90000000);
    console.log('folio ',folio)
    let tramites = '';
    if(body.tramite){
          tramites = body.tramite.join(',');
    }

    const cita = await CitasGeneral.create({
        rfc_solicitante: body.rfc,
        evento_id: body.evento,
        fecha_cita: body.fecha_cita,
        horario_id: body.horario_id,
        folio: folio,
        tramite: tramites
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

export const acuse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const cita = await CitasGeneral.findOne({
      where: { id: id },
      include:{
        model: agendaEventos,
        as: 'mEvento'
      }
    });

    const Validacion = await dp_fum_datos_generales.findOne({
      where: { f_rfc: cita?.rfc_solicitante },
      attributes: ["f_nombre", "f_primer_apellido", "f_segundo_apellido", "f_sexo", "f_fecha_nacimiento", "f_curp"]
    });

    if (!Validacion) {
      throw new Error("No se encontró información para el RFC proporcionado");
    }
    const sede2 = (await Sede.findOne({ where: { id: cita?.mEvento?.sede } }))?.sede || "";
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
    if(cita.tramite != null && cita.tramite != ''){
        tramites = cita.tramite.split(',').map((tramite: string): string | undefined => {
        const id = Number(tramite.trim());
            const tram = Tramites.findByPk(id);
            return tram.tramite;
        }).filter((tramite): tramite is string => tramite !== undefined);
    }else{
        tramites = cita.mEvento?.evento;
    }
    

    if(cita.mEvento?.horarios === true){
        console.log('cita.mEvento?.table_horarios ', cita.mEvento?.table_horarios);
        const model = sequelizeCuestionarios.models[cita.mEvento?.table_horarios];

        if (!model) {
            throw new Error(
            `No existe el modelo: ${cita.mEvento?.table_horarios}`
            );
        }

        const horario = await model.findByPk(cita.horario_id);
        citaHora =  horario.horario_inicio + '-' + horario.horario_fin;
    }else{
        citaHora = 'Presentarse en la sede indicada a las '+cita.mEvento?.hora_inicio;
    }

    const pdfBuffer = await generarPDFBufferGen({
      folio: cita.folio,
      nombreCompleto: nombreCompleto,
      sexo: '',
      edad: edad,
      curp: curp1,
      fecha: cita.fecha_cita,
      sede: cita.mEvento?.mSede?.sede,
      horario: citaHora,
      citaId: cita.id,
      tramites: tramites,
      evento: cita.mEvento?.evento,
      organizador: cita.mEvento?.organizador,
    });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="acuse.pdf"`);
    res.send(pdfBuffer);

  } catch (error) {
    console.error("❌ Error generando Acuse:", error);
    res.status(500).json({ error: "Error generando Acuse" });
  }
};


export async function generarPDFBufferSep(data: PDFDataSep): Promise<Buffer> {
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
      .text("PROGRAMA DE CREDENCIALIZACIÓN Y ACTUALIZACIÓN DE CARTA TESTAMENTARIA DEL ISSEMYM", {
        align: "center",
      })
      .fillColor("black");

    doc.moveDown(2);
    doc.font("Helvetica").fontSize(12).text(`Folio: ${data.folio}`, { align: "right" });
    doc.font("Helvetica").fontSize(12).text(`Fecha cita: ${data.fecha}`, { align: "right" });
    doc.fontSize(12)
      .font("Helvetica")
      .text(`Servidor público: ${data.nombreCompleto} | Edad: ${data.edad} años` , { align: "left" })
      .text(`CURP: ${data.curp}`, { align: "left" })
      .text(`Ubicación: ${data.sede}`, { align: "left" })
      .text(`Horario: ${data.horario}`, { align: "left" })
      .text(`Tramites: ${data.tramites}`, { align: "left" });

    doc.moveDown();
    doc.fontSize(12).text(
      "REQUISITOS NUEVO INGRESO DE SERVIDOR PÚBLICO.",
      { align: "center" }
    );
   doc.moveDown();
     doc.fontSize(10)
      .font("Helvetica")
      .text(`1) Original del Aviso de Movimiento de Alta (emitido por Recursos Humanos de la dependencia y contiene clave ISSEMYM)` , { align: "justify" })
      .text(`2) Original del comprobante de pago, debe ser de la última quincena vigente y que contenga la clave ISSEMyM.`, { align: "justify" })
      .text(`3) Original o copia certificada del acta de nacimiento.`, { align: "justify" })
      .text(`4) Original de identificación oficial vigente (pasaporte expedido por autoridad competente, credencial para votar expedida por el Instituto Nacional Electoral (INE), matrícula consular expedida por la Secretaría de Relaciones Exteriores a ciudadanos mexicanos domiciliados en el extranjero, Cartilla Militar liberada o Constancia de Identidad expedida por el Secretario del Ayuntamiento según corresponda el domicilio del derechohabiente, con sello sobre la fotografía y con una antigüedad no mayor a tres meses a la fecha del trámite).`, { align: "justify" });

    doc.moveDown();
    doc.fontSize(11).text(
      "NOTA:",
      { align: "justify" }
    );
    doc.fontSize(10)
      .text(`• No se generará el pago de derechos si tramita la expedición de su identificación institucional del ISSEMYM y en su caso, la de sus dependientes económicos dentro del plazo de 30 días hábiles posteriores a la fecha de su alta como servidor público.` , { align: "justify" })
      .text(`• En caso de no estar vigente en la base de datos, y de credencializarse por primera vez se solicitará comprobante de pago de la última quincena.`, { align: "justify" })
      .text(`• En caso de que el comprobante de pago del Servidor Público no cuente con la clave ISSEMYM, no se realizará ningún tipo de trámite.`, { align: "justify" })
      .text(`• Para asignar adscripción médica, deberán presentar comprobante de domicilio (pago de luz, predio, agua, teléfono o constancia domiciliaria firmada y sellada por autoridad municipal) a nombre del servidor público.`, { align: "justify" })
      .text(`• En caso de que la CURP, no se encuentre registrada en sistema se le solicitará la presente al momento de realizar el trámite.`, { align: "justify" })
      .text(`• Todos los documentos deben presentarse en original sin excepción alguna (legibles, en buen estado, sin tachaduras ni enmendaduras).`, { align: "justify" })
      .text(`• Para asignar adscripción médica, deberán presentar comprobante de domicilio (pago de luz, predio, agua, teléfono o constancia domiciliaria firmada y sellada por autoridad municipal) a nombre de la o del servidor público.`, { align: "justify" })
      .text(`• En caso de que la o el derechohabiente se encuentre imposibilitado de acudir a realizar el trámite; se solicitara constancia de hospitalización o en su caso constancia médica que indique la imposibilidad para moverse. Para estos casos solo se emitirá una constancia de identificación provisional por 30 días naturales contados a partir de la fecha de expedición de la constancia de hospitalización.`, { align: "justify" });

    doc.moveDown(5);
    doc.fontSize(12).text(
      "REQUISITOS RENOVACIÓN DE CREDENCIAL- SERVIDOR PÚBLICO.",
      { align: "center" }
    );

     doc.moveDown();
     doc.fontSize(10)
      .font("Helvetica")
      .text(`1) Original de Credencial de Identificación Institucional expedida por el Instituto (ISSEMyM).` , { align: "justify" })
      .text(`2) Original de identificación oficial vigente (pasaporte expedido por autoridad competente, credencial para votar expedida por el Instituto Nacional Electoral (INE), matrícula consular expedida por la Secretaría de Relaciones Exteriores a ciudadanos mexicanos domiciliados en el extranjero, Cartilla Militar liberada o Constancia de Identidad expedida por el Secretario del Ayuntamiento según corresponda el domicilio del derechohabiente, con sello sobre la fotografía y con una antigüedad no mayor a tres meses a la fecha del trámite).`, { align: "justify" })
      .text(`3) Original del comprobante de pago, debe ser de la última quincena vigente y que contenga la clave ISSEMyM.`, { align: "justify" });

    doc.moveDown();
    doc.fontSize(11).text(
      "NOTA:",
      { align: "justify" }
    );
    doc.fontSize(10)
      .text(`• En caso de realizar la renovación de la Identificación Institucional expedida por el Instituto (ISSEMyM) o cambio de adscripción médica y este se realice dentro de los 10 años contados a partir de la fecha de emisión. Deberá cubrir las tarifas establecidas en el artículo 78 del Código Financiero del Estado de México y Municipios vigente.`, { align: "justify" })
      .text(`• Para asignar adscripción médica, deberán presentar comprobante de domicilio (pago de luz, predio, agua, teléfono o constancia domiciliaria firmada y sellada por autoridad municipal) a nombre del servidor público.`, { align: "justify" })
      .text(`• En caso de que la o el solicitante sea personal de Sustitución o Suplencia de ISSEMyM, deberá presentar la constancia original vigente, emitida por el Departamento de Administración de Personal.`, { align: "justify" })
      .text(`• En caso de que la CURP, no se encuentre registrada en sistema se le solicitará la presente al momento de realizar el trámite.`, { align: "justify" })
      .text(`• En caso de que la o el derechohabiente se encuentre imposibilitado de acudir a realizar el trámite; se solicitara constancia de hospitalización o en su caso constancia médica que indique la imposibilidad para moverse. Para estos casos solo se emitirá una constancia de identificación provisional por 30 días naturales contados a partir de la fecha de expedición de la constancia de hospitalización.`, { align: "justify" }); 
     
    doc.moveDown();
    doc.fontSize(12).text(
      "IMPORTANTE:",
      { align: "justify" }
    );
    doc.fontSize(10)
      .text(`• Todos los documentos deben presentarse en original, sin excepción alguna (legibles, en buen estado, sin tachaduras ni enmendaduras).`, { align: "justify" })
      .text(`• No se hace ningún tipo de trámite si el comprobante de pago NO cuenta con clave ISSEMyM.`, { align: "justify" })
      .text(`• El trámite debe ser presencial y personal.`, { align: "justify" }); 
 
    doc.moveDown();
    doc.fontSize(12).text(
      "COSTOS:",
      { align: "center" }
    );

     doc.moveDown();
    doc.fontSize(10).text(
      "Para el trámite que amerite un pago monetario, será necesario realizarlo con moneda fraccionaria, cabe mencionar que, para afiliación extemporánea o renovación de credencial aún vigente, se requiere el pago de $288.00 y en caso de reportar como robo o extravío de la credencial, su costo ascenderá a $391.00, debido a que es necesario generar un acta informativa que establezca el hecho del robo o extravío.",
      { align: "justify" }
    );

    doc.moveDown();
    doc.fontSize(12).text(
      "REQUISITOS RENOVACIÓN DE CARTA TESTAMENTARIA",
      { align: "center" }
    );

    doc.moveDown();
    doc.fontSize(10)
      .text(`1) Original de identificación oficial vigente de la o del servidor público, de la o del pensionado (pasaporte expedido por autoridad competente, credencial para votar expedida por el Instituto Nacional Electoral (INE), matrícula consular expedida por la Secretaría de Relaciones Exteriores a ciudadanos mexicanos domiciliados en el extranjero, cartilla Militar liberada, licencia de conducir expedida por la Secretaría de Movilidad del Gobierno del Estado de México, la cual deberá ser verificada mediante QR o Constancia de identidad expedida por el Secretario del Ayuntamiento según corresponda el domicilio del derechohabiente, con sello sobre la fotografía y con una antigüedad no mayor a tres meses a la fecha del trámite).`, { align: "justify" })
      .text(`2) Original de Credencial de Identificación expedida por el Instituto (ISSEMyM).`, { align: "justify" })
      .text(`3) Original del comprobante de pago, debe ser de la última quincena vigente y que contenga la clave ISSEMyM.`, { align: "justify" })
      .text(`4) Copia simple de identificación oficial vigente del beneficiario o los Beneficiarios por ambos lados (pasaporte expedido por autoridad competente, credencial para votar expedida por el Instituto Nacional Electoral (INE), matrícula consular expedida por la Secretaría de Relaciones Exteriores a ciudadanos mexicanos domiciliados en el extranjero, cartilla Militar liberada, licencia de conducir expedida por la Secretaría de Movilidad del Gobierno del Estado de México, la cual deberá ser verificada mediante QR o Constancia de identidad expedida por el Secretario del Ayuntamiento según corresponda el domicilio del derechohabiente, con sello sobre la fotografía y con una antigüedad no mayor a tres meses a la fecha del trámite).`, { align: "justify" });
     
    doc.moveDown(5);
    doc.fontSize(12).text(
      "NOTA:",
      { align: "justify" }
    );
    doc.fontSize(10)
      .text(`• En caso de no estar vigente el servidor público o pensionado en la base de datos, se solicitará comprobante de pago de la última quincena.`, { align: "justify" })
      .text(`• En caso de que la CURP, no se encuentre registrada en sistema se le solicitará la presente al momento de realizar el trámite.`, { align: "justify" });

    doc.moveDown();
    doc.fontSize(12).text(
      "IMPORTANTE:",
      { align: "justify" }
    );
    doc.fontSize(10)
      .text(`• Todos los documentos deben presentarse en original, sin excepción alguna (legibles, en buen estado, sin tachaduras ni enmendaduras).`, { align: "justify" })
      .text(`• No se hace ningún tipo de trámite si el comprobante de pago NO cuenta con clave ISSEMyM.`, { align: "justify" })
      .text(`• El trámite debe ser presencial y personal.`, { align: "justify" })
      .text(`• La designación y el llenado deberá ser realizado por la o el servidor público o la o el pensionado y solo en caso de imposibilidad para escribir se pedirá requisitar a su acompañante.`, { align: "justify" });

    doc.moveDown();
    doc.fontSize(11).text(
      "SUTEYM Poder Legislativo del Estado de México organiza el programa de Credencialización y actualización de Carta Testamentaria del ISSEMYM.",
      { align: "justify" }
    );

    doc.moveDown();
    doc.fontSize(11).text(
      " En caso de presentarse alguna duda, error o requerir asistencia relacionada con el acceso, comunícate a las extensiones 5506 y 5517 del Departamento de Desarrollo y Actualización Tecnológica.",
      { align: "justify" }
    );

    doc.moveDown();
    doc.fontSize(11).text(
      "Para acceder a este beneficio, es indispensable presentar en el día y hora asignados.",
      { align: "justify" }
    );
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
  });
}


export async function generarPDFBufferGen(data: any): Promise<Buffer> {
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

    doc.on("data", (chunk: any) => chunks.push(chunk));
    doc.on("end", async () => {
      try {
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
      .text(data.evento, {
        align: "center",
      })
      .fillColor("black");

    doc.moveDown(2);
    doc.font("Helvetica").fontSize(12).text(`Folio: ${data.folio}`, { align: "right" });
    doc.font("Helvetica").fontSize(12).text(`Fecha cita: ${data.fecha}`, { align: "right" });
    doc.fontSize(12)
      .font("Helvetica")
      .text(`Servidor público: ${data.nombreCompleto} | Edad: ${data.edad} años` , { align: "left" })
      .text(`CURP: ${data.curp}`, { align: "left" })
      .text(`Ubicación: ${data.sede}`, { align: "left" })
      .text(`Horario: ${data.horario}`, { align: "left" })
      .text(`Tramites: ${data.tramites}`, { align: "left" });

    doc.moveDown();
    doc.fontSize(11).text(
      data.organizador+" organiza "+ data.evento,
      { align: "justify" }
    );

    doc.moveDown();
    doc.fontSize(11).text(
      " En caso de presentarse alguna duda, error o requerir asistencia relacionada con el acceso, comunícate a las extensiones 5506 y 5517 del Departamento de Desarrollo y Actualización Tecnológica.",
      { align: "justify" }
    );

    doc.moveDown();
    doc.fontSize(11).text(
      "Para acceder a este beneficio, es indispensable presentar en el día y hora asignados.",
      { align: "justify" }
    );
    doc.moveDown();
    doc.end();
  });
}
