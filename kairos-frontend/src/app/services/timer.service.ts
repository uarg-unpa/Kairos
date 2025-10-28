import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { ConfigService } from './config.service';
import { TimerState, initialTimerState } from '../models/timer.model';

/**
 * DTO que representa el cronómetro activo devuelto por el backend.
 */
export interface TiempoActivoDTO {
  idTiempoActivo: number;
  idUsuario: number;
  idTarea: number;
  inicio: string; // ISO
}

/**
 * Servicio de cronómetro del Workspace.
 * - Sincroniza con el backend (iniciar/detener y leer activo)
 * - Mantiene un timer local para el display
 * - Calcula segundos efectivos descontando pausas
 */
@Injectable({ providedIn: 'root' })
export class TimerService {
  private http = inject(HttpClient);
  private config = inject(ConfigService);

  /** Endpoint base para recursos de tiempo activo */
  readonly baseUrl = (this.config.get('apiBaseUrl') || 'http://localhost:8080') + '/api/tiempos/activo';

  /** Estado del cronómetro expuesto a la UI */
  private timerStateSubject = new BehaviorSubject<TimerState>({ ...initialTimerState });
  readonly timerState$ = this.timerStateSubject.asObservable();

  /** Segundos transcurridos (descontando pausas) para mostrar */
  private elapsedSecondsSubject = new BehaviorSubject<number>(0);
  readonly elapsedSeconds$ = this.elapsedSecondsSubject.asObservable();

  private tickHandle: any = null;
  private pausedAccumulatedMs = 0;
  private pausedSinceMs: number | null = null;

constructor() {
    // Al construir, intenta restaurar estado activo desde el backend
    this.refreshFromServer();
  }

  // ------------- HTTP helpers -------------
  /** Obtiene el cronómetro activo del usuario (o null si no hay). */
  getActive(): Observable<TiempoActivoDTO | null> {
    return this.http
      .get<TiempoActivoDTO>(this.baseUrl, { observe: 'response' })
      .pipe(map((res: HttpResponse<TiempoActivoDTO>) => (res.status === 204 ? null : res.body || null)));
  }

  /** Inicia el cronómetro en el servidor para una tarea. */
  private startOnServer(idTarea: number): Observable<TiempoActivoDTO> {
    return this.http.post<TiempoActivoDTO>(`${this.baseUrl}/iniciar`, { idTarea });
  }

  /** Detiene en el servidor; acepta duración efectiva opcional. */
  private stopOnServer(duracionSegundos?: number): Observable<any> {
    const body = duracionSegundos && duracionSegundos > 0 ? { duracionSegundos } : {};
    return this.http.post(`${this.baseUrl}/detener`, body);
  }

  // Expuesto para logout
  /** Atajo para detener enviando segundos efectivos durante logout. */
  stop(): Observable<any> { return this.stopOnServer(this.computeEffectiveSeconds()); }

  // ------------- UI timer logic -------------
  /** Inicia el intervalo y actualiza el contador visual. */
  private startTicking(): void {
    this.stopTicking();
    this.tickHandle = setInterval(() => this.updateElapsed(), 1000);
    this.updateElapsed();
  }

  /** Detiene el intervalo del contador local. */
  private stopTicking(): void {
    if (this.tickHandle) {
      clearInterval(this.tickHandle);
      this.tickHandle = null;
    }
  }

  /** Recalcula y emite los segundos transcurridos (descontando pausas). */
  private updateElapsed(): void {
    const state = this.timerStateSubject.getValue();
    if (!state.startTime) {
      this.elapsedSecondsSubject.next(0);
      return;
    }
    const now = Date.now();
    const elapsedMs = now - state.startTime - this.pausedAccumulatedMs;
    const secs = Math.max(0, Math.floor(elapsedMs / 1000));
    this.elapsedSecondsSubject.next(secs);
  }

  /** Aplica cambios al estado y notifica. */
  private setState(patch: Partial<TimerState>): void {
    this.timerStateSubject.next({ ...this.timerStateSubject.getValue(), ...patch });
  }

  /** Restablece el estado local (timer y contadores). */
  private clearState(): void {
    this.stopTicking();
    this.pausedAccumulatedMs = 0;
    this.pausedSinceMs = null;
    this.timerStateSubject.next({ ...initialTimerState });
    this.elapsedSecondsSubject.next(0);
  }

  public resetState(): void {
    this.clearState();
  }

  /**
   * Sincroniza con el backend: si hay cronómetro activo,
   * ajusta startTime a la hora real e inicia el conteo local.
   */
  public refreshFromServer(): void {
    this.getActive().subscribe({
      next: (active) => {
        if (active) {
          const startMs = Date.parse(active.inicio);
          this.pausedAccumulatedMs = 0;
          this.pausedSinceMs = null;
          this.setState({
            id: String(active.idTiempoActivo),
            taskId: active.idTarea,
            taskTitle: null, // el tÃ­tulo lo setea el componente tras cargar tareas
            startTime: startMs,
            isPaused: false,
            pausedDuration: 0,
          });
          this.startTicking();
        } else {
          this.clearState();
        }
      },
      error: () => {
        // En error, no alterar el estado
      },
    });
  }

  // ------------- Public API used by Workspace -------------
  /** Inicia el cronómetro para la tarea (o reanuda si estaba en pausa). */
  startTimer(taskId: number, taskTitle: string): void {
    // Si ya estÃ¡ corriendo y no estÃ¡ en pausa, no duplicar
    const state = this.timerStateSubject.getValue();
    if (state.startTime && !state.isPaused) return;

    this.startOnServer(taskId).subscribe({
      next: (active) => {
        const startMs = Date.parse(active.inicio);
        this.pausedAccumulatedMs = 0;
        this.pausedSinceMs = null;
        this.timerStateSubject.next({
          id: String(active.idTiempoActivo),
          taskId,
          taskTitle,
          startTime: startMs,
          isPaused: false,
          pausedDuration: 0,
        });
        this.startTicking();
      },
      error: (err) => {
        console.error('No se pudo iniciar el cronómetro en el servidor', err);
      },
    });
  }

  /** Pausa el cronómetro local y detiene el ticking. */
  pauseTimer(): void {
    const state = this.timerStateSubject.getValue();
    if (!state.startTime || state.isPaused) return;
    this.pausedSinceMs = Date.now();
    this.setState({ isPaused: true });
    this.stopTicking();
  }

  /** Reanuda desde pausa acumulando el tiempo pausado. */
  resumeTimer(): void {
    const state = this.timerStateSubject.getValue();
    if (!state.startTime || !state.isPaused) return;
    if (this.pausedSinceMs) {
      this.pausedAccumulatedMs += Date.now() - this.pausedSinceMs;
      this.pausedSinceMs = null;
    }
    this.setState({ isPaused: false });
    this.startTicking();
  }

  /** Detiene y envía al backend los segundos efectivos calculados. */
  stopTimer(): void {
    const secs = this.computeEffectiveSeconds();
    this.stopOnServer(secs).subscribe({
      next: () => {
        this.clearState();
      },
      error: (err) => {
        console.error('Error al detener cronómetro en el servidor', err);
        // Aún si falla, liberamos estado local para evitar inconsistencias visuales
        this.clearState();
      },
    });
  }

  /** Calcula now - startTime - totalPausado, en segundos. */
  private computeEffectiveSeconds(): number {
    const state = this.timerStateSubject.getValue();
    if (!state.startTime) return 0;
    const now = Date.now();
    let pausedMs = this.pausedAccumulatedMs;
    if (this.pausedSinceMs) pausedMs += now - this.pausedSinceMs;
    const effectiveMs = now - state.startTime - pausedMs;
    return Math.max(0, Math.floor(effectiveMs / 1000));
  }

  // Permite al componente actualizar el tÃ­tulo una vez que carga las tareas
  /** Permite al componente establecer el título de la tarea activa. */
  setActiveTaskTitle(title: string | null): void {
    this.setState({ taskTitle: title ?? null });
  }
}


