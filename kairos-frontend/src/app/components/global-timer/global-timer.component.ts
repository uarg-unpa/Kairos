import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimerService } from '../../services/timer.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-global-timer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="floating-timer" *ngIf="isActive && !isPaused">
      <div class="d-flex align-items-center gap-3 text-white">
        <div>
          <div class="small text-white-50">Cronometrando</div>
          <div class="fw-bold">{{ taskTitle || 'Tarea' }}</div>
        </div>
        <div class="timer-display">{{ elapsedTime }}</div>
        <button class="btn btn-light btn-sm rounded-circle" (click)="pause()">
          <i class="bi bi-pause-fill"></i>
        </button>
        <button class="btn btn-danger btn-sm rounded-circle" (click)="stop()">
          <i class="bi bi-stop-fill"></i>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .floating-timer {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 1050;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 15px;
      padding: 12px 16px;
      color: white;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      font-family: 'Courier New', monospace;
      min-width: 280px;
    }
    .timer-display {
      font-size: 1.6rem;
      font-weight: bold;
      min-width: 100px;
    }
    .btn-sm {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `]
})
export class GlobalTimerComponent implements OnInit, OnDestroy {
  isActive = false;
  isPaused = false;
  taskTitle = '';
  elapsedTime = '00:00:00';

  private subs = new Subscription();

  constructor(private timerService: TimerService) { }

  ngOnInit() {
    this.subs.add(
      this.timerService.timerState$.subscribe(state => {
        this.isActive = !!state.startTime;
        this.isPaused = state.isPaused;
        this.taskTitle = state.taskTitle || '';
      })
    );

    this.subs.add(
      this.timerService.elapsedSeconds$.subscribe(secs => {
        this.elapsedTime = this.formatTime(secs);
      })
    );
  }

  pause() {
    this.timerService.pauseTimer();
  }

  stop() {
    this.timerService.stopTimer();
  }

  private formatTime(seconds: number): string {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}