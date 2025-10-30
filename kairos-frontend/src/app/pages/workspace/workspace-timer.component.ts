import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import { TimerService } from '../../services/timer.service';
import { TaskDataService } from '../../services/task-data.service'; 
import { TimerState, TaskTimerInfo } from '../../models/timer.model'; 

@Component({
  selector: 'app-workspace-timer',
  standalone: true, 
  imports: [
    CommonModule, // Habilita *ngIf, *ngFor
    FormsModule, // Habilita [(ngModel)]
  ], 
  templateUrl: './workspace-timer.component.html'
// styleUrls: ['./workspace-timer.component.css']
})
export class WorkspaceTimerComponent implements OnInit, OnDestroy {
  
  elapsedTimeDisplay: string = '00:00:00';
  timerState: TimerState = {} as TimerState;
  
  availableTasks: TaskTimerInfo[] = []; 
  selectedTaskId: number | null = null;

  private subscriptions = new Subscription();

  constructor(
    private timerService: TimerService,
    private taskDataService: TaskDataService // <-- Servicio para la carga HTTP
  ) {}

  // --- FUNCIÓN RESTAURADA ---
  // Esta función es necesaria para que la suscripción en ngOnInit funcione.
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
   * Carga tareas reales desde el Backend.
   */
  loadTasks(): void {
    // LLAMADA HTTP REAL
    this.subscriptions.add(
        this.taskDataService.getTareasAsignadas().subscribe({
            next: (tasks) => {
                this.availableTasks = tasks;
                console.log("Tareas cargadas del backend:", tasks);
                
                // Si el timer ya estaba activo (recarga), selecciona la tarea
                if (this.timerState.taskId && this.selectedTaskId === null) {
                    this.selectedTaskId = this.timerState.taskId;
                }
            },
            error: (err) => {
                console.error('Error al cargar tareas asignadas. ¿El backend está activo y el JWT es válido?', err);
                // Carga un placeholder en caso de fallo para evitar que el selector se rompa
                this.availableTasks = [{ id: 0, title: "Error al cargar tareas", status: "ERROR" } as TaskTimerInfo];
            }
        })
    );
  }

  ngOnInit(): void {
    // Evita mostrar estado residual de otra sesión
    this.timerService.resetState();
    // Forzar sincronización con el servidor para el usuario actual
    this.timerService.refreshFromServer();

    // 1. Cargar tareas reales
    this.loadTasks();

    // 2. Suscripción al estado
    this.subscriptions.add(this.timerService.timerState$.subscribe(state => {
      this.timerState = state;
      if (state.taskId && this.selectedTaskId === null) {
        this.selectedTaskId = state.taskId;
        // Si ya tenemos las tareas, setear el título en el servicio
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
  }

  //Manejadores del CU20

  handleStart(): void { 
    if (this.timerState.isPaused) {
      // Reanudar
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

  /**
   * Maneja el clic en el botón amarillo (PAUSAR).
   */
  handlePause(): void {
    if (this.timerState.startTime !== null && !this.timerState.isPaused) {
        this.timerService.pauseTimer();
    }
  }

  /**
   * Maneja el clic en el botón rojo (DETENER).
   */
  handleStop(): void { 
    this.timerService.stopTimer();
  }
  
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}





