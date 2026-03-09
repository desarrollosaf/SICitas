import { Router } from "express";
import { getCita, getcitasagrupadas, getHorariosDisponibles, savecita, getcitasFecha, generarPDFCitas, generarExcelCitas, generalExcel, generarPdfAcuse } from "../controllers/citasLicencias";

const router = Router();

router.get("/api/citasLicencia/gethorarios/:fecha", getHorariosDisponibles )
router.post("/api/citasLicencia/savecita/", savecita)
router.get("/api/citasLicencia/citasagrupadas/", getcitasagrupadas) 
router.get("/api/citasLicencia/getcitaservidor/:id", getCita) 
router.get("/api/citasLicencia/getcitasfecha/:fecha/:rfc", getcitasFecha);
router.get("/api/citasLicencia/pdf/:fecha/:sedeId", generarPDFCitas);
router.get("/api/citasLicencia/exel/:fecha/:sedeId", generarExcelCitas);
router.get("/api/citasLicencia/exelgeneral/", generalExcel);
router.get("/api/citasLicencia/pdfAcuse/:rfc", generarPdfAcuse);


export default router