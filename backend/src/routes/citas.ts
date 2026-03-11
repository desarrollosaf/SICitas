import { Router } from "express";
import { getCita, getcitasagrupadas, getHorariosDisponibles, savecita, getcitasFecha, generarPDFCitas, generarExcelCitas, generalExcel, generarPdfAcuse, getEventos } from "../controllers/citas";

const router = Router();

router.get("/api/citas/gethorarios/:fecha", getHorariosDisponibles )
router.post("/api/citas/savecita/", savecita)
router.get("/api/citas/citasagrupadas/", getcitasagrupadas) 
router.get("/api/citas/getcitaservidor/:id", getCita) 
router.get("/api/citas/getcitasfecha/:fecha/:rfc", getcitasFecha);
router.get("/api/citas/pdf/:fecha/:sedeId", generarPDFCitas);
router.get("/api/citas/exel/:fecha/:sedeId", generarExcelCitas);
router.get("/api/citas/exelgeneral/", generalExcel);
router.get("/api/citas/pdfAcuse/:rfc", generarPdfAcuse); 
router.get("/api/citas/getEventos/", getEventos) 

export default router