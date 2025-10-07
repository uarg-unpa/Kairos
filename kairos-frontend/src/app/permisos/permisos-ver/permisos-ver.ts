import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

interface Permiso {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
  categoria: string;
  fechaCreacion: string;
  fechaModificacion: string;
}

@Component({
  selector: 'app-permisos-ver',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './permisos-ver.html',
  styleUrl: './permisos-ver.css'
})
export class PermisosVerComponent implements OnInit {
  permiso: Permiso | null = null;
  loading = true;
  error: string | null = null;
  permisoId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.permisoId = +this.route.snapshot.paramMap.get('id')!;
    this.cargarPermiso();
  }

  cargarPermiso(): void {
    this.loading = true;
    this.error = null;

    // TODO: Replace with actual API call
    setTimeout(() => {
      this.permiso = {
        id: this.permisoId!,
        nombre: 'PERMISO_USUARIOS',
        descripcion: 'Permiso para gestionar usuarios del sistema',
        activo: true,
        categoria: 'Gestión de Usuarios',
        fechaCreacion: '2024-01-15T10:30:00Z',
        fechaModificacion: '2024-01-20T14:45:00Z'
      };
      this.loading = false;
    }, 1000);
  }

  editarPermiso(): void {
    this.router.navigate(['/permisos/editar', this.permisoId]);
  }

  volver(): void {
    this.router.navigate(['/permisos']);
  }

  getEstadoClass(activo: boolean): string {
    return activo ? 'badge-success' : 'badge-secondary';
  }

  getEstadoText(activo: boolean): string {
    return activo ? 'Activo' : 'Inactivo';
  }

  getCategoriaClass(categoria: string): string {
    const classes: { [key: string]: string } = {
      'Gestión de Usuarios': 'badge-primary',
      'Gestión de Roles': 'badge-warning',
      'Gestión de Permisos': 'badge-danger',
      'Reportes': 'badge-info'
    };
    return classes[categoria] || 'badge-secondary';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString('es-ES');
  }
}
