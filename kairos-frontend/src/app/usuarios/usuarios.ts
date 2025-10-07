
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Title } from '@angular/platform-browser'; // Importado para manejar el título de la página
// La línea de PageWrapperComponent se ha eliminado

interface Rol {
  id: number;
  nombre: string;
}

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  roles: Rol[];
}

@Component({
  selector: 'app-usuarios',
  standalone: true,
  
  imports: [CommonModule, RouterModule], 
  template: `
    <div class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h4><span class="oi oi-person"></span> Usuarios</h4>
        <a routerLink="/usuarios/crear" class="btn btn-success">
          <span class="oi oi-plus"></span> Crear Usuario
        </a>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-striped">
            <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Roles</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let usuario of usuarios">
                  <td>{{ usuario.id }}</td>
                  <td>{{ usuario.nombre }}</td>
                  <td>{{ usuario.email }}</td>
                  <td>
                    <span *ngFor="let rol of usuario.roles; let last = last" 
                          class="badge badge-info mr-1">
                      {{ rol.nombre }}{{ last ? '' : ', ' }}
                    </span>
                  </td>
                  <td>
                    <div class="btn-group" role="group">
                      <a [routerLink]="['/usuarios/ver', usuario.id]" class="btn btn-info btn-sm">
                        <span class="oi oi-eye"></span>
                      </a>
                      <a [routerLink]="['/usuarios/editar', usuario.id]" class="btn btn-warning btn-sm">
                        <span class="oi oi-pencil"></span>
                      </a>
                      <a [routerLink]="['/usuarios/eliminar', usuario.id]" class="btn btn-danger btn-sm">
                        <span class="oi oi-trash"></span>
                      </a>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
  `,
  styleUrl: './usuarios.css'
})
export class UsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];

  // 1. Inyectar TitleService
  constructor(private titleService: Title) {}

  ngOnInit(): void {
    // 2. Establecer el título de la página
    this.titleService.setTitle('Kairos - Administración de Usuarios');
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    // TODO: Replace with actual API call
    // For now, using mock data
    this.usuarios = [
      {
        id: 1,
        nombre: 'Valeria Centurion',
        email: 'centurionvaleria6@gmail.com',
        roles: [
          { id: 1, nombre: 'ADMIN' },
          { id: 2, nombre: 'USER' }
        ]
      },
      {
        id: 2,
        nombre: 'María González',
        email: 'maria.gonzalez@unpa.edu.ar',
        roles: [
          { id: 2, nombre: 'USER' }
        ]
      },
      {
        id: 3,
        nombre: 'Carlos López',
        email: 'carlos.lopez@unpa.edu.ar',
        roles: [
          { id: 2, nombre: 'USER' }
        ]
      }
    ];
  }
}