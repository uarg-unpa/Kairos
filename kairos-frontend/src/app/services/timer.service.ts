import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { TimeEntry, TimerState, initialTimerState } from '../models/timer.model'; 
import { TaskDataService } from './task-data.service'; // <-- IMPORTADO

@Injectable({
  providedIn: 'root'
})
export class TimerService {
  
  //claves del LocalStorage
  private readonly LS_TIMER_STATE = 'kairos_timer_state';
  private readonly LS_TIME_ENTRIES = 'kairos_time_entries';

  private timerStateSubject = new BehaviorSubject<TimerState>(this.loadTimerState());
  public timerState$ = this.timerStateSubject.asObservable();

  private elapsedSecondsSubject = new BehaviorSubject<number>(0);
  public elapsedSeconds$: Observable<number> = this.elapsedSecondsSubject.asObservable();
  
  private timerSubscription: Subscription | null = null;
  private isRegistering = false; // Flag para evitar doble envío

  constructor(private taskDataService: TaskDataService) { // <-- INYECCIÓN DE DEPENDENCIA
    this.startRunningTimer();
  }

  private loadTimerState(): TimerState {
    const savedState = localStorage.getItem(this.LS_TIMER_STATE);
    if (savedState) {
      const state = JSON.parse(savedState);
      return state;
    }
    return initialTimerState;
  }

  private saveTimerState(state: TimerState): void {
    localStorage.setItem(this.LS_TIMER_STATE, JSON.stringify(state));
  }
  
  private loadTimeEntries(): TimeEntry[] {
      const savedEntries = localStorage.getItem(this.LS_TIME_ENTRIES);
      return savedEntries ? JSON.parse(savedEntries) : [];
  }
  
  private saveTimeEntries(entries: TimeEntry[]): void {
      localStorage.setItem(this.LS_TIME_ENTRIES, JSON.stringify(entries));
  }

  private startRunningTimer(): void {
    const state = this.timerStateSubject.getValue();
    
    if (state.startTime !== null && !state.isPaused) {
      const elapsedOnLoad = (Date.now() - state.startTime) / 1000;
      this.startInterval(state.startTime, state.pausedDuration / 1000);
      this.elapsedSecondsSubject.next(elapsedOnLoad);
      this.timerStateSubject.next({ ...state, isPaused: false }); 
    }
  }

  // --- CU20; registrar tiempor por cronometro ---

  /**
   * Inicia o reanuda el cronómetro.
   */
  public startTimer(taskId: number, taskTitle: string): void {
    const currentState = this.timerStateSubject.getValue();
    
    // CORRECCIÓN CRÍTICA:
    // 1. Si existe un timer Y NO está pausado, detiene el anterior (para iniciar uno nuevo).
    // 2. Si está pausado (currentState.isPaused es true), saltamos este stop para pasar a REANUDAR.
    if (currentState.startTime !== null && !currentState.isPaused) {
        // Esto solo ocurre si el usuario intenta iniciar una NUEVA tarea.
        // El botón Iniciar/Reanudar en el template ya maneja esto, pero es una capa de seguridad.
        this.stopTimer(); 
    }
    
    const now = Date.now();
    let newState: TimerState;
    
    if (currentState.isPaused) {
      // REANUDAR
      // Calculamos el nuevo 'startTime' como si nunca se hubiera pausado.
      // El nuevo inicio es: Ahora - (el tiempo que ya llevaba antes de pausar)
      const recomputedStartTime = now - currentState.pausedDuration;
      
      newState = { 
          ...currentState, 
          isPaused: false, 
          pausedDuration: 0, 
          startTime: recomputedStartTime // ESTO ES CLAVE para el cálculo posterior
      };
      
    } else {
      // INICIAR NUEVO
      newState = {
        id: now.toString(),
        taskId: taskId,
        taskTitle: taskTitle,
        startTime: now,
        isPaused: false,
        pausedDuration: 0
      };
    }
    
    this.timerStateSubject.next(newState);
    this.saveTimerState(newState);
    
    // NOTA: La duración inicial para el intervalo debe ser 0 para la reanudación si el cálculo del tiempo de inicio es correcto.
    const initialElapsedSeconds = currentState.isPaused ? currentState.pausedDuration / 1000 : 0;
    this.startInterval(newState.startTime!, initialElapsedSeconds);
  }

  public pauseTimer(): void {
    const currentState = this.timerStateSubject.getValue();
    if (!currentState.startTime || currentState.isPaused) return;

    const pausedDuration = Date.now() - currentState.startTime;

    this.stopInterval();
    
    const newState = {
      ...currentState,
      isPaused: true,
      pausedDuration: pausedDuration,
    };
    
    this.timerStateSubject.next(newState);
    this.saveTimerState(newState);
  }

  /**
   * detiene el cronometro y REGISTRA LA ENTRADA DE TIEMPO EN EL BACKEND
   */
  public stopTimer(): void {
    const currentState = this.timerStateSubject.getValue();
    if (!currentState.startTime || this.isRegistering) return;

    this.stopInterval();

    const endTime = new Date();
    //calcular duración total en segundos (incluyendo pausas si hubo)
    const durationMs = currentState.isPaused 
        ? currentState.pausedDuration 
        : (endTime.getTime() - currentState.startTime!);
        
    const durationSeconds = Math.floor(durationMs / 1000);

    // Regla de validación: si el tiempo es muy corto (menos de 60 segundos), solo resetear
    if (durationSeconds < 60) {
        console.warn('Tiempo demasiado corto para registrar (menos de 60s). Reseteando el cronómetro.');
        this.resetState();
        return;
    }
    
    // 1. Crear la entrada de tiempo LOCAL temporal
    const newEntry: TimeEntry = {
      id: currentState.id,
      taskId: currentState.taskId!,
      taskTitle: currentState.taskTitle!,
      description: `Tiempo cronometrado para: ${currentState.taskTitle}`, 
      durationSeconds: durationSeconds,
      start: new Date(currentState.startTime!),
      end: endTime,
      type: 'timer',
    };

    // 2. Enviar a la API de Spring Boot
    this.isRegistering = true;
    this.taskDataService.registrarTiempo({ 
        idTarea: newEntry.taskId, 
        durationSeconds: newEntry.durationSeconds,
        taskTitle: newEntry.taskTitle 
    }).subscribe({
        next: (response) => {
            console.log("Registro de tiempo exitoso en BDD:", response);
            
            // 3. Si tiene éxito, guardar localmente para el historial y resetear el estado
            const entries = this.loadTimeEntries();
            entries.unshift(newEntry);
            this.saveTimeEntries(entries);
            this.resetState();
        },
        error: (error) => {
            console.error("ERROR CRÍTICO: Fallo al registrar tiempo en el backend. Revisa TiempoController.", error);
            this.resetState(); 
        },
        complete: () => {
            this.isRegistering = false;
        }
    });
  }
  
  private resetState(): void {
    this.timerStateSubject.next(initialTimerState);
    this.elapsedSecondsSubject.next(0);
    localStorage.removeItem(this.LS_TIMER_STATE);
  }

  private stopInterval(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = null;
    }
  }

  private startInterval(startTime: number, initialElapsedSeconds: number): void {
    this.stopInterval(); // Asegura que solo hay uno corriendo

    this.timerSubscription = interval(1000).pipe(
      startWith(0),
      map(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        this.elapsedSecondsSubject.next(elapsed);
        return elapsed;
      })
    ).subscribe();
  }

  
  public getTimerEntries(): TimeEntry[] {
    return this.loadTimeEntries();
  }
}