"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const citasSalud_1 = require("../controllers/citasSalud");
const router = (0, express_1.Router)();
router.get("/api/citasSalud/getcitaservidor/:id", citasSalud_1.getCita);
router.post("/api/citasSalud/savecita/", citasSalud_1.savecita);
router.get("/api/citasSalud/pdfAcuse/:rfc", citasSalud_1.generarPdfAcuse);
exports.default = router;
