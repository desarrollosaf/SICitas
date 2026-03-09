import { TestBed } from '@angular/core/testing';

import { CitasIssemymService } from './citas-issemym.service';

describe('CitasIssemymService', () => {
  let service: CitasIssemymService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CitasIssemymService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
