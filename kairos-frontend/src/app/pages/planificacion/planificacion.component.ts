import { Component, OnInit, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TaskService } from '../../services/tarea.service';
import { CategoriaService, CategoriaDTO } from '../../services/categoria.service';
import { IteracionService } from '../../services/iteracion.service';
import { UsuariosService } from '../../services/usuarios';
import { ComentarioService } from '../../services/comentario.service';

import { Iteracion } from '../../models/iteracion.model';
import { Tarea } from '../../models/tarea.model';
import { Usuario } from '../../models/usuarios';
import { Comentario } from '../../models/comentario.model';

declare var bootstrap: any;

@Component({
  selector: 'app-planificacion',
  templateUrl: './planificacion.component.html',
  styleUrls: ['./planificacion.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class PlanificacionComponent implements OnInit {
  idProyecto!: number;
  // -----------------------
  // Modal bootstrap
  // -----------------------
  private addTaskModal: any;
  private comentarioModal: any;
  private categoriaModal: any;
  // -----------------------
  // Datos estáticos / listas
  // -----------------------
  categorias: CategoriaDTO[] = [];
  iteraciones: Iteracion[] = [];
  tareas: Tarea[] = [];

  iteracionActual: Iteracion | null = null;
  // -----------------------
  // Paginación
  // -----------------------
  // Número de tareas por página
  tareasPorPagina = 5;

  // Página actual
  paginaActual = 1;

  // -----------------------
  // Usuarios
  // -----------------------
  usuarios: Usuario[] = [];
  usuarioActual: Usuario | null = null;

  // -----------------------
  // Comentarios por tarea
  // key: idTarea, value: lista de comentarios
  // -----------------------
  comentariosPorTarea: { [idTarea: number]: Comentario[] } = {};
  nuevoComentario: { [idTarea: number]: string } = {};
  tareaSeleccionada: number | null = null;
  nuevoComentarioModal = { contenido: '' };


  // -----------------------
  // Objeto para crear/editar tareas desde el modal
  // -----------------------
  tareaEnEdicion: Tarea | null = null;
  nuevaTarea: any = {
    nombre: '',
    descripcion: '',
    categoria: '',      // nombre para mostrar en el select (opcional)
    categoriaId: null,  // ID real que enviamos al backend
    prioridad: 'Media',
    estado: 'En Progreso',
    fechaCreacion: '',
    fechaFin: '',
    horasEstimadas: 0,
    usuarioId: null,
    iteracionId: null,
    dependenciaId: null,
  };

    // -----------------------
  // Objeto para crear/editar categorias desde el modal
  // -----------------------
  nuevaCategoria: any = {
    nombre: '',
    descripcion: '',
    idProyecto: this.idProyecto,
  }
  // -----------------------
  // Filtros para la vista
  // -----------------------
  filtroCategoria: string = 'Todas';
  filtroResponsable: string = 'Todos';
  filtroEstado: string = 'Todos';
  filtroFechaDesde: string = '';
  filtroFechaHasta: string = '';

  // Filtro por vencimiento proveniente del Dashboard (?vencimiento=proximas|atrasadas)
  filtroVencimiento: 'proximas' | 'atrasadas' | null = null;

  /**
   * Constructor inyecta servicios necesarios.
   * Además utiliza effect() para escuchar cambios en el servicio de usuarios.
   */
  constructor(
    private categoriaService: CategoriaService,
    private taskService: TaskService,
    private usuariosService: UsuariosService,
    private iteracionService: IteracionService,
    private comentarioService: ComentarioService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // sincroniza la lista de usuarios cada vez que cambia el servicio
    effect(() => {
      this.usuarios = this.usuariosService.usuarios();
      console.log('Usuarios actualizados:', this.usuarios);
    });
  }

  /**
   * Inicialización del componente:
   * - carga tareas, categorías e iteraciones
   * - recupera usuario guardado en localStorage
   * - inicializa el modal de bootstrap si está presente en el DOM
   */
  ngOnInit(): void {
    const qp = this.route.snapshot.queryParamMap;
    const iterParam = qp.get('iteracionId');
    if (iterParam) this.filtroIteracionId = Number(iterParam);

    // Escucha y aplica filtro de vencimiento desde query params
    this.route.queryParamMap.subscribe(params => {
      const venc = params.get('vencimiento');
      this.filtroVencimiento = (venc === 'proximas' || venc === 'atrasadas') ? venc : null;
    });

    this.proyectoId = Number(this.route.snapshot.paramMap.get('id'));
    console.log('Proyecto ID:', this.proyectoId);
    this.cargarTareas();
    this.cargarCategorias();
    this.cargarIteraciones();

    const usuarioGuardado = localStorage.getItem('usuario_data');
    if (usuarioGuardado) {
      this.usuarioActual = JSON.parse(usuarioGuardado);
    }
    console.log('Usuario actual:', this.usuarioActual);

    this.obtenerIteracionActual();


    const modalEl = document.getElementById('addTaskModal');
    if (modalEl) {
      // bootstrap está declarado globalmente en index.html
      this.addTaskModal = new (window as any).bootstrap.Modal(modalEl);
    }
    const comentarioModalEl = document.getElementById('addComentarioModal');
    if (comentarioModalEl) {
      this.comentarioModal = new (window as any).bootstrap.Modal(comentarioModalEl);
    }
    const categoriaModalEl = document.getElementById('categoriasModal');
    if (categoriaModalEl) {
      this.categoriaModal = new (window as any).bootstrap.Modal(categoriaModalEl);
    }

  }

  obtenerIteracionActual(): void {
  if (!this.proyectoId) {
    console.warn('No hay proyectoId definido, no se puede obtener la iteración actual');
    return;
  }

  this.iteracionService.getIteracionActualPorProyecto(this.proyectoId).subscribe({
    next: (iteracionActual) => {
      if (iteracionActual) {
        console.log('Iteración actual detectada:', iteracionActual);
        this.iteracionActual = iteracionActual;
        this.iteraciones = [iteracionActual]; // ✅ solo la actual en la lista
        this.nuevaTarea.iteracionId = iteracionActual.idIteracion; // preselecciona en el modal
        this.filtroIteracionId = iteracionActual.idIteracion; // para filtrar tareas
      } else {
        console.warn('No hay iteración actual activa para este proyecto');
        this.iteraciones = [];
      }

      // Cargar datos dependientes
      this.cargarTareas();
      this.cargarCategorias();
      this.cargarIteraciones();
    },
    error: (err) => {
      console.warn('No se pudo obtener la iteración actual:', err);
      // fallback: no hay iteración actual, se puede decidir si mostrar vacío o todas
      this.iteraciones = [];
      this.cargarTareas();
      this.cargarCategorias();
    }
  });
}


  // -----------------------
  // Metodos de paginación 
  // -----------------------

  // Método para obtener las tareas visibles en la página actual
  tareasPaginadas() {
    const inicio = (this.paginaActual - 1) * this.tareasPorPagina;
    const fin = inicio + this.tareasPorPagina;
    return this.tareasFiltradas().slice(inicio, fin);
  }

  // Total de páginas
  totalPaginas() {
    return Math.ceil(this.tareasFiltradas().length / this.tareasPorPagina);
  }

  // Cambiar de página
  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas()) {
      this.paginaActual = pagina;
    }
  }
  // -----------------------
  // Cargas (fetch)
  // -----------------------

  /** Carga todas las iteraciones desde el backend */
  cargarIteraciones(): void {
    const obs = this.proyectoId
      ? this.iteracionService.getIteracionesPorProyectoId(this.proyectoId)
      : this.iteracionService.getIteraciones();
    obs.subscribe({
      next: (data) => (this.iteraciones = data),
      error: (err) => console.error('Error al cargar iteraciones:', err)
    });
  }

  /** Carga todas las categorías desde el backend */
  cargarCategorias(): void {
    this.categoriaService.getCategorias().subscribe({
      next: (data) => (this.categorias = data),
      error: (err) => console.error('Error al cargar categorías:', err)
    });
  }

  /**
   * Carga todas las tareas y luego carga sus comentarios asociados.
   * Se separa la carga de comentarios para evitar peticiones fallidas cuando las tareas aún no existen.
   */
  cargarTareas(): void {
    const obs = this.proyectoId
      ? this.taskService.getTareasPorProyecto(this.proyectoId)
      : this.taskService.getTareas();
    obs.subscribe({
      next: (data) => {
        this.tareas = data;
        console.log('Tareas cargadas:', this.tareas);
        this.cargarComentarios();
      },
      error: (err) => console.error('Error al cargar tareas:', err)
    });
  }

  /** Carga comentarios para cada tarea presente en this.tareas */
  cargarComentarios(): void {
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

  // -----------------------
  // Operaciones con comentarios
  // -----------------------

  /**
   * Agrega un comentario rápido desde la vista de lista.
   * @param tareaId id de la tarea a la que se agrega el comentario
   */
  agregarComentario(tareaId: number): void {
    const contenido = this.nuevoComentario[tareaId];
    if (!contenido || contenido.trim() === '') return;

    const comentarioParaBackend = {
      contenido,
      idTarea: tareaId,
      idUsuario: this.usuarioActual?.id ?? 1 // usa usuario logueado si existe, sino 1 por defecto
    };

    this.comentarioService.createComentario(comentarioParaBackend).subscribe({
      next: (comentarioCreado) => {
        if (!this.comentariosPorTarea[tareaId]) this.comentariosPorTarea[tareaId] = [];
        this.comentariosPorTarea[tareaId].push(comentarioCreado);
        this.nuevoComentario[tareaId] = '';
      },
      error: (err) => console.error('Error al crear comentario:', err)
    });
  }

  /**
   * Agrega un comentario desde el modal de edición de tarea.
   * Usa this.tareaEnEdicion y this.usuarioActual.
   */
  agregarComentarioModal(): void {
    if (!this.tareaSeleccionada) return;

    const contenido = this.nuevoComentarioModal.contenido.trim();
    if (!contenido) return;

    const comentario = {
      idTarea: this.tareaSeleccionada,
      idUsuario: this.usuarioActual?.id ?? 1,
      contenido
    };

    this.comentarioService.createComentario(comentario).subscribe({
      next: (comentarioCreado) => {
        if (!this.comentariosPorTarea[this.tareaSeleccionada!]) {
          this.comentariosPorTarea[this.tareaSeleccionada!] = [];
        }
        this.comentariosPorTarea[this.tareaSeleccionada!].push(comentarioCreado);
        this.nuevoComentarioModal.contenido = ''; // limpia campo
        this.cerrarModalComentario();
      },
      error: (err) => console.error('Error al agregar comentario:', err)
    });
  }


  /** Elimina un comentario y actualiza la UI local */
  eliminarComentario(comentarioId: number, idTarea: number): void {
    if (!confirm('¿Seguro que deseas eliminar este comentario?')) return;

    this.comentarioService.deleteComentario(comentarioId).subscribe({
      next: () => {
        this.comentariosPorTarea[idTarea] = this.comentariosPorTarea[idTarea].filter(
          (c) => c.idComentario !== comentarioId
        );
      },
      error: (err) => console.error('Error al eliminar comentario:', err)
    });
  }


  /**
   * Agrega un comentario rápido desde la vista de lista.
   * @param proyectoId id del proyecto a la que se agrega el comentario
   */
  agregarCategorias(): void {
    const categoriaBackend = {
      nombre: this.nuevaCategoria.nombre,
      descripcion: this.nuevaCategoria.descripcion,
      idProyecto: 1,
    }

    console.log('Categoria a enviar', categoriaBackend)

    this.categoriaService.createCategoria(categoriaBackend).subscribe({
      next:  (categoriaCreada) =>{
        this.categorias.push(categoriaCreada);
      this.resetModalCategorias();
      }, 
      error: (err) => console.error('Error al crear tarea:', err)
  })
}

eliminarCategoria(categoriaId: number): void {
  if (!confirm('¿Estás seguro que quieres eliminar esta tarea?')) return;

  this.categoriaService.deleteCategoria(categoriaId).subscribe({
    next: () => {
      this.cargarCategorias();
      console.log('Tarea eliminada');
    },
    error: (err) => console.error('Error al eliminar tarea:', err)
  })
}

  // -----------------------
  // Operaciones con tareas
  // -----------------------

  /** Muestra el modal para crear una tarea */
  abrirModal(): void {
    this.addTaskModal?.show();
  }

  abrirModalCrear(): void {
  this.tareaEnEdicion = null; // ← ahora sí, explícitamente
  this.resetModal();
  this.addTaskModal?.show();
}


  /** Cierra el modal y quita foco */
  cerrarModal(): void {
    this.addTaskModal?.hide();
    (document.activeElement as HTMLElement)?.blur();
  }

  abrirModalComentarios(tareaId: number): void {
    this.tareaSeleccionada = tareaId;
    this.nuevoComentarioModal.contenido = ''; // limpia texto anterior
    this.comentarioModal?.show();
  }

  cerrarModalComentario(): void {
    this.comentarioModal?.hide();
  }

  resetModalCategorias(): void {
    this.nuevaCategoria = {
      nombre: '',
      descripcion: '',
    }

  }

  abrirCategorias(){
    this.categoriaModal?.show();
  }

  cerrarModalCategorias(){
    this.categoriaModal?.hide();
  }

  /** Reinicia el formulario del modal a valores por defecto */
  resetModal(): void {
  this.nuevaTarea = {
    nombre: '',
    descripcion: '',
    categoria: '',
    categoriaId: null,
    prioridad: 'Media',
    estado: 'En progreso',
    fechaCreacion: '',
    fechaFin: '',
    horasEstimadas: 0,
    usuarioId: 1,
    iteracionId: 7
  };
}


  /** Agrega una tarea nueva validando campos básicos */
  agregarTarea(): void {
    if (!this.nuevaTarea.nombre) return;

    if (this.nuevaTarea.horasEstimadas < 0) {
      alert('⚠️ Las horas estimadas no pueden ser negativas.');
      return;
    }

    const fechaInicio = new Date(this.nuevaTarea.fechaCreacion);
    const fechaFin = new Date(this.nuevaTarea.fechaFin);
    if (fechaInicio > fechaFin) {
      alert('⚠️ La fecha de inicio no puede ser posterior a la fecha de fin.');
      return;
    }

    if (this.nuevaTarea.horasEstimadas > 1000) {
      alert('⚠️ Las horas estimadas no pueden ser mayores a 1000.');
      return;
    }

    const tareaParaBackend = {
      nombre: this.nuevaTarea.nombre,
      descripcion: this.nuevaTarea.descripcion,
      prioridad: this.nuevaTarea.prioridad,
      estado: this.nuevaTarea.estado,
      fechaCreacion: this.nuevaTarea.fechaCreacion + 'T00:00:00',
      fechaFin: this.nuevaTarea.fechaFin + 'T00:00:00',
      horasEstimadas: this.nuevaTarea.horasEstimadas,
      usuarioId: this.nuevaTarea.usuarioId,
      iteracionId: this.nuevaTarea.iteracionId,
      categoriaIds: this.nuevaTarea.categoriaId ? [Number(this.nuevaTarea.categoriaId)] : [],
      dependenciasIds: this.nuevaTarea.dependenciaId ? [Number(this.nuevaTarea.dependenciaId)] : []
    };

    console.log('Tarea a enviar:', tareaParaBackend);
    this.taskService.createTarea(tareaParaBackend).subscribe({
      next: (tareaCreada) => {
        this.tareas.push(tareaCreada);
        this.cargarTareas();
        this.resetModal();
        this.cerrarModal();
      },
      error: (err) => console.error('Error al crear tarea:', err)
    });
  }

  /** Abre modal de edición y precarga datos en el formulario */
  abrirModalEditar(tarea: Tarea): void {
    this.nuevaTarea = {
      nombre: tarea.nombre,
      descripcion: tarea.descripcion,
      categoriaId: tarea.categorias?.[0]?.idCategoria || null,
      prioridad: tarea.prioridad,
      estado: tarea.estado,
      fechaCreacion: tarea.fechaCreacion?.split('T')[0] || '',
      fechaFin: tarea.fechaFin?.split('T')[0] || '',
      horasEstimadas: Number(tarea.horasEstimadas),
      usuarioId: Number(this.usuarios.find(u => u.nombre === tarea.usuarioNombre)?.id || null),
      iteracionId: tarea.iteracionId ?? null,
      dependenciaId: tarea.dependenciasIds?.[0] || null,
    };

    this.tareaEnEdicion = tarea;

    // Cargar comentarios si no están en memoria


    this.abrirModal();
  }

  /** Envía cambios de edición al backend y actualiza la lista local */
  editarTarea(): void {
    if (!this.tareaEnEdicion) return;

    const tareaParaBackend = {
      nombre: this.nuevaTarea.nombre,
      descripcion: this.nuevaTarea.descripcion,
      prioridad: this.nuevaTarea.prioridad,
      estado: this.nuevaTarea.estado,
      fechaCreacion: this.nuevaTarea.fechaCreacion + 'T00:00:00',
      fechaFin: this.nuevaTarea.fechaFin + 'T00:00:00',
      horasEstimadas: Number(this.nuevaTarea.horasEstimadas),
      usuarioId: this.nuevaTarea.usuarioId,
      iteracionId: this.nuevaTarea.iteracionId,
      categoriaIds: this.nuevaTarea.categoriaId ? [Number(this.nuevaTarea.categoriaId)] : [],
      dependenciasIds: this.nuevaTarea.dependenciaId ? [Number(this.nuevaTarea.dependenciaId)] : []
    };

    console.log('Tarea a editar:', tareaParaBackend);
    if (this.nuevaTarea.horasEstimadas < 0) {
      alert('⚠️ Las horas estimadas no pueden ser negativas.');
      return;
    }

    if (this.nuevaTarea.horasEstimadas > 1000) {
      alert('⚠️ Las horas estimadas no pueden ser mayores a 1000.');
      return;
    }

    const fechaInicio = new Date(this.nuevaTarea.fechaCreacion);
    const fechaFin = new Date(this.nuevaTarea.fechaFin);
    if (fechaInicio > fechaFin) {
      alert('⚠️ La fecha de inicio no puede ser posterior a la fecha de fin.');
      return;
    }
    this.taskService.updateTarea(this.tareaEnEdicion.idTarea!, tareaParaBackend).subscribe({
      next: (tareaActualizada) => {
        const index = this.tareas.findIndex(t => t.idTarea === this.tareaEnEdicion?.idTarea);
        if (index !== -1) this.tareas[index] = tareaActualizada;
        this.tareaEnEdicion = null;
        this.cargarTareas;
        this.resetModal();
        this.cerrarModal();

        console.log('✅ Tarea editada correctamente');
      },
      error: (err) => console.error('❌ Error al editar tarea:', err)
    });
  }

  /** Elimina tarea tanto en backend como en la lista local */
  eliminarTarea(tareaId: number): void {
    if (!confirm('¿Estás seguro que quieres eliminar esta tarea?')) return;

    this.taskService.deleteTarea(tareaId).subscribe({
      next: () => {
        this.tareas = this.tareas.filter(t => t.idTarea !== tareaId);
        console.log('Tarea eliminada');
      },
      error: (err) => console.error('Error al eliminar tarea:', err)
    });
  }

  // -----------------------
  // Utilidades / getters
  // -----------------------

  /** Devuelve la cantidad de tareas totales */
  totalTareas(): number {
    return this.tareas.length;
  }

  /** Cuenta tareas completadas */
  completadas(): number {
    return this.tareas.filter(t => t.estado === 'Completado').length;
  }

  /** Porcentaje de tareas completadas (redondeado) */
  porcentajeCompletado(): number {
    const total = this.tareas.length;
    if (total === 0) return 0;
    const completadas = this.tareas.filter(t => t.estado.toLowerCase() === 'completado').length;
    return Math.round((completadas / total) * 100);
  }

  /** Devuelve un map nombreCategoria -> cantidad de tareas */
  tareasPorCategoria(): { [nombreCategoria: string]: number } {
    const contador: { [nombreCategoria: string]: number } = {};
    this.tareas.forEach(tarea => {
      tarea.categorias.forEach(cat => {
        contador[cat.nombre] = (contador[cat.nombre] || 0) + 1;
      });
    });
    return contador;
  }

  /** Cambia el estado de una tarea y persiste el cambio en el backend */
  cambiarEstado(tareaId: number, nuevoEstado: string): void {
    const tarea = this.tareas.find(t => t.idTarea === tareaId);
    if (!tarea) return;

    tarea.estado = nuevoEstado;
    this.taskService.updateTarea(tareaId, { estado: nuevoEstado }).subscribe({
      next: (res) => console.log('Estado actualizado:', res),
      error: (err) => console.error('Error al actualizar estado:', err)
    });
  }

  /** Devuelve el nombre del usuario por id, o 'Desconocido' si no existe */
  getNombreUsuario(idUsuario: number): string {
    const usuario = this.usuarios.find(u => u.id === idUsuario);
    console.log('Buscando nombre para idUsuario:', idUsuario, '->', usuario);
    return usuario ? usuario.nombre : 'Desconocido';
  }

  /**
   * Retorna la lista de tareas filtradas por los criterios seleccionados en la UI.
   */
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

    // Aplica filtro de vencimiento si corresponde
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

  // Filtros derivados de ruta
  proyectoId: number | null = null;
  filtroIteracionId: number | null = null;


  categoriaExpandida: string | null = null;

toggleDescripcion(nombreCategoria: string) {
  if (this.categoriaExpandida === nombreCategoria) {
    // Si se vuelve a hacer clic, se colapsa
    this.categoriaExpandida = null;
  } else {
    // Si se hace clic en otra, se muestra esa
    this.categoriaExpandida = nombreCategoria;
  }
}

getNombreTareaPorId(id: number): string {
  const tarea = this.tareas.find(t => t.idTarea === id);
  return tarea ? tarea.nombre : 'Desconocida';
}


  // Quita el filtro de vencimiento proveniente del Dashboard
  clearVencimientoFilter(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { vencimiento: null },
      queryParamsHandling: 'merge'
    });
  }


}
