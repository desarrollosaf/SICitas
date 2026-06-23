import { Router } from "express";
import { generarPdfAcuse, getCita, savecita } from "../controllers/citasSalud";

const router = Router();

router.get("/api/citasSalud/getcitaservidor/:id", getCita);
router.post("/api/citasSalud/savecita/", savecita)
router.get("/api/citasSalud/pdfAcuse/:rfc", generarPdfAcuse);
export default router