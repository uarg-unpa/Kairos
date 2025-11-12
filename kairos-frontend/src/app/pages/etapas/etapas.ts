import { Component, OnInit, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from '../../services/usuarios';
import { EtapaService } from '../../services/etapa.service';
import { Etapa } from '../../models/etapa.model';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

declare const bootstrap: any;

@Component({
  selector: 'app-etapas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './etapas.html'
})
export class EtapasComponent implements OnInit, AfterViewInit {
  private addStageModal: any;

  private usuariosService = inject(UsuariosService);
  private etapaService = inject(EtapaService);
  usuarios = this.usuariosService.usuarios; // usable si agregamos responsable en el futuro
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  proyectoId: number | null = null;
  proyectoNombre: string | null = null;

  nuevaEtapa: any = {
    nombre: '',
    descripcion: '',
    fechaInicio: '',
    fechaFin: ''
  };

  etapas: Etapa[] = [];
  filtroEstado: 'TODAS' | 'PENDIENTE' | 'EN_PROGRESO' | 'FINALIZADA' = 'TODAS';

  ngOnInit(): void {
    const el = document.getElementById('addStageModal');
    if (el) this.addStageModal = new bootstrap.Modal(el);

    // Detecta si estamos en /proyecto/:id/etapas
    this.route.paramMap.subscribe(pm => {
      const id = pm.get('id');
      this.proyectoId = id ? Number(id) : null;
      const data: any = (this.route.snapshot as any).data;
      this.proyectoNombre = data?.['proyecto']?.nombre || null;
      const obs = this.proyectoId ? this.etapaService.getEtapasPorProyecto(this.proyectoId) : this.etapaService.getEtapas();
      obs.subscribe((data) => {
        this.etapas = data;
        setTimeout(() => this.enableTooltips(), 0);
      });
    });
  }

  ngAfterViewInit(): void {
    this.enableTooltips();
  }

  abrirModalEtapa() {
    this.addStageModal?.show();
  }

  cerrarModalEtapa() {
    this.addStageModal?.hide();
    (document.activeElement as HTMLElement)?.blur();
  }

  nuevaEtapaValida(): boolean {
    const e = this.nuevaEtapa;
    return !!(e.nombre && e.fechaInicio && e.fechaFin);
  }

  crearEtapa() {
    if (!this.nuevaEtapaValida()) return;
    const payload: any = { nombre: this.nuevaEtapa.nombre, descripcion: this.nuevaEtapa.descripcion, fechaInicio: this.nuevaEtapa.fechaInicio, fechaFin: this.nuevaEtapa.fechaFin };
    if (this.proyectoId) payload.proyectoId = this.proyectoId;
    this.etapaService.crearEtapa(payload).subscribe({
      next: (nueva) => {
        this.etapas = [nueva, ...this.etapas];
        this.resetForm();
        this.cerrarModalEtapa();
        setTimeout(() => this.enableTooltips(), 0);
      },
      error: (err) => {
        console.error('Error creando etapa', err);
        alert('No se pudo crear la etapa');
      }
    });
  }

  private resetForm() {
    this.nuevaEtapa = { nombre: '', descripcion: '', fechaInicio: '', fechaFin: '' };
  }

  goToEtapaId(id: number) {
    this.router.navigate(['/iteraciones/etapa', id]);
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
        try { new bootstrap.Tooltip(el); } catch {}
      });
    } catch {}
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

  eliminarEtapa(e: Etapa, ev?: Event) {
    if (ev) ev.stopPropagation();
    if (!confirm(`¿Eliminar la etapa "${e.nombre}"?`)) return;
    this.etapaService.deleteEtapa(e.idEtapa).subscribe({
      next: () => {
        this.etapas = this.etapas.filter(x => x.idEtapa !== e.idEtapa);
        setTimeout(() => this.enableTooltips(), 0);
      },
      error: (err) => {
        console.error('Error eliminando etapa', err);
        alert('No se pudo eliminar la etapa');
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
}
