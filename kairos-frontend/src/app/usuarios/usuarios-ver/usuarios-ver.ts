import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  activo: boolean;
  roles: string[];
  fechaCreacion: string;
  fechaModificacion: string;
}

@Component({
  selector: 'app-usuarios-ver',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './usuarios-ver.html',
  styleUrl: './usuarios-ver.css'
})
export class UsuariosVerComponent implements OnInit {
  usuario: Usuario | null = null;
  loading = true;
  error: string | null = null;
  usuarioId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.usuarioId = +this.route.snapshot.paramMap.get('id')!;
    this.cargarUsuario();
  }

  cargarUsuario(): void {
    this.loading = true;
    this.error = null;

    // TODO: Replace with actual API call
    setTimeout(() => {
      // Mock data based on ID
      this.usuario = {
        id: this.usuarioId!,
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan.perez@unpa.edu.ar',
        activo: true,
        roles: ['ADMIN', 'USER'],
        fechaCreacion: '2024-01-15T10:30:00Z',
        fechaModificacion: '2024-01-20T14:45:00Z'
      };
      this.loading = false;
    }, 1000);
  }

  editarUsuario(): void {
    this.router.navigate(['/usuarios/editar', this.usuarioId]);
  }

  volver(): void {
    this.router.navigate(['/usuarios']);
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
