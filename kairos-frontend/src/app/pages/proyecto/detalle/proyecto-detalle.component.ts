import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ProyectoService } from '../../../services/proyecto.service';
import { AuthService } from '../../../services/auth.service';
import { EtapaService } from '../../../services/etapa.service';
import { TaskService } from '../../../services/tarea.service';

import { Proyecto } from '../../../models/proyecto.model';
import { Etapa } from '../../../models/etapa.model';
import { Tarea } from '../../../models/tarea.model';

@Component({
  selector: 'app-proyecto-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './proyecto-detalle.component.html',
  styleUrls: ['./proyecto-detalle.component.css']
})
export class ProyectoDetalleComponent implements OnInit {
  proyecto: Proyecto | null = null;
  rolEnProyecto: 'Admin' | 'Lider' | 'Miembro' = 'Miembro';
  mostrarModalEditar = false;
  proyectoEdit: any = {};
  errorMensaje: string | null = null;
  usuarioId: number | null = null;
  etapas: Etapa[] = [];
  tareasProyecto: Tarea[] = [];
  etapaActualNombre: string | null = null;
  etapasCompletadas = 0;
  planificacionProgreso = 0;
  tareasTotales = 0;
  tareasFinalizadas = 0;
  tareasAsignadasPendientes = 0;
  private avatarPalette = ['#6C63FF', '#0d6efd', '#198754', '#20c997', '#fd7e14', '#6f42c1'];

  // === VALIDACIONES ===
  maxNombre = 20;
  maxEquipo = 20;
  maxDescripcion = 140;
  maxImagenMB = 2;
  fechaOriginal: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private proyectoService: ProyectoService,
    private authService: AuthService,
    private etapaService: EtapaService,
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarProyecto(+id);
    }
    this.cargarUsuarioId();
  }

  private cargarUsuarioId(): void {
    this.authService.currentUser$.subscribe(user => {
      this.usuarioId = user?.id || null;
      this.determinarRolEnProyecto();
      this.actualizarTareasAsignadas();
    });
  }

  private cargarProyecto(id: number): void {
    this.proyectoService.getProyectoById(id).subscribe({
      next: (proyecto) => {
        this.proyecto = proyecto;
        this.determinarRolEnProyecto();
        this.cargarResumenProyecto(id);
      },
      error: (err) => console.error('Error:', err)
    });
  }

  private cargarResumenProyecto(id: number): void {
    this.etapaService.getEtapasPorProyecto(id).subscribe({
      next: (etapas) => {
        this.etapas = etapas || [];
        this.actualizarResumenEtapas();
      },
      error: (err) => console.error('Error al cargar etapas del proyecto:', err)
    });

    this.taskService.getTareasPorProyecto(id).subscribe({
      next: (tareas) => {
        this.tareasProyecto = tareas || [];
        this.actualizarResumenTareas();
      },
      error: (err) => console.error('Error al cargar tareas del proyecto:', err)
    });
  }

  private determinarRolEnProyecto(): void {
    if (!this.proyecto || !this.usuarioId) {
      this.rolEnProyecto = 'Miembro';
      return;
    }

    // 1. ¿Es admin global?
    if (this.authService.esAdmin()) {
      this.rolEnProyecto = 'Admin';
      return;
    }

    // 2. ¿Es lider del proyecto? (normalizado sin tildes)
    const esLider = this.proyecto.usuariosProyecto?.some(up => {
      const rolNorm = (up.rolProyecto || '')
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      return up.idUsuario === this.usuarioId && rolNorm.includes('LIDER');
    }) || false;

    this.rolEnProyecto = esLider ? 'Lider' : 'Miembro';
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
      this.errorMensaje = errores[0] || null;
      return;
    }

    const payload = {
      nombre: this.proyectoEdit.nombre?.trim() || '',
      equipo: this.proyectoEdit.equipo?.trim() || '',
      descripcion: this.proyectoEdit.descripcion || '',
      fechaInicio: this.proyectoEdit.fechaInicio || null,
      estado: this.proyectoEdit.estado || 'En Progreso',
      logo: this.proyectoEdit.logo || null
    };

    this.proyectoService.actualizarProyecto(this.proyecto!.idProyecto, payload).subscribe({
      next: (actualizado) => {
        this.proyecto = actualizado;
        this.cargarResumenProyecto(actualizado.idProyecto);
        alert('Proyecto actualizado con exito');
        this.cerrarModalEditar();
      },
      error: (err) => {
        this.errorMensaje = err.error?.error || 'Error al actualizar';
      }
    });
  }

  // rol de usuario ya determinado mediante determinarRolEnProyecto

  get hoyISO(): string {
    return new Date().toISOString().split('T')[0];
  }

  validarNombre(): string | null {
    const valor = this.proyectoEdit?.nombre?.trim();
    if (!valor) return 'El nombre es obligatorio';
    if (valor.length > this.maxNombre) return `Maximo ${this.maxNombre} caracteres`;
    return null;
  }

  validarEquipo(): string | null {
    const valor = this.proyectoEdit?.equipo?.trim();
    if (!valor) return 'El equipo es obligatorio';
    if (valor.length > this.maxEquipo) return `Maximo ${this.maxEquipo} caracteres`;
    return null;
  }

  validarDescripcion(): string | null {
    if (this.proyectoEdit?.descripcion?.length > this.maxDescripcion) {
      return `Maximo ${this.maxDescripcion} caracteres`;
    }
    return null;
  }

  get anioActual(): number {
    return new Date().getFullYear();
  }

  validarFecha(): string | null {
    const actual = this.proyectoEdit?.fechaInicio;
    const original = this.fechaOriginal;

    // Si habia fecha y ahora esta vacia -> ERROR
    if (original && !actual) {
      return 'No puedes eliminar la fecha de inicio';
    }

    // Si hay fecha, valida formato y año
    if (actual) {
      const match = actual.match(/^(\d{4})-\d{2}-\d{2}$/);
      if (!match) return 'Formato invalido (YYYY-MM-DD)';

      const anio = parseInt(match[1], 10);
      if (anio < this.anioActual) {
        return `El año debe ser ${this.anioActual} o posterior`;
      }
    }

    return null;
  }

  validarImagen(file: File): string | null {
    if (!file) return null;
    if (!file.type.startsWith('image/')) return 'Solo se permiten imagenes';
    if (file.size > this.maxImagenMB * 1024 * 1024) return `Maximo ${this.maxImagenMB} MB`;
    return null;
  }

  private actualizarResumenEtapas(): void {
    this.etapasCompletadas = this.etapas.filter(e => (e.estado || '').toUpperCase() === 'COMPLETADA').length;
    const enCurso = this.etapas.find(e => (e.estado || '').toUpperCase() === 'EN_PROGRESO');
    const pendiente = this.etapas.find(e => (e.estado || '').toUpperCase() === 'PENDIENTE');
    this.etapaActualNombre = enCurso?.nombre || pendiente?.nombre || this.etapas[0]?.nombre || null;
  }

  private actualizarResumenTareas(): void {
    this.tareasTotales = this.tareasProyecto.length;
    this.tareasFinalizadas = this.tareasProyecto.filter(t => this.esTareaCompletada(t.estado)).length;
    this.planificacionProgreso = this.tareasTotales
      ? Math.round((this.tareasFinalizadas / this.tareasTotales) * 100)
      : 0;
    this.actualizarTareasAsignadas();
  }

  private actualizarTareasAsignadas(): void {
    if (!this.usuarioId) {
      this.tareasAsignadasPendientes = 0;
      return;
    }
    this.tareasAsignadasPendientes = this.tareasProyecto.filter(
      t => t.usuarioId === this.usuarioId && !this.esTareaCompletada(t.estado)
    ).length;
  }

  private esTareaCompletada(estado: string | null | undefined): boolean {
    if (!estado) return false;
    return /completad|finalizad/i.test(estado);
  }

  inicialesUsuario(nombre?: string): string {
    if (!nombre) return '?';
    const partes = nombre.trim().split(/\s+/).filter(Boolean);
    return partes.slice(0, 2).map(p => p[0]?.toUpperCase() || '').join('') || '?';
  }

  colorAvatar(index: number): string {
    return this.avatarPalette[index % this.avatarPalette.length];
  }
}
