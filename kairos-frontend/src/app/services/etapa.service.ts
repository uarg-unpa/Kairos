import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Etapa } from '../models/etapa.model';
import { Iteracion } from '../models/iteracion.model';
import { ConfigService } from './config.service';

@Injectable({ providedIn: 'root' })
export class EtapaService {
  private http = inject(HttpClient);
  private cfg = inject(ConfigService);

  private base(): string {
    return (this.cfg.get('apiBaseUrl') || 'http://localhost:8080') + '/api/etapas';
  }

  getEtapas(proyectoId?: number): Observable<Etapa[]> {
    const url = proyectoId ? `${this.base()}?proyectoId=${proyectoId}` : this.base();
    return this.http.get<Etapa[]>(url);
    }

  getEtapa(id: number): Observable<Etapa> {
    return this.http.get<Etapa>(`${this.base()}/${id}`);
  }

  crearEtapa(proyectoId: number, body: Partial<Etapa>): Observable<Etapa> {
    return this.http.post<Etapa>(`${this.base()}/proyecto/${proyectoId}`, body);
  }

  getIteracionesPorEtapa(etapaId: number): Observable<Iteracion[]> {
    return this.http.get<Iteracion[]>(`${this.base()}/${etapaId}/iteraciones`);
  }
}

