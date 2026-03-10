import { Router } from "express";
import { getCita, getcitasagrupadas, getHorariosDisponibles, savecita, getcitasFecha, generarPDFCitas, generarExcelCitas, generalExcel, generarPdfAcuse } from "../controllers/citasIssemym";

const router = Router();

router.get("/api/citasIssemym/gethorarios/:fecha", getHorariosDisponibles )
router.post("/api/citasIssemym/savecita/", savecita)
router.get("/api/citasIssemym/citasagrupadas/", getcitasagrupadas) 
router.get("/api/citasIssemym/getcitaservidor/:id", getCita) 
router.get("/api/citasIssemym/getcitasfecha/:fecha/:rfc", getcitasFecha);
router.get("/api/citasIssemym/pdf/:fecha/:sedeId", generarPDFCitas);
router.get("/api/citasIssemym/exel/:fecha/:sedeId", generarExcelCitas);
router.get("/api/citasIssemym/exelgeneral/", generalExcel);
router.get("/api/citasIssemym/pdfAcuse/:rfc", generarPdfAcuse);


export default router