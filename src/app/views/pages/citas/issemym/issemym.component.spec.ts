import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IssemymComponent } from './issemym.component';

describe('IssemymComponent', () => {
  let component: IssemymComponent;
  let fixture: ComponentFixture<IssemymComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IssemymComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IssemymComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
