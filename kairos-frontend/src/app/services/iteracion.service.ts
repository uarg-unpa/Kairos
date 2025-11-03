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

    getIteracionesPorEtapa(etapaId: number): Observable<Iteracion[]> {
        return this.http.get<Iteracion[]>(`${this.baseUrl().replace('/api/iteraciones','/api/etapas')}/${etapaId}/iteraciones`);
    }

    crearIteracion(etapaId: number, body: Partial<Iteracion>): Observable<Iteracion> {
        return this.http.post<Iteracion>(`${this.baseUrl().replace('/api/iteraciones','/api/etapas')}/${etapaId}/iteraciones`, body);
    }
}
