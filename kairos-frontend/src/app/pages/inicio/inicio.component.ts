import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ProyectoService } from '../../services/proyecto.service';
import { IdCoderService } from '../../services/id-coder.service'; 
import { UsuariosService } from '../../services/usuarios.service';
import { Router } from '@angular/router';
import { Proyecto } from '../../models/proyecto.model';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterModule,
    CommonModule,
    FormsModule,],
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
  
  // Filtros
  filtroEstado: string = 'Todos';
  filtroBusqueda: string = '';

  get proyectosFiltrados(): Proyecto[] {
    return this.proyectos.filter(p => {
      const estadoLowerCase = p.estado ? p.estado.toLowerCase() : '';
      const filtroReq = this.filtroEstado.toLowerCase();
      // Asume que los estados que vienen de la DB o en `p.estado` son 'En Progreso', 'Completado', etc.
      const matchEstado = this.filtroEstado === 'Todos' || estadoLowerCase === filtroReq;
      
      const search = this.filtroBusqueda.toLowerCase().trim();
      const matchBusqueda = !search || 
                            (p.nombre && p.nombre.toLowerCase().includes(search)) || 
                            (p.equipo && p.equipo.toLowerCase().includes(search));
                            
      return matchEstado && matchBusqueda;
    });
  }
  // Modal
  mostrarModal = false;
  usuarios: any[] = [];
  liderId: number | null = null;
  errorMensaje: string | null = null;
// validaciones
  maxNombre = 20;
  maxEquipo = 20;
  maxDescripcion = 140;
  maxImagenMB = 2;


  // Formulario
  nuevoProyecto = {
    nombre: '',
    equipo: '',
    descripcion: '',
    fechaInicio: '',
    logo: '' as string | ArrayBuffer | null
  };

  searchLider: string = "";
  resultadosLider: any[] = [];
  liderSeleccionado: any = null;

  constructor(
    public authService: AuthService,
    private proyectoService: ProyectoService,
    private router: Router,
    private idCoderService: IdCoderService,
    private usuariosService: UsuariosService
  ) {}

  ngOnInit(): void {
      this.cargarUsuarioYProyectos();
  }
  getEncodedIdForProject(p: Proyecto): string {
    return this.idCoderService.encode(p.idProyecto);
}

  abrirModal() {
    this.mostrarModal = true;
    this.cargarUsuarios();
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.nuevoProyecto = { nombre: '', equipo: '', descripcion: '', fechaInicio: '', logo: '' };
    this.liderId = null;
    this.searchLider = "";
    this.resultadosLider = [];
    this.liderSeleccionado = null;
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

  onFileSelected(event: any): void {
  const file = event.target.files[0];
  const error = this.validarImagen(file);
  if (error) {
    this.errorMensaje = error;
    event.target.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = (e: any) => {
    this.nuevoProyecto.logo = e.target.result;
    this.errorMensaje = null;
  };
  reader.readAsDataURL(file);
}

  crearProyecto(): void {
  this.errorMensaje = null;

  const errores = [
    this.validarNombre(),
    this.validarEquipo(),
    this.validarDescripcion(),
    this.validarFecha(),
    this.liderId ? null : 'Selecciona un líder'
  ].filter(e => e);

  if (errores.length > 0) {
    this.errorMensaje = errores[0];
    return;
  }

  const payload = {
    nombre: this.nuevoProyecto.nombre.trim(),
    equipo: this.nuevoProyecto.equipo.trim(),
    descripcion: this.nuevoProyecto.descripcion,
    fechaInicio: this.nuevoProyecto.fechaInicio,
    liderId: this.liderId!,
    logo: this.nuevoProyecto.logo
  };

  this.proyectoService.crearProyecto(payload).subscribe({
    next: (nuevo) => {
      this.proyectos.push(nuevo);
      alert('Proyecto creado');
      this.cerrarModal();
    },
    error: (err) => {
      this.errorMensaje = err.error?.error || 'Error al crear';
    }
  });
}
buscarLider(): void {
  if (this.searchLider.trim().length < 2) {
    this.resultadosLider = [];
    return;
  }
  

  this.usuariosService.searchByName(this.searchLider).subscribe({
    next: (usuarios) => {
      this.resultadosLider = usuarios;
    },
    error: () => {
      this.resultadosLider = [];
    }
  });

}

seleccionarLider(usuario: any): void {
  this.liderSeleccionado = usuario;
  this.liderId = usuario.id;
  this.searchLider = `${usuario.nombre} (${usuario.email})`; 
  this.resultadosLider = [];
}

get hoyISO(): string {
  return new Date().toISOString().split('T')[0];
}
limitarAnio(event: any): void {
  let valor = event.target.value;

  if (!valor) return;

  const partes = valor.split("-");

  if (partes.length >= 1) {
    let anio = partes[0];

    if (anio.length > 4) {
      anio = anio.slice(0, 4);
    }

    // Reconstruye la fecha
    partes[0] = anio;
    event.target.value = partes.join("-");
    this.nuevoProyecto.fechaInicio = event.target.value;
  }
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
    if (e.includes('pausado')) return 'bg-secondary text-white';
    if (e.includes('cancelado')) return 'bg-danger text-white';
    return 'bg-info text-white';
  }

  // metodos de validaciones
  validarNombre(): string | null {
  if (!this.nuevoProyecto.nombre.trim()) return 'El nombre es obligatorio';
  if (this.nuevoProyecto.nombre.length > this.maxNombre) 
    return `Máximo ${this.maxNombre} caracteres`;
  return null;
}

validarEquipo(): string | null {
  if (!this.nuevoProyecto.equipo.trim()) return 'El equipo es obligatorio';
  if (this.nuevoProyecto.equipo.length > this.maxEquipo) 
    return `Máximo ${this.maxEquipo} caracteres`;
  return null;
}

validarDescripcion(): string | null {
  if (this.nuevoProyecto.descripcion.length > this.maxDescripcion) 
    return `Máximo ${this.maxDescripcion} caracteres`;
  return null;
}
  get anioActual(): number {
    return new Date().getFullYear();
  }

  validarFecha(): string | null {
    const fecha = this.nuevoProyecto?.fechaInicio;
    if (!fecha) return null;

    const match = fecha.match(/^(\d{4})-\d{2}-\d{2}$/);
    if (!match) return 'Formato inválido';

    const anio = parseInt(match[1], 10);
    if (anio < this.anioActual) {
      return `El año debe ser ${this.anioActual} o posterior`;
    }
    if (fecha < this.hoyISO) {
      return 'La fecha debe ser posterior a hoy';
    }
    return null;
  }
  validarImagen(file: File): string | null {
    if (!file) return null;
    if (!file.type.startsWith('image/')) return 'Solo se permiten imágenes';
    if (file.size > this.maxImagenMB * 1024 * 1024) 
      return `Máximo ${this.maxImagenMB} MB`;
    return null;
  }


}
