import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UsuariosService } from '../../services/usuarios';
import { Usuario } from '../../models/usuarios';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './usuarios.html',
  styleUrls: ['./usuarios.css']
})
export class UsuariosComponent {
  private usuariosService = inject(UsuariosService);
  usuarios = this.usuariosService.usuarios; // ✅ ahora sí es editable (WritableSignal)

  eliminarUsuario(id: number) {
    this.usuariosService.eliminarUsuario(id).subscribe({
      next: () => {
        // ahora podés usar update sin error
        this.usuarios.update(usuarios => usuarios.filter(u => u.id !== id));
      },
      error: (err) => console.error('Error al eliminar usuario', err)
    });
  }
}
