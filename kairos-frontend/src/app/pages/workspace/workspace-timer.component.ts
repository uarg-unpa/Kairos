// workspace-timer.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { TimerService } from '../../services/timer.service';
import { TaskService } from '../../services/tarea.service'; 
import { TimerState, TaskTimerInfo } from '../../models/timer.model'; 
import { Tarea } from '../../models/tarea.model';
import { Usuario } from '../../models/usuarios';
import { catchError, map, of } from 'rxjs';

// Definimos la estructura del payload para registro manual
interface ManualTimeEntry {
  idTarea: number | null;
  hours: number;
  minutes: number;
  seconds: number;
  descripcion: string;
  fechaRegistro: string; // YYYY-MM-DD
}


// Declaración global para Bootstrap Modal
declare var bootstrap: any;

@Component({
  selector: 'app-workspace-timer',
  standalone: true, 
  imports: [
    CommonModule, 
    FormsModule, 
  ], 
  templateUrl: './workspace-timer.component.html'
// styleUrls: ['./workspace-timer.component.css']
})
export class WorkspaceTimerComponent implements OnInit, OnDestroy {
  
  elapsedTimeDisplay: string = '00:00:00';
  timerState: TimerState = {} as TimerState;
  
  // Lista para el selector del cronómetro y el modal manual
  availableTasks: TaskTimerInfo[] = []; 
  selectedTaskId: number | null = null;
  
  // 🆕 Tareas para la lista general (requiere mapeo en loadTasks)
  tareas: Tarea[] = []; 

  // -----------------------
  // 🆕 Paginación y Filtros (adaptado de PlanificacionComponent)
  // -----------------------
  tareasPorPagina = 5;
  paginaActual = 1;
  filtroCategoria: string = 'Todas';
  filtroResponsable: string = 'Todos';
  filtroEstado: string = 'Todos';
  filtroFechaDesde: string = '';
  filtroFechaHasta: string = '';
  
  // 🆕 Usuarios y usuario actual (solo para referencia, el servicio de tareas ya filtra)
  usuarios: Usuario[] = [];
  usuarioActual: Usuario | null = null;

  // 🆕 Propiedades para el CU21 (Registro Manual)
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

  constructor(
    private timerService: TimerService,
    private TaskService: TaskService // <-- Servicio para la carga HTTP
  ) {}

  // --- FUNCIÓN RESTAURADA ---
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
   * Carga tareas reales desde el Backend (endpoint mis-tareas).
   */
  // loadTasks(): void {
  //   this.subscriptions.add(
  //       this.TaskService.getTareasAsignadas().subscribe({
  //           next: (tasksInfo) => {
  //               this.availableTasks = tasksInfo;
  //               console.log("Tareas cargadas (TaskTimerInfo):", tasksInfo);
                
  //               this.loadFullTareas();
  //               console.log("Tareas completas cargadas (Tarea[]):", this.tareas);

  //               // Si el timer ya estaba activo (recarga), selecciona la tarea
  //               if (this.timerState.taskId && this.selectedTaskId === null) {
  //                   this.selectedTaskId = this.timerState.taskId;
  //               }
  //           },
  //           error: (err) => {
  //               console.error('Error al cargar tareas asignadas (TaskTimerInfo).', err);
  //               this.availableTasks = [{ id: 0, title: "Error al cargar tareas", status: "ERROR" } as TaskTimerInfo];
  //           }
  //       })
  //   );
  // }
  loadTasks(): void {
  this.subscriptions.add(
    this.TaskService.getTareasAsignadas().subscribe({
      next: (tasksInfo) => {
        this.availableTasks = tasksInfo;
        // 👇 Evitá el cast a Tarea
        this.tareas = tasksInfo.map(t => ({
          idTarea: t.id,
          nombre: t.title,
          estado: t.status,
          prioridad: t.priority,
          descripcion: t.description
        } as any)); // solo los campos necesarios
        console.log("Tareas asignadas al usuario:", this.tareas);
      },
      error: (err) => {
        console.error('Error al cargar tareas asignadas.', err);
        this.availableTasks = [];
      }
    })
  );
}



  /**
   * 🆕 Carga las tareas completas (Tarea[]) para el listado inferior (Asignadas al usuario).
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

    // Cargar usuario actual (simulando desde localStorage como en PlanificacionComponent)
    const usuarioGuardado = localStorage.getItem('usuario_data');
    if (usuarioGuardado) {
      this.usuarioActual = JSON.parse(usuarioGuardado);
    }

    // 2. Suscripción al estado del timer
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

    // 3. Suscripción al display del tiempo
    this.subscriptions.add(this.timerService.elapsedSeconds$.subscribe(seconds => {
      this.elapsedTimeDisplay = this.formatTime(seconds);
    }));
    
    // 🆕 4. Inicializar el modal de Bootstrap para Tiempo Manual
    const modalEl = document.getElementById('manualTimeModal');
    if (modalEl && typeof bootstrap !== 'undefined') {
        this.manualTimeModal = new bootstrap.Modal(modalEl);
    }
  }

  // -------------------------
  // 🆕 Lógica de Paginación y Filtros (adaptada)
  // -------------------------

  tareasFiltradas(): Tarea[] {
    return this.tareas.filter(t => {
      const cumpleEstado = this.filtroEstado === 'Todos' || t.estado === this.filtroEstado;
      return cumpleEstado;
    });
  }

  // Método para obtener las tareas visibles en la página actual
  tareasPaginadas(): Tarea[] {
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

    tarea.estado = nuevoEstado; // Actualización optimista en el frontend
    this.TaskService.updateTarea(tareaId, { estado: nuevoEstado, usuarioId: tarea.usuarioId, iteracionId: tarea.iteracionId }).subscribe({
      next: (res) => {
          console.log('Estado actualizado:', res);
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
  // Manejadores CU20: Cronómetro (Existentes)
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
  // 🆕 Manejadores CU21: Tiempo Manual
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

  /** Maneja el envío del formulario de registro manual. */
  handleManualTimeSubmission(): void {
    const entry = this.manualTimeEntry;

    // 1. Validaciones básicas
    if (!entry.idTarea || (entry.hours === 0 && entry.minutes <= 0 && entry.seconds === 0)) {
        alert("Debe seleccionar una tarea e ingresar una duración de al menos un minuto.");
        return; 
    }
    if (new Date(entry.fechaRegistro) > new Date()) {
        alert("No puede registrar tiempo en una fecha futura.");
        return;
    }
    
    // 2. Calcular duración total en segundos
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
            next: (res) => {
                alert('✅ Tiempo manual registrado exitosamente.');
                this.loadTasks(); // Recargar para actualizar tiempos registrados en la lista
                this.closeManualTimeModal();
            },
            error: (err) => {
                console.error('❌ Error al registrar tiempo manual:', err);
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