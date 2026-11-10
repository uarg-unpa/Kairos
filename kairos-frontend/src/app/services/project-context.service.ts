import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CookieService } from './cookie.service';

@Injectable({ providedIn: 'root' })
export class ProjectContextService {
  private cookieService = inject(CookieService);
  private readonly cookieKey = 'kairos_project_id';
  private currentId$ = new BehaviorSubject<number | null>(this.readFromStorage());

  setProjectId(id: number | null) {
    this.currentId$.next(id);
    if (id != null) {
      this.cookieService.set(this.cookieKey, String(id), { days: 7, path: '/' });
    } else {
      this.cookieService.delete(this.cookieKey);
    }
    // limpiar LocalStorage
    try { localStorage.removeItem('lastProjectId'); } catch { }
  }

  idChanges() { return this.currentId$.asObservable(); }
  getCurrentId(): number | null { return this.currentId$.value; }
  getLastProjectId(): number | null { return this.readFromStorage(); }

  private readFromStorage(): number | null {
    // intentar leer de cookie primero
    const raw = this.cookieService.get(this.cookieKey);
    const n = raw ? Number(raw) : NaN;
    if (Number.isFinite(n)) return n;

    try {
      const oldRaw = localStorage.getItem('lastProjectId');
      if (oldRaw) {
        localStorage.removeItem('lastProjectId');
        const oldN = Number(oldRaw);
        if (Number.isFinite(oldN)) {
          this.cookieService.set(this.cookieKey, String(oldN), { days: 7, path: '/' });
          return oldN;
        }
      }
    } catch { }

    return null;
  }
}

