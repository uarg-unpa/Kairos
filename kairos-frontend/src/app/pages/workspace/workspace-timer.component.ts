import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription, of, forkJoin } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { TimerService } from '../../services/timer.service';
import { TaskService } from '../../services/tarea.service';
import { AlertService } from '../../services/alert.service';
import { ComentarioService } from '../../services/comentario.service';
import { TimerState } from '../../models/timer.model';
import { Tarea } from '../../models/tarea.model';
import { Usuario } from '../../models/usuarios';
import { Comentario } from '../../models/comentario.model';
import { HttpClient } from '@angular/common/http'; // Import HttpClient

// Interface for Personal Task
interface PersonalTask {
  id: number;
  nombre: string;
  descripcion: string;
  fechaCreacion: string;
  estado: string;
  proyectoPropuestoId?: number;
  categoriaPropuestaId?: number;
}

interface ManualTimeEntry {
  idTarea: number | null;
  idTareaPersonal: number | null;
  hours: number;
  minutes: number;
  seconds: number;
  descripcion: string;
  fechaRegistro: string; // YYYY-MM-DD
}
interface TiempoResponseDTO {
  idTiempo: number;
  nombreTarea: string;
  duracionMinutos: number;
  fechaRegistro: string; // formato 'YYYY-MM-DD'
  descripcion: string | null;
}

declare var bootstrap: any;

@Component({
  selector: 'app-workspace-timer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './workspace-timer.component.html',
  styleUrls: ['./workspace-timer.component.css']
})
export class WorkspaceTimerComponent implements OnInit, OnDestroy {

  elapsedTimeDisplay: string = '00:00:00';
  timerState: TimerState = {} as TimerState;

  // Lista para el selector del cron?metro y el modal manual
  availableTasks: any[] = [];
  selectedTaskId: number | null = null;

  tareas: Tarea[] = [];
  personalTasks: PersonalTask[] = [];
  combinedTasks: any[] = [];

  totalTimeToday: string = '0h 0m';
  tasksCompletedToday: number = 0;
  activeTasks: number = 0;
  recentActivities: { time: string; message: string }[] = [];

  tareasPorPagina = 5;
  paginaActual = 1;
  filtroCategoria: string = 'Todas';
  filtroResponsable: string = 'Todos';
  filtroEstado: string = 'En Progreso';
  filtroFechaDesde: string = '';
  filtroFechaHasta: string = '';
  filtroPrioridad: string = '';
  tareasEnProgreso: number = 0;

  usuarios: Usuario[] = [];
  usuarioActual: Usuario | null = null;

  // ?? Propiedades para el CU21 (Registro Manual)
  manualTimeEntry: ManualTimeEntry = {
    idTarea: null,
    idTareaPersonal: null,
    hours: 0,
    minutes: 0,
    seconds: 0,
    descripcion: '',
    fechaRegistro: new Date().toISOString().split('T')[0], // Fecha actual por defecto
  };
  //dia actual
  today: string = new Date().toISOString().split('T')[0]
  private manualTimeModal: any; // Instancia del modal

  private personalTaskModal: any;
  newPersonalTask: { nombre: string; descripcion: string } = { nombre: '', descripcion: '' };

  private proposeTaskModal: any;
  proposeTaskData: { taskId: number | null; proyectoId: number | null; categoriaId: number | null } = { taskId: null, proyectoId: null, categoriaId: null };
  proyectos: any[] = [];
  categorias: any[] = [];

  private subscriptions = new Subscription();
  ultimosTiempos: TiempoResponseDTO[] = [];
  editTimeForm: { idTiempo: any; duracionMinutos: any; fechaRegistro: any; descripcion: any; } | undefined;
  showEditModal: boolean | undefined;
  comentariosPorTarea: { [idTarea: number]: Comentario[] } = {};

  constructor(
    private timerService: TimerService,
    private TaskService: TaskService,
    private alertService: AlertService,
    private comentarioService: ComentarioService,
    private http: HttpClient
  ) { }

  private formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  //metodos para el html

  getTimerStatusClass(): string {
    if (this.timerState.startTime === null) {
      return 'alert-info';
    } else if (this.timerState.isPaused) {
      return 'alert-warning';
    } else {
      return 'alert-success';
    }
  }

  getTimerStatusText(): string {
    if (this.timerState.startTime === null) {
      return 'Selecciona una tarea para comenzar';
    }

    const taskTitle = this.timerState.taskTitle || 'Tarea Desconocida';

    if (this.timerState.isPaused) {
      return `Pausado: ${taskTitle}`;
    } else {
      return `Cronometrando: ${taskTitle}`;
    }
  }

  loadTasks(): void {
    const projectId = this.getProjectId();

    // Load regular tasks
    const tasks$ = projectId
      ? this.TaskService.getTareasPorProyecto(projectId)
      : this.TaskService.getTareasAsignadas();

    // Load personal tasks
    const personalTasks$ = this.http.get<PersonalTask[]>('/api/personal-tasks').pipe(
      catchError(() => of([] as PersonalTask[]))
    );

    this.subscriptions.add(
      forkJoin({
        tareas: tasks$.pipe(catchError(() => of([] as Tarea[]))),
        personalTasks: personalTasks$
      }).pipe(
        switchMap(result => {
          this.tareas = result.tareas || [];
          this.personalTasks = result.personalTasks || [];

          return this.timerService.getTiemposTotalesUsuario().pipe(
            catchError(() => of({} as { [k: number]: number }))
          );
        })
      ).subscribe({
        next: (tiemposMap) => {
          (this.tareas || []).forEach(t => {
            const minutos = (tiemposMap && tiemposMap[t.idTarea]) ? tiemposMap[t.idTarea] : 0;
            t.tiempoDedicado = parseFloat((minutos / 60).toFixed(2)); // Convertir a horas
          });

          this.combinedTasks = [
            ...this.tareas.map(t => ({ ...t, type: 'TAREA' })),
            ...this.personalTasks.map(p => ({
              id: p.id,
              nombre: p.nombre,
              descripcion: p.descripcion,
              fechaCreacion: p.fechaCreacion,
              estado: p.estado,
              proyectoPropuestoId: p.proyectoPropuestoId,
              categoriaPropuestaId: p.categoriaPropuestaId,
              prioridad: 'Personal',
              type: 'PERSONAL'
            }))
          ];

          this.availableTasks = [
            ...this.tareas
              .filter(t => t.estado !== 'Completado')
              .map(t => ({
                id: t.idTarea,
                title: t.nombre,
                status: t.estado,
                priority: t.prioridad,
                description: t.descripcion,
                type: 'TAREA'
              })),
            ...this.personalTasks
              .filter(p => p.estado !== 'Completado')
              .map(p => ({
                id: p.id,
                title: `${p.nombre} (Personal)`,
                status: p.estado,
                priority: 'Personal',
                description: p.descripcion,
                type: 'PERSONAL',
                proyectoPropuestoId: p.proyectoPropuestoId
              }))
          ];

          this.tareas.forEach((tarea) => {
            this.comentarioService.getComentariosByTarea(tarea.idTarea).subscribe({
              next: (data) => (this.comentariosPorTarea[tarea.idTarea] = data || []),
              error: (err) => {
                console.error(`Error al cargar comentarios para tarea ${tarea.idTarea}:`, err);
                this.comentariosPorTarea[tarea.idTarea] = [];
              }
            });
          });

          this.tareasEnProgreso = this.tareas.filter(t => t.estado === 'En Progreso').length;
          this.updateStats();
        },
        error: (err) => {
          console.error('Error al cargar tareas o tiempos', err);
          this.tareas = [];
          this.personalTasks = [];
          this.combinedTasks = [];
          this.availableTasks = [];
        }
      })
    );
  }

  private updateStats(): void {
    const today = this.formatLocalDate(new Date());
    const hoyMinutos = (this.ultimosTiempos || [])
      .filter(t => (t.fechaRegistro || '').startsWith(today))
      .reduce((sum, t) => sum + (t.duracionMinutos || 0), 0);
    this.totalTimeToday = this.formatHours(hoyMinutos);

    const todayStr = new Date().toDateString();
    this.tasksCompletedToday = (this.tareas || [])
      .filter(t => t.estado === 'Completado' && new Date(t.fechaCreacion).toDateString() === todayStr)
      .length;

    this.activeTasks = (this.tareas || []).filter(t => t.estado !== 'Completado').length + this.personalTasks.filter(p => p.estado !== 'Completado').length;
  }

  private getProjectId(): number | null {
    const m = window.location.pathname.match(/\/proyecto\/(\d+)/);
    return m && m[1] ? Number(m[1]) : null;
  }

  private formatHours(totalMinutos: number): string {
    const h = Math.floor(totalMinutos / 60);
    const m = totalMinutos % 60;
    return `${h}h ${m}m`;
  }

  private formatLocalDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  addRecentActivity(message: string): void {
    const time = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    this.recentActivities.unshift({ time, message });
    if (this.recentActivities.length > 5) this.recentActivities.pop();
  }

  loadFullTareas(): void {
    this.loadTasks();
  }

  ngOnInit(): void {
    this.timerService.resetState();
    this.timerService.refreshFromServer();

    this.loadTasks();
    this.loadLast5Times();

    const usuarioGuardado = localStorage.getItem('usuario_data');
    if (usuarioGuardado) {
      this.usuarioActual = JSON.parse(usuarioGuardado);
    }

    this.subscriptions.add(this.timerService.timerState$.subscribe(state => {
      this.timerState = state;
      if (state.taskId && this.selectedTaskId === null) {
        this.selectedTaskId = state.taskId;
        const t = this.availableTasks.find(x => x.id === state.taskId);
        if (t && !state.taskTitle) {
          this.timerService.setActiveTaskTitle(t.title);
        }
      }
    }));

    this.subscriptions.add(this.timerService.elapsedSeconds$.subscribe(seconds => {
      this.elapsedTimeDisplay = this.formatTime(seconds);
    }));

    const modalEl = document.getElementById('manualTimeModal');
    if (modalEl && typeof bootstrap !== 'undefined') {
      this.manualTimeModal = new bootstrap.Modal(modalEl);
    }

    const personalModalEl = document.getElementById('personalTaskModal');
    if (personalModalEl && typeof bootstrap !== 'undefined') {
      this.personalTaskModal = new bootstrap.Modal(personalModalEl);
    }

    const proposeModalEl = document.getElementById('proposeTaskModal');
    if (proposeModalEl && typeof bootstrap !== 'undefined') {
      this.proposeTaskModal = new bootstrap.Modal(proposeModalEl);
    }
  }

  // -------------------------
  tareasFiltradas(): any[] {
    return this.combinedTasks.filter(t => {
      const cumpleEstado = this.filtroEstado === 'Todos' || t.estado === this.filtroEstado;
      const cumplePrioridad = !this.filtroPrioridad || t.prioridad === this.filtroPrioridad || (this.filtroPrioridad === 'Personal' && t.type === 'PERSONAL');
      return cumpleEstado && cumplePrioridad;
    });
  }
  tareasPaginadas(): any[] {
    const inicio = (this.paginaActual - 1) * this.tareasPorPagina;
    const fin = inicio + this.tareasPorPagina;
    return this.tareasFiltradas().slice(inicio, fin);
  }

  // Total de páginas
  totalPaginas(): number {
    return Math.ceil(this.tareasFiltradas().length / this.tareasPorPagina);
  }

  // Cambiar de página
  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas()) {
      this.paginaActual = pagina;
    }
  }

  // Cambiar estado de la tarea
  cambiarEstado(tareaId: number, nuevoEstado: string): void {
    const tarea = this.tareas.find(t => t.idTarea === tareaId);
    if (!tarea) return;

    tarea.estado = nuevoEstado;
    this.TaskService.updateTarea(tareaId, { estado: nuevoEstado, usuarioId: tarea.usuarioId, iteracionId: tarea.iteracionId }).subscribe({
      next: () => {
        this.loadTasks();
      },
      error: (err) => {
        console.error('Error al actualizar estado:', err);
        this.loadTasks();
      }
    });
  }

  // -------------------------
  // Manejadores CU20: Cronómetro
  // -------------------------

  handleStart(): void {
    if (this.timerState.isPaused) {
      this.timerService.resumeTimer();
      return;
    }

    // iniciar a partir del selector (selectedTaskId)
    const task = this.availableTasks.find(t => t.id === this.selectedTaskId);
    if (!task) {
      this.alertService.warning('Atención', 'Seleccioná una tarea válida para iniciar el cronómetro.');
      return;
    }

    if (task.type === 'PERSONAL') {
      this.alertService.warning('No soportado', 'El backend actual no permite registrar tiempos directamente sobre tareas personales. Proponela a un proyecto o convertila a tarea del proyecto para registrar tiempo.');
      return;
    }

    // regular task:
    this.timerService.startTimer(task.id, task.title);
  }

  handlePause(): void {
    if (this.timerState.startTime !== null && !this.timerState.isPaused) {
      this.timerService.pauseTimer();
    }
  }

  handleStop(): void {
    this.timerService.stopTimer();
    this.loadTasks();
  }

  startTimerForTask(tarea: any): void {
    if (!tarea) return;

    if (this.timerState.taskId === tarea.id && !this.timerState.isPaused) {
      return;
    }
    if (this.timerState.taskId === tarea.id && this.timerState.isPaused) {
      this.timerService.resumeTimer();
      return;
    }

    if (tarea.type === 'PERSONAL') {
      this.alertService.warning('No soportado', 'El backend actual no permite iniciar cronómetro sobre tareas personales. Proponela a un proyecto o convertila para poder medir tiempo.');
      return;
    }

    this.timerService.startTimer(tarea.idTarea || tarea.id, tarea.nombre || tarea.title);
  }

  async markAsCompleted(taskId: number): Promise<void> {
    const confirmed = await this.alertService.confirm('¿Estás seguro?', '¿Estás seguro de marcar esta tarea como completada?');
    if (!confirmed) return;

    this.cambiarEstado(taskId, 'Completado');
    this.alertService.success('Tarea completada', 'La tarea ha sido marcada como completada.');
  }

  // -------------------------
  // Manejadores CU21: Tiempo Manual
  // -------------------------

  /** Muestra el modal de registro manual */
  openManualTimeModal(): void {
    this.manualTimeEntry = {
      idTarea: null,
      idTareaPersonal: null,
      hours: 0,
      minutes: 0,
      seconds: 0,
      descripcion: '',
      fechaRegistro: new Date().toISOString().split('T')[0]
    };
    if ((this.availableTasks || []).length === 0) {
      this.alertService.warning('Sin tareas', 'No tenés tareas pendientes para registrar tiempo.');
      return;
    }
    this.manualTimeModal?.show();
  }

  /** Oculta el modal de registro manual */
  closeManualTimeModal(): void {
    this.manualTimeModal?.hide();
  }
  // manejadores de tiempos
  loadLast5Times(): void {
    this.subscriptions.add(
      this.timerService.getLast5Times().subscribe({
        next: (tiempos) => {
          this.ultimosTiempos = tiempos;
          this.updateStats(); // actualiza con tiempos reales
        },
        error: (err) => {
          console.error('Error al cargar ?ltimos tiempos', err);
          this.ultimosTiempos = [];
        }
      })
    );
  }
  openEditModal(tiempo: TiempoResponseDTO): void {
    this.editTimeForm = {
      idTiempo: tiempo.idTiempo,
      duracionMinutos: tiempo.duracionMinutos,
      fechaRegistro: tiempo.fechaRegistro,
      descripcion: tiempo.descripcion || ''
    };
    this.showEditModal = true;
  }

  saveEditedTime(): void {
    if (!this.editTimeForm || this.editTimeForm.duracionMinutos < 1) {
      this.alertService.warning('Atención', 'La duración debe ser al menos 1 minuto');
      return;
    }

    this.subscriptions.add(
      this.timerService.editTime(this.editTimeForm.idTiempo, {
        duracionMinutos: this.editTimeForm.duracionMinutos,
        fechaRegistro: this.editTimeForm.fechaRegistro,
        descripcion: this.editTimeForm.descripcion
      }).subscribe({
        next: () => {
          this.showEditModal = false;
          this.loadLast5Times();
          this.loadTasks();
        },
        error: (err) => {
          console.error('Error al editar tiempo', err);
          this.alertService.error('Error', 'Error al guardar. Verifica los datos.');
        }
      })
    );
  }

  /** Maneja el env?o del formulario de registro manual. */
  handleManualTimeSubmission(): void {
    const entry = this.manualTimeEntry;

    if ((!entry.idTarea && !entry.idTareaPersonal) || (entry.hours === 0 && entry.minutes <= 0 && entry.seconds === 0)) {
      this.alertService.warning('Atención', "Debe seleccionar una tarea e ingresar una duración de al menos un minuto.");
      return;
    }
    if (new Date(entry.fechaRegistro) > new Date()) {
      this.alertService.warning('Atención', "No puede registrar tiempo en una fecha futura.");
      return;
    }

    const totalSeconds = (entry.hours * 3600) + (entry.minutes * 60) + entry.seconds;

    const selectedTask = this.availableTasks.find(t => t.id === (entry.idTarea || entry.idTareaPersonal));
    const taskTitle = selectedTask?.title || 'Tarea Desconocida';
    const isPersonal = (selectedTask as any)?.type === 'PERSONAL';
    if (isPersonal) {
      this.alertService.warning('No soportado', 'Registro manual sobre tareas personales no está soportado por el backend. Proponela a un proyecto o convertila a tarea del proyecto.');
      return;
    }

    const payload = {
      idTarea: isPersonal ? null : entry.idTarea,
      durationSeconds: totalSeconds,
      taskTitle: taskTitle,
      fechaRegistro: entry.fechaRegistro,
      descripcion: entry.descripcion
    };

    this.subscriptions.add(
      this.TaskService.registrarTiempo(payload).subscribe({
        next: () => {
          this.alertService.success('Éxito', 'Tiempo manual registrado exitosamente.');
          this.loadTasks();
          this.closeManualTimeModal();
        },
        error: (err) => {
          console.error('? Error al registrar tiempo manual:', err);
          const errorMessage = err.error && err.error.message ? err.error.message : 'Error al registrar tiempo. Verifique el estado de la tarea.';
          this.alertService.error('Error de Registro', errorMessage);
        }
      })
    );
  }
  //metodos tareas personales
  openPersonalTaskModal(): void {
    this.newPersonalTask = { nombre: '', descripcion: '' };
    this.personalTaskModal?.show();
  }

  closePersonalTaskModal(): void {
    this.personalTaskModal?.hide();
  }

  createPersonalTask(): void {
    if (!this.newPersonalTask.nombre) {
      this.alertService.warning('Atención', 'El nombre es obligatorio.');
      return;
    }

    this.http.post('/api/personal-tasks', this.newPersonalTask).subscribe({
      next: () => {
        this.alertService.success('Éxito', 'Tarea personal creada.');
        this.loadTasks();
        this.closePersonalTaskModal();
      },
      error: (err) => {
        console.error('Error creating personal task', err);
        this.alertService.error('Error', 'No se pudo crear la tarea personal.');
      }
    });
  }

  openProposeTaskModal(taskId: number): void {
    this.proposeTaskData = { taskId, proyectoId: null, categoriaId: null };
    this.http.get<any[]>('/api/proyectos/mis-proyectos').subscribe({
      next: (data) => this.proyectos = data,
      error: (err) => console.error('Error loading projects', err)
    });

    this.proposeTaskModal?.show();
  }

  closeProposeTaskModal(): void {
    this.proposeTaskModal?.hide();
  }

  onProjectSelect(): void {
    if (this.proposeTaskData.proyectoId) {
      this.http.get<any[]>(`/api/categorias/proyecto/${this.proposeTaskData.proyectoId}`).subscribe({
        next: (data) => this.categorias = data,
        error: (err) => console.error('Error loading categories', err)
      });
    } else {
      this.categorias = [];
    }
  }

  proposeTask(): void {
    if (!this.proposeTaskData.proyectoId || !this.proposeTaskData.categoriaId) {
      this.alertService.warning('Atención', 'Debe seleccionar un proyecto y una categoría.');
      return;
    }

    this.http.put(`/api/personal-tasks/${this.proposeTaskData.taskId}/propose`, {
      proyectoId: this.proposeTaskData.proyectoId,
      categoriaId: this.proposeTaskData.categoriaId
    }).subscribe({
      next: () => {
        this.alertService.success('Éxito', 'Tarea propuesta al proyecto.');
        this.loadTasks();
        this.closeProposeTaskModal();
      },
      error: (err) => {
        console.error('Error proposing task', err);
        this.alertService.error('Error', 'No se pudo proponer la tarea.');
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
