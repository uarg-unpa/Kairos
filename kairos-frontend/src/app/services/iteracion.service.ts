import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Iteracion } from '../models/iteracion.model';
import { ConfigService } from './config.service';

@Injectable({
    providedIn: 'root'
})
export class IteracionService {
    private http = inject(HttpClient);
    private cfg = inject(ConfigService);
    private baseUrl(): string {
        return (this.cfg.get('apiBaseUrl') || 'http://localhost:8080') + '/api/iteraciones';
    }


    getIteraciones(): Observable<Iteracion[]> {
        return this.http.get<Iteracion[]>(this.baseUrl());
    }

    // Intenta obtener iteraciones filtradas por etapa vía query string.
    // Si tu backend usa otra ruta (por ejemplo /api/etapas/{id}/iteraciones), avísame y lo adapto.
    getIteracionesPorEtapa(etapaSlug: string): Observable<Iteracion[]> {
        const url = `${this.baseUrl}?etapa=${encodeURIComponent(etapaSlug)}`;
        return this.http.get<Iteracion[]>(url);
    }

    getIteracionesPorEtapaId(etapaId: number): Observable<Iteracion[]> {
        return this.http.get<Iteracion[]>(`${this.baseUrl}/por-etapa/${etapaId}`);
    }

    // Eliminado: entregables por iteración

    crearIteracion(payload: { numero: number; descripcion?: string; fechaInicio: string; fechaFin: string; etapaId: number }): Observable<Iteracion> {
        const body = {
            numero: payload.numero,
            descripcion: payload.descripcion ?? '',
            fechaInicio: payload.fechaInicio,
            fechaFin: payload.fechaFin,
            etapaId: payload.etapaId
        };
        return this.http.post<Iteracion>(this.baseUrl(), body);
    }

    deleteIteracion(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }
}



