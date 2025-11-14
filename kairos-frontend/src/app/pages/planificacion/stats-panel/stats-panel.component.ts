import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tarea } from '../../../models/tarea.model';

@Component({
  selector: 'app-stats-panel',
  templateUrl: './stats-panel.component.html',
  styleUrls: ['./stats-panel.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class StatsPanelComponent {
  @Input() tareas: Tarea[] = [];

  totalTareas(): number {
    return this.tareas.length;
  }

  completadas(): number {
    return this.tareas.filter(t => t.estado === 'Completado').length;
  }

  porcentajeCompletado(): number {
    const total = this.tareas.length;
    if (total === 0) return 0;
    const completadas = this.tareas.filter(t => t.estado.toLowerCase() === 'completado').length;
    return Math.round((completadas / total) * 100);
  }

  tareasPorCategoria(): { [nombreCategoria: string]: number } {
    const contador: { [nombreCategoria: string]: number } = {};
    this.tareas.forEach(tarea => {
      tarea.categorias.forEach(cat => {
        contador[cat.nombre] = (contador[cat.nombre] || 0) + 1;
      });
    });
    return contador;
  }
}
