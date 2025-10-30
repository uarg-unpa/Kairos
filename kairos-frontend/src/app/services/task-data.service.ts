import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; 
import { TaskTimerInfo } from '../models/timer.model'; 

// DTO del Backend para registrar el tiempo (debe coincidir con TiempoRegistroRequest.java)
interface TiempoRegistroRequest {
    idTarea: number;
    duracionSegundos: number;
    fechaRegistro: string;
    descripcion?: string; 
}

// Interfaz para el mapeo del DTO de tareas (TareaDTO.java)
interface TareaBackend {
    idTarea: number;
    nombre: string;
    descripcion: string;
    estado: string;
    prioridad: number;
    fechaCreacion: string;
    fechaFin: string | null;
    usuarioNombre: string | null;
    iteracionNumero: number;
    categorias: { idCategoria: number; nombre: string; descripcion: string }[];
}


@Injectable({
  providedIn: 'root'
})
export class TaskDataService {
  private apiUrl = 'http://localhost:8080/api/tareas'; 
  private tiempoUrl = 'http://localhost:8080/api/tiempos';

  constructor(private http: HttpClient) { }

  /**
   * Obtiene las tareas asignadas y las mapea al modelo local (TaskTimerInfo).
   */
  getTareasAsignadas(): Observable<TaskTimerInfo[]> {
    // Llama al endpoint seguro
    return this.http.get<TareaBackend[]>(`${this.apiUrl}/mis-tareas`).pipe(
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