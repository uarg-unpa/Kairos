import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface Permiso {
  id: number;
  nombre: string;
}

@Component({
  selector: 'app-permisos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './permisos.html',
  styleUrl: './permisos.css'
})
export class PermisosComponent implements OnInit {
  permisos: Permiso[] = [];

  ngOnInit(): void {
    this.cargarPermisos();
  }

  cargarPermisos(): void {
    // TODO: Replace with actual API call
    this.permisos = [
      {
        id: 1,
        nombre: 'Usuarios'
      },
      {
        id: 2,
        nombre: 'Roles'
      },
      {
        id: 3,
        nombre: 'Permisos'
      },
      {
        id: 4,
        nombre: 'Reportes'
      }
    ];
  }
}
