import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoriaDTO } from '../../../services/categoria.service';
import { Usuario } from '../../../models/usuarios';
import { Iteracion } from '../../../models/iteracion.model';

@Component({
  selector: 'app-task-filters',
  templateUrl: './task-filters.component.html',
  styleUrls: ['./task-filters.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class TaskFiltersComponent {
  @Input() iteracionActual: Iteracion | null = null;
  @Input() categorias: CategoriaDTO[] = [];
  @Input() usuarios: Usuario[] = [];
  @Input() filtroCategoria = 'Todas';
  @Input() filtroResponsable = 'Todos';
  @Input() filtroEstado = 'Todos';
  @Input() filtroFechaDesde = '';
  @Input() filtroFechaHasta = '';

  @Output() filtrosChange = new EventEmitter<any>();

  onFiltroChange(): void {
    this.filtrosChange.emit({
      categoria: this.filtroCategoria,
      responsable: this.filtroResponsable,
      estado: this.filtroEstado,
      fechaDesde: this.filtroFechaDesde,
      fechaHasta: this.filtroFechaHasta
    });
  }
}