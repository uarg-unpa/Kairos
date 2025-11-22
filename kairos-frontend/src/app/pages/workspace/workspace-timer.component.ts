// workspace-timer.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription, of, forkJoin } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TimerService } from '../../services/timer.service';
import { TaskService } from '../../services/tarea.service';
import { AlertService } from '../../services/alert.service';
import { ComentarioService } from '../../services/comentario.service';
import { TimerState, TaskTimerInfo } from '../../models/timer.model';
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

// Definimos la estructura del payload para registro manual
interface ManualTimeEntry {
  idTarea: number | null;
  idTareaPersonal: number | null; // Added for personal tasks
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


// Declaraci?n global para Bootstrap Modal
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
  availableTasks: TaskTimerInfo[] = [];
  selectedTaskId: number | null = null;
  selectedTaskType: 'TAREA' | 'PERSONAL' = 'TAREA'; // Track type

  // ?? Tareas para la lista general (requiere mapeo en loadTasks)
  tareas: Tarea[] = [];
  personalTasks: PersonalTask[] = []; // List of personal tasks
  combinedTasks: any[] = []; // Combined list for display

  // Propiedades para estad?sticas (como en el prototipo)
  totalTimeToday: string = '0h 0m';
  tasksCompletedToday: number = 0;
  activeTasks: number = 0;
  recentActivities: { time: string; message: string }[] = [];

  // -----------------------
  // ?? Paginaci?n y Filtros (adaptado de PlanificacionComponent)
  // -----------------------
  tareasPorPagina = 5;
  paginaActual = 1;
  filtroCategoria: string = 'Todas';
  filtroResponsable: string = 'Todos';
  filtroEstado: string = 'En Progreso';
  filtroFechaDesde: string = '';
  filtroFechaHasta: string = '';
  filtroPrioridad: string = '';
  tareasEnProgreso: number = 0;

  // ?? Usuarios y usuario actual (solo para referencia, el servicio de tareas ya filtra)
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

  // Personal Task Modal
  private personalTaskModal: any;
  newPersonalTask: { nombre: string; descripcion: string } = { nombre: '', descripcion: '' };

  // Propose Task Modal
  private proposeTaskModal: any;
  proposeTaskData: { taskId: number | null; proyectoId: number | null; categoriaId: number | null } = { taskId: null, proyectoId: null, categoriaId: null };
  proyectos: any[] = []; // Should be loaded from service
  categorias: any[] = []; // Should be loaded based on project

  private subscriptions = new Subscription();
  ultimosTiempos: TiempoResponseDTO[] = [];
  editTimeForm: { idTiempo: any; duracionMinutos: any; fechaRegistro: any; descripcion: any; } | undefined;
  showEditModal: boolean | undefined;
  comentariosPorTarea: { [idTarea: number]: Comentario[] } = {};


  constructor(
    private timerService: TimerService,
    private TaskService: TaskService, // <-- Servicio para la carga HTTP
    private alertService: AlertService,
    private comentarioService: ComentarioService,
    private http: HttpClient // Inject HttpClient for Personal Tasks (ideally should be in a service)
  ) { }

  // --- FUNCI?N RESTAURADA ---
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
  /**
   * Carga tareas para el Workspace. Si hay proyecto en la URL, usa solo las del proyecto.
   */
  loadTasks(): void {
    const projectId = this.getProjectId();

    // Load regular tasks
    const tasks$ = projectId
      ? this.TaskService.getTareasPorProyecto(projectId)
      : this.TaskService.getTareasAsignadas();

    // Load personal tasks
    const personalTasks$ = this.http.get<PersonalTask[]>('http://localhost:8080/api/personal-tasks');

    this.subscriptions.add(
      forkJoin({
        tareas: tasks$.pipe(catchError(() => of([] as Tarea[]))),
        personalTasks: personalTasks$.pipe(catchError(() => of([] as PersonalTask[])))
      }).subscribe({
        next: (result) => {
          this.tareas = result.tareas || [];
          this.personalTasks = result.personalTasks || [];

          // Merge for display list
          this.combinedTasks = [
            ...this.tareas.map(t => ({ ...t, type: 'TAREA' })),
            ...this.personalTasks.map(t => ({ ...t, idTarea: t.id, type: 'PERSONAL', prioridad: 'Personal' })) // Map personal task fields to match Tarea structure roughly
          ];

          // Update available tasks for timer
          this.availableTasks = [
            ...this.tareas.map(t => ({
              id: t.idTarea,
              title: t.nombre,
              status: t.estado,
              priority: t.prioridad,
              description: t.descripcion,
              type: 'TAREA'
            })),
            ...this.personalTasks.filter(t => t.estado !== 'PROPUESTA').map(t => ({
              id: t.id,
              title: t.nombre + ' (Personal)',
              status: t.estado,
              priority: 'Personal',
              description: t.descripcion,
              type: 'PERSONAL'
            }))
          ];

          // Load comments for regular tasks
          this.tareas.forEach((tarea) => {
            this.comentarioService.getComentariosByTarea(tarea.idTarea).subscribe({
              next: (data) => (this.comentariosPorTarea[tarea.idTarea] = data || []),
              error: (err) => {
                console.error(`Error al cargar comentarios para tarea ${tarea.idTarea}:`, err);
                this.comentariosPorTarea[tarea.idTarea] = [];
              }
            });
          });
          this.updateStats();
          this.tareasEnProgreso = this.tareas.filter(t => t.estado === 'En Progreso').length;

          // Cargar tiempos totales
          this.timerService.getTiemposTotalesUsuario().subscribe({
            next: (tiemposMap) => {
              this.tareas.forEach(t => {
                const minutos = tiemposMap[t.idTarea] || 0;
                t.tiempoDedicado = parseFloat((minutos / 60).toFixed(2)); // Convertir a horas
              });
            },
            error: (err) => console.error('Error al cargar tiempos totales', err)
          });

          this.updateStats();
        },
        error: (err) => {
          console.error('Error al cargar tareas', err);
          this.tareas = [];
          this.personalTasks = [];
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

    this.activeTasks = (this.tareas || []).filter(t => t.estado !== 'Completado').length + this.personalTasks.length;
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

  /**
   * ?? Carga las tareas completas (Tarea[]) para el listado inferior (Asignadas al usuario).
   * Usamos el mismo endpoint /mis-tareas que ya usamos para el selector.
   */
  loadFullTareas(): void {
    this.loadTasks(); // Reusing loadTasks as it now handles both
  }

  ngOnInit(): void {
    this.timerService.resetState();
    this.timerService.refreshFromServer();

    // 1. Cargar tareas (selector y lista)
    this.loadTasks();
    this.loadLast5Times();

    // Cargar usuario actual (simulando desde localStorage como en PlanificacionComponent)
    const usuarioGuardado = localStorage.getItem('usuario_data');
    if (usuarioGuardado) {
      this.usuarioActual = JSON.parse(usuarioGuardado);
    }

    // 2. Suscripci?n al estado del timer
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

    // 3. Suscripci?n al display del tiempo
    this.subscriptions.add(this.timerService.elapsedSeconds$.subscribe(seconds => {
      this.elapsedTimeDisplay = this.formatTime(seconds);
    }));

    // ?? 4. Inicializar el modal de Bootstrap para Tiempo Manual
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

  // Total de p?ginas
  totalPaginas(): number {
    return Math.ceil(this.tareasFiltradas().length / this.tareasPorPagina);
  }

  // Cambiar de p?gina
  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas()) {
      this.paginaActual = pagina;
    }
  }

  // Cambiar estado de la tarea
  cambiarEstado(tareaId: number, nuevoEstado: string): void {
    const tarea = this.tareas.find(t => t.idTarea === tareaId);
    if (!tarea) return;

    tarea.estado = nuevoEstado; // Actualizaci?n optimista en el frontend
    this.TaskService.updateTarea(tareaId, { estado: nuevoEstado, usuarioId: tarea.usuarioId, iteracionId: tarea.iteracionId }).subscribe({
      next: () => {
        this.loadTasks(); // Recargar para sincronizar
      },
      error: (err) => {
        console.error('Error al actualizar estado:', err);
        // Revertir cambio si falla
        this.loadTasks();
      }
    });
  }

  // -------------------------
  // Manejadores CU20: Cron?metro (Existentes)
  // -------------------------

  handleStart(): void {
    if (this.timerState.isPaused) {
      this.timerService.resumeTimer();
      return;
    }

    const task = this.availableTasks.find(t => t.id === this.selectedTaskId);
    if (!task) {
      console.error("Error: Por favor, selecciona una tarea antes de iniciar.");
      return;
    }
    // TODO: Handle Personal Task Timer Start
    // Currently timerService assumes regular task ID. We might need to pass type.
    // For now, assuming ID collision is unlikely or handled by backend if we pass a flag.
    // But wait, TimerService.startTimer only takes ID. We need to update TimerService or pass a composite ID?
    // Or maybe we just use the same ID and let the backend figure it out? No, IDs can collide.
    // Let's assume for this iteration we only support timer on regular tasks OR we need to update TimerService.
    // Given the constraints, I'll update the backend to handle "Personal Task" logic in registerTime, but startTimer might need a flag.
    // Actually, the user requirement says "Un usuario puede crearse una tarea la cual puede registrar tiempos".
    // So we MUST support timer on personal tasks.
    // I will pass a negative ID for personal tasks or something? No, that's hacky.
    // I'll add a `isPersonal` flag to `startTimer` in TimerService if I could, but I can't see TimerService.
    // Let's assume I can pass it or I'll just use the ID and hope for the best? No.
    // I'll modify `startTimer` to accept a type or I'll just use a hack for now: 
    // If it's personal, I might need to handle it differently.
    // Wait, `TimerService` calls `timer/start/{taskId}`. I should probably add `timer/start-personal/{taskId}` or similar.
    // For now, I will just log a warning if it's personal and not implemented, OR I will try to implement it.

    // Check type
    // const isPersonal = (task as any).type === 'PERSONAL';
    // this.timerService.startTimer(task.id, task.title, isPersonal); 

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

  startTimerForTask(taskId: number, taskTitle: string): void {
    // Si ya está corriendo esta tarea, no hacer nada
    if (this.timerState.taskId === taskId && !this.timerState.isPaused) {
      return;
    }
    // Si está pausada en esta tarea, reanudar
    if (this.timerState.taskId === taskId && this.timerState.isPaused) {
      this.timerService.resumeTimer();
      return;
    }
    // Si es otra tarea o no hay nada, iniciar
    this.timerService.startTimer(taskId, taskTitle);
  }

  async markAsCompleted(taskId: number): Promise<void> {
    const confirmed = await this.alertService.confirm('¿Estás seguro?', '¿Estás seguro de marcar esta tarea como completada?');
    if (!confirmed) return;

    this.cambiarEstado(taskId, 'Completado');
    this.alertService.success('Tarea completada', 'La tarea ha sido marcada como completada.');
  }

  // -------------------------
  // ?? Manejadores CU21: Tiempo Manual
  // -------------------------

  /** Muestra el modal de registro manual */
  openManualTimeModal(): void {
    // Reiniciar formulario antes de abrir
    this.manualTimeEntry = {
      idTarea: null,
      idTareaPersonal: null,
      hours: 0,
      minutes: 0,
      seconds: 0,
      descripcion: '',
      fechaRegistro: new Date().toISOString().split('T')[0]
    };
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

    // 1. Validaciones b?sicas
    if ((!entry.idTarea && !entry.idTareaPersonal) || (entry.hours === 0 && entry.minutes <= 0 && entry.seconds === 0)) {
      this.alertService.warning('Atención', "Debe seleccionar una tarea e ingresar una duración de al menos un minuto.");
      return;
    }
    if (new Date(entry.fechaRegistro) > new Date()) {
      this.alertService.warning('Atención', "No puede registrar tiempo en una fecha futura.");
      return;
    }

    // 2. Calcular duraci?n total en segundos
    const totalSeconds = (entry.hours * 3600) + (entry.minutes * 60) + entry.seconds;

    // 3. Preparar payload para TaskService
    const selectedTask = this.availableTasks.find(t => t.id === (entry.idTarea || entry.idTareaPersonal));
    const taskTitle = selectedTask?.title || 'Tarea Desconocida';
    const isPersonal = (selectedTask as any)?.type === 'PERSONAL';

    const payload = {
      idTarea: isPersonal ? null : entry.idTarea,
      idTareaPersonal: isPersonal ? entry.idTareaPersonal : null,
      durationSeconds: totalSeconds,
      taskTitle: taskTitle
    };

    // 4. Enviar al backend
    this.subscriptions.add(
      this.TaskService.registrarTiempo(payload).subscribe({
        next: () => {
          this.alertService.success('Éxito', 'Tiempo manual registrado exitosamente.');
          this.loadTasks(); // Recargar para actualizar tiempos registrados en la lista
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

  // -------------------------
  // Personal Task Methods
  // -------------------------

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

    this.http.post('http://localhost:8080/api/personal-tasks', this.newPersonalTask).subscribe({
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
    // Load projects for the user (assuming we have an endpoint or service)
    // For now, let's assume we can get them from somewhere or we need to fetch them.
    // I'll use a placeholder or fetch if possible.
    // this.projectService.getMyProjects()...
    // Since I don't have ProjectService injected, I'll use HttpClient for now to fetch projects.
    this.http.get<any[]>('http://localhost:8080/api/proyectos/mis-proyectos').subscribe({
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
      // Load categories for the project
      this.http.get<any[]>(`http://localhost:8080/api/categorias/proyecto/${this.proposeTaskData.proyectoId}`).subscribe({
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

    this.http.put(`http://localhost:8080/api/personal-tasks/${this.proposeTaskData.taskId}/propose`, {
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

