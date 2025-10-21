import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { UsuariosService } from '../../services/usuarios';
import { Usuario } from '../../models/usuarios';

@Component({
  selector: 'app-usuario-ver',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './ver.html'
})
export class UsuarioVerComponent {
  private route = inject(ActivatedRoute);
  private service = inject(UsuariosService);

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
}
