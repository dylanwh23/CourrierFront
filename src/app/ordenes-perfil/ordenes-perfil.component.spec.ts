import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdenesPerfilComponent } from './ordenes-perfil.component';

describe('OrdenesPerfilComponent', () => {
  let component: OrdenesPerfilComponent;
  let fixture: ComponentFixture<OrdenesPerfilComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdenesPerfilComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrdenesPerfilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
