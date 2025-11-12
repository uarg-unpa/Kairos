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

  crearEtapa(payload: Partial<Etapa>): Observable<Etapa> {
    return this.http.post<Etapa>(this.baseUrl, payload);
  }

  // Sin actualización manual de estado: derivado por fechas en UI
  deleteEtapa(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getEtapasPorProyecto(idProyecto: number): Observable<Etapa[]> {
    return this.http.get<Etapa[]>(`${this.baseUrl}/proyecto/${idProyecto}`);
  }
}

