import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisReclamosComponent } from './mis-reclamos.component';

describe('MisReclamosComponent', () => {
  let component: MisReclamosComponent;
  let fixture: ComponentFixture<MisReclamosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisReclamosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MisReclamosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
