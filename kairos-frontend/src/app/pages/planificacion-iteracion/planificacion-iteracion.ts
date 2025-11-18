import { Component, OnInit, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TaskService } from '../../services/tarea.service';
import { CategoriaService, CategoriaDTO } from '../../services/categoria.service';
import { IteracionService } from '../../services/iteracion.service';
import { UsuariosService } from '../../services/usuarios';
import { ComentarioService } from '../../services/comentario.service';
import { EtapaService } from '../../services/etapa.service';
import { ProyectoService } from '../../services/proyecto.service';
import { IdCoderService } from '../../services/id-coder.service';

import { TaskListComponent } from './task-list/task-list.component';
import { TaskFiltersComponent } from './task-filters/task-filters.component';
import { StatsPanelComponent } from './stats-panel/stats-panel.component';


import { Iteracion } from '../../models/iteracion.model';
import { Tarea } from '../../models/tarea.model';
import { Usuario } from '../../models/usuarios';
import { Comentario } from '../../models/comentario.model';
import { Etapa } from '../../models/etapa.model';
import { Proyecto } from '../../models/proyecto.model';

@Component({
  selector: 'app-planificacion',
  templateUrl: './planificacion-iteracion.html',
  styleUrls: ['./planificacion-iteracion.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TaskListComponent,
    TaskFiltersComponent,
    StatsPanelComponent  ]
})
export class PlanificacionIteracion implements OnInit {
  

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
  proyectoActual: Proyecto | null = null;

  constructor(
    private proyectoService: ProyectoService,
    private categoriaService: CategoriaService,
    private idCoderService: IdCoderService,
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
   
  const usuarioGuardado = localStorage.getItem('usuario_data');
  if (usuarioGuardado) {
    this.usuarioActual = JSON.parse(usuarioGuardado);
  }

  const encodedId = this.route.snapshot.paramMap.get('id');

    if (encodedId) {
      const decodedId = this.idCoderService.decode(encodedId);

      if (decodedId) {
        this.proyectoId = decodedId;
        console.log('Proyecto ID Decodificado:', this.proyectoId);
      } else {
        console.error('ID de proyecto inválido en la ruta');
        alert('Acceso denegado o ID de proyecto inválido.');
        this.router.navigate(['/inicio']);
        return;
      }
    } else {
      this.router.navigate(['/inicio']);
      return;
    }

 this.getProyectoActual();
 
  this.route.paramMap.subscribe(params => {
    this.filtroIteracionId = Number(params.get('idIteracion'));
    console.log("Proyecto:", this.proyectoId, "Iteración:", this.filtroIteracionId);

    // Primero: obtener la iteración actual del proyecto
    this.iteracionService.getIteracionActualPorProyecto(this.proyectoId!).subscribe({
  next: itActual => {
    const idActual = itActual?.idIteracion;

    // Si la iteración de la ruta es la actual → redirigir
    if (idActual && idActual === this.filtroIteracionId) {
      this.router.navigate([`/proyecto/${encodedId}/planificacion`]);
      return;
    }

    // Si NO es la actual, cargar normalmente
    this.cargarIteracionSeleccionada();
    this.cargarEtapas();
    this.cargarCategorias();
  },

  error: err => {
    // Si NO existe iteración actual → BACKEND retorna 404
    if (err.status === 404) {
      console.warn("No existe iteración actual. Continuando normalmente...");
      
      this.cargarIteracionSeleccionada();
      this.cargarEtapas();
      this.cargarCategorias();
      return;
    }

    console.error("Error inesperado al obtener iteración actual:", err);
  }
});


  });


  // Filtros por query params
  this.route.queryParamMap.subscribe(params => {
    const venc = params.get('vencimiento');
    this.filtroVencimiento = (venc === 'proximas' || venc === 'atrasadas') ? venc : null;
  });
}

  private cargarEtapas(): void {
    if (!this.proyectoId) return;
    this.etapaService.getEtapasPorProyecto(this.proyectoId).subscribe({
      next: (data) => (this.etapas = data),
      error: (err) => console.error('Error al cargar etapas:', err)
    });
  }

  private cargarIteracionSeleccionada(): void {
  if (!this.proyectoId || !this.filtroIteracionId) return;

  this.iteracionService.getIteracionPorId(this.filtroIteracionId).subscribe({
    next: iter => {
      this.iteracionActual = iter;
      this.iteraciones = [iter]; // Para que el filtro funcione igual que antes
      this.cargarTareas();
      this.cargarCategorias();
    },
    error: err => {
      console.error("Error al cargar iteración:", err);
      this.iteracionActual = null;
      this.tareas = [];
    }
  });
}


  private cargarTareas(): void {
    const obs = this.proyectoId
  ? this.taskService.getTareasPorProyectoEIteracion(
      this.proyectoId,
      this.filtroIteracionId!
    )
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

  onFiltrosChange(filtros: any): void {
  this.filtroCategoria = filtros.categoria;
  this.filtroResponsable = filtros.responsable;
  this.filtroEstado = filtros.estado;
  this.filtroFechaDesde = filtros.fechaDesde;
  this.filtroFechaHasta = filtros.fechaHasta;

  this.paginaActual = 1; 
}



  getEtapaIteracionActual(){
    return this.iteracionActual?.etapaNombre;
  }

  getProyectoActual(){
    this.proyectoService.getProyectoById(this.proyectoId!).subscribe({
      next: proy => {
        this.proyectoActual = proy;
      },
      error: err => {
      console.error("Error al cargar proyecto:", err);
      this.iteracionActual = null;
      this.tareas = [];
    }
    })
  }
}

