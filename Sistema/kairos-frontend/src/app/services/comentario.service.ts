import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comentario } from '../models/comentario.model';

@Injectable({
    providedIn: 'root'
})
export class ComentarioService {
    private baseUrl = 'http://localhost:8080/api/comentarios';
    constructor(private http: HttpClient) { }

    getComentarios(): Observable<Comentario[]> {
        return this.http.get<Comentario[]>(this.baseUrl);
    }

    getComentariosByTarea(idTarea: number): Observable<Comentario[]> {
        return this.http.get<Comentario[]>(`${this.baseUrl}/tarea/${idTarea}`);
    }

    createComentario(comentario: Partial<Comentario>): Observable<Comentario> {
        return this.http.post<Comentario>(this.baseUrl, comentario);
    }

    deleteComentario(idComentario: number): Observable<void> {
  return this.http.delete<void>(`${this.baseUrl}/${idComentario}`);
}

}
