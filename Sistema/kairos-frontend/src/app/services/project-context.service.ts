import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProjectContextService {
  private readonly storageKey = 'lastProjectId';
  private currentId$ = new BehaviorSubject<number | null>(this.readFromStorage());

  setProjectId(id: number | null) {
    this.currentId$.next(id);
    if (id != null) localStorage.setItem(this.storageKey, String(id));
  }

  idChanges() { return this.currentId$.asObservable(); }
  getCurrentId(): number | null { return this.currentId$.value; }
  getLastProjectId(): number | null { return this.readFromStorage(); }

  private readFromStorage(): number | null {
    const raw = localStorage.getItem(this.storageKey);
    const n = raw ? Number(raw) : NaN;
    return Number.isFinite(n) ? n : null;
  }
}

