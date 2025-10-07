import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router'; // 1. Importar RouterOutlet
import { Title } from '@angular/platform-browser'; 

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
  // 2. Incluir RouterOutlet en imports
  imports: [CommonModule, RouterModule, RouterOutlet], 
  template: `
    <div class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h4><span class="oi oi-person"></span> Usuarios</h4>
        <!-- El enlace sigue apuntando a la ruta hija -->
        <a routerLink="crear" class="btn btn-success"> 
          <span class="oi oi-plus"></span> Crear Usuario
        </a>
      </div>

      <!-- 3. INYECTAR RUTAS HIJAS: Mostrará UsuariosCrearComponent en esta posición. -->
      <router-outlet></router-outlet> 
      
      <div class="card-body">
        <!-- 4. MOSTRAR LA TABLA SOLO SI NO ESTAMOS EN UNA RUTA HIJA -->
        <!-- Usaremos el RouterOutlet para determinar qué mostrar. 
             Si no hay ruta hija activa, mostraremos la tabla.
             PERO, para simplificar, si quieres que la tabla y el formulario se reemplacen completamente, 
             tendrás que ajustar las rutas para que 'crear' no sea hija de 'usuarios'.
             
             Por ahora, si estás usando rutas anidadas, el template debería ser más inteligente: -->

        <!-- Ejemplo de lógica de visibilidad (requiere CurrentRoute URL checking, pero para simplificar, 
             siempre mostramos la tabla debajo del router-outlet): -->
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

  constructor(private titleService: Title) {}

  ngOnInit(): void {
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
