import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RolesService, RolItem } from '../../services/roles';
import { PermisosService } from '../../services/permisos';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../../services/config.service';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-rol-modificar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './rol-modificar.html'
})
export class RolModificarComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private config = inject(ConfigService);
  private http = inject(HttpClient);
  private rolesService = inject(RolesService);
  public permisosService = inject(PermisosService); 

  rolId: number | null = null;
  rol: RolItem | null = null;
  nombre: string = '';
  permisosSeleccionados: number[] = [];
  
  permisos = this.permisosService.permisos;

  get baseUrl() {
    return (this.config.get('apiBaseUrl') || 'http://localhost:8080') + '/api/roles';
  }

  ngOnInit(): void {
    // Cargar el ID de la ruta y luego obtener los datos del rol
    this.route.paramMap.pipe(
      switchMap(params => {
        this.rolId = Number(params.get('id'));
        if (this.rolId) {
          // Asumir que existe un endpoint GET /api/roles/{id}
          return this.http.get<RolItem>(`${this.baseUrl}/${this.rolId}`);
        }
        return of(null);
      })
    ).subscribe({
      next: (data) => {
        if (data) {
          this.rol = data;
          this.nombre = data.nombre;
          // Inicializar permisosSeleccionados con los IDs de los permisos actuales
          this.permisosSeleccionados = data.permisos.map((p: any) => p.id || p); 
        } else {
          this.router.navigate(['/roles']);
        }
      },
      error: () => this.router.navigate(['/roles'])
    });
  }

  togglePermiso(idPermiso: number, checked: boolean): void {
    if (checked) {
      this.permisosSeleccionados.push(idPermiso);
    } else {
      this.permisosSeleccionados = this.permisosSeleccionados.filter(id => id !== idPermiso);
    }
  }
  
  // Verifica si el ID del permiso está en la lista de seleccionados
  estaSeleccionado(idPermiso: number): boolean {
    // Si rol.permisos viene como array de objetos {id: number, nombre: string}
    if (this.rol && this.rol.permisos && this.rol.permisos.length > 0 && typeof this.rol.permisos[0] === 'object') {
        return (this.rol.permisos as any[]).some(p => p.id === idPermiso);
    }
    // Si rol.permisos viene como array de strings o numbers
    return this.permisosSeleccionados.includes(idPermiso);
  }

  guardar(): void {
    if (!this.rolId) return;

    const body = { 
      nombre: this.nombre, 
      permisosIds: this.permisosSeleccionados 
    };

    this.http.put(`${this.baseUrl}/${this.rolId}`, body).subscribe({
      next: () => {
        alert('Rol modificado con éxito.');
        this.rolesService.cargarRoles();
        this.router.navigate(['/roles']);
      },
      error: (err) => alert(`Error al modificar rol: ${err.error?.error || 'Error desconocido'}`)
    });
  }
}