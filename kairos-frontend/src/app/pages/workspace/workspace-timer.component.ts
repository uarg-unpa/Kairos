// workspace-timer.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TimerService } from '../../services/timer.service';
import { TaskService } from '../../services/tarea.service';
import { TimerState, TaskTimerInfo } from '../../models/timer.model';
import { Tarea } from '../../models/tarea.model';
import { Usuario } from '../../models/usuarios';
import { map } from 'rxjs';


// Definimos la estructura del payload para registro manual
interface ManualTimeEntry {
  idTarea: number | null;
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

  // ?? Tareas para la lista general (requiere mapeo en loadTasks)
  tareas: Tarea[] = [];
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
  filtroEstado: string = 'Todos';
  filtroFechaDesde: string = '';
  filtroFechaHasta: string = '';
  filtroPrioridad: string = '';

  // ?? Usuarios y usuario actual (solo para referencia, el servicio de tareas ya filtra)
  usuarios: Usuario[] = [];
  usuarioActual: Usuario | null = null;

  // ?? Propiedades para el CU21 (Registro Manual)
  manualTimeEntry: ManualTimeEntry = {
    idTarea: null,
    hours: 0,
    minutes: 0,
    seconds: 0,
    descripcion: '',
    fechaRegistro: new Date().toISOString().split('T')[0], // Fecha actual por defecto
  };
  //dia actual
  today: string = new Date().toISOString().split('T')[0]
  private manualTimeModal: any; // Instancia del modal

  private subscriptions = new Subscription();
  ultimosTiempos: TiempoResponseDTO[] = [];
  editTimeForm: { idTiempo: any; duracionMinutos: any; fechaRegistro: any; descripcion: any; } | undefined;
  showEditModal: boolean | undefined;

  constructor(
    private timerService: TimerService,
    private TaskService: TaskService // <-- Servicio para la carga HTTP
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
    const source$ = projectId
      ? this.TaskService.getTareasPorProyecto(projectId)
      : this.TaskService.getTareasAsignadas();

    this.subscriptions.add(
      source$.pipe(catchError(() => of([] as Tarea[]))).subscribe({
        next: (tareas: Tarea[]) => {
          // Ordenar: En Progreso primero
          this.tareas = (tareas || []).sort((a, b) => {
            if (a.estado === 'En Progreso' && b.estado !== 'En Progreso') return -1;
            if (a.estado !== 'En Progreso' && b.estado === 'En Progreso') return 1;
            return 0;
          });

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

          console.log('Tareas cargadas y ordenadas:', this.tareas);

          this.availableTasks = this.tareas.map(t => ({
            id: t.idTarea,
            title: t.nombre,
            status: t.estado,
            priority: t.prioridad,
            description: t.descripcion
          }));
          this.updateStats();
        },
        error: (err) => {
          console.error('Error al cargar tareas', err);
          this.tareas = [];
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

    this.activeTasks = (this.tareas || []).filter(t => t.estado !== 'Completado').length;
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
    this.subscriptions.add(
      this.TaskService.getTareasAsignadas().pipe(
        map(tasks => tasks as unknown as Tarea[])
      ).subscribe({
        next: (data) => {
          this.tareas = data;
          console.log('Tareas completas cargadas para el listado:', this.tareas);
        },
        error: (err) => console.error('Error al cargar tareas completas:', err)
      })
    );
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
  }

  // -------------------------
  tareasFiltradas(): Tarea[] {
    return this.tareas.filter(t => {
      const cumpleEstado = this.filtroEstado === 'Todos' || t.estado === this.filtroEstado;
      const cumplePrioridad = !this.filtroPrioridad || t.prioridad === this.filtroPrioridad;
      return cumpleEstado && cumplePrioridad;
    });
  }
  tareasPaginadas(): Tarea[] {
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
        console.log('Estado actualizado');
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
    this.timerService.startTimer(task.id, task.title);
  }

  handlePause(): void {
    if (this.timerState.startTime !== null && !this.timerState.isPaused) {
      this.timerService.pauseTimer();
    }
  }

  handleStop(): void {
    this.timerService.stopTimer();
  }

  // -------------------------
  // ?? Manejadores CU21: Tiempo Manual
  // -------------------------

  /** Muestra el modal de registro manual */
  openManualTimeModal(): void {
    // Reiniciar formulario antes de abrir
    this.manualTimeEntry = {
      idTarea: null,
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
      alert('La duraci?n debe ser al menos 1 minuto');
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
          this.loadTasks(); // opcional: recarga tareas
        },
        error: (err) => {
          console.error('Error al editar tiempo', err);
          alert('Error al guardar. Verifica los datos.');
        }
      })
    );
  }

  /** Maneja el env?o del formulario de registro manual. */
  handleManualTimeSubmission(): void {
    const entry = this.manualTimeEntry;

    // 1. Validaciones b?sicas
    if (!entry.idTarea || (entry.hours === 0 && entry.minutes <= 0 && entry.seconds === 0)) {
      alert("Debe seleccionar una tarea e ingresar una duraci?n de al menos un minuto.");
      return;
    }
    if (new Date(entry.fechaRegistro) > new Date()) {
      alert("No puede registrar tiempo en una fecha futura.");
      return;
    }

    // 2. Calcular duraci?n total en segundos
    const totalSeconds = (entry.hours * 3600) + (entry.minutes * 60) + entry.seconds;

    // 3. Preparar payload para TaskService
    const taskTitle = this.availableTasks.find(t => t.id === entry.idTarea)?.title || 'Tarea Desconocida';

    const payload = {
      idTarea: entry.idTarea,
      durationSeconds: totalSeconds,
      taskTitle: taskTitle
    };

    // 4. Enviar al backend
    this.subscriptions.add(
      this.TaskService.registrarTiempo(payload).subscribe({
        next: () => {
          alert('? Tiempo manual registrado exitosamente.');
          this.loadTasks(); // Recargar para actualizar tiempos registrados en la lista
          this.closeManualTimeModal();
        },
        error: (err) => {
          console.error('? Error al registrar tiempo manual:', err);
          const errorMessage = err.error && err.error.message ? err.error.message : 'Error al registrar tiempo. Verifique el estado de la tarea.';
          alert(`Error de Registro: ${errorMessage}`);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}

