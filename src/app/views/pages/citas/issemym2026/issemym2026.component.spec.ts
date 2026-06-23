import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Issemym2026Component } from './issemym2026.component';

describe('Issemym2026Component', () => {
  let component: Issemym2026Component;
  let fixture: ComponentFixture<Issemym2026Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Issemym2026Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Issemym2026Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
