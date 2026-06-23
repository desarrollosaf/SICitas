import { TestBed } from '@angular/core/testing';

import { CitasIssemym2026Service } from './citas-issemym2026.service';

describe('CitasIssemym2026Service', () => {
  let service: CitasIssemym2026Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CitasIssemym2026Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
