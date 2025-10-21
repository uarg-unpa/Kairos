import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RolesService } from '../../services/roles';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './roles.html'
})
export class RolesComponent {
  private service = inject(RolesService);
  roles = this.service.roles;
}

