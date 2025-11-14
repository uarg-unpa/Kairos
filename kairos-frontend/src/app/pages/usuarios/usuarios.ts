import { Component, inject} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UsuariosService } from '../../services/usuarios.service';
import { AuthService } from '../../services/auth.service';


 
@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './usuarios.html',
  styleUrls: ['./usuarios.css']
})
export class UsuariosComponent {
  readonly ROL_ADMIN = 'ADMINISTRADOR';
  usuarioLogueado: boolean = false;
  rolUsuario: string | null = null;
  private usuariosService = inject(UsuariosService);
  usuarios = this.usuariosService.usuarios;
  constructor(
    public router: Router, 
    public auth: AuthService
  ) {
  }

  eliminarUsuario(id: number) {
    this.usuariosService.eliminarUsuario(id).subscribe({
      next: () => {
        this.usuarios.update(usuarios => usuarios.filter(u => u.id !== id));
      },
      error: (err) => console.error('Error al eliminar usuario', err)
    });
  }
  esAdmin(): boolean {
    return this.auth.esAdmin();
  }
}
