import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tarea } from '../../../models/tarea.model';
import { Comentario } from '../../../models/comentario.model';
import { Usuario } from '../../../models/usuarios';
import { AlertService } from '../../../services/alert.service';
import { inject } from '@angular/core';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class TaskListComponent {
  private alertService = inject(AlertService);
  @Input() tareas: Tarea[] = [];
  @Input() comentariosPorTarea: { [idTarea: number]: Comentario[] } = {};
  @Input() usuarios: Usuario[] = [];
  @Input() paginaActual = 1;
  @Input() tareasPorPagina = 5;
  @Input() esLider: boolean = false;

  @Output() editarTarea = new EventEmitter<Tarea>();
  @Output() eliminarTarea = new EventEmitter<number>();
  @Output() cambiarEstado = new EventEmitter<{ tareaId: number; nuevoEstado: string }>();
  @Output() abrirComentarios = new EventEmitter<number>();
  @Output() cambiarPagina = new EventEmitter<number>();
  @Output() eliminarComentario = new EventEmitter<{ comentarioId: number; tareaId: number }>();

  tareasPaginadas(): Tarea[] {
    const inicio = (this.paginaActual - 1) * this.tareasPorPagina;
    return this.tareas.slice(inicio, inicio + this.tareasPorPagina);
  }

  totalPaginas(): number {
    return Math.ceil(this.tareas.length / this.tareasPorPagina);
  }

  onCambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas()) {
      this.cambiarPagina.emit(pagina);
    }
  }

  getNombreUsuario(idUsuario: number): string {
    return this.usuarios.find(u => u.id === idUsuario)?.nombre || 'Desconocido';
  }

  getNombreTareaPorId(id: number): string {
    const tarea = this.tareas.find(t => t.idTarea === id);
    return tarea ? tarea.nombre : 'Desconocida';
  }

  async onEliminarComentario(comentarioId: number, tareaId: number): Promise<void> {
    const confirmado = await this.alertService.confirm(
      '¿Eliminar comentario?',
      '¿Estás seguro de que deseas eliminar este comentario?',
      'Sí, eliminar'
    );

    if (!confirmado) return;

    this.eliminarComentario.emit({ comentarioId, tareaId });
  }
}