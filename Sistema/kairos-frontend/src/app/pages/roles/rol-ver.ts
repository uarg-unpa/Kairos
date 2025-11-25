import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RolesService, RolItem } from '../../services/roles';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../../services/config.service';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-rol-ver',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './rol-ver.html'
})
export class RolVerComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private config = inject(ConfigService);
  private http = inject(HttpClient);
  private rolesService = inject(RolesService);
  
  rol: RolItem | null = null;

  get baseUrl() {
    return (this.config.get('apiBaseUrl') || 'http://localhost:8080') + '/api/roles';
  }

  ngOnInit(): void {
    // Obtener el ID de la ruta y cargar el rol
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = Number(params.get('id'));
        if (id) {
          return this.http.get<RolItem>(`${this.baseUrl}/${id}`);
        }
        return of(null);
      })
    ).subscribe({
      next: (data) => {
        if (data) {
          this.rol = data;
        } else {
          this.router.navigate(['/roles']);
        }
      },
      error: () => this.router.navigate(['/roles'])
    });
  }

  // Permite reutilizar la función de eliminar
  eliminar(): void {
    if (this.rol) {
        this.rolesService.eliminar(this.rol.id, this.rol.nombre);
        if (confirm(`¿Está seguro de eliminar el rol "${this.rol.nombre}"?`)) {
             this.http.delete(`${this.baseUrl}/${this.rol.id}`).subscribe({
                next: () => {
                    alert(`Rol "${this.rol!.nombre}" eliminado con éxito.`);
                    this.rolesService.cargarRoles();
                    this.router.navigate(['/roles']);
                },
                error: (err) => alert(`Error al eliminar rol: ${err.error?.error || 'Error desconocido'}`)
             });
        }
    }
  }
}