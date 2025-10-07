import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

interface Rol {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
  permisos: string[];
  fechaCreacion: string;
  fechaModificacion: string;
}

@Component({
  selector: 'app-roles-ver',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './roles-ver.html',
  styleUrl: './roles-ver.css'
})
export class RolesVerComponent implements OnInit {
  rol: Rol | null = null;
  loading = true;
  error: string | null = null;
  rolId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.rolId = +this.route.snapshot.paramMap.get('id')!;
    this.cargarRol();
  }

  cargarRol(): void {
    this.loading = true;
    this.error = null;

    // TODO: Replace with actual API call
    setTimeout(() => {
      this.rol = {
        id: this.rolId!,
        nombre: 'ADMIN',
        descripcion: 'Administrador del sistema con acceso completo',
        activo: true,
        permisos: ['PERMISO_USUARIOS', 'PERMISO_ROLES', 'PERMISO_PERMISOS'],
        fechaCreacion: '2024-01-15T10:30:00Z',
        fechaModificacion: '2024-01-20T14:45:00Z'
      };
      this.loading = false;
    }, 1000);
  }

  editarRol(): void {
    this.router.navigate(['/roles/editar', this.rolId]);
  }

  volver(): void {
    this.router.navigate(['/roles']);
  }

  getEstadoClass(activo: boolean): string {
    return activo ? 'badge-success' : 'badge-secondary';
  }

  getEstadoText(activo: boolean): string {
    return activo ? 'Activo' : 'Inactivo';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString('es-ES');
  }
}

