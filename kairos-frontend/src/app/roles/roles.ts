import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface Permiso {
  id: number;
  nombre: string;
}

interface Rol {
  id: number;
  nombre: string;
  permisos: Permiso[];
}

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './roles.html',
  styleUrl: './roles.css'
})
export class RolesComponent implements OnInit {
  roles: Rol[] = [];

  ngOnInit(): void {
    this.cargarRoles();
  }

  cargarRoles(): void {
    // TODO: Replace with actual API call
    this.roles = [
      {
        id: 1,
        nombre: 'ADMIN',
        permisos: [
          { id: 1, nombre: 'Usuarios' },
          { id: 2, nombre: 'Roles' },
          { id: 3, nombre: 'Permisos' }
        ]
      },
      {
        id: 2,
        nombre: 'USER',
        permisos: [
          { id: 1, nombre: 'Usuarios' }
        ]
      }
    ];
  }
}

