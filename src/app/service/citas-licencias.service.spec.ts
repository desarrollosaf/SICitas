import { TestBed } from '@angular/core/testing';

import { CitasLicenciasService } from './citas-licencias.service';

describe('CitasLicenciasService', () => {
  let service: CitasLicenciasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CitasLicenciasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
