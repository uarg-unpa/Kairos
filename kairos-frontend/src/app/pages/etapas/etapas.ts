import { Component, OnInit, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from '../../services/usuarios';
import { EtapaService } from '../../services/etapa.service';
import { IdCoderService } from '../../services/id-coder.service';
import { AuthService } from '../../services/auth.service';
import { ProyectoService } from '../../services/proyecto.service';
import { Etapa } from '../../models/etapa.model';
import { Proyecto } from '../../models/proyecto.model';
import { Router, RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { AlertService } from '../../services/alert.service';

declare const bootstrap: any;

@Component({
  selector: 'app-etapas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './etapas.html',
  styleUrls: ['./etapas.css']
})
export class EtapasComponent implements OnInit, AfterViewInit {
  idProyecto!: number;
  proyectoNombre?: string;
  proyecto?: Proyecto;
  proyectoInicio?: string;
  private addStageModal: any;

  private usuariosService = inject(UsuariosService);
  private etapaService = inject(EtapaService);
  usuarios = this.usuariosService.usuarios; // usable si agregamos responsable en el futuro
  private router = inject(Router);
  private idCoderService = inject(IdCoderService);
  private authService = inject(AuthService);
  private proyectoService = inject(ProyectoService);
  private alertService = inject(AlertService);

  nuevaEtapa: any = {
    nombre: '',
    descripcion: '',
    fechaInicio: '',
    fechaFin: '',
    proyectoId: this.idProyecto,
  };
  errorNuevaEtapa: string | null = null;

  etapas: Etapa[] = [];
  filtroEstado: 'TODAS' | 'PENDIENTE' | 'EN_PROGRESO' | 'FINALIZADA' = 'TODAS';

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    const el = document.getElementById('addStageModal');
    if (el) this.addStageModal = new bootstrap.Modal(el);

    const encodedId = this.route.snapshot.paramMap.get('id');

    if (encodedId) {
      const decodedId = this.idCoderService.decode(encodedId);

      if (decodedId) {
        this.idProyecto = decodedId;
        console.log('Proyecto ID Decodificado:', this.idProyecto);
        this.nuevaEtapa.proyectoId = this.idProyecto;
        this.cargarProyecto();
        this.cargarEtapas();
      } else {
        console.error('ID de proyecto inválido en la ruta');
        alert('Acceso denegado o ID de proyecto inválido.');
        this.router.navigate(['/inicio']);
        return;
      }
    } else {
      this.router.navigate(['/inicio']);
      return;
    }
  }
  private cargarEtapas(): void {
    this.etapaService.getEtapasPorProyecto(this.idProyecto).subscribe({
      next: (etapas) => {
        this.etapas = etapas;
        setTimeout(() => this.enableTooltips(), 0);
      },
      error: (err) => {
        console.error('Error cargando etapas', err);
        alert('No se pudieron cargar las etapas del proyecto');
      }
    });
  }

  private cargarProyecto(): void {
    this.proyectoService.getProyectoById(this.idProyecto).subscribe({
      next: (p) => {
        this.proyecto = p;
        this.proyectoNombre = p.nombre;
        this.proyectoInicio = p.fechaInicio;
      },
      error: (err) => console.error('Error cargando proyecto', err)
    });
  }

  ngAfterViewInit(): void {
    this.enableTooltips();
  }

  abrirModalEtapa() {
    this.errorNuevaEtapa = null;
    this.addStageModal?.show();
  }

  cerrarModalEtapa() {
    this.addStageModal?.hide();
    this.errorNuevaEtapa = null;
    (document.activeElement as HTMLElement)?.blur();
  }

  nuevaEtapaValida(): boolean {
    const e = this.nuevaEtapa;
    this.errorNuevaEtapa = null;
    if (this.proyecto?.estado === 'FINALIZADO') {
      this.errorNuevaEtapa = 'No se pueden crear etapas en un proyecto finalizado';
      return false;
    }

    if (!(e.nombre && e.fechaInicio && e.fechaFin)) return false;

    if (this.fechaInicioMenorAProyecto()) {
      const inicioProy = this.proyecto?.fechaInicio || this.proyectoInicio;
      this.errorNuevaEtapa = `La fecha de inicio no puede ser menor a la fecha de inicio del proyecto (${inicioProy})`;
      return false;
    }

    if (this.fechasDesordenadas()) {
      this.errorNuevaEtapa = 'La fecha de fin no puede ser anterior a la fecha de inicio';
      return false;
    }
    return true;
  }

  crearEtapa() {
    if (!this.nuevaEtapaValida()) return;
    const payload = { nombre: this.nuevaEtapa.nombre, descripcion: this.nuevaEtapa.descripcion, fechaInicio: this.nuevaEtapa.fechaInicio, fechaFin: this.nuevaEtapa.fechaFin, proyectoId: this.idProyecto };
    console.log('Crear etapa con payload:', payload);
    this.etapaService.crearEtapa(payload).subscribe({
      next: (nueva) => {
        this.etapas = [nueva, ...this.etapas];
        this.resetForm();
        this.cerrarModalEtapa();
        setTimeout(() => this.enableTooltips(), 0);
      },
      error: (err) => {
        console.error('Error creando etapa', err);
        this.errorNuevaEtapa = err?.error?.error || err?.error?.message || 'No se pudo crear la etapa';
      }
    });
  }

  private resetForm() {
    this.nuevaEtapa = { nombre: '', descripcion: '', fechaInicio: '', fechaFin: '', proyectoId: this.idProyecto };
    this.errorNuevaEtapa = null;
  }

  fechaInicioMenorAProyecto(): boolean {
    const e = this.nuevaEtapa;
    const inicioProyecto = this.proyecto?.fechaInicio || this.proyectoInicio;
    if (!e?.fechaInicio || !inicioProyecto) return false;
    const iniEtapa = new Date(e.fechaInicio);
    const iniProy = new Date(inicioProyecto);
    if (isNaN(iniEtapa.getTime()) || isNaN(iniProy.getTime())) {
      return e.fechaInicio < inicioProyecto;
    }
    return iniEtapa < iniProy;
  }

  fechasDesordenadas(): boolean {
    const e = this.nuevaEtapa;
    if (!e?.fechaInicio || !e?.fechaFin) return false;
    const ini = new Date(e.fechaInicio);
    const fin = new Date(e.fechaFin);
    if (isNaN(ini.getTime()) || isNaN(fin.getTime())) return false;
    return fin < ini;
  }

  onFechaInicioChange(value: string): void {
    this.nuevaEtapa.fechaInicio = value;
    if (this.nuevaEtapa.fechaFin && this.nuevaEtapa.fechaFin < value) {
      // Ajusta la fecha fin al mínimo permitido para mantener consistencia visual
      this.nuevaEtapa.fechaFin = value;
    }
    this.errorNuevaEtapa = null;
  }

  goToEtapaId(id: number) {
    if (this.idProyecto) {
      const encodedProyectoId = this.idCoderService.encode(this.idProyecto);
      const encodedEtapaId = this.idCoderService.encode(id);
      this.router.navigate(['/proyecto', encodedProyectoId, 'iteraciones', encodedEtapaId]);
    } else {
      const encodedId = this.idCoderService.encode(id);
      this.router.navigate(['/iteraciones/etapa', encodedId]);
    }
  }

  // Estado derivado solo por fechas: PENDIENTE, EN_PROGRESO, FINALIZADA
  estadoVisible(e: Etapa): 'PENDIENTE' | 'EN_PROGRESO' | 'FINALIZADA' {
    const hoy = new Date();
    const ini = e.fechaInicio ? new Date(e.fechaInicio) : null;
    const fin = e.fechaFin ? new Date(e.fechaFin) : null;
    if (ini && hoy < ini) return 'PENDIENTE';
    if (fin && hoy > fin) return 'FINALIZADA';
    return 'EN_PROGRESO';
  }

  // Color lógico del estado para UI (incluye caso finalizada con pendientes)
  colorEstado(e: Etapa): 'success' | 'warning' | 'secondary' | 'danger' {
    const estado = this.estadoVisible(e);
    if (estado === 'FINALIZADA') {
      return this.progressValue(e) < 100 ? 'danger' : 'success';
    }
    if (estado === 'EN_PROGRESO') return 'warning';
    return 'secondary';
  }

  // Progreso mostrado: si está finalizada y tiene 0 iteraciones, forzar 100%
  progressValue(e: Etapa): number {
    const iters = e.iteraciones ?? 0;
    const estado = this.estadoVisible(e);
    if (estado === 'FINALIZADA' && iters === 0) return 100;
    const p = e.progreso ?? 0;
    return Math.max(0, Math.min(100, p));
  }

  // Tooltip cuando está en rojo
  tooltipFinalizadaPendiente(e: Etapa): string | null {
    return this.colorEstado(e) === 'danger' ? 'Finalizada con pendientes' : null;
  }

  private enableTooltips() {
    try {
      const list = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]')) as any[];
      list.forEach((el: any) => {
        try { new bootstrap.Tooltip(el); } catch { }
      });
    } catch { }
  }

  // Etiqueta legible para estado
  estadoLabel(e: Etapa): string {
    const estado = this.estadoVisible(e);
    if (estado === 'EN_PROGRESO') return 'En progreso';
    if (estado === 'PENDIENTE') return 'Pendiente';
    return 'Finalizada';
  }

  etapasFiltradas(): Etapa[] {
    if (this.filtroEstado === 'TODAS') return this.etapas;
    return this.etapas.filter(e => this.estadoVisible(e) === this.filtroEstado);
  }

  async eliminarEtapa(e: Etapa, ev?: Event): Promise<void> {
    if (ev) ev.stopPropagation();

    // Confirmar eliminación con SweetAlert2
    const confirmado = await this.alertService.confirm(
      '¿Eliminar etapa?',
      `¿Estás seguro de que deseas eliminar la etapa "${e.nombre}"? Esta acción no se puede deshacer y perderas toda la información de las iteraciones que se encuentran en esta etapa.`,
      'Sí, eliminar'
    );

    if (!confirmado) return;

    this.etapaService.deleteEtapa(e.idEtapa).subscribe({
      next: () => {
        this.etapas = this.etapas.filter(x => x.idEtapa !== e.idEtapa);
        this.alertService.success('Etapa eliminada exitosamente');
        setTimeout(() => this.enableTooltips(), 0);
      },
      error: (err) => {
        console.error('Error eliminando etapa', err);
        this.alertService.error('No se pudo eliminar la etapa');
      }
    });
  }

  // Resumen de Etapas
  totalEtapas(): number {
    return this.etapas.length;
  }

  completadas(): number {
    return this.etapas.filter(e => this.estadoVisible(e) === 'FINALIZADA').length;
  }

  enProgreso(): number {
    return this.etapas.filter(e => this.estadoVisible(e) === 'EN_PROGRESO').length;
  }

  progresoTotal(): number {
    if (!this.etapas.length) return 0;
    const sum = this.etapas.reduce((acc, e) => acc + this.progressValue(e), 0);
    return Math.round(sum / this.etapas.length);
  }

  autoGrow(event: Event) {
    const el = event.target as HTMLTextAreaElement;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }

  get isLider(): boolean {
    const user = this.authService.usuario;
    if (!user || !this.proyecto || !this.proyecto.usuariosProyecto) return false;

    // Si es admin global, también podría considerarse líder (opcional, pero seguro)
    //if (user.admin) return true;

    const miembro = this.proyecto.usuariosProyecto.find(u => u.idUsuario === user.id);
    if (!miembro) return false;

    const rol = miembro.rolProyecto;
    return rol === 'LIDER' || rol === 'Líder';
  }
}
