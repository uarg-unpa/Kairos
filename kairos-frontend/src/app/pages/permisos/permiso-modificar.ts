import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PermisosService, PermisoItem } from '../../services/permisos';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../../services/config.service';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-permiso-modificar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './permiso-modificar.html'
})
export class PermisoModificarComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private config = inject(ConfigService);
  private http = inject(HttpClient);
  public permisosService = inject(PermisosService); 

  permisoId: number | null = null;
  permiso: PermisoItem | null = null;
  nombre: string = '';

  get baseUrl() {
    return (this.config.get('apiBaseUrl') || 'http://localhost:8080') + '/api/permisos';
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        this.permisoId = Number(params.get('id'));
        if (this.permisoId) {
          return this.http.get<PermisoItem>(`${this.baseUrl}/${this.permisoId}`);
        }
        return of(null);
      })
    ).subscribe({
      next: (data) => {
        if (data) {
          this.permiso = data;
          this.nombre = data.nombre;
        } else {
          this.router.navigate(['/permisos']);
        }
      },
      error: () => this.router.navigate(['/permisos'])
    });
  }

  guardar(): void {
    if (!this.permisoId) return;

    const body = { 
      nombre: this.nombre,
    };

    this.http.put(`${this.baseUrl}/${this.permisoId}`, body).subscribe({
      next: () => {
        alert('Permiso modificado con éxito.');
        this.permisosService.cargarPermisos();
        this.router.navigate(['/permisos']);
      },
      error: (err) => alert(`Error al modificar permiso: ${err.error?.error || 'Error desconocido'}`)
    });
  }
}
