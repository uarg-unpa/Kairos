import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { IteracionService } from '../../services/iteracion.service';
import { IdCoderService } from '../../services/id-coder.service'; // << Importado
import { Iteracion } from '../../models/iteracion.model';

declare const bootstrap: any;

@Component({
  selector: 'app-iteraciones',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './iteraciones.html',
  styleUrls: ['./iteraciones.css']
})
export class IteracionesComponent implements OnInit {
  private addIterationModal: any;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private iteracionService = inject(IteracionService);
  private idCoderService = inject(IdCoderService);

  etapaSlug: string | null = null;
  etapaId: number | null = null;
  proyectoId: number | null = null;
  proyectoNombre: string | null = null;
  backLink: string | any[] = '/inicio';
  private encodedProyectoId: string | null = null;

  iteraciones: Iteracion[] = [];
  filtroProgreso: 'TODAS' | 'SIN_INICIAR' | 'EN_PROCESO' | 'FINALIZADA' = 'TODAS';

  nuevaIteracion: any = {
    descripcion: '',
    fechaInicio: '',
    fechaFin: ''
  };
  errorNuevaIteracion: string | null = null;

  ngOnInit(): void {
    const el = document.getElementById('addIterationModal');
    if (el) this.addIterationModal = new bootstrap.Modal(el);

    this.route.paramMap.subscribe(pm => {
      // 1. Obtener parámetros y ruta
      const idParam = pm.get('id');
      const etapaParam = pm.get('etapa');
      const path = this.route.snapshot.routeConfig?.path || '';
      const data: any = (this.route.snapshot as any).data;

      this.proyectoNombre = data?.['proyecto']?.nombre || null;
      this.proyectoId = null;
      this.etapaId = null;
      this.backLink = '/inicio';
      this.encodedProyectoId = null;

      if (path.startsWith('proyecto/:id')) {
        if (idParam) {
          const decodedId = this.idCoderService.decode(idParam);
          if (decodedId) {
            this.proyectoId = decodedId;
            this.encodedProyectoId = idParam;
            this.backLink = ['/proyecto', idParam, 'etapas'];
          } else {
            alert('ID de proyecto inválido o manipulado.');
            this.router.navigate(['/inicio']);
            return;
          }
        }
      }

      if (etapaParam) {
        const decodedEtapaId = this.idCoderService.decode(etapaParam);
        if (decodedEtapaId) {
          this.etapaId = decodedEtapaId;
        } else {
          if (this.proyectoId) {
            alert('ID de etapa en URL inválido.');
            this.router.navigate(['/proyecto', this.encodedProyectoId, 'etapas']);
            return;
          }
          this.etapaSlug = etapaParam;
        }
      }

      else if (path.startsWith('iteraciones/etapa')) {
        if (idParam) {
          const decodedEtapaId = this.idCoderService.decode(idParam);
          if (decodedEtapaId) {
            this.etapaId = decodedEtapaId;
          } else {
            alert('ID de etapa inválido o manipulado.');
            this.router.navigate(['/inicio']);
            return;
          }
        }
      }

      if (this.etapaId) {
        this.iteracionService.getIteracionesPorEtapaId(this.etapaId).subscribe(all => this.iteraciones = all);
        return;
      }

      if (this.proyectoId) {
        this.iteracionService.getIteracionesPorProyectoId(this.proyectoId).subscribe(all => this.iteraciones = all);
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
    (document.activeElement as HTMLElement)?.blur();
  }

  nuevaIteracionValida(): boolean {
    const i = this.nuevaIteracion;
    this.errorNuevaIteracion = null;
    if (!(i.fechaInicio && i.fechaFin)) return false;
    if (this.fechasDesordenadas()) {
      this.errorNuevaIteracion = 'La fecha de fin no puede ser anterior a la fecha de inicio';
      return false;
    }
    return true;
  }

  crearIteracion() {
    if (!this.nuevaIteracionValida()) return;
    if (!this.etapaId) { alert('Selecciona una etapa para crear la iteración.'); return; }
    const payload = {
      numero: this.obtenerSiguienteNumero(),
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
        console.error('Error creando iteración', err);
        this.errorNuevaIteracion = err?.error?.error || 'No se pudo crear la iteración';
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
    this.nuevaIteracion = { descripcion: '', fechaInicio: '', fechaFin: '' };
  }

  get proximoNumeroIteracion(): number {
    return this.obtenerSiguienteNumero();
  }

  private obtenerSiguienteNumero(): number {
    const numeros = (this.iteraciones || [])
      .map(it => Number(it?.numero))
      .filter(n => Number.isFinite(n));
    if (!numeros.length) return 1;
    return Math.max(...numeros) + 1;
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

  eliminarIteracion(it: Iteracion, ev?: Event) {
    if (ev) ev.stopPropagation();
    if (!confirm(`¿Eliminar la iteración ${it.numero}?`)) return;
    this.iteracionService.deleteIteracion(it.idIteracion).subscribe({
      next: () => {
        this.iteraciones = this.iteraciones.filter((x: Iteracion) => x.idIteracion !== it.idIteracion);
      },
      error: (err) => {
        console.error('Error eliminando iteración', err);
        alert('No se pudo eliminar la iteración');
      }
    });
  }


  //anterior
  /*verTareasDeIteracion(it: Iteracion) {
    const iterId = (it as any)?.idIteracion;
    if (!iterId) return;
    const pidEncoded = this.encodedProyectoId;

    if (pidEncoded) {
      this.router.navigate(['/proyecto', pidEncoded, 'planificacion'], { queryParams: { iteracionId: iterId } });
    } else {
      this.router.navigate(['/planificacion'], { queryParams: { iteracionId: iterId } });
    }
  }*/


  verTareasDeIteracion(it: Iteracion) {
  const iterId = (it as any)?.idIteracion;
  if (!iterId) return;

  const pidEncoded = this.encodedProyectoId;

  if (pidEncoded) {
    this.router.navigate([
      '/proyecto',
      pidEncoded,
      'iteracion',
      iterId,
      'planificacion'
    ]);
  } else {
  
    this.router.navigate(['/planificacion'], { queryParams: { iteracionId: iterId } });
  }
}
}
