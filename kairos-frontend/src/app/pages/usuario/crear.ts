import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UsuariosService } from '../../services/usuarios';

@Component({
  selector: 'app-usuario-crear',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './crear.html'
})
export class UsuarioCrearComponent {
  private service = inject(UsuariosService);
  private router = inject(Router);

  nombre = '';
  email = '';

  guardar() {
    this.service.create({ nombre: this.nombre, email: this.email }).subscribe({
      next: () => {
        this.service.cargarUsuarios();
        this.router.navigate(['/usuarios']);
      },
      error: (e) => console.error('No se pudo crear el usuario', e)
    });
  }
}
