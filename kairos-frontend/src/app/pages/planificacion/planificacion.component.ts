import { Component, OnInit, ViewChild, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TaskService } from '../../services/tarea.service';
import { CategoriaService, CategoriaDTO } from '../../services/categoria.service';
import { IteracionService } from '../../services/iteracion.service';
import { UsuariosService } from '../../services/usuarios';
import { ComentarioService } from '../../services/comentario.service';
import { EtapaService } from '../../services/etapa.service';

import { TaskListComponent } from './task-list/task-list.component';
import { TaskFiltersComponent } from './task-filters/task-filters.component';
import { StatsPanelComponent } from './stats-panel/stats-panel.component';
import { TaskFormModalComponent } from './task-form-modal/task-form-modal.component';
import { CategoriesModalComponent } from './categories-modal/categories-modal.component';
import { CommentsModalComponent } from './comments-modal/comments-modal.component';

import { Iteracion } from '../../models/iteracion.model';
import { Tarea } from '../../models/tarea.model';
import { Usuario } from '../../models/usuarios';
import { Comentario } from '../../models/comentario.model';
import { Etapa } from '../../models/etapa.model';

@Component({
  selector: 'app-planificacion',
  templateUrl: './planificacion.component.html',
  styleUrls: ['./planificacion.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TaskListComponent,
    TaskFiltersComponent,
    StatsPanelComponent,
    TaskFormModalComponent,
    CategoriesModalComponent,
    CommentsModalComponent
  ]
})
export class PlanificacionComponent implements OnInit {
  @ViewChild(TaskFormModalComponent) taskFormModal!: TaskFormModalComponent;
  @ViewChild(CategoriesModalComponent) categoriesModal!: CategoriesModalComponent;
  @ViewChild(CommentsModalComponent) commentsModal!: CommentsModalComponent;

  // Datos principales
  idProyecto!: number;
  categorias: CategoriaDTO[] = [];
  iteraciones: Iteracion[] = [];
  tareas: Tarea[] = [];
  etapas: Etapa[] = [];
  iteracionActual: Iteracion | null = null;

  // Usuario y comentarios
  usuarios: Usuario[] = [];
  usuarioActual: Usuario | null = null;
  comentariosPorTarea: { [idTarea: number]: Comentario[] } = {};

  // Paginación
  tareasPorPagina = 5;
  paginaActual = 1;

  // Filtros
  filtroCategoria = 'Todas';
  filtroResponsable = 'Todos';
  filtroEstado = 'Todos';
  filtroFechaDesde = '';
  filtroFechaHasta = '';
  filtroVencimiento: 'proximas' | 'atrasadas' | null = null;
  filtroIteracionId: number | null = null;
  proyectoId: number | null = null;

  constructor(
    private categoriaService: CategoriaService,
    private taskService: TaskService,
    private usuariosService: UsuariosService,
    private iteracionService: IteracionService,
    private comentarioService: ComentarioService,
    private etapaService: EtapaService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    effect(() => {
      this.usuarios = this.usuariosService.usuarios();
    });
  }

  ngOnInit(): void {
    this.proyectoId = Number(this.route.snapshot.paramMap.get('id'));
    
    const usuarioGuardado = localStorage.getItem('usuario_data');
    if (usuarioGuardado) {
      this.usuarioActual = JSON.parse(usuarioGuardado);
    }

    this.route.queryParamMap.subscribe(params => {
      const venc = params.get('vencimiento');
      this.filtroVencimiento = (venc === 'proximas' || venc === 'atrasadas') ? venc : null;
    });

    this.obtenerIteracionActual();
    this.cargarEtapas();
  }

  private cargarEtapas(): void {
    if (!this.proyectoId) return;
    this.etapaService.getEtapasPorProyecto(this.proyectoId).subscribe({
      next: (data) => (this.etapas = data),
      error: (err) => console.error('Error al cargar etapas:', err)
    });
  }

  private obtenerIteracionActual(): void {
    if (!this.proyectoId) return;

    this.iteracionService.getIteracionActualPorProyecto(this.proyectoId).subscribe({
      next: (iteracionActual) => {
        if (iteracionActual) {
          this.iteracionActual = iteracionActual;
          this.iteraciones = [iteracionActual];
          this.filtroIteracionId = iteracionActual.idIteracion;
        }
        console.log('Iteración actual:', this.iteracionActual);
        this.cargarTareas();
        this.cargarCategorias();
      },
      error: () => {
        this.iteraciones = [];
        this.cargarTareas();
        this.cargarCategorias();
      }
    });
  }

  private cargarTareas(): void {
    const obs = this.proyectoId
      ? this.taskService.getTareasPorProyectoEIteracion(this.proyectoId, this.filtroIteracionId || 0)
      : this.taskService.getTareas();

    obs.subscribe({
      next: (data) => {
        this.tareas = data;
        this.cargarComentarios();
      },
      error: (err) => console.error('Error al cargar tareas:', err)
    });
  }

  private cargarCategorias(): void {
    this.categoriaService.getCategoriaporProyecto(this.proyectoId!).subscribe({
      next: (data) => (this.categorias = data || []),
      error: (err) => {
        console.error('Error al cargar categorías:', err);
        this.categorias = [];
      }
    });
  }

  private cargarComentarios(): void {
    this.tareas.forEach((tarea) => {
      this.comentarioService.getComentariosByTarea(tarea.idTarea).subscribe({
        next: (data) => (this.comentariosPorTarea[tarea.idTarea] = data || []),
        error: (err) => {
          console.error(`Error al cargar comentarios para tarea ${tarea.idTarea}:`, err);
          this.comentariosPorTarea[tarea.idTarea] = [];
        }
      });
    });
  }

  // ===== Manejadores de Eventos =====

  onAbrirModalCrear(): void {
  this.taskFormModal.tareaEnEdicion = null;   // <- Indicar que NO es edición
  this.taskFormModal.resetModal();            // <- Forzar reinicio de datos
  this.taskFormModal.abrirModal();            // <- Ahora abrir el modal limpio
}


  onAbrirModalEditar(tarea: Tarea): void {
    // Pasar tarea a editar al modal
    this.taskFormModal.tareaEnEdicion = tarea;
    this.taskFormModal.ngOnChanges();
    this.taskFormModal.abrirModal();
  }

  onGuardarTarea(data: any): void {
    if (data.esEdicion) {
      this.editarTarea(data);
    } else {
      this.agregarTarea(data);
    }
  }

  private agregarTarea(datos: any): void {
    const tareaParaBackend = {
      nombre: datos.nombre,
      descripcion: datos.descripcion,
      prioridad: datos.prioridad,
      estado: datos.estado,
      fechaCreacion: datos.fechaCreacion + 'T00:00:00',
      fechaFin: datos.fechaFin + 'T00:00:00',
      horasEstimadas: datos.horasEstimadas,
      usuarioId: datos.usuarioId,
      iteracionId: datos.iteracionId,
      categoriaIds: datos.categoriaId ? [Number(datos.categoriaId)] : [],
      dependenciasIds: datos.dependenciaId ? [Number(datos.dependenciaId)] : []
    };
    console.log('Datos para crear tarea:', tareaParaBackend);

    this.taskService.createTarea(tareaParaBackend).subscribe({
      next: () => {
        this.cargarTareas();
        this.taskFormModal.cerrarModal();
      },
      error: (err) => console.error('Error al crear tarea:', err)
    });
  }

  private editarTarea(datos: any): void {
    const tareaParaBackend = {
      nombre: datos.nombre,
      descripcion: datos.descripcion,
      prioridad: datos.prioridad,
      estado: datos.estado,
      fechaCreacion: datos.fechaCreacion + 'T00:00:00',
      fechaFin: datos.fechaFin + 'T00:00:00',
      horasEstimadas: Number(datos.horasEstimadas),
      usuarioId: datos.usuarioId,
      iteracionId: datos.iteracionId,
      categoriaIds: datos.categoriaId ? [Number(datos.categoriaId)] : [],
      dependenciasIds: datos.dependenciaId ? [Number(datos.dependenciaId)] : []
    };
    
    console.log('Datos para editar tarea:', tareaParaBackend);

    this.taskService.updateTarea(datos.tareaId, tareaParaBackend).subscribe({
      next: () => {
        this.cargarTareas();
        this.taskFormModal.cerrarModal();
      },
      error: (err) => {
        console.error('❌ Error al editar tarea:', err);

        // Capturar mensaje del backend
        const mensaje =
          err?.error?.error ||     // caso: { error: "mensaje" }
          err?.error?.message ||   // caso: { message: "mensaje" }
          'Ocurrió un error inesperado.';

        alert('⚠️ ' + mensaje);
        console.error('Error completo:', err);

      }
   
    });
  }

  onEliminarTarea(tareaId: number): void {
    if (!confirm('¿Estás seguro que quieres eliminar esta tarea?')) return;

    this.taskService.deleteTarea(tareaId).subscribe({
      next: () => {
        this.tareas = this.tareas.filter(t => t.idTarea !== tareaId);
      },
      error: (err) => console.error('Error al eliminar tarea:', err)
    });
  }

  onCambiarEstado(evento: { tareaId: number; nuevoEstado: string }): void {
    const tarea = this.tareas.find(t => t.idTarea === evento.tareaId);
    if (tarea) {
      tarea.estado = evento.nuevoEstado;
      this.taskService.updateTarea(evento.tareaId, { estado: evento.nuevoEstado }).subscribe({
        next: () => console.log('Estado actualizado'),
        error: (err) => console.error('Error al actualizar estado:', err)
      });
    }
  }

  onAbrirComentarios(tareaId: number): void {
    this.commentsModal?.abrirModal(tareaId);
  }

  onAgregarComentario(evento: { tareaId: number; contenido: string }): void {
    const comentario = {
      idTarea: evento.tareaId,
      idUsuario: this.usuarioActual?.id ?? 1,
      contenido: evento.contenido
    };

    this.comentarioService.createComentario(comentario).subscribe({
      next: (comentarioCreado) => {
        if (!this.comentariosPorTarea[evento.tareaId]) {
          this.comentariosPorTarea[evento.tareaId] = [];
        }
        this.comentariosPorTarea[evento.tareaId].push(comentarioCreado);
      },
      error: (err) => console.error('Error al agregar comentario:', err)
    });
  }

  onEliminarComentario(evento: { comentarioId: number; tareaId: number }): void {
    this.comentarioService.deleteComentario(evento.comentarioId).subscribe({
      next: () => {
        this.comentariosPorTarea[evento.tareaId] = this.comentariosPorTarea[evento.tareaId].filter(
          (c) => c.idComentario !== evento.comentarioId
        );
      },
      error: (err) => console.error('Error al eliminar comentario:', err)
    });
  }

  onAgregarCategoria(datos: any): void {
    const categoriaBackend = {
      nombre: datos.nombre,
      descripcion: datos.descripcion,
      idProyecto: this.proyectoId,
    };

    this.categoriaService.createCategoria(categoriaBackend).subscribe({
      next: () => this.cargarCategorias(),
      error: (err) => console.error('Error al crear categoría:', err)
    });
  }

  onEditarCategoria(evento: { idCategoria: number; datos: any }): void {
    this.categoriaService
      .updateCategoria(evento.idCategoria, evento.datos)
      .subscribe({
        next: () => this.cargarCategorias(),
        error: (err) => console.error('Error al editar categoría:', err)
      });
  }

  onEliminarCategoria(categoriaId: number): void {
    this.categoriaService.deleteCategoria(categoriaId).subscribe({
      next: () => this.cargarCategorias(),
      error: (err) => console.error('Error al eliminar categoría:', err)
    });
  }

  onCambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= Math.ceil(this.tareasFiltradas().length / this.tareasPorPagina)) {
      this.paginaActual = pagina;
    }
  }

  // ===== Métodos Auxiliares =====

  tareasFiltradas(): Tarea[] {
    let items = this.tareas.filter(t => {
      const cumpleIteracion = !this.filtroIteracionId || t.iteracionId === this.filtroIteracionId;
      const cumpleCategoria =
        this.filtroCategoria === 'Todas' ||
        t.categorias.some(c => c.nombre === this.filtroCategoria);
      const cumpleResponsable =
        this.filtroResponsable === 'Todos' ||
        t.usuarioNombre === this.filtroResponsable;
      const cumpleEstado =
        this.filtroEstado === 'Todos' ||
        t.estado === this.filtroEstado;
      const cumpleFechaDesde =
        !this.filtroFechaDesde ||
        (t.fechaCreacion && new Date(t.fechaCreacion) >= new Date(this.filtroFechaDesde));
      const cumpleFechaHasta =
        !this.filtroFechaHasta ||
        (t.fechaFin && new Date(t.fechaFin) <= new Date(this.filtroFechaHasta));

      return cumpleIteracion && cumpleCategoria && cumpleResponsable && cumpleEstado && cumpleFechaDesde && cumpleFechaHasta;
    });

    if (this.filtroVencimiento) {
      const ahora = new Date();
      const limite = new Date(ahora);
      limite.setDate(limite.getDate() + 7);

      const esNoCompletada = (t: Tarea) => !/completad|finalizad/i.test(t?.estado ?? '');
      const fechaFin = (t: Tarea) => t?.fechaFin ? new Date(t.fechaFin) : null;

      if (this.filtroVencimiento === 'proximas') {
        items = items.filter(t => {
          const f = fechaFin(t);
          return esNoCompletada(t) && !!f && f >= ahora && f <= limite;
        });
      } else if (this.filtroVencimiento === 'atrasadas') {
        items = items.filter(t => {
          const f = fechaFin(t);
          return esNoCompletada(t) && !!f && f < ahora;
        });
      }
    }

    return items;
  }

  clearVencimientoFilter(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { vencimiento: null },
      queryParamsHandling: 'merge'
    });
  }
}