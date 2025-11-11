import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProyectoService } from '../../../services/proyecto.service';
import { AuthService } from '../../../services/auth.service';
import { Proyecto } from '../../../models/proyecto.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-proyecto-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './proyecto-detalle.component.html',
  styleUrls: ['./proyecto-detalle.component.css']
})
export class ProyectoDetalleComponent implements OnInit {
  proyecto: Proyecto | null = null;
  rol: string = 'Miembro'; // Default
  mostrarModalEditar = false;
  proyectoEdit: any = {};
  errorMensaje: string | null = null;
  // === VALIDACIONES ===
  maxNombre = 20;
  maxEquipo = 20;
  maxDescripcion = 140;
  maxImagenMB = 2;
  fechaOriginal: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private proyectoService: ProyectoService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarProyecto(+id);
    }
    this.cargarRol();
  }

  private cargarProyecto(id: number): void {
    this.proyectoService.getProyectoById(id).subscribe({
      next: (proyecto) => this.proyecto = proyecto,
      error: (err) => console.error('Error al cargar proyecto', err)
    });
  }
  abrirModalEditar(): void {
    this.proyectoEdit = { ...this.proyecto };
    this.mostrarModalEditar = true;
    this.fechaOriginal = this.proyecto?.fechaInicio || null;
    this.errorMensaje = null;
  }
  cerrarModalEditar(): void {
    this.mostrarModalEditar = false;
    this.errorMensaje = null;
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
      this.proyectoEdit.logo = e.target.result;
      this.errorMensaje = null;
    };
    reader.readAsDataURL(file);
  }
  
  actualizarProyecto(): void {
    this.errorMensaje = null;

    const errores = [
      this.validarNombre(),
      this.validarEquipo(),
      this.validarDescripcion(),
      this.validarFecha()
    ].filter(e => e);

    if (errores.length > 0) {
      this.errorMensaje = errores[0];
      return;
    }

    const payload = {
      nombre: this.proyectoEdit.nombre.trim(),
      equipo: this.proyectoEdit.equipo.trim(),
      descripcion: this.proyectoEdit.descripcion || '',
      fechaInicio: this.proyectoEdit.fechaInicio || null,
      estado: this.proyectoEdit.estado || 'En Progreso',
      logo: this.proyectoEdit.logo || null
    };

    this.proyectoService.actualizarProyecto(this.proyecto!.idProyecto, payload).subscribe({
      next: (actualizado) => {
        this.proyecto = actualizado;
        alert('Proyecto actualizado con éxito');
        this.cerrarModalEditar();
      },
      error: (err) => {
        this.errorMensaje = err.error?.error || 'Error al actualizar';
      }
    });
  }

  private cargarRol(): void {
  this.authService.currentUser$.subscribe(user => {
    const rolRaw = user?.rol || 'Miembro';

    // NORMALIZA: mayúsculas + sin acentos
    const rolNormalizado = rolRaw
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, ""); // quita tildes

    if (rolNormalizado.includes('ADMIN')) {
      this.rol = 'Admin';
    } else if (rolNormalizado.includes('LIDER')) {
      this.rol = 'Líder';
    } else {
      this.rol = 'Miembro';
    }
  });
}

  get hoyISO(): string {
    return new Date().toISOString().split('T')[0];
  }

  validarNombre(): string | null {
    const valor = this.proyectoEdit?.nombre?.trim();
    if (!valor) return 'El nombre es obligatorio';
    if (valor.length > this.maxNombre) return `Máximo ${this.maxNombre} caracteres`;
    return null;
  }

  validarEquipo(): string | null {
    const valor = this.proyectoEdit?.equipo?.trim();
    if (!valor) return 'El equipo es obligatorio';
    if (valor.length > this.maxEquipo) return `Máximo ${this.maxEquipo} caracteres`;
    return null;
  }

  validarDescripcion(): string | null {
    if (this.proyectoEdit?.descripcion?.length > this.maxDescripcion) {
      return `Máximo ${this.maxDescripcion} caracteres`;
    }
    return null;
  }
  get anioActual(): number {
    return new Date().getFullYear();
  }

  validarFecha(): string | null {
    const actual = this.proyectoEdit?.fechaInicio;
    const original = this.fechaOriginal;

    // Si había fecha y ahora está vacía → ERROR
    if (original && !actual) {
      return 'No puedes eliminar la fecha de inicio';
    }

    // Si hay fecha, valida formato y año
    if (actual) {
      const match = actual.match(/^(\d{4})-\d{2}-\d{2}$/);
      if (!match) return 'Formato inválido (YYYY-MM-DD)';

      const anio = parseInt(match[1], 10);
      if (anio < this.anioActual) {
        return `El año debe ser ${this.anioActual} o posterior`;
      }
    }

    return null;
  }

  validarImagen(file: File): string | null {
    if (!file) return null;
    if (!file.type.startsWith('image/')) return 'Solo se permiten imágenes';
    if (file.size > this.maxImagenMB * 1024 * 1024) return `Máximo ${this.maxImagenMB} MB`;
    return null;
  }
  
}