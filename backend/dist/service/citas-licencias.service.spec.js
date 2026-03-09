"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@angular/core/testing");
const citas_licencias_service_1 = require("./citas-licencias.service");
describe('CitasLicenciasService', () => {
    let service;
    beforeEach(() => {
        testing_1.TestBed.configureTestingModule({});
        service = testing_1.TestBed.inject(citas_licencias_service_1.CitasLicenciasService);
    });
    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
