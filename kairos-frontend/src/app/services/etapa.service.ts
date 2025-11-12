import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Etapa } from '../models/etapa.model';

@Injectable({ providedIn: 'root' })
export class EtapaService {
  private baseUrl = 'http://localhost:8080/api/etapas';
  constructor(private http: HttpClient) {}

  getEtapas(): Observable<Etapa[]> {
    return this.http.get<Etapa[]>(this.baseUrl);
  }

  getEtapasPorProyecto(proyectoId: number): Observable<Etapa[]> {
    return this.http.get<Etapa[]>(`${this.baseUrl}/por-proyecto/${proyectoId}`);
  }

  crearEtapa(payload: any): Observable<Etapa> {
    return this.http.post<Etapa>(this.baseUrl, payload);
  }

  // Sin actualización manual de estado: derivado por fechas en UI
  deleteEtapa(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // Nota: endpoint unificado en /por-proyecto/{idProyecto}
}

