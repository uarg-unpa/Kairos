import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ProyectoService } from '../../services/proyecto.service';
import { Router } from '@angular/router';
import { Proyecto } from '../../models/proyecto.model';
import { Observable } from 'rxjs';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterModule,
    CommonModule],
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit {
  proyectos: Proyecto[] = [];
  rolPrincipal: 'miembro' | 'lider' | 'Administrador' = 'miembro';
  usuario: any = null;
  totalProyectos: number = 0;
  enProgreso: number = 0;
  completados: number = 0;

  constructor(
    public authService: AuthService,
    private proyectoService: ProyectoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarUsuarioYProyectos();
  }

  private cargarUsuarioYProyectos(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.usuario = user;
        this.determinarRol();
        this.cargarProyectos();
      },
      error: () => this.router.navigate(['/login'])
    });
  }

  private determinarRol(): void {
      console.log(this.usuario.isAdmin);
    if (this.usuario.admin) {
      this.rolPrincipal = 'Administrador';
    } else if (this.usuario.roles?.includes('Líder')) {
      this.rolPrincipal = 'lider';
    } else {
      this.rolPrincipal = 'miembro';
    }
  }

  private cargarProyectos(): void {
  this.proyectoService.getMisProyectos().subscribe({
    next: (proyectos) => {
      this.proyectos = proyectos;
      console.log('Proyectos cargados:', proyectos);
      this.calcularStats();
    },
    error: (err) => {
      console.error('Error:', err);
      this.proyectos = [];
    }
  });
}
private calcularStats(): void {
    this.totalProyectos = this.proyectos.length;
    this.enProgreso = this.proyectos.filter(p => p.estado.toLowerCase() === 'en progreso').length;
    this.completados = this.proyectos.filter(p => p.estado.toLowerCase() === 'completado').length;
  }

  getEstadoClass(estado: string): string {
    const e = estado.toLowerCase();
    if (e.includes('progreso')) return 'text-dark bg-warning bg-opacity-25';
    if (e.includes('completado')) return 'bg-success text-white';
    if (e.includes('pendiente')) return 'bg-secondary text-white';
    return 'bg-info text-white';
  }
}