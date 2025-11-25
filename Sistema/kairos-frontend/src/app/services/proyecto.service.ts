import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Proyecto } from '../models/proyecto.model';
import { ConfigService } from './config.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ProyectoService {
  private http = inject(HttpClient);
  private config = inject(ConfigService);
  private authService = inject(AuthService);
  private baseUrl = (this.config.get('apiBaseUrl') || 'http://localhost:8080') + '/api/proyectos';

  private getHeaders(): HttpHeaders {
    const token = this.authService.token;
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    });
  }
  crearProyecto(proyecto: any): Observable<any> {
    return this.http.post(`${this.baseUrl}`, proyecto, { headers: this.getHeaders() });
  }

  getUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.config.get('apiBaseUrl') || 'http://localhost:8080'}/api/usuarios`, {
      headers: this.getHeaders()
    });
  }
  getProyectoById(id: number): Observable<Proyecto> {
    return this.http.get<Proyecto>(`${this.baseUrl}/${id}`, { headers: this.getHeaders() });
  }
  getProjectsByUser(idUsuario: number): Observable<Proyecto[]> {
    return this.http.get<Proyecto[]>(`${this.baseUrl}/usuario/${idUsuario}`, { headers: this.getHeaders() });
  }

  // Mis proyectos (para miembro)
  getMisProyectos(): Observable<Proyecto[]> {
  return this.http.get<Proyecto[]>(`${this.baseUrl}/mis-proyectos`, { headers: this.getHeaders() });
}

  // Todos los proyectos (para admin)
  getAllProyectos(): Observable<Proyecto[]> {
    return this.http.get<Proyecto[]>(this.baseUrl);
  }

  // Proyectos liderados (para líder)
  getProyectosLiderados(): Observable<Proyecto[]> {
    return this.http.get<Proyecto[]>(`${this.baseUrl}/liderados`);
  }

  actualizarProyecto(id: number, datos: any): Observable<Proyecto> {
    return this.http.put<Proyecto>(`${this.baseUrl}/${id}`, datos, { headers: this.getHeaders() });
  }
  getMiembros(idProyecto: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.config.get('apiBaseUrl')}/api/usuario-proyecto/proyecto/${idProyecto}/miembros`, {
      headers: this.getHeaders()
    });
  }

  agregarMiembro(idProyecto: number, idUsuario: number, rol: string): Observable<any> {
    const params = new HttpParams()
      .set('idProyecto', idProyecto.toString())
      .set('idUsuario', idUsuario.toString())
      .set('rolProyecto', rol);
    return this.http.post(`${this.config.get('apiBaseUrl')}/api/usuario-proyecto/agregar`, null, {
      headers: this.getHeaders(), params
    });
  }

  invitarMiembro(idProyecto: number, email: string, rol: string): Observable<any> {
    const params = new HttpParams()
      .set('idProyecto', idProyecto.toString())
      .set('email', email)
      .set('rolProyecto', rol);
    return this.http.post(`${this.config.get('apiBaseUrl')}/api/usuario-proyecto/invitar`, null, {
      headers: this.getHeaders(), params
    });
  }

  actualizarRolMiembro(idProyecto: number, idUsuario: number, rol: string): Observable<any> {
    const params = new HttpParams()
      .set('idProyecto', idProyecto.toString())
      .set('idUsuario', idUsuario.toString())
      .set('nuevoRol', rol);
    return this.http.put(`${this.config.get('apiBaseUrl')}/api/usuario-proyecto/editar-rol`, null, {
      headers: this.getHeaders(), params
    });
  }
}