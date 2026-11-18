import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UsuariosService } from '../../services/usuarios';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-usuario-crear',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './crear.html'
})
export class UsuarioCrearComponent {
  private service = inject(UsuariosService);
  private router = inject(Router);
  private alertService = inject(AlertService);


  nombre = '';
  email = '';

  guardar() {
    if (!this.nombre || !this.nombre.trim() || !this.email || !this.email.trim()) {
      this.alertService.warning('Atención', 'Los campos no pueden estar vacíos.');
      return;
    }
    this.service.create({ nombre: this.nombre, email: this.email }).subscribe({
      next: () => {
        this.service.cargarUsuarios();
        this.router.navigate(['/usuarios']);
      },
      error: (e) => console.error('No se pudo crear el usuario', e)
    });
  }
}
