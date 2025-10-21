import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UsuariosService } from '../../services/usuarios';


@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './usuarios.html',
  styleUrls: ['./usuarios.css']
})
export class UsuariosComponent {
  private usuariosService = inject(UsuariosService);
  usuarios = this.usuariosService.usuarios; 

  eliminarUsuario(id: number) {
    this.usuariosService.eliminarUsuario(id).subscribe({
      next: () => {
        this.usuarios.update(usuarios => usuarios.filter(u => u.id !== id));
      },
      error: (err) => console.error('Error al eliminar usuario', err)
    });
  }
}
