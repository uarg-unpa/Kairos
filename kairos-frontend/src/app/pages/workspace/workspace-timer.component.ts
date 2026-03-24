import Swal from 'sweetalert2';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription, of, forkJoin, Observable } from 'rxjs';
import { catchError, switchMap, map } from 'rxjs/operators';
import { TimerService } from '../../services/timer.service';
import { TaskService } from '../../services/tarea.service';
import { ProyectoService } from '../../services/proyecto.service';
import { AlertService } from '../../services/alert.service';
import { ComentarioService } from '../../services/comentario.service';
import { TimerState } from '../../models/timer.model';
import { Tarea } from '../../models/tarea.model';
import { Usuario } from '../../models/usuarios';
import { Comentario } from '../../models/comentario.model';
import { HttpClient } from '@angular/common/http';

interface PersonalTask {
  id: number;
  nombre: string;
  descripcion: string;
  fechaCreacion: string;
  estado: string;
  proyectoPropuestoId?: number;
  categoriaPropuestaId?: number;
  horasEstimadas?: number;
  tiempoDedicado?: number;
}

interface ManualTimeEntry {
  idTarea: number | null;
  idTareaPersonal: number | null;
  editMode: string;
  hours: number;
  minutes: number;
  seconds: number;
  descripcion: string;
  fechaRegistro: string;
  startDateTime: string;
  endDateTime: string;
}
interface TiempoResponseDTO {
  idTiempo: number;
  nombreTarea: string;
  duracionMinutos: number;
  fechaRegistro: string;
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

  availableTasks: any[] = [];
  selectedTaskId: number | null = null;

  tareas: Tarea[] = [];
  personalTasks: PersonalTask[] = [];

  combinedTasks: any[] = [];
  projectTasks: any[] = [];
  projectIdInView: number | null = null; //tareas de proyecto seleccionado

  private proyectoNameCache: { [id: number]: string } = {};

  totalTimeToday: string = '0h 0m';
  tasksCompletedToday: number = 0;
  activeTasks: number = 0;
  recentActivities: { time: string; message: string }[] = [];

  tareasPorPagina = 5;
  paginaActual = 1;
  filtroCategoria: string = 'Todas';
  filtroResponsable: string = 'Todos';
  filtroEstado: string = 'En Progreso';
  filtroEstadoPersonal: string = 'Todos';
  filtroFechaDesde: string = '';
  filtroFechaHasta: string = '';
  filtroPrioridad: string = 'Todas';
  tareasEnProgreso: number = 0;

  usuarios: Usuario[] = [];
  usuarioActual: Usuario | null = null;

  //Propiedades para el CU21 (Registro Manual)
  manualTimeEntry: ManualTimeEntry = {
    idTarea: null,
    idTareaPersonal: null,
    editMode: 'duration',
    hours: 0,
    minutes: 0,
    seconds: 0,
    descripcion: '',
    fechaRegistro: new Date().toISOString().split('T')[0],
    startDateTime: new Date().toISOString().split('T')[0] + 'T08:00',
    endDateTime: new Date().toISOString().split('T')[0] + 'T09:00',
  };
  //dia actual
  today: string = new Date().toISOString().split('T')[0]
  private manualTimeModal: any;

  private personalTaskModal: any;
  newPersonalTask: { nombre: string; descripcion: string; horasEstimadas: number | null } = { nombre: '', descripcion: '', horasEstimadas: null };
  editingPersonalTaskId: number | null = null;

  private proposeTaskModal: any;
  proposeTaskData: { taskId: number | null; proyectoId: number | null; categoriaId: number | null } = { taskId: null, proyectoId: null, categoriaId: null };
  proyectos: any[] = [];
  categorias: any[] = [];

  private subscriptions = new Subscription();
  ultimosTiempos: TiempoResponseDTO[] = [];
  editTimeForm: {
    idTiempo: number;
    fechaRegistro: string;
    descripcion: string;
    editMode: string;
    hours: number;
    minutes: number;
    seconds: number;
    startDateTime: string;
    endDateTime: string;
  } | undefined;
  showEditModal: boolean | undefined;
  comentariosPorTarea: { [idTarea: number]: Comentario[] } = {};

  constructor(
    private timerService: TimerService,
    private TaskService: TaskService,
    private proyectoService: ProyectoService,
    private alertService: AlertService,
    private comentarioService: ComentarioService,
    private http: HttpClient
  ) { }


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

  loadTasks(): void {
    const projectId = this.getProjectId();
    this.projectIdInView = projectId;

    const tasks$ = projectId
      ? this.TaskService.getTareasPorProyecto(projectId).pipe(
        map(tareas => tareas.filter(t => t.usuarioId === this.usuarioActual?.id))
      )
      : this.TaskService.getTareasAsignadas();


    const personalTasks$ = projectId
      ? of([] as PersonalTask[])
      : this.http.get<PersonalTask[]>('/api/personal-tasks').pipe(catchError(() => of([] as PersonalTask[])));

    this.subscriptions.add(
      forkJoin({
        tareas: tasks$.pipe(catchError(() => of([] as Tarea[]))),
        personalTasks: personalTasks$
      }).pipe(
        switchMap(result => {
          this.tareas = result.tareas || [];
          this.personalTasks = result.personalTasks || [];

          return forkJoin({
            totales: this.timerService.getTiemposTotalesUsuario().pipe(
              catchError(() => of({} as { [k: number]: number }))
            ),
            totalesPersonales: this.timerService.getTiemposTotalesPersonalesUsuario().pipe(
              catchError(() => of({} as { [k: number]: number }))
            )
          });
        })
      ).subscribe({
        next: ({ totales, totalesPersonales }) => {
          (this.tareas || []).forEach(t => {
            const minutos = (totales && totales[t.idTarea]) ? totales[t.idTarea] : 0;
            t.tiempoDedicado = parseFloat((minutos / 60).toFixed(2)); // Convertir a horas
          });

          (this.personalTasks || []).forEach(p => {
            const minutos = (totalesPersonales && totalesPersonales[p.id]) ? totalesPersonales[p.id] : 0;
            p.tiempoDedicado = parseFloat((minutos / 60).toFixed(2));
          });

          const proyectoIds = Array.from(new Set(
            (this.tareas || []).map(t => (t.proyectoId ? Number(t.proyectoId) : null)).filter(id => id !== null) as number[]
          ));

          const loadNames$: Observable<any> = proyectoIds.length === 0 ? of([]) : forkJoin(
            proyectoIds.map(pid => {
              if (this.proyectoNameCache[pid]) {
                return of({ id: pid, nombre: this.proyectoNameCache[pid] });
              }
              return this.proyectoService.getProyectoById(pid).pipe(
                map(p => ({ id: pid, nombre: p.nombre })),
                catchError(() => of({ id: pid, nombre: 'Proyecto desconocido' }))
              );
            })
          );

          loadNames$.subscribe((projArr: any[]) => {
            projArr.forEach(x => { if (x && x.id) this.proyectoNameCache[x.id] = x.nombre; });

            this.projectTasks = (this.tareas || []).map(t => ({
              ...t,
              type: 'TAREA',
              proyectoNombre: t.proyectoId ? this.proyectoNameCache[Number(t.proyectoId)] : null
            }));

            this.combinedTasks = [
              ...this.projectTasks,
              ...this.personalTasks.map(p => ({
                id: p.id,
                nombre: p.nombre,
                descripcion: p.descripcion,
                fechaCreacion: p.fechaCreacion,
                estado: p.estado,
                proyectoPropuestoId: p.proyectoPropuestoId,
                categoriaPropuestaId: p.categoriaPropuestaId,
                horasEstimadas: p.horasEstimadas,
                tiempoDedicado: p.tiempoDedicado,
                prioridad: 'Personal',
                type: 'PERSONAL'
              }))
            ];

            const projectSelector = this.projectTasks
              .filter(t => t.estado !== 'Completado')
              .map(t => ({
                id: t.idTarea,
                title: `${t.nombre} ${t.proyectoNombre ? '• ' + t.proyectoNombre : ''}`,
                status: t.estado,
                priority: t.prioridad,
                description: t.descripcion,
                type: 'TAREA',
                proyectoNombre: t.proyectoNombre
              }));

            const personalSelector = this.personalTasks
              .filter(p => p.estado !== 'Completado')
              .map(p => ({
                id: p.id,
                title: `${p.nombre} (Personal)`,
                status: p.estado,
                priority: 'Personal',
                description: p.descripcion,
                type: 'PERSONAL',
                proyectoPropuestoId: p.proyectoPropuestoId,
                horasEstimadas: p.horasEstimadas,
                tiempoDedicado: p.tiempoDedicado
              }));

            this.availableTasks = projectId ? projectSelector : [...projectSelector, ...personalSelector];

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
          });
        },
        error: (err) => {
          console.error('Error al cargar tareas o tiempos', err);
          this.tareas = [];
          this.personalTasks = [];
          this.combinedTasks = [];
          this.availableTasks = [];
          this.projectTasks = [];
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

    this.tasksCompletedToday = (this.tareas || [])
      .filter(t => t.estado === 'Completado' && t.fechaCompletada === today)
      .length;

    this.activeTasks = (this.tareas || []).filter(t => t.estado !== 'Completado').length + this.personalTasks.filter(p => p.estado !== 'Completado').length;
  }
  private getProjectId(): number | null {
    const m = window.location.pathname.match(/\/proyecto\/([^\/]+)/);
    if (!m || !m[1]) return null;
    try {
      const raw = decodeURIComponent(m[1]);
      const num = Number(raw);
      if (!isNaN(num)) return num;
      try {
        const decoded = atob(raw);
        const num2 = Number(decoded);
        if (!isNaN(num2)) return num2;
      } catch (e) {
        this.alertService.error('Error al decodificar el ID del proyecto');
      }
      return null;
    } catch {
      return null;
    }
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

  private getFilteredProjectTasks(source: any[]): any[] {
    return source.filter(t => {
      const matchEstado = this.filtroEstado === 'Todos' || t.estado === this.filtroEstado;
      const tPrioridad = t.prioridad || 'Media';
      const matchPrioridad = this.filtroPrioridad === 'Todas' || tPrioridad === this.filtroPrioridad;
      return matchEstado && matchPrioridad;
    });
  }

  private getFilteredPersonalTasks(source: any[]): any[] {
    return source.filter(t => {
      return this.filtroEstadoPersonal === 'Todos' || t.estado === this.filtroEstadoPersonal;
    });
  }

  projectTasksPaginadas(): any[] {
    const source = this.getFilteredProjectTasks(this.projectTasks || []);
    const inicio = (this.paginaActual - 1) * this.tareasPorPagina;
    return source.slice(inicio, inicio + this.tareasPorPagina);
  }

  personalTasksPaginadas(): any[] {
    const source = this.getFilteredPersonalTasks(this.personalTasks || []);
    const inicio = 0;
    return source.slice(inicio, inicio + 1000);
  }

  totalPaginas(): number {
    const len = this.getFilteredProjectTasks(this.projectTasks || []).length;
    return Math.ceil(len / this.tareasPorPagina);
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas()) {
      this.paginaActual = pagina;
    }
  }

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

    const task = this.availableTasks.find(t => t.id === this.selectedTaskId);
    if (!task) {
      this.alertService.warning('Atención', 'Seleccioná una tarea válida para iniciar el cronómetro.');
      return;
    }

    const isPersonal = task.type === 'PERSONAL';
    this.timerService.startTimer(task.id, task.title, isPersonal);
  }

  handlePause(): void {
    if (this.timerState.startTime !== null && !this.timerState.isPaused) {
      this.timerService.pauseTimer();
    }
  }

  handleStop(): void {
    this.subscriptions.add(
      this.timerService.stop().subscribe({
        next: () => {
          this.loadTasks();
          this.loadLast5Times();
        },
        error: (err) => {
          console.error('Error al detener cronómetro', err);
          this.loadTasks();
        }
      })
    );
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

    const id = tarea.idTarea || tarea.id;
    const title = tarea.nombre || tarea.title;
    const isPersonal = tarea.type === 'PERSONAL';

    this.timerService.startTimer(id, title, isPersonal);
  }

  async markAsCompleted(taskId: number): Promise<void> {
    const confirmed = await this.alertService.confirm('¿Estás seguro?', '¿Estás seguro de marcar esta tarea como completada?');
    if (!confirmed) return;

    this.cambiarEstado(taskId, 'Completado');
    this.alertService.success('Tarea completada', 'La tarea ha sido marcada como completada.');
  }

  // -------------------------
  //Manejadores CU21: Tiempo Manual
  // -------------------------

  /** Muestra el modal de registro manual */
  openManualTimeModal(): void {
    const defaultDate = new Date().toISOString().split('T')[0];
    this.manualTimeEntry = {
      idTarea: null,
      idTareaPersonal: null,
      editMode: 'duration',
      hours: 0,
      minutes: 0,
      seconds: 0,
      descripcion: '',
      fechaRegistro: defaultDate,
      startDateTime: defaultDate + 'T08:00',
      endDateTime: defaultDate + 'T09:00'
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
          console.error('Error al cargar últimos tiempos', err);
          this.ultimosTiempos = [];
        }
      })
    );
  }
  openEditModal(tiempo: TiempoResponseDTO): void {
    const totalMinutos = tiempo.duracionMinutos || 0;
    const h = Math.floor(totalMinutos / 60);
    const m = totalMinutos % 60;

    const datePrefix = tiempo.fechaRegistro ? tiempo.fechaRegistro + 'T' : new Date().toISOString().split('T')[0] + 'T';

    this.editTimeForm = {
      idTiempo: tiempo.idTiempo,
      fechaRegistro: tiempo.fechaRegistro || new Date().toISOString().split('T')[0],
      descripcion: tiempo.descripcion || '',
      editMode: 'duration',
      hours: h,
      minutes: m,
      seconds: 0,
      startDateTime: datePrefix + '08:00',
      endDateTime: datePrefix + '09:00'
    };
    this.showEditModal = true;
  }

  saveEditedTime(): void {
    if (!this.editTimeForm) return;

    let finalMinutos = 0;
    let finalFecha = this.editTimeForm.fechaRegistro;

    if (this.editTimeForm.editMode === 'duration') {
      const h = this.editTimeForm.hours || 0;
      const m = this.editTimeForm.minutes || 0;
      const s = this.editTimeForm.seconds || 0;
      finalMinutos = Math.ceil((h * 3600 + m * 60 + s) / 60);
    } else {
      const start = new Date(this.editTimeForm.startDateTime).getTime();
      const end = new Date(this.editTimeForm.endDateTime).getTime();

      if (isNaN(start) || isNaN(end)) {
        this.alertService.warning('Error', 'Fechas inválidas.');
        return;
      }
      if (end <= start) {
        this.alertService.warning('Atención', 'La fecha/hora de fin no puede ser anterior o igual a la de inicio.');
        return;
      }
      finalMinutos = Math.ceil((end - start) / 60000);
      finalFecha = this.editTimeForm.startDateTime.split('T')[0];
    }

    if (finalMinutos < 1) {
      this.alertService.warning('Atención', 'La duración calculada debe ser de al menos 1 minuto.');
      return;
    }

    this.subscriptions.add(
      this.timerService.editTime(this.editTimeForm.idTiempo, {
        duracionMinutos: finalMinutos,
        fechaRegistro: finalFecha,
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

  confirmDeleteTime(): void {
    if (!this.editTimeForm) return;

    Swal.fire({
      title: '¿Estás seguro?',
      text: "Se eliminará este registro de forma permanente.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.subscriptions.add(
          this.timerService.deleteTime(this.editTimeForm!.idTiempo).subscribe({
            next: () => {
              this.showEditModal = false;
              this.loadLast5Times();
              this.loadTasks();
              Swal.fire('¡Eliminado!', 'El registro ha sido eliminado.', 'success');
            },
            error: (err) => {
              console.error('Error al eliminar tiempo', err);
              this.alertService.error('Error', 'No se pudo eliminar el registro.');
            }
          })
        );
      }
    });
  }

  /** Maneja el envío del formulario de registro manual. */
  handleManualTimeSubmission(): void {
    const entry = this.manualTimeEntry;

    if (!entry.idTarea && !entry.idTareaPersonal) {
      this.alertService.warning('Atención', "Debe seleccionar una tarea.");
      return;
    }

    let finalSegundos = 0;
    let finalFecha = entry.fechaRegistro;

    if (entry.editMode === 'duration') {
      if (entry.hours === 0 && entry.minutes <= 0 && entry.seconds === 0) {
        this.alertService.warning('Atención', "Debe ingresar una duración de al menos un minuto.");
        return;
      }
      if (new Date(entry.fechaRegistro) > new Date()) {
        this.alertService.warning('Atención', "No puede registrar tiempo en una fecha futura.");
        return;
      }
      finalSegundos = (entry.hours * 3600) + (entry.minutes * 60) + entry.seconds;
    } else {
      const start = new Date(entry.startDateTime).getTime();
      const end = new Date(entry.endDateTime).getTime();

      if (isNaN(start) || isNaN(end)) {
        this.alertService.warning('Error', 'Fechas inválidas.');
        return;
      }
      if (end <= start) {
        this.alertService.warning('Atención', 'La fecha/hora de fin no puede ser anterior o igual a la de inicio.');
        return;
      }
      if (start > Date.now() || end > Date.now()) {
        this.alertService.warning('Atención', 'No puede registrar tiempo en una fecha/hora futura.');
        return;
      }
      finalSegundos = Math.ceil((end - start) / 1000);
      finalFecha = entry.startDateTime.split('T')[0];
    }

    const selectedTask = this.availableTasks.find(t => t.id === (entry.idTarea || entry.idTareaPersonal));
    const taskTitle = selectedTask?.title || 'Tarea Desconocida';
    const isPersonal = (selectedTask as any)?.type === 'PERSONAL';

    const payload = {
      idTarea: isPersonal ? null : (entry.idTarea || entry.idTareaPersonal),
      idTareaPersonal: isPersonal ? (entry.idTareaPersonal || entry.idTarea) : null,
      duracionSegundos: finalSegundos,
      taskTitle: taskTitle,
      fechaRegistro: finalFecha,
      descripcion: entry.descripcion
    };

    this.subscriptions.add(
      this.http.post('/api/tiempos', payload).subscribe({
        next: () => {
          this.alertService.success('Éxito', 'Tiempo manual registrado exitosamente.');
          this.loadTasks();
          this.closeManualTimeModal();
        },
        error: (err) => {
          console.error(' Error al registrar tiempo manual:', err);
          const errorMessage = err.error && err.error.message ? err.error.message : 'Error al registrar tiempo. Verifique el estado de la tarea.';
          this.alertService.error('Error de Registro', errorMessage);
        }
      })
    );
  }
  // metodos de tareas personales

  openPersonalTaskModal(): void {
    this.newPersonalTask = { nombre: '', descripcion: '', horasEstimadas: null };
    this.editingPersonalTaskId = null;
    this.personalTaskModal?.show();
  }

  openEditPersonalTaskModal(tarea: any): void {
    this.editingPersonalTaskId = tarea.id;
    this.newPersonalTask = {
      nombre: tarea.nombre,
      descripcion: tarea.descripcion || '',
      horasEstimadas: tarea.horasEstimadas || null
    };
    this.personalTaskModal?.show();
  }

  closePersonalTaskModal(): void {
    this.personalTaskModal?.hide();
    this.editingPersonalTaskId = null;
  }

  createPersonalTask(): void {
    if (!this.newPersonalTask.nombre.trim()) return;

    if (this.newPersonalTask.horasEstimadas !== null && this.newPersonalTask.horasEstimadas < 0) {
      this.alertService.warning('Atención', 'Las horas estimadas no pueden ser negativas.');
      return;
    }

    if (this.editingPersonalTaskId) {
      this.http.put(`/api/personal-tasks/${this.editingPersonalTaskId}`, this.newPersonalTask).subscribe({
        next: () => {
          this.alertService.success('Éxito', 'Tarea personal actualizada.');
          this.loadTasks();
          this.closePersonalTaskModal();
        },
        error: (err) => {
          console.error('Error al actualizar tarea personal', err);
          this.alertService.error('Error', 'No se pudo actualizar la tarea personal.');
        }
      });
    } else {
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
  }

  async deletePersonalTask(id: number): Promise<void> {
    const isConfirmed = await this.alertService.confirm(
      '¿Eliminar Tarea Personal?',
      '¿Estás seguro de que deseas eliminar esta tarea personal? Se eliminarán todos los tiempos vinculados a ella.',
      'Sí, eliminar'
    );

    if (isConfirmed) {
      this.http.delete(`/api/personal-tasks/${id}`).subscribe({
        next: () => {
          this.alertService.success('Éxito', 'Tarea personal eliminada.');
          this.loadTasks();
        },
        error: (err) => {
          console.error('Error al eliminar tarea personal', err);
          this.alertService.error('Error', 'No se pudo eliminar la tarea personal.');
        }
      });
    }
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
