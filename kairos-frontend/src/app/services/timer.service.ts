import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { TimeEntry, TimerState, initialTimerState } from '../models/timer.model'; 
@Injectable({
  providedIn: 'root'
})
export class TimerService {
  
  //claves del LocalStorage
  private readonly LS_TIMER_STATE = 'kairos_timer_state';
  private readonly LS_TIME_ENTRIES = 'kairos_time_entries';

  private timerStateSubject = new BehaviorSubject<TimerState>(this.loadTimerState());
  public timerState$ = this.timerStateSubject.asObservable();

  //tiempo transcurrido actual (en segundos)
  private elapsedSecondsSubject = new BehaviorSubject<number>(0);
  public elapsedSeconds$: Observable<number> = this.elapsedSecondsSubject.asObservable();
  
  private timerSubscription: Subscription | null = null;

  constructor() {
    this.startRunningTimer();
  }

  private loadTimerState(): TimerState {
    const savedState = localStorage.getItem(this.LS_TIMER_STATE);
    if (savedState) {
      //si hay un estado guardado intentar reanudarlo
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

  //intenta reanudar el cronómetro si estaba corriendo al recargar la página
  private startRunningTimer(): void {
    const state = this.timerStateSubject.getValue();
    
    if (state.startTime !== null && !state.isPaused) {
      //calcula cuánto tiempo ha pasado desde el inicio hasta ahora
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
    
    if (currentState.id && currentState.id !== Date.now().toString()) {
        //detener y registrar el anterior si ya había un timer activo
        this.stopTimer(); 
    }
    
    const now = Date.now();
    let newState: TimerState;
    
    if (currentState.isPaused) {
      // REANUDAR (mantiene el startTime original, solo deshace la pausa)
      newState = { ...currentState, isPaused: false, pausedDuration: 0 };
      
    } else {
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
    this.startInterval(newState.startTime!, newState.pausedDuration / 1000);
  }

  /**
   * pausa el cronometro
   */
  public pauseTimer(): void {
    const currentState = this.timerStateSubject.getValue();
    if (!currentState.startTime || currentState.isPaused) return;

    // calcula la duración al momento de la pausa
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
   * detiene el cronometro y registra la entrada de tiempo
   */
  public stopTimer(): void {
    const currentState = this.timerStateSubject.getValue();
    if (!currentState.startTime) return;

    this.stopInterval();

    const endTime = new Date();
    //calcular duración total en segundos (incluyendo pausas si hubo)
    const durationMs = currentState.isPaused 
        ? currentState.pausedDuration 
        : (endTime.getTime() - currentState.startTime);
        
    const durationSeconds = Math.floor(durationMs / 1000);

    if (durationSeconds < 1) {
        this.resetState();
        return;
    }

    // Registrar la entrada de tiempo
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

    const entries = this.loadTimeEntries();
    entries.unshift(newEntry);

    this.saveTimeEntries(entries);
    this.resetState();
  }
  
  /**
   * Reinicia el estado a su valor inicial y limpia LocalStorage
   */
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
        // Calcula el tiempo transcurrido desde el inicio real
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