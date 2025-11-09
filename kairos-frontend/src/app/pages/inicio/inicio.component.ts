import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ProyectoService } from '../../services/proyecto.service';
import { Router } from '@angular/router';
import { Proyecto } from '../../models/proyecto.model';
import { Observable } from 'rxjs';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterModule,
    CommonModule,
    FormsModule],
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
  // Modal
  mostrarModal = false;
  usuarios: any[] = [];
  liderId: number | null = null;
  errorMensaje: string | null = null;


  // Formulario
  nuevoProyecto = {
    nombre: '',
    equipo: '',
    descripcion: '',
    fechaInicio: '',
    logo: '' as string | ArrayBuffer | null
  };

  constructor(
    public authService: AuthService,
    private proyectoService: ProyectoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarUsuarioYProyectos();
  }

  abrirModal() {
    this.mostrarModal = true;
    this.cargarUsuarios();
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.nuevoProyecto = { nombre: '', equipo: '', descripcion: '', fechaInicio: '', logo: '' };
    this.liderId = null;
    document.body.classList.remove('modal-open');
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) backdrop.remove();
  }

  cargarUsuarios() {
    this.proyectoService.getUsuarios().subscribe({
      next: (usuarios) => this.usuarios = usuarios,
      error: () => alert('Error al cargar usuarios')
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => this.nuevoProyecto.logo = e.target?.result ?? null;
      reader.readAsDataURL(file);
    }
  }

  crearProyecto() {
  this.errorMensaje = null; // limpia errores previos

  if (!this.nuevoProyecto.nombre?.trim() || !this.nuevoProyecto.equipo?.trim() || !this.liderId) {
    this.errorMensaje = 'Completa nombre, equipo y líder';
    return;
  }

  const payload = {
    nombre: this.nuevoProyecto.nombre.trim(),
    equipo: this.nuevoProyecto.equipo.trim(),
    descripcion: this.nuevoProyecto.descripcion,
    fechaInicio: this.nuevoProyecto.fechaInicio || null,
    logo: this.nuevoProyecto.logo,
    liderId: this.liderId
  };

  this.proyectoService.crearProyecto(payload).subscribe({
    next: () => {
      alert('Proyecto creado con éxito');
      this.cerrarModal();
      this.cargarProyectos();
    },
    error: (err) => {
      this.errorMensaje = err.error?.error || 'Error al crear el proyecto';
      console.error('Error:', err);
    }
  });
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