import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanificacionIteracion } from './planificacion-iteracion';

describe('PlanificacionIteracion', () => {
  let component: PlanificacionIteracion;
  let fixture: ComponentFixture<PlanificacionIteracion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanificacionIteracion]
    })
      .compileComponents();

    fixture = TestBed.createComponent(PlanificacionIteracion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
