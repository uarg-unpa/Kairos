import { ElementRef, Component, Input, Output, EventEmitter, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Tarea } from '../../../models/tarea.model';
import { CategoriaDTO } from '../../../services/categoria.service';
import { Iteracion } from '../../../models/iteracion.model';
import { Usuario } from '../../../models/usuarios';

declare var bootstrap: any;

@Component({
  selector: 'app-task-form-modal',
  templateUrl: './task-form-modal.component.html',
  styleUrls: ['./task-form-modal.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class TaskFormModalComponent implements OnInit {

  @Input() tareaEnEdicion: Tarea | null = null;
  @Input() categorias: CategoriaDTO[] = [];
  @Input() usuarios: Usuario[] = [];
  @Input() iteracionActual: Iteracion | null = null;
  @Input() tareas: Tarea[] = [];

  @Output() guardarTarea = new EventEmitter<any>();
  @Output() cerrar = new EventEmitter<void>();

  @ViewChild('form') form!: NgForm;
  @ViewChild('modalElement', { static: true }) modalElement!: ElementRef;

  private modal: any;



  nuevaTarea: any = {
    nombre: '',
    descripcion: '',
    categoria: '',
    categoriaId: null,
    prioridad: 'Media',
    estado: 'En Progreso',
    fechaCreacion: '',
    fechaFin: '',
    horasEstimadas: 0,
    usuarioId: null,
    iteracionId: null,
    dependenciaId: null,
  };



  ngOnInit(): void {
    const modalEl = document.getElementById('addTaskModal');
    if (modalEl) {
      this.modal = new (window as any).bootstrap.Modal(modalEl);
    }
  }

  ngOnChanges(): void {

    // ✔ Si es edición → cargar datos
    if (this.tareaEnEdicion) {
      console.log("tarea en edicion", this.tareaEnEdicion);
      this.nuevaTarea = {
        nombre: this.tareaEnEdicion.nombre,
        descripcion: this.tareaEnEdicion.descripcion,
        categoriaId: this.tareaEnEdicion.categorias?.[0]?.idCategoria || null,
        prioridad: this.tareaEnEdicion.prioridad,
        estado: this.tareaEnEdicion.estado,
        // ✅ Extraer solo la fecha (YYYY-MM-DD) para que el input type="date" funcione
        fechaCreacion: this.tareaEnEdicion.fechaCreacion?.split('T')[0] || '',
        fechaFin: this.tareaEnEdicion.fechaFin?.split('T')[0] || '',
        horasEstimadas: Number(this.tareaEnEdicion.horasEstimadas),
        usuarioId: Number(this.usuarios.find(u => u.nombre === this.tareaEnEdicion?.usuarioNombre)?.id || null),
        iteracionId: this.tareaEnEdicion.iteracionId ?? null,
        dependenciaId: this.tareaEnEdicion.dependenciasIds?.[0] || null,
      };
      return;
    }

    // ❗✔ Si NO hay tarea en edición → resetear para "Nueva Tarea"
  }


  onSubmit(): void {

    // Normalizar a número
    this.nuevaTarea.dependenciaId =
      this.nuevaTarea.dependenciaId ? Number(this.nuevaTarea.dependenciaId) : null;

    if (!this.nuevaTarea.nombre) return;

    // 2) Validar fechas
    if (this.nuevaTarea.fechaCreacion && this.nuevaTarea.fechaFin) {
      const inicio = new Date(this.nuevaTarea.fechaCreacion);
      const fin = new Date(this.nuevaTarea.fechaFin);
      const iterInicio = new Date(this.iteracionActual?.fechaInicio || '');
      const iterFin = new Date(this.iteracionActual?.fechaFin || '');
      if (fin < inicio) {
        alert('⚠️ La fecha de fin no puede ser anterior a la fecha de creación.');
        return;
      }
      if (inicio < iterInicio || fin > iterFin ||
        fin < iterInicio || inicio > iterFin) {

        alert(`⚠️ Las fechas deben estar dentro del rango de la iteración actual:
${this.iteracionActual?.fechaInicio} a ${this.iteracionActual?.fechaFin}.`);

        return;
      }
    }

    if (!this.nuevaTarea.fechaCreacion) {
      return;
    }

    if (!this.nuevaTarea.fechaFin) {
      return;
    }

    if (this.nuevaTarea.horasEstimadas < 0) {
      alert('⚠️ Las horas estimadas no pueden ser negativas.');
      return;
    }

    if (this.nuevaTarea.usuarioId === 0 || this.nuevaTarea.usuarioId === null) {
      alert('⚠️ Debes asignar un usuario a la tarea.');
      return;
    }

    if (this.nuevaTarea.categoriaId === null || this.nuevaTarea.categoriaId === 0) {
      alert('⚠️ Debes asignar una categoría a la tarea.');
      return;
    }

    if (this.nuevaTarea.iteracionId === null) {
      return
    }


    // ❌ Validar que no dependa de sí misma
    if (this.tareaEnEdicion && this.nuevaTarea.dependenciaId === this.tareaEnEdicion.idTarea) {
      alert("⚠️ Una tarea no puede depender de sí misma asdds.");
      return;
    }

    // ❌ Validar ciclos
    if (this.tareaEnEdicion && this.nuevaTarea.dependenciaId) {
      const ciclo = this.tieneCicloDependencias(
        this.tareaEnEdicion.idTarea,
        this.nuevaTarea.dependenciaId
      );

      if (ciclo) {
        alert("⚠️ Dependencia inválida. Se detectó una dependencia circular.");
        return;
      }
    }


    this.guardarTarea.emit({
      ...this.nuevaTarea,
      esEdicion: !!this.tareaEnEdicion,
      tareaId: this.tareaEnEdicion?.idTarea
    });

    this.resetModal();
  }



  resetModal(): void {
    this.tareaEnEdicion = null;
    this.nuevaTarea = {
      nombre: '',
      descripcion: '',
      categoria: '',
      categoriaId: null,
      prioridad: 'Media',
      estado: 'En Progreso',
      fechaCreacion: '',
      fechaFin: '',
      horasEstimadas: 0,
      usuarioId: null,
      iteracionId: this.iteracionActual?.idIteracion || null,
    };
  }

  abrirModal(): void {
    this.modal?.show();
  }

  cerrarModal(): void {
    this.modal?.hide();
    this.cerrar.emit();
    this.resetModal();
    (document.activeElement as HTMLElement)?.blur();
  }

  getNombreTareaPorId(id: number): string {
    const tarea = this.tareas.find(t => t.idTarea === id);
    return tarea ? tarea.nombre : 'Desconocida';
  }

  // Verifica si existe un ciclo de dependencias
  private tieneCicloDependencias(tareaId: number, dependenciaId: number): boolean {
    let actual = this.tareas.find(t => t.idTarea === dependenciaId);

    while (actual) {
      if (actual.idTarea === tareaId) {
        return true; // Se detectó ciclo
      }

      // Tomar la próxima dependencia
      const nextDepId = actual.dependenciasIds?.[0] || null;
      if (!nextDepId) break;

      actual = this.tareas.find(t => t.idTarea === nextDepId);
    }

    return false;
  }



}
