import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PermisosService, PermisoItem } from '../../services/permisos';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../../services/config.service';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-permiso-ver',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './permiso-ver.html'
})
export class PermisoVerComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private config = inject(ConfigService);
  private http = inject(HttpClient);
  private permisosService = inject(PermisosService);
  
  permiso: PermisoItem | null = null;

  get baseUrl() {
    return (this.config.get('apiBaseUrl') || 'http://localhost:8080') + '/api/permisos';
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = Number(params.get('id'));
        if (id) {
          return this.http.get<PermisoItem>(`${this.baseUrl}/${id}`);
        }
        return of(null);
      })
    ).subscribe({
      next: (data) => {
        if (data) {
          this.permiso = data;
        } else {
          this.router.navigate(['/permisos']);
        }
      },
      error: () => this.router.navigate(['/permisos'])
    });
  }

  eliminar(): void {
    if (this.permiso) {
        if (confirm(`¿Está seguro de eliminar el permiso "${this.permiso.nombre}"?`)) {
             this.http.delete(`${this.baseUrl}/${this.permiso.id}`).subscribe({
                next: () => {
                    alert(`Permiso "${this.permiso!.nombre}" eliminado con éxito.`);
                    this.permisosService.cargarPermisos();
                    this.router.navigate(['/permisos']);
                },
                error: (err) => alert(`Error al eliminar permiso: ${err.error?.error || 'Error desconocido'}`)
             });
        }
    }
  }
}
