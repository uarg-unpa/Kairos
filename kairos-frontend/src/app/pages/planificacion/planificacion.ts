import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TareaService, Tarea } from '../../services/tarea.service';

declare var bootstrap: any;

@Component({
  selector: 'app-planificacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './planificacion.component.html',
  styleUrls: ['./planificacion.component.css']
})
export class PlanificacionComponent implements OnInit {
  tareas: Tarea[] = [];

  nuevaTarea: Tarea = {
    idIteracion: 1,
    idUsuario: 1,
    estado: 'Pendiente',
    descripcion: '',
    fechaCreacion: new Date().toISOString().split('T')[0],
    prioridad: 'Media',
    fechaFin: '',
    nombre: ''
  };

  constructor(private tareaService: TareaService) {}

  ngOnInit(): void {
    this.cargarTareas();
  }

  // ======================
  // 🔹 CRUD BÁSICO
  // ======================
  cargarTareas(): void {
    this.tareaService.getTareas().subscribe({
      next: (data) => (this.tareas = data),
      error: (err) => console.error('Error al obtener tareas', err)
    });
  }

  crearTarea(): void {
    this.tareaService.crearTarea(this.nuevaTarea).subscribe({
      next: () => {
        this.cargarTareas();
        this.resetFormulario();
        this.cerrarModal();
      },
      error: (err) => console.error('Error al crear tarea', err)
    });
  }

  deleteTask(id: number): void {
    if (confirm('¿Seguro que deseas eliminar esta tarea?')) {
      this.tareaService.eliminarTarea(id).subscribe({
        next: () => this.cargarTareas(),
        error: (err) => console.error('Error al eliminar tarea', err)
      });
    }
  }

  editTask(id: number): void {
    console.log('Editar tarea', id);
  }

  // ======================
  // 🔹 FUNCIONES AUXILIARES
  // ======================
  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'Alta': return 'danger';
      case 'Media': return 'warning';
      case 'Baja': return 'success';
      default: return 'secondary';
    }
  }

  getPriorityText(priority: string): string {
  return priority;
}

getStatusText(status: string): string {
    return status;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Pendiente': return 'secondary';
      case 'En Progreso': return 'primary';
      case 'Completada': return 'success';
      case 'En Pausa': return 'warning';
      default: return 'light';
    }
  }

  abrirModal(): void {
    const modal = new bootstrap.Modal(document.getElementById('addTaskModal'));
    modal.show();
  }

  cerrarModal(): void {
    const modalEl = document.getElementById('addTaskModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal?.hide();
  }

  formatDateRange(fechaFin: string, fechaCreacion: string ): string {
    const fechaInicio = this.nuevaTarea.fechaCreacion;
    return `${fechaInicio} - ${fechaFin}`;
  }

  changeTaskStatus(idTarea: number, newStatus: string): void {
    console.log(`Cambiar estado de la tarea ${idTarea} a ${newStatus}`);
  }

  private resetFormulario(): void {
    this.nuevaTarea = {
      idIteracion: 1,
      idUsuario: 1,
      estado: 'Pendiente',
      descripcion: '',
      fechaCreacion: new Date().toISOString().split('T')[0],
      prioridad: 'Media',
      fechaFin: '',
      nombre: ''
    };
  }
}
