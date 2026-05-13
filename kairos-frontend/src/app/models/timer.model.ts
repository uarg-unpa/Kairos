
export interface TaskTimerInfo {
  id: number;
  title: string;
  status: string;
  priority?: string;
  description?: string;
}


/** entrada de tiempo terminada */
export interface TimeEntry {
  id: string; // Timestamp o UUID
  taskId: number;
  taskTitle: string;
  description: string;
  durationSeconds: number; // Duración total en segundos
  start: Date;
  end: Date;
  type: 'timer' | 'manual';
}

/** estado del cronómetro que debe persistir en LocalStorage */
export interface TimerState {
  id: string;
  taskId: number | null;
  taskTitle: string | null;
  startTime: number | null; // Timestamp (milisegundos) del inicio real
  isPaused: boolean;
  pausedDuration: number; // Duración en milisegundos cuando se pausó
  isPersonal?: boolean;
}

// estado inicial
export const initialTimerState: TimerState = {
  id: '',
  taskId: null,
  taskTitle: null,
  startTime: null,
  isPaused: false,
  pausedDuration: 0,
  isPersonal: false,
};