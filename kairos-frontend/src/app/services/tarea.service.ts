import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tarea } from '../models/tarea.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private baseUrl = 'http://localhost:8080/api/tareas';

  constructor(private http: HttpClient) {}

  // Obtener todas las tareas
  getTareas(): Observable<Tarea[]> {
    return this.http.get<Tarea[]>(this.baseUrl);
  }

  // Obtener una tarea por ID
  getTareaById(id: number): Observable<Tarea> {
    return this.http.get<Tarea>(`${this.baseUrl}/${id}`);
  }

  // Crear una nueva tarea
  createTarea(tarea: any): Observable<Tarea> {
    return this.http.post<Tarea>(this.baseUrl, tarea);
  }

  // (Opcional) actualizar o eliminar tareas en el futuro
  updateTarea(id: number, tarea: any): Observable<Tarea> {
    return this.http.put<Tarea>(`${this.baseUrl}/${id}`, tarea);
  }

  deleteTarea(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

