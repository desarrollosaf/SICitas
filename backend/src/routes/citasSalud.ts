import { Router } from "express";
import { generarPdfAcuse, getCita, getHorariosDisponibles, savecita } from "../controllers/citasSalud";

const router = Router();

router.get("/api/citasSalud/getcitaservidor/:id", getCita);
router.get("/api/citasSalud/gethorarios/:fecha", getHorariosDisponibles )
router.post("/api/citasSalud/savecita/", savecita)
router.get("/api/citasSalud/pdfAcuse/:rfc", generarPdfAcuse);
export default router