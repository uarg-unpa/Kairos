import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PermisosService } from '../../services/permisos';

@Component({
  selector: 'app-permisos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './permisos.html'
})
export class PermisosComponent {
  private service = inject(PermisosService);
  permisos = this.service.permisos;
}

