import { Router } from "express";
import { acuse, getEvento, getGeneral, savecita } from "../controllers/citasGeneral";

const router = Router();


router.get("/api/citasGeneral/getGeneral/:rfc", getGeneral);
router.get("/api/citasGeneral/getEvento/:fecha", getEvento);
router.post("/api/citasGeneral/savecita/", savecita);
router.get("/api/citasGeneral/pdf/:id", acuse);

export default router;