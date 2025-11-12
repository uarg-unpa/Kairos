import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PermisosService } from '../../services/permisos';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../../services/config.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-permisos',
  standalone: true,
  imports: [CommonModule, RouterModule], // Añadir RouterModule
  templateUrl: './permisos.html'
})
export class PermisosComponent {
  private service = inject(PermisosService);
  private http = inject(HttpClient);
  private config = inject(ConfigService);
  
  permisos = this.service.permisos;

  get baseUrl() {
    return (this.config.get('apiBaseUrl') || 'http://localhost:8080') + '/api/permisos';
  }
  
  eliminar(id: number, nombre: string): void {
    if (confirm(`¿Está seguro de eliminar el permiso "${nombre}"?`)) {
      this.http.delete(`${this.baseUrl}/${id}`).subscribe({
        next: () => {
          alert(`Permiso "${nombre}" eliminado con éxito.`);
          this.service.cargarPermisos(); // Recargar lista
        },
        error: (err) => alert(`Error al eliminar permiso: ${err.error?.error || 'Error desconocido'}`)
      });
    }
  }
}

