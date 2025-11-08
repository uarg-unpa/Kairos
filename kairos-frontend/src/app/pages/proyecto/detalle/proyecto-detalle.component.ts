import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProyectoService } from '../../../services/proyecto.service';
import { Proyecto } from '../../../models/proyecto.model';

@Component({
  selector: 'app-proyecto-detalle',
  standalone: true,
  imports: [],
  template: `
    <div class="container my-5">
      <h2>{{ proyecto?.nombre || 'Cargando...' }}</h2>
      <p>{{ proyecto?.descripcion }}</p>
      <p><strong>Estado:</strong> {{ proyecto?.estado }}</p>
      <p><strong>Equipo:</strong> {{ proyecto?.equipo }}</p>
    </div>
  `
})
export class ProyectoDetalleComponent implements OnInit {
  proyecto?: Proyecto;

  constructor(
    private route: ActivatedRoute,
    private proyectoService: ProyectoService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
    }
  }
}