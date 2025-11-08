import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, map, catchError } from 'rxjs';
import { ConfigService } from './config.service';
import { TimerState, initialTimerState } from '../models/timer.model';
import { TaskService } from './tarea.service';

// Nota: Este tipo se usa solo para comunicar "hay un timer activo" a componentes
// como SalirComponent. No representa ningÃºn endpoint del backend.
export interface TiempoActivoDTO {
  idTiempoActivo: number;
  idUsuario: number;
  idTarea: number;
  inicio: string; // ISO
}
interface TiempoResponseDTO {
  idTiempo: number;
  nombreTarea: string;
  duracionMinutos: number;
  fechaRegistro: string; // ISO date
  descripcion: string | null;
}

interface TiempoEditRequestDTO {
  duracionMinutos: number;
  fechaRegistro: string;
  descripcion?: string;
}

@Injectable({ providedIn: 'root' })
export class TimerService {
  private http = inject(HttpClient);
  private config = inject(ConfigService);
  private taskData = inject(TaskService);

  private timerStateSubject = new BehaviorSubject<TimerState>({ ...initialTimerState });
  readonly timerState$ = this.timerStateSubject.asObservable();

  private elapsedSecondsSubject = new BehaviorSubject<number>(0);
  readonly elapsedSeconds$ = this.elapsedSecondsSubject.asObservable();

  private tickHandle: any = null;
  private pausedAccumulatedMs = 0;
  private pausedSinceMs: number | null = null;

  constructor() {
    this.refreshFromServer();
    // Sincroniza entre pestañas/ventanas: si otra pestaña cambia el timer
    // (p.ej., detiene), este listener recarga el estado del usuario actual.
    window.addEventListener('storage', (ev: StorageEvent) => {
      if (!ev.key) return;
      if (!ev.key.startsWith('kairos.timer.')) return;
      this.refreshFromServer();
    });
  }

  // -------- User resolution --------
  private get apiBaseUrl(): string { return this.config.get('apiBaseUrl') || 'http://localhost:8080'; }
  private currentUserId$(): Observable<number | null> {
    return this.http.get<{ id: number }>(`${this.apiBaseUrl}/auth/me`).pipe(
      map(r => (r && typeof r.id === 'number') ? r.id : null),
      catchError(() => of(null))
    );
  }

  // -------- LocalStorage helpers --------
  private storageKey(userId: number) { return `kairos.timer.${userId}`; }
  private loadFromStorage(userId: number): any | null {
    try { const raw = localStorage.getItem(this.storageKey(userId)); return raw ? JSON.parse(raw) : null; }
    catch { return null; }
  }
  private saveToStorage(userId: number): void {
    const st = this.timerStateSubject.getValue();
    const payload = {
      userId,
      taskId: st.taskId,
      taskTitle: st.taskTitle,
      startTime: st.startTime,
      isPaused: st.isPaused,
      pausedAccumulatedMs: this.pausedAccumulatedMs,
      pausedSinceMs: this.pausedSinceMs,
    };
    localStorage.setItem(this.storageKey(userId), JSON.stringify(payload));
  }
  private clearStorage(userId: number): void { localStorage.removeItem(this.storageKey(userId)); }

  // Indica si hay timer activo para el usuario actual leyendo desde localStorage
  getActive(): Observable<TiempoActivoDTO | null> {
    return this.currentUserId$().pipe(map(uid => {
      if (!uid) return null;
      const data = this.loadFromStorage(uid);
      if (!data || !data.startTime || !data.taskId) return null;
      return { idTiempoActivo: 1, idUsuario: uid, idTarea: data.taskId, inicio: new Date(data.startTime).toISOString() };
    }));
  }

  // -------- Local ticking --------
  private startTicking(): void {
    this.stopTicking();
    this.tickHandle = setInterval(() => this.updateElapsed(), 1000);
    this.updateElapsed();
  }
  private stopTicking(): void { if (this.tickHandle) { clearInterval(this.tickHandle); this.tickHandle = null; } }
  private updateElapsed(): void {
    const state = this.timerStateSubject.getValue();
    if (!state.startTime) { this.elapsedSecondsSubject.next(0); return; }
    const now = Date.now();
    const paused = this.pausedSinceMs ? this.pausedAccumulatedMs + (now - this.pausedSinceMs) : this.pausedAccumulatedMs;
    const secs = Math.max(0, Math.floor((now - state.startTime - paused) / 1000));
    this.elapsedSecondsSubject.next(secs);
  }
  private setState(patch: Partial<TimerState>): void {
    this.timerStateSubject.next({ ...this.timerStateSubject.getValue(), ...patch });
    this.currentUserId$().subscribe(uid => { if (uid) this.saveToStorage(uid); });
  }
  private clearState(): void {
    this.stopTicking();
    this.pausedAccumulatedMs = 0;
    this.pausedSinceMs = null;
    this.timerStateSubject.next({ ...initialTimerState });
    this.elapsedSecondsSubject.next(0);
  }
  public resetState(): void { this.clearState(); }

  // -------- Init desde storage (para workspace) --------
  public refreshFromServer(): void {
    this.currentUserId$().subscribe(uid => {
      if (!uid) { this.clearState(); return; }
      const data = this.loadFromStorage(uid);
      if (data && data.startTime && data.taskId) {
        this.pausedAccumulatedMs = Number(data.pausedAccumulatedMs) || 0;
        this.pausedSinceMs = (typeof data.pausedSinceMs === 'number') ? data.pausedSinceMs : null;
        this.timerStateSubject.next({
          id: '',
          taskId: data.taskId,
          taskTitle: data.taskTitle ?? null,
          startTime: data.startTime,
          isPaused: !!data.isPaused,
          pausedDuration: 0,
        });
        this.startTicking();
      } else {
        this.clearState();
      }
    });
  }

  // -------- API pÃºblica usada por Workspace --------
  startTimer(taskId: number, taskTitle: string): void {
    const state = this.timerStateSubject.getValue();
    if (state.startTime && !state.isPaused) return;
    const startMs = Date.now();
    this.pausedAccumulatedMs = 0;
    this.pausedSinceMs = null;
    this.timerStateSubject.next({ id: String(startMs), taskId, taskTitle, startTime: startMs, isPaused: false, pausedDuration: 0 });
    this.currentUserId$().subscribe(uid => { if (uid) this.saveToStorage(uid); });
    this.startTicking();
  }
  pauseTimer(): void {
    const state = this.timerStateSubject.getValue();
    if (!state.startTime || state.isPaused) return;
    this.pausedSinceMs = Date.now();
    this.setState({ isPaused: true });
    this.stopTicking();
  }
  resumeTimer(): void {
    const state = this.timerStateSubject.getValue();
    if (!state.startTime || !state.isPaused) return;
    if (this.pausedSinceMs) { this.pausedAccumulatedMs += Date.now() - this.pausedSinceMs; this.pausedSinceMs = null; }
    this.setState({ isPaused: false });
    this.startTicking();
  }
  stopTimer(): void {
    const secs = this.computeEffectiveSeconds();
    const st = this.timerStateSubject.getValue();
    if (!st.taskId) { this.clearState(); return; }
    this.taskData.registrarTiempo({ idTarea: st.taskId, durationSeconds: secs, taskTitle: st.taskTitle || '' }).subscribe({
      next: () => { this.currentUserId$().subscribe(uid => { if (uid) this.clearStorage(uid); }); this.clearState(); },
      error: () => { this.currentUserId$().subscribe(uid => { if (uid) this.clearStorage(uid); }); this.clearState(); }
    });
  }
  private computeEffectiveSeconds(): number {
    const state = this.timerStateSubject.getValue();
    if (!state.startTime) return 0;
    const now = Date.now();
    let pausedMs = this.pausedAccumulatedMs;
    if (this.pausedSinceMs) pausedMs += now - this.pausedSinceMs;
    const effectiveMs = now - state.startTime - pausedMs;
    return Math.max(0, Math.floor(effectiveMs / 1000));
  }
  setActiveTaskTitle(title: string | null): void { this.setState({ taskTitle: title ?? null }); }

  // Expuesto para logout (misma firma que antes)
  stop(): Observable<any> {
    const st = this.timerStateSubject.getValue();
    if (!st.taskId) return of(null);
    const secs = this.computeEffectiveSeconds();
    return this.taskData.registrarTiempo({ idTarea: st.taskId, durationSeconds: secs, taskTitle: st.taskTitle || '' }).pipe(
      map(res => { this.currentUserId$().subscribe(uid => { if (uid) this.clearStorage(uid); }); this.clearState(); return res; }),
      catchError(() => { this.currentUserId$().subscribe(uid => { if (uid) this.clearStorage(uid); }); this.clearState(); return of(null); })
    );
  }
  // GET: últimos 5 tiempos del usuario
getLast5Times(): Observable<TiempoResponseDTO[]> {
  return this.http.get<TiempoResponseDTO[]>(`${this.apiBaseUrl}/api/tiempos/ultimos`);
}

// PUT: editar un registro de tiempo
editTime(idTiempo: number, data: TiempoEditRequestDTO): Observable<any> {
  return this.http.put(`${this.apiBaseUrl}/api/tiempos/${idTiempo}`, data);
}
}

