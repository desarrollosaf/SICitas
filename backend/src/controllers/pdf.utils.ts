import PDFDocument from "pdfkit";
import path from "path";

export async function generarReporteCitasPDF(
  fechap: string,
  citas: any[]
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: any[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const marginBottom = 70;
    const col1X = 50;
    const col2X = 30;
    const tableWidth = 500;

    const bgPath = path.join(__dirname, "../assets/salud_page_mem.jpg");

    const drawHeader = () => {
      // Fondo de página
      doc.image(bgPath, 0, 0, {
        width: doc.page.width,
        height: doc.page.height,
      });

      doc.y = 115; // Fijar posición inicial en cada página

      // Encabezado
      doc.font("Helvetica-Bold").fontSize(20).fillColor("#7d0037")
        .text("Reporte de Citas", { align: "center" });

      doc.font("Helvetica").fontSize(12).fillColor("black");
      doc.text(`Fecha: ${fechap}`, { align: "center" });
      doc.moveDown(1);

      // Encabezado tabla
      const tableTop = doc.y;
      doc.rect(col1X - 5, tableTop - 5, tableWidth, 20).fill("#7d0037");
      doc.fillColor("white").font("Helvetica-Bold").fontSize(11);
      doc.text("Citas", col2X+260, tableTop);
      doc.fillColor("black");
      doc.moveDown(1);
    };

    // Primera página
    drawHeader();

    // Dibujar filas

      let citasTexto = "";
    
      for (const cita of citas) {
        const nombre = cita.datos_user?.nombre_completo || "Nombre desconocido";
        const curp = cita.datos_user?.f_curp || "Sin curp";
        const correo = cita.correo ?? "Sin correo";
        const telefono = cita.telefono ?? "Sin teléfono";
        const clave = cita.datos_user?.f_clave_issemym ?? "Sin clave";
        const adscripcion = cita.adscripcion ?? "Sin adscripción";
        citasTexto += `• ${nombre} | CURP: ${curp} | Clave ISSEMYM: ${clave} | Tel: ${telefono} | Correo: ${correo} | Adscripción: ${adscripcion} \n\n`;
      }
      
      // Calcular altura de la fila ajustada
      const citasWidth = 500;
      const textHeight = doc.heightOfString(citasTexto, { width: citasWidth, align: "left" });

      // Reducir el padding a 2
      const padding = 5;
      const rowHeight = Math.max(5, textHeight + padding); 

      // Verifica si el contenido cabe en la página sin generar espacios extra
      if (doc.y + rowHeight + marginBottom > doc.page.height) {
        doc.addPage();
        drawHeader(); // Dibuja el encabezado si se agrega una nueva página
      }

      const rowY = doc.y;

      // Fondo de fila
      doc.rect(col1X - 5, rowY - 2, tableWidth, rowHeight)
        .fillOpacity(0.05)
        .fill("#bdc3c7")
        .fillOpacity(1);

      // Escribir horario
      doc.fillColor("#000000").font("Helvetica-Bold").fontSize(10);
 
      // Escribir citas
      if (citas.length === 0) {
        doc.fillColor("black").font("Helvetica-Oblique").text(citasTexto, col2X, rowY + 3, { width: citasWidth });
      } else {
        doc.fillColor("black").font("Helvetica").fontSize(9);
        doc.text(citasTexto.trim(), col2X+15, rowY + 3, { width: citasWidth });
      }

      // Avanzar a la siguiente fila
      doc.y = rowY + rowHeight + 3; // Asegúrate de no dejar espacio innecesario
  

    // Pie de página
    doc.moveDown(2);
    doc.fontSize(9).font("Helvetica-Oblique").fillColor("#7f8c8d")
      .text(`Generado el ${new Date().toLocaleString()}`, { align: "right" });

    doc.end();
  });
}
