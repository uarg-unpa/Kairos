// src/app/services/categoria.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CategoriaDTO {
  idCategoria: number;
  nombre: string;
  descripcion?: string;
  proyectoId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private baseUrl = 'http://localhost:8080/api/categorias';

  constructor(private http: HttpClient) {}

  getCategorias(): Observable<CategoriaDTO[]> {
    return this.http.get<CategoriaDTO[]>(this.baseUrl);
  }

  createCategoria(categoria: any): Observable<CategoriaDTO> {
    return this.http.post<CategoriaDTO>(this.baseUrl, categoria);
  }

  deleteCategoria(id: number): Observable<void>{
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getCategoriaporProyecto(idProyecto: number): Observable<CategoriaDTO[]> {
    return this.http.get<CategoriaDTO[]>(`${this.baseUrl}/proyecto/${idProyecto}`);
  }
}
