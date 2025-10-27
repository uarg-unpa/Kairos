import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import { TimerService } from '../../services/timer.service';
import { TimerState } from '../../models/timer.model';

@Component({
  selector: 'app-workspace-timer',
  standalone: true, 
  imports: [
    CommonModule, // Habilita *ngIf, *ngFor
    FormsModule,    // Habilita [(ngModel)]
  ], 
  templateUrl: './workspace-timer.component.html'
// styleUrls: ['./workspace-timer.component.css']
})
export class WorkspaceTimerComponent implements OnInit, OnDestroy {
  
  elapsedTimeDisplay: string = '00:00:00';
  timerState: TimerState = {} as TimerState;
  
  // Simulación de tareas (reemplazarlas por una llamada HTTP real)
  availableTasks: any[] = []; // Inicializado vacío, se llena en ngOnInit
  selectedTaskId: number | null = null;

  private subscriptions = new Subscription();

  constructor(private timerService: TimerService) {}

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
    // TEMPORAL: Simula la carga de tareas desde tu prototipo JS
    this.availableTasks = [
        { id: 1, title: 'Realizar prototipo', status: 'in-progress' },
        { id: 2, title: 'Realizar iteración de la etapa Construcción', status: 'pending' },
        { id: 3, title: 'Modelo arquitectonico', status: 'pending' }
    ];
    
    if (this.timerState.taskId) {
        this.selectedTaskId = this.timerState.taskId;
    }
  }

  ngOnInit(): void {
    this.loadTasks();

    this.subscriptions.add(this.timerService.timerState$.subscribe(state => {
      this.timerState = state;
      if (state.taskId && this.selectedTaskId === null) {
        this.selectedTaskId = state.taskId;
      }
    }));
    
    this.subscriptions.add(this.timerService.elapsedSeconds$.subscribe(seconds => {
      this.elapsedTimeDisplay = this.formatTime(seconds);
    }));
  }

  // --- Manejadores de Eventos del CU20 ---

  handleStart(): void { 
    const task = this.availableTasks.find(t => t.id === this.selectedTaskId);

    if (!task) {
        console.error("Error: Por favor, selecciona una tarea antes de iniciar.");
        return;
    }
    
    // Llama al servicio para INICIAR o REANUDAR
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
    // Llama al servicio para DETENER y REGISTRAR el tiempo, ya sea corriendo o pausado
    this.timerService.stopTimer();
  }

  private formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}