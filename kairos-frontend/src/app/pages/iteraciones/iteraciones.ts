import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { IteracionService } from '../../services/iteracion.service';
import { Iteracion } from '../../models/iteracion.model';

declare const bootstrap: any;

@Component({
  selector: 'app-iteraciones',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './iteraciones.html'
})
export class IteracionesComponent implements OnInit {
  private addIterationModal: any;

  private route = inject(ActivatedRoute);
  etapaSlug: string | null = null;
  etapaId: number | null = null;
  proyectoId: number | null = null;
  proyectoNombre: string | null = null;
  private iteracionService = inject(IteracionService);

  iteraciones: Iteracion[] = [];
  filtroProgreso: 'TODAS' | 'SIN_INICIAR' | 'EN_PROCESO' | 'FINALIZADA' = 'TODAS';

  nuevaIteracion: any = {
    numero: 1,
    descripcion: '',
    fechaInicio: '',
    fechaFin: ''
  };
  errorNuevaIteracion: string | null = null;

  ngOnInit(): void {
    const el = document.getElementById('addIterationModal');
    if (el) this.addIterationModal = new bootstrap.Modal(el);

    this.route.paramMap.subscribe(pm => {
      // Detecta distintas variantes de ruta
      this.etapaSlug = pm.get('etapa');
      const idParam = pm.get('id');
      const path = this.route.snapshot.routeConfig?.path || '';
      const data: any = (this.route.snapshot as any).data;
      this.proyectoNombre = data?.['proyecto']?.nombre || null;

      if (path.startsWith('iteraciones/etapa')) {
        // /iteraciones/etapa/:id -> id es etapa
        this.etapaId = idParam ? Number(idParam) : null;
        if (this.etapaId) {
          this.iteracionService.getIteracionesPorEtapaId(this.etapaId).subscribe(all => this.iteraciones = all);
          return;
        }
      } else if (path.startsWith('proyecto/:id/iteraciones')) {
        // /proyecto/:id/iteraciones -> id es proyecto
        this.proyectoId = idParam ? Number(idParam) : null;
        if (this.proyectoId) {
          this.iteracionService.getIteracionesPorProyectoId(this.proyectoId).subscribe(all => this.iteraciones = all);
          return;
        }
      }

      if (this.etapaSlug) {
        this.iteracionService.getIteraciones().subscribe(all => this.iteraciones = all);
        return;
      }
      this.iteracionService.getIteraciones().subscribe(all => this.iteraciones = all);
    });
  }

  abrirModalIteracion() {
    this.errorNuevaIteracion = null;
    this.addIterationModal?.show();
  }

  cerrarModalIteracion() {
    this.addIterationModal?.hide();
    this.errorNuevaIteracion = null;
    this.errorNuevaIteracion = null;
    (document.activeElement as HTMLElement)?.blur();
  }

  nuevaIteracionValida(): boolean {
    const i = this.nuevaIteracion;
    this.errorNuevaIteracion = null;
    if (!(i.numero && i.fechaInicio && i.fechaFin)) return false;
    if (this.fechasDesordenadas()) {
      this.errorNuevaIteracion = 'La fecha de fin no puede ser anterior a la fecha de inicio';
      return false;
    }
    return true;
  }

  crearIteracion() {
    if (!this.nuevaIteracionValida()) return;
    if (!this.etapaId) { alert('Selecciona una etapa para crear la iteraci贸n.'); return; }
    const payload = {
      numero: Number(this.nuevaIteracion.numero),
      descripcion: this.nuevaIteracion.descripcion,
      fechaInicio: this.nuevaIteracion.fechaInicio,
      fechaFin: this.nuevaIteracion.fechaFin,
      etapaId: this.etapaId
    };
    this.iteracionService.crearIteracion(payload).subscribe({
      next: (nueva) => {
        this.iteraciones = [nueva, ...this.iteraciones];
        this.resetForm();
        this.cerrarModalIteracion();
      },
      error: (err) => {
        console.error('Error creando iteraci髇', err);
        this.errorNuevaIteracion = err?.error?.error || 'No se pudo crear la iteraci髇';
      }
    });
  }

  fechasDesordenadas(): boolean {
    const i = this.nuevaIteracion;
    if (!i?.fechaInicio || !i?.fechaFin) return false;
    const ini = new Date(i.fechaInicio);
    const fin = new Date(i.fechaFin);
    if (isNaN(ini.getTime()) || isNaN(fin.getTime())) return false;
    return fin < ini;
  }

  onFechaInicioChange(value: string): void {
    this.nuevaIteracion.fechaInicio = value;
    if (this.nuevaIteracion.fechaFin && this.nuevaIteracion.fechaFin < value) {
      this.nuevaIteracion.fechaFin = value;
    }
    this.errorNuevaIteracion = null;
  }

  private resetForm() {
    this.nuevaIteracion = { numero: 1, descripcion: '', fechaInicio: '', fechaFin: '' };
  }

  // Progreso aproximado en porcentaje basado en fechas
  progresoIteracion(it: Iteracion): number {
    const ini = it.fechaInicio ? new Date(it.fechaInicio).getTime() : NaN;
    const fin = it.fechaFin ? new Date(it.fechaFin).getTime() : NaN;
    const hoy = Date.now();
    if (!isFinite(ini) || !isFinite(fin) || fin <= ini) return 0;
    const pct = Math.round(((hoy - ini) / (fin - ini)) * 100);
    return Math.max(0, Math.min(100, pct));
  }

  iteracionesFiltradas(): Iteracion[] {
    if (this.filtroProgreso === 'TODAS') return this.iteraciones;
    if (this.filtroProgreso === 'SIN_INICIAR') return this.iteraciones.filter(it => this.progresoIteracion(it) === 0);
    if (this.filtroProgreso === 'FINALIZADA') return this.iteraciones.filter(it => this.progresoIteracion(it) === 100);
    return this.iteraciones.filter(it => {
      const p = this.progresoIteracion(it);
      return p > 0 && p < 100;
    });
  }

  eliminarIteracion(it: Iteracion) {
    if (!confirm(`驴Eliminar la iteraci贸n ${it.numero}?`)) return;
    this.iteracionService.deleteIteracion(it.idIteracion).subscribe({
      next: () => {
        this.iteraciones = this.iteraciones.filter((x: Iteracion) => x.idIteracion !== it.idIteracion);
      },
      error: (err) => {
        console.error('Error eliminando iteraci贸n', err);
        alert('No se pudo eliminar la iteraci贸n');
      }
    });
  }
}










