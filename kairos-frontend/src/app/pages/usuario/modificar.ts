import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UsuariosService } from '../../services/usuarios';
import { Usuario } from '../../models/usuarios';

@Component({
  selector: 'app-usuario-modificar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './modificar.html'
})
export class UsuarioModificarComponent {
  private route = inject(ActivatedRoute);
  private service = inject(UsuariosService);
  private router = inject(Router);

  usuario?: Usuario;

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.service.getById(id).subscribe({
        next: (u) => (this.usuario = u),
        error: (e) => console.error('No se pudo cargar el usuario', e)
      });
    }
  }

  guardar() {
    if (!this.usuario) return;
    this.service.update(this.usuario.id, {
      nombre: this.usuario.nombre,
      email: this.usuario.email
    }).subscribe({
      next: () => this.router.navigate(['/usuarios']),
      error: (e) => console.error('No se pudo actualizar el usuario', e)
    });
  }
}
