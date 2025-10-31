import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tarea } from '../models/tarea.model';
import { map } from 'rxjs/operators'; 
import { TaskTimerInfo } from '../models/timer.model'; 

interface TiempoRegistroRequest {
    idTarea: number;
    duracionSegundos: number;
    fechaRegistro: string;
    descripcion?: string; 
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private baseUrl = 'http://localhost:8080/api/tareas';
  private tiempoUrl = 'http://localhost:8080/api/tiempos';

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

  getTareasAsignadas(): Observable<TaskTimerInfo[]> {
      // Llama al endpoint seguro
      return this.http.get<Tarea[]>(`${this.baseUrl}/mis-tareas`).pipe(
        map(tareas => tareas.map(t => ({
          id: t.idTarea,
          title: t.nombre,
          status: t.estado,
          priority: t.prioridad,
          description: t.descripcion
        })))
      );
    }
  
    /**
     * Envía el tiempo registrado por el cronómetro al servidor (POST /api/tiempos).
     */
    registrarTiempo(data: { idTarea: number, durationSeconds: number, taskTitle: string }): Observable<any> {
        
        const payload: TiempoRegistroRequest = {
            idTarea: data.idTarea,
            duracionSegundos: data.durationSeconds,
            fechaRegistro: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
            descripcion: `Tiempo cronometrado para: ${data.taskTitle}`
        };
  
        return this.http.post(this.tiempoUrl, payload);
    }

}

