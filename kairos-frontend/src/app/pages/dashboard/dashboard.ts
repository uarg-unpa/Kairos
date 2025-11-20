import { AfterViewInit, Component, OnDestroy, OnInit, inject } from '@angular/core';

import { DashboardExportComponent } from './dashboard-export.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EtapaService } from '../../services/etapa.service';
import { IteracionService } from '../../services/iteracion.service';
import { TaskService } from '../../services/tarea.service';
import { IdCoderService } from '../../services/id-coder.service';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { ProyectoService } from '../../services/proyecto.service';
import { Proyecto } from '../../models/proyecto.model';

declare const Chart: any;

type DetalleTipo = 'horasIteracion' | 'horasCategoria' | 'tareasUsuario' | 'horasDiaTarea' | 'horasTarea';
type FiltroTiempo = 'today' | 'week' | 'month' | 'quarter' | 'all';


export interface HorasIteracionDetalle {
  etiqueta: string;
  horas: number;
  minutos: number;
  etapa?: string | null;
  estimadas: number;
}

export interface HorasCategoriaDetalle {
  categoria: string;
  horas: number;
  minutos: number;
}

export interface TareasUsuarioDetalle {
  usuario: string;
  cantidad: number;
}

export interface HorasDiaDetalle {
  dia: string;
  horas: number;
  minutos: number;
}

export interface HorasTareaDetalle {
  tarea: string;
  horas: number;
  minutos: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, DashboardExportComponent],
  templateUrl: './dashboard.html'
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  private etapaService = inject(EtapaService);
  private iteracionService = inject(IteracionService);
  private proyectoService = inject(ProyectoService);
  private taskService = inject(TaskService);
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private idCoderService = inject(IdCoderService);

  etapas: any[] = [];
  iteraciones: any[] = [];
  filtroEtapa: number | null = null;
  filtroIteracion: number | null = null;
  filtroTiempo: FiltroTiempo = 'all';
  filtroSemana: number = 0; // 0 = semana actual, -1 = anterior, 1 = siguiente
  semanaActual: { inicio: string; fin: string } = { inicio: '', fin: '' };
  proyectoId: number | null = null;
  encodedProjectId: string | null = null; //para el html
  detalleGrafico: string | null = null;
  graficoAmpliado: any = null;

  // mAtricas
  totalTareas = 0;
  tareasCompletadas = 0;
  totalHoras = 0; // horas reales (minutos agregados / 60)
  eficiencia = 0; // (reales/estimadas)*100 si hay estimadas
  proyectoNombre: string | null = null;
  proyecto: Proyecto | null = null;
  atrasadasCount = 0;
  proximasCount = 0;

  charts: Map<string, any> = new Map(); // Cambiar de array a Map
  chartsWithData = new Set<string>();
  detalleAbierto: DetalleTipo | null = null;
  horasIteracionDetalle: HorasIteracionDetalle[] = [];
  horasCategoriaDetalle: HorasCategoriaDetalle[] = [];
  tareasUsuarioDetalle: TareasUsuarioDetalle[] = [];
  horasDiaDetalle: HorasDiaDetalle[] = [];
  horasTareaDetalle: HorasTareaDetalle[] = [];
  tareasNoFinalizadas: any[] = [];
  private horasIteracionRows: any[] = [];
  private horasEstimadasPorIteracion = new Map<number, number>();
  private readonly diasSemanaOrden = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];
  private readonly diaPorIndice = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
  private readonly gradientPalette = [
    { start: '#0d6efd', end: '#6ea8fe' },
    { start: '#198754', end: '#6cc59d' },
    { start: '#ffc107', end: '#ffe08a' },
    { start: '#dc3545', end: '#f28b94' },
    { start: '#20c997', end: '#7be0c3' },
    { start: '#6f42c1', end: '#c8a4ff' }
  ];
  private cacheHorasIteracion = new Map<string, any[]>();
  private cacheHorasCategoria = new Map<string, { categoria: string; minutos: number }[]>();
  private cacheHorasDia = new Map<string, any[]>();
  private cacheHorasEtapa = new Map<string, any[]>();
  private cacheTareas = new Map<string, any[]>();
  private iteracionesRangoActual: Set<number> | null = null;
  private lastIterParamsKey: string | null = null;
  private lastTareasCacheKey: string | null = null;
  private semanaBase: Date | null = null;
  soloFiltroTodo = false;
  loadingHorasIteracion = false;
  loadingHorasCategoria = false;
  loadingHorasDia = false;
  loadingHorasEtapa = false;
  loadingTareasData = false;

  ngOnInit(): void {
    this.actualizarSemanaActual();
    this.route.paramMap.subscribe(pm => {
      const encodedId = pm.get('id');


      if (encodedId) {
        const id = this.idCoderService.decode(encodedId);
        if (id) {
          this.proyectoId = id;
          this.encodedProjectId = encodedId;
        } else {
          alert('Acceso denegado o ID de proyecto invAlido.');
          this.router.navigate(['/inicio']);
          return;
        }
        this.proyectoService.getProyectoById(this.proyectoId!).subscribe(p => {
          this.proyecto = p || null;
          this.proyectoNombre = this.proyecto?.nombre || null;
          console.log("Proyecto cargado:", this.proyecto);
        });
      }

      if (this.proyectoId) {
        this.etapaService.getEtapasPorProyecto(this.proyectoId).subscribe(e => this.etapas = e || []);
        this.iteracionService.getIteracionesPorProyectoId(this.proyectoId).subscribe(it => this.iteraciones = it || []);

      } else {
        this.etapaService.getEtapas().subscribe(e => this.etapas = e || []);
        this.iteracionService.getIteraciones().subscribe(it => this.iteraciones = it || []);
      }


      this.reload();
    });




  }


  private actualizarSemanaActual() {
    const range = this.computeWeeklyRangeWithOffset(this.filtroSemana);
    this.semanaActual = { inicio: range.from, fin: range.to };
  }

  cambiarSemana(offset: number) {
    if (offset < 0 && this.prevSemanaDisabled()) return;
    if (offset > 0 && this.nextSemanaDisabled()) return;
    this.filtroSemana += offset;
    this.actualizarSemanaActual();
    this.reloadHorasPorDia();
  }

  private computeWeeklyRangeWithOffset(offset: number = 0): { from: string, to: string } {
    const baseDate = this.semanaBase ? new Date(this.semanaBase.getTime()) : new Date();
    const clone = (d: Date) => new Date(d.getTime());
    const addDays = (d: Date, n: number) => {
      const result = clone(d);
      result.setDate(result.getDate() + n);
      return result;
    };
    const startOfWeek = () => {
      const d = clone(baseDate);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      d.setDate(diff);
      d.setHours(0, 0, 0, 0);
      return d;
    };

    const weekStart = addDays(startOfWeek(), offset * 7);
    const weekEnd = addDays(weekStart, 6);

    // Ajustar rango a los limites del filtro (etapa/iteracion) si existen
    const rango = this.rangoFechasFiltro();
    const clampInicio = rango.desde ? Math.max(weekStart.getTime(), rango.desde.getTime()) : weekStart.getTime();
    const clampFin = rango.hasta ? Math.min(weekEnd.getTime(), rango.hasta.getTime()) : weekEnd.getTime();
    const inicioDate = new Date(clampInicio);
    const finDate = new Date(clampFin);

    const from = this.formatLocalDate(inicioDate);
    const to = this.formatLocalDate(finDate);
    return { from, to };
  }

  private reloadHorasPorDia() {
    this.loadingHorasDia = true;
    const diaParams = new URLSearchParams();
    if (this.proyectoId) diaParams.set('proyectoId', String(this.proyectoId));
    if (this.filtroEtapa) diaParams.set('etapaId', String(this.filtroEtapa));
    if (this.filtroIteracion) diaParams.set('iteracionId', String(this.filtroIteracion));
    const weekRange = this.computeWeeklyRangeWithOffset(this.filtroSemana);
    diaParams.set('from', weekRange.from);
    diaParams.set('to', weekRange.to);
    const paramsDia = diaParams.toString() ? `?${diaParams.toString()}` : '';

    this.http.get<any[]>(`http://localhost:8080/api/tiempos/horas-por-dia-tarea${paramsDia}`).subscribe(rows => {
      this.renderHorasPorDiaTareaChart(rows || []);
      this.loadingHorasDia = false;
      // Si el grAfico ampliado estA abierto, recrearlo tambiAn
      if (this.detalleGrafico === 'chartHorasDiaTarea') {
        setTimeout(() => {
          this.destroyChartByCanvasId('graficoDetalle');
          this.renderBar(
            'graficoDetalle',
            this.obtenerLabelsGrafico('chartHorasDiaTarea'),
            this.obtenerDataGrafico('chartHorasDiaTarea'),
            '#0d6efd',
            '#6ea8fe',
            false,
            true,
            false,
            'Horas por dia',
            'dias de la Semana',
            'Horas (h)'
          );
        }, 100);
      }
    }, () => {
      this.destroyChartByCanvasId('chartHorasDiaTarea');
      this.horasDiaDetalle = [];
      this.loadingHorasDia = false;
      if (this.detalleGrafico === 'chartHorasDiaTarea') {
        this.destroyChartByCanvasId('graficoDetalle');
      }
    });
  }

  private obtenerLabelsGrafico(canvasId: string): string[] {
    const chartInstance = this.charts.get(canvasId);
    return chartInstance?.data?.labels || [];
  }

  private obtenerDataGrafico(canvasId: string): number[] {
    const chartInstance = this.charts.get(canvasId);
    return chartInstance?.data?.datasets?.[0]?.data || [];
  }

  ngAfterViewInit(): void {
    // Cargar datos iniciales
    setTimeout(() => this.reload(), 0);
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }

  reload(forceRefresh = false) {
    if (forceRefresh) {
      this.clearDataCaches();
      this.soloFiltroTodo = false;
      // No borro semana base aquí para permitir usar cache; se reinicia solo cuando cambia filtro.
    }
    this.destroyCharts();
    this.loadingHorasIteracion = true;
    this.loadingHorasCategoria = true;
    this.loadingHorasDia = true;
    this.loadingHorasEtapa = true;
    this.loadingTareasData = true;

    let range = this.computeRange();
    const actualizarIteraciones = (it: any[] | null | undefined) => {
      this.iteraciones = it || [];
      this.aplicarRestriccionFiltroTiempo();
      range = this.computeRange();
      this.actualizarIteracionesRango(range);
      this.reloadHorasPorDia();
    };
    if (this.filtroEtapa) {
      this.iteracionService.getIteracionesPorEtapaId(this.filtroEtapa).subscribe(actualizarIteraciones);
    } else if (this.proyectoId) {
      this.iteracionService.getIteracionesPorProyectoId(this.proyectoId).subscribe(actualizarIteraciones);
    } else {
      this.iteracionService.getIteraciones().subscribe(actualizarIteraciones);
    }

    const iterParams = new URLSearchParams();
    if (this.filtroEtapa) iterParams.set('etapaId', String(this.filtroEtapa));
    else if (this.proyectoId) iterParams.set('proyectoId', String(this.proyectoId));
    if (this.filtroIteracion) iterParams.set('iteracionId', String(this.filtroIteracion));
    if (range.from && range.to) { iterParams.set('from', range.from); iterParams.set('to', range.to); }
    const paramsIter = iterParams.toString() ? `?${iterParams.toString()}` : '';
    const iterKey = this.cacheKeyFromParams(paramsIter);
    this.lastIterParamsKey = iterKey;
    const cachedIterRows = this.cacheHorasIteracion.get(iterKey);
    if (cachedIterRows) {
      this.actualizarHorasIteracionDesdeRows(cachedIterRows);
    } else {
      this.http.get<any[]>(`http://localhost:8080/api/tiempos/horas-por-iteracion${paramsIter}`).subscribe(rows => {
        const normalized = Array.isArray(rows) ? rows : [];
        this.cacheHorasIteracion.set(iterKey, normalized);
        this.actualizarHorasIteracionDesdeRows(normalized);
      }, () => {
        this.cacheHorasIteracion.delete(iterKey);
        this.horasIteracionRows = [];
        this.actualizarHorasIteracionChart();
        this.loadingHorasIteracion = false;
      });
    }

    const categoriaParams = new URLSearchParams();
    if (this.filtroIteracion) categoriaParams.set('iteracionId', String(this.filtroIteracion));
    else if (this.proyectoId) categoriaParams.set('proyectoId', String(this.proyectoId));
    if (range.from && range.to) { categoriaParams.set('from', range.from); categoriaParams.set('to', range.to); }
    const paramsCategoria = categoriaParams.toString() ? `?${categoriaParams.toString()}` : '';
    const categoriaKey = this.cacheKeyFromParams(paramsCategoria);
    const renderCategoria = (pairs: { categoria: string; minutos: number }[]) => {
      const labels = pairs.map(p => p.categoria);
      const dataHoras = pairs.map(p => Math.round(((p.minutos / 60) * 100)) / 100);
      const dataMinutos = pairs.map(p => p.minutos);
      this.renderPie(
        'chartHorasCategoria',
        labels,
        dataHoras,
        dataMinutos,
        'Horas Semanales por Categoria'
      );
      this.horasCategoriaDetalle = pairs.map(p => ({
        categoria: p.categoria,
        horas: Math.round(((p.minutos / 60) * 100)) / 100,
        minutos: p.minutos
      }));
      this.loadingHorasCategoria = false;
    };
    const cachedCategoria = this.cacheHorasCategoria.get(categoriaKey);
    if (cachedCategoria) {
      renderCategoria(cachedCategoria);
    } else {
      this.http.get<any[]>(`http://localhost:8080/api/tiempos/horas-por-categoria${paramsCategoria}`).subscribe(rows => {
        const pairs = (rows || []).map(r => ({
          categoria: r.categoriaNombre || 'Sin categoria',
          minutos: r.minutos || 0
        })).sort((a, b) => b.minutos - a.minutos);
        this.cacheHorasCategoria.set(categoriaKey, pairs);
        renderCategoria(pairs);
      }, () => {
        this.cacheHorasCategoria.delete(categoriaKey);
        this.destroyChartByCanvasId('chartHorasCategoria');
        this.horasCategoriaDetalle = [];
        this.loadingHorasCategoria = false;
      });
    }

    const etapaParams = new URLSearchParams();
    if (this.proyectoId) etapaParams.set('proyectoId', String(this.proyectoId));
    if (this.filtroIteracion) etapaParams.set('iteracionId', String(this.filtroIteracion));
    if (range.from && range.to) { etapaParams.set('from', range.from); etapaParams.set('to', range.to); }
    const paramsEtapa = etapaParams.toString() ? `?${etapaParams.toString()}` : '';
    const etapaKey = this.cacheKeyFromParams(paramsEtapa);
    const renderEtapa = (rows: any[]) => {
      this.renderHorasPorEtapaChart(rows || []);
      this.loadingHorasEtapa = false;
    };
    const cachedEtapa = this.cacheHorasEtapa.get(etapaKey);
    if (cachedEtapa) {
      renderEtapa(cachedEtapa);
    } else {
      this.http.get<any[]>(`http://localhost:8080/api/tiempos/horas-por-etapa${paramsEtapa}`).subscribe(rows => {
        const normalized = Array.isArray(rows) ? rows : [];
        this.cacheHorasEtapa.set(etapaKey, normalized);
        renderEtapa(normalized);
      }, () => {
        this.cacheHorasEtapa.delete(etapaKey);
        this.destroyChartByCanvasId('chartHorasEtapa');
        this.loadingHorasEtapa = false;
      });
    }

    const tareasKey = this.tareasCacheKey();
    this.lastTareasCacheKey = tareasKey;
    const cachedTareas = this.cacheTareas.get(tareasKey);
    if (cachedTareas) {
      this.procesarTareasDesdeCache(cachedTareas);
    } else {
      const tareas$ = this.proyectoId ? this.taskService.getTareasPorProyecto(this.proyectoId) : this.taskService.getTareas();
      tareas$.subscribe(ts => {
        const lista = Array.isArray(ts) ? ts : [];
        this.cacheTareas.set(tareasKey, lista);
        this.procesarTareasDesdeCache(lista);
      }, () => {
        this.cacheTareas.delete(tareasKey);
        this.procesarTareasDesdeCache([]);
      });
    }
  } private actualizarHorasIteracionChart() {
    const orderedIds: number[] = [];
    const pushId = (value: number | null | undefined) => {
      if (value === null || value === undefined) return;
      const numericId = Number(value);
      if (!Number.isFinite(numericId)) return;
      if (!orderedIds.includes(numericId)) orderedIds.push(numericId);
    };

    this.horasIteracionRows.forEach(row => pushId(this.obtenerIteracionId(row)));
    this.horasEstimadasPorIteracion.forEach((_, iterId) => pushId(iterId));

    if (!orderedIds.length) {
      this.horasIteracionDetalle = [];
      this.destroyChartByCanvasId('chartHorasIter');
      this.totalHoras = 0;
      return;
    }

    const labels: string[] = [];
    const realesHoras: number[] = [];
    const estimadasHoras: number[] = [];
    const detalleRows: HorasIteracionDetalle[] = [];

    orderedIds.forEach(iterId => {
      const row = this.horasIteracionRows.find(r => this.obtenerIteracionId(r) === iterId) || null;
      const iterInfo = this.iteraciones?.find((it: any) => Number(it?.idIteracion) === iterId);
      const numero = row?.numero ?? iterInfo?.numero;
      const nombre = row?.nombre;
      const etapa = row?.etapaNombre || row?.etapa || this.nombreEtapaDeIteracion(iterId) || null;
      const minutos = row ? Number(row.minutos || 0) : 0;
      const horasReales = Math.round(((minutos / 60) * 100)) / 100;
      const horasEstimadasRaw = this.horasEstimadasPorIteracion.get(iterId) ?? 0;
      const horasEstimadas = Math.round((horasEstimadasRaw) * 10) / 10;

      const baseLabel = numero ? `Iter ${numero}` : (nombre || `Iter ${iterId}`);
      labels.push(etapa ? `${baseLabel}\n${etapa}` : baseLabel);
      realesHoras.push(horasReales);
      estimadasHoras.push(horasEstimadas);

      const etiquetaDetalle = numero
        ? `Iteracion ${numero}${nombre ? ` - ${nombre}` : ''}`
        : (nombre ? nombre : `Iteracion ${iterId}`);
      detalleRows.push({
        etiqueta: etiquetaDetalle,
        etapa,
        horas: horasReales,
        minutos,
        estimadas: horasEstimadas
      });
    });

    this.totalHoras = Math.round((realesHoras.reduce((a, b) => a + b, 0)) * 10) / 10;

    const tooltipEtapaResolver = (ctx: any) => {
      const index = Number(ctx?.dataIndex ?? 0);
      const etapaNombre = detalleRows[index]?.etapa;
      return etapaNombre ? `Etapa: ${etapaNombre}` : null;
    };

    this.renderBarMulti('chartHorasIter', labels, [
      { label: 'Ejecucion', data: realesHoras, colorStart: '#0d6efd', colorEnd: '#6ea8fe', showMinutes: true },
      { label: 'Estimacion', data: estimadasHoras, colorStart: '#6610f2', colorEnd: '#c29bfe' }
    ], false, false, 'Estimacion vs Ejecucion', 'Iteraciones', 'Horas (h)', tooltipEtapaResolver);
    this.horasIteracionDetalle = detalleRows;
  }

  private computeRange(): { from: string | null, to: string | null } {
    const today = new Date();
    const to = this.formatLocalDate(today);
    const clone = (d: Date) => new Date(d.getTime());
    const addDays = (d: Date, n: number) => { const x = clone(d); x.setDate(x.getDate() + n); return x; };
    const startOfWeek = () => { const d = clone(today); const day = d.getDay(); const diff = (day === 0 ? -6 : 1) - day; return addDays(d, diff); };
    const startOfMonth = () => new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfQuarter = () => new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1);

    if (this.filtroTiempo === 'today') {
      return { from: to, to };
    }
    if (this.filtroTiempo === 'week') {
      const f = this.formatLocalDate(startOfWeek());
      return { from: f, to };
    }
    if (this.filtroTiempo === 'month') {
      const f = this.formatLocalDate(startOfMonth());
      return { from: f, to };
    }
    if (this.filtroTiempo === 'quarter') {
      const f = this.formatLocalDate(startOfQuarter());
      return { from: f, to };
    }
    return { from: null, to: null };
  }

  private normalizarFecha(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  private fechaDesdeValor(value: any): Date | null {
    if (!value) return null;
    const raw = typeof value === 'string' ? `${value}T00:00:00` : value;
    const parsed = new Date(raw);
    if (isNaN(parsed.getTime())) return null;
    return this.normalizarFecha(parsed);
  }

  private minFecha(...dates: Array<Date | null | undefined>): Date | null {
    const valores = dates
      .filter((d): d is Date => d instanceof Date && !isNaN(d.getTime()))
      .map(d => this.normalizarFecha(d));
    if (!valores.length) return null;
    return valores.reduce((min, actual) => actual.getTime() < min.getTime() ? actual : min);
  }

  private maxFecha(...dates: Array<Date | null | undefined>): Date | null {
    const valores = dates
      .filter((d): d is Date => d instanceof Date && !isNaN(d.getTime()))
      .map(d => this.normalizarFecha(d));
    if (!valores.length) return null;
    return valores.reduce((max, actual) => actual.getTime() > max.getTime() ? actual : max);
  }

  private rangoFechasFiltro(): { desde: Date | null; hasta: Date | null } {
    const inicioFin: Date[] = [];
    const agregar = (valor: Date | null) => { if (valor) inicioFin.push(valor); };

    const iteraciones = this.iteraciones || [];

    if (this.filtroIteracion && iteraciones.length) {
      const iter = iteraciones.find(it => Number(it?.idIteracion) === Number(this.filtroIteracion));
      agregar(this.fechaDesdeValor(iter?.fechaInicio));
      agregar(this.fechaDesdeValor(iter?.fechaFin));
    } else if (this.filtroEtapa) {
      const etapa = this.etapas?.find(e => Number(e?.idEtapa) === Number(this.filtroEtapa));
      agregar(this.fechaDesdeValor(etapa?.fechaInicio));
      agregar(this.fechaDesdeValor(etapa?.fechaFin));

      iteraciones
        .filter(it => Number(it?.idEtapa ?? it?.etapaId) === Number(this.filtroEtapa))
        .forEach(it => {
          agregar(this.fechaDesdeValor(it?.fechaInicio));
          agregar(this.fechaDesdeValor(it?.fechaFin));
        });
    } else {
      iteraciones.forEach(it => {
        agregar(this.fechaDesdeValor(it?.fechaInicio));
        agregar(this.fechaDesdeValor(it?.fechaFin));
      });
      (this.etapas || []).forEach(et => {
        agregar(this.fechaDesdeValor(et?.fechaInicio));
        agregar(this.fechaDesdeValor(et?.fechaFin));
      });
    }

    return {
      desde: this.minFecha(...inicioFin),
      hasta: this.maxFecha(...inicioFin)
    };
  }

  prevSemanaDisabled(): boolean {
    const rango = this.rangoFechasFiltro();
    if (!rango.desde) return false;
    const actual = this.computeWeeklyRangeWithOffset(this.filtroSemana);
    const inicioActual = this.fechaDesdeValor(actual.from);
    return !!(inicioActual && inicioActual.getTime() <= rango.desde.getTime());
  }

  nextSemanaDisabled(): boolean {
    const rango = this.rangoFechasFiltro();
    if (!rango.hasta) return false;
    const actual = this.computeWeeklyRangeWithOffset(this.filtroSemana);
    const finActual = this.fechaDesdeValor(actual.to);
    return !!(finActual && finActual.getTime() >= rango.hasta.getTime());
  }

  private determinarSemanaBase(iteraciones: any[]): Date | null {
    if (this.filtroEtapa && this.etapas?.length) {
      const etapa = this.etapas.find(e => Number(e?.idEtapa) === Number(this.filtroEtapa));
      const inicioEtapa = this.fechaDesdeValor(etapa?.fechaInicio);
      if (inicioEtapa) return inicioEtapa;
      const finEtapa = this.fechaDesdeValor(etapa?.fechaFin);
      if (finEtapa) return finEtapa;
    }
    if (this.filtroIteracion && iteraciones.length) {
      const iter = iteraciones.find(it => Number(it?.idIteracion) === Number(this.filtroIteracion));
      const inicio = this.fechaDesdeValor(iter?.fechaInicio);
      if (inicio) return inicio;
      const fin = this.fechaDesdeValor(iter?.fechaFin);
      if (fin) return fin;
    }
    if (this.filtroEtapa && iteraciones.length) {
      const fechasInicio = iteraciones
        .map(it => this.fechaDesdeValor(it?.fechaInicio))
        .filter((d): d is Date => !!d)
        .sort((a, b) => a.getTime() - b.getTime());
      if (fechasInicio.length) return fechasInicio[0];
      const fechasFin = iteraciones
        .map(it => this.fechaDesdeValor(it?.fechaFin))
        .filter((d): d is Date => !!d)
        .sort((a, b) => a.getTime() - b.getTime());
      if (fechasFin.length) return fechasFin[0];
    }
    return null;
  }

  private obtenerSemanaBaseGlobal(iteraciones: any[]): Date | null {
    const fechas = iteraciones
      .map(it => this.fechaDesdeValor(it?.fechaInicio))
      .filter((d): d is Date => !!d)
      .sort((a, b) => a.getTime() - b.getTime());
    if (fechas.length) return fechas[0];

    if (this.etapas?.length) {
      const etapasOrdenadas = [...this.etapas]
        .map(et => this.fechaDesdeValor(et?.fechaInicio))
        .filter((d): d is Date => !!d)
        .sort((a, b) => a.getTime() - b.getTime());
      if (etapasOrdenadas.length) return etapasOrdenadas[0];
    }
    return null;
  }

  private cacheKeyFromParams(params: string): string {
    return params && params.length ? params : '__all__';
  }

  private tareasCacheKey(): string {
    return this.proyectoId ? `proyecto:${this.proyectoId}` : 'all';
  }

  private aplicarRestriccionFiltroTiempo() {
    const hoy = this.normalizarFecha(new Date());
    let forzarTodo = false;
    const iteraciones = this.iteraciones || [];
    if (this.filtroIteracion && iteraciones.length) {
      const iter = iteraciones.find(it => Number(it?.idIteracion) === Number(this.filtroIteracion));
      const fin = this.fechaDesdeValor(iter?.fechaFin);
      if (fin && fin < hoy) {
        forzarTodo = true;
      }
    } else if (this.filtroEtapa && iteraciones.length) {
      const fechas = iteraciones
        .map(it => this.fechaDesdeValor(it?.fechaFin))
        .filter((fin): fin is Date => !!fin);
      if (fechas.length && fechas.every(fin => fin < hoy)) {
        forzarTodo = true;
      }
    }

    this.soloFiltroTodo = forzarTodo;
    if (this.soloFiltroTodo && this.filtroTiempo !== 'all') {
      this.filtroTiempo = 'all';
    }

    const esFiltroGlobal = !this.filtroEtapa && !this.filtroIteracion && this.filtroTiempo === 'all';
    if (this.soloFiltroTodo) {
      const baseInicial = this.determinarSemanaBase(iteraciones);
      if (baseInicial && (!this.semanaBase || this.semanaBase.getTime() !== baseInicial.getTime())) {
        this.semanaBase = baseInicial;
      }
      this.filtroSemana = 0;
      this.actualizarSemanaActual();
    } else if (esFiltroGlobal) {
      const baseGlobal = this.obtenerSemanaBaseGlobal(iteraciones);
      if (baseGlobal && (!this.semanaBase || this.semanaBase.getTime() !== baseGlobal.getTime())) {
        this.semanaBase = baseGlobal;
        this.filtroSemana = 0;
        this.actualizarSemanaActual();
      }
    } else {
      this.semanaBase = null;
      this.filtroSemana = 0;
      this.actualizarSemanaActual();
    }
  }

  private clearDataCaches() {
    this.cacheHorasIteracion.clear();
    this.cacheHorasCategoria.clear();
    this.cacheHorasDia.clear();
    this.cacheHorasEtapa.clear();
    this.cacheTareas.clear();
    this.lastIterParamsKey = null;
    this.lastTareasCacheKey = null;
  }

  private parseDateInput(value: any): number | null {
    if (!value) return null;
    const date = new Date(value);
    const time = date.getTime();
    return Number.isFinite(time) ? time : null;
  }

  private calcularIteracionesEnRango(range: { from: string | null; to: string | null } | null): Set<number> | null {
    if (!range || (!range.from && !range.to)) return null;
    if (!this.iteraciones?.length) return null;
    const fromTime = range.from ? this.parseDateInput(range.from) : null;
    const toTime = range.to ? this.parseDateInput(range.to) : null;
    if (fromTime === null && toTime === null) return null;
    const result = new Set<number>();
    this.iteraciones.forEach((it: any) => {
      const iterId = Number(it?.idIteracion);
      if (!Number.isFinite(iterId)) return;
      const startTime = this.parseDateInput(it?.fechaInicio);
      const endTime = this.parseDateInput(it?.fechaFin);
      if (startTime === null && endTime === null) {
        result.add(iterId);
        return;
      }
      const iterStart = startTime ?? endTime ?? null;
      const iterEnd = endTime ?? startTime ?? null;
      const overlaps =
        (!fromTime || (iterEnd !== null && iterEnd >= fromTime)) &&
        (!toTime || (iterStart !== null && iterStart <= toTime));
      if (overlaps) result.add(iterId);
    });
    return result;
  }

  private setsIguales(a: Set<number> | null, b: Set<number> | null): boolean {
    if (a === b) return true;
    if (!a || !b) return false;
    if (a.size !== b.size) return false;
    for (const val of a) {
      if (!b.has(val)) return false;
    }
    return true;
  }

  private actualizarIteracionesRango(range: { from: string | null; to: string | null }) {
    const nuevos = this.calcularIteracionesEnRango(range);
    if (this.setsIguales(this.iteracionesRangoActual, nuevos)) return;
    this.iteracionesRangoActual = nuevos;
    this.reapplyIteracionFilters();
    this.reapplyTareasFilters();
  }

  private reapplyIteracionFilters() {
    if (!this.lastIterParamsKey) return;
    const cached = this.cacheHorasIteracion.get(this.lastIterParamsKey);
    if (cached) {
      this.actualizarHorasIteracionDesdeRows(cached);
    }
  }

  private reapplyTareasFilters() {
    if (!this.lastTareasCacheKey) return;
    const cached = this.cacheTareas.get(this.lastTareasCacheKey);
    if (cached) {
      this.procesarTareasDesdeCache(cached);
    }
  }

  private filtrarHorasIteracionRows(rows: any[]): any[] {
    if (!Array.isArray(rows)) return [];
    let result = rows;
    if (this.filtroIteracion) {
      result = result.filter(r => this.obtenerIteracionId(r) === this.filtroIteracion);
    }
    const iterSet = this.iteracionesRangoActual;
    if (iterSet) {
      result = result.filter(r => {
        const iterId = this.obtenerIteracionId(r);
        return iterId !== null && iterSet.has(iterId);
      });
    }
    return result;
  }

  private actualizarHorasIteracionDesdeRows(rows: any[]) {
    this.loadingHorasIteracion = false;
    const filtered = this.filtrarHorasIteracionRows(rows || []);
    this.horasIteracionRows = filtered;
    this.actualizarHorasIteracionChart();
  }

  private procesarTareasDesdeCache(ts: any[]) {
    const filtrar = (t: any) => {
      if (this.filtroIteracion && t.iteracionId !== this.filtroIteracion) return false;
      if (this.proyectoId && this.iteraciones?.length) {
        const ids = new Set(this.iteraciones.map(it => it.idIteracion));
        if (!ids.has(t.iteracionId)) return false;
      }
      return true;
    };
    let tareas = (ts || []).filter(filtrar);
    const iterSet = this.iteracionesRangoActual;
    if (iterSet) {
      tareas = tareas.filter(t => iterSet.has(Number(t?.iteracionId)));
    }
    const estimadasMap = new Map<number, number>();
    tareas.forEach(t => {
      const iterId = Number(t?.iteracionId);
      const horas = Number(t?.horasEstimadas || 0);
      if (!Number.isFinite(iterId) || !horas) return;
      estimadasMap.set(iterId, (estimadasMap.get(iterId) || 0) + horas);
    });
    this.horasEstimadasPorIteracion = estimadasMap;
    this.actualizarHorasIteracionChart();
    this.totalTareas = tareas.length;
    const completadas = tareas.filter(t => /completad|finalizad/i.test(t.estado || ''));
    this.tareasCompletadas = completadas.length;

    const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const hoy = startOfDay(new Date());
    const limite = new Date(hoy);
    limite.setDate(limite.getDate() + 7);
    const esPendiente = (t: any) => !(/completad|finalizad/i.test((t.estado || '').toLowerCase()));
    const parseFecha = (s: any) => {
      try {
        if (!s) return null;
        const d = new Date(s);
        return isNaN(d.getTime()) ? null : startOfDay(d);
      } catch { return null; }
    };
    const iterPorId = new Map<number, any>();
    (this.iteraciones || []).forEach(it => {
      const id = Number(it?.idIteracion);
      if (Number.isFinite(id)) iterPorId.set(id, it);
    });
    const pendientes = tareas.filter(esPendiente);
    const iterActivas = (this.iteraciones || []).filter(it => {
      const ini = parseFecha(it?.fechaInicio);
      const fin = parseFecha(it?.fechaFin);
      if (!ini && !fin) return false;
      const inicioOK = ini ? ini.getTime() <= hoy.getTime() : true;
      const finOK = fin ? fin.getTime() >= hoy.getTime() : true;
      return inicioOK && finOK;
    });
    const hayIteracionVigente = iterActivas.length > 0;
    let iteracionesVigentes: Set<number> | null = null;
    if (this.iteracionesRangoActual) {
      iteracionesVigentes = this.iteracionesRangoActual;
    } else if (iterActivas.length) {
      iteracionesVigentes = new Set(iterActivas.map(it => Number(it?.idIteracion)).filter(id => Number.isFinite(id)));
    }
    const perteneceAIterVigente = (t: any) => {
      if (!iteracionesVigentes) return true;
      return iteracionesVigentes.has(Number(t?.iteracionId));
    };

    if (hayIteracionVigente) {
      this.atrasadasCount = pendientes.filter(t => {
        const f = parseFecha(t.fechaFin);
        return !!f && f < hoy && perteneceAIterVigente(t);
      }).length;
      this.proximasCount = pendientes.filter(t => {
        const f = parseFecha(t.fechaFin);
        return !!f && f >= hoy && f <= limite && perteneceAIterVigente(t);
      }).length;
    } else {
      this.atrasadasCount = 0;
      this.proximasCount = 0;
    }

    this.tareasNoFinalizadas = pendientes.filter(t => {
      const iterId = Number(t?.iteracionId);
      const iter = iterPorId.get(iterId);
      const finIter = parseFecha(iter?.fechaFin);
      return !!finIter && finIter < hoy;
    });

    const estimadas = tareas.map(t => t.horasEstimadas || 0).reduce((a: number, b: number) => a + b, 0);
    const reales = this.totalHoras;
    if (estimadas > 0) {
      const rawPct = Math.round((reales / estimadas) * 100);
      this.eficiencia = Math.max(0, rawPct);
    } else {
      this.eficiencia = 0;
    }

    const porUserMap = new Map<string, number>();
    tareas.forEach(t => {
      const key = (t.usuarioNombre || 'Sin usuario');
      porUserMap.set(key, (porUserMap.get(key) || 0) + 1);
    });
    const formatTareas = (valor: number) => {
      const cantidad = Math.round(Number(valor) || 0);
      return `${cantidad} ${cantidad === 1 ? 'tarea' : 'tareas'}`;
    };
    this.renderBar(
      'chartTareasUser',
      Array.from(porUserMap.keys()),
      Array.from(porUserMap.values()),
      '#ffc107',
      '#ffe08a',
      true,
      false,
      false,
      'Tareas por Usuario',
      'Cantidad de Tareas',
      'Usuarios',
      formatTareas
    );
    this.tareasUsuarioDetalle = Array.from(porUserMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([usuario, cantidad]) => ({ usuario, cantidad }));

    try {
      const cards = document.querySelectorAll('.row.mb-5.g-4.justify-content-between .col-md-6');
      const proximasCard = cards && cards.length > 1 ? cards[1] as HTMLElement : null;
      const titleEl = proximasCard?.querySelector('h4.mb-2');
      if (titleEl && titleEl.textContent && titleEl.textContent.trim().startsWith('Pr')) {
        titleEl.textContent = 'Proximos vencimientos';
      }
      const spanEl = proximasCard?.querySelector('span.fs-5');
      if (spanEl) {
        if (this.proximasCount > 0) {
          spanEl.classList.remove('text-muted');
          spanEl.textContent = `${this.proximasCount} ${this.proximasCount === 1 ? 'tarea proxima a vencer' : 'tareas proximas a vencer'}`;
        } else {
          spanEl.classList.add('text-muted');
          spanEl.textContent = 'No hay tareas proximas a vencer';
        }
      }
    } catch { }
    this.loadingTareasData = false;
  }

  /* private computeWeeklyRange(): { from: string, to: string } {
     const today = new Date();
     const clone = (d: Date) => new Date(d.getTime());
     const addDays = (d: Date, n: number) => { const x = clone(d); x.setDate(x.getDate() + n); return x; };
     const startOfWeek = () => {
       const d = clone(today);
       const day = d.getDay();
       const diff = (day === 0 ? -6 : 1) - day;
       return addDays(d, diff);
     };
     const from = this.formatLocalDate(startOfWeek());
     const to = this.formatLocalDate(today);
     return { from, to };
   }*/

  private destroyCharts() {
    this.charts.forEach(c => { try { c.destroy(); } catch { } });
    this.charts.clear();
    this.chartsWithData.clear();
  }

  private destroyChartByCanvasId(elId: string) {
    if (this.charts.has(elId)) {
      try {
        this.charts.get(elId)?.destroy();
      } catch { }
      this.charts.delete(elId);
      this.chartsWithData.delete(elId);
    }
  }

  private renderBar(
    elId: string,
    labels: string[],
    data: number[],
    colorStart: string,
    colorEnd: string,
    horizontal = false,
    showMinutes = false,
    stacked = false,
    titleChart: string = '',
    labelX: string = '',
    labelY: string = '',
    valueFormatter?: (value: number, ctx?: any) => string,
    tooltipExtra?: (ctx: any) => string | null
  ) {
    this.renderBarMulti(
      elId,
      labels,
      [{ label: '', data, colorStart, colorEnd, showMinutes, valueFormatter }],
      horizontal,
      stacked,
      titleChart,
      labelX,
      labelY,
      tooltipExtra
    );
  }

  private renderBarMulti(
    elId: string,
    labels: string[],
    datasetsConfig: Array<{ label: string; data: number[]; colorStart: string; colorEnd: string; showMinutes?: boolean; valueFormatter?: (value: number, ctx?: any) => string }>,
    horizontal = false,
    stacked = false,
    titleChart: string = '',
    labelX: string = '',
    labelY: string = '',
    tooltipExtra?: (ctx: any) => string | null
  ) {
    const canvas: any = document.getElementById(elId);
    if (!canvas) return;
    this.destroyChartByCanvasId(elId);
    const ctx = canvas.getContext('2d');
    const gradientFactory = () => {
      const gradient = ctx.createLinearGradient(0, 0, horizontal ? 200 : 0, horizontal ? 0 : 200);
      return gradient;
    };
    const datasets = datasetsConfig.map(cfg => {
      const gradient = gradientFactory();
      gradient.addColorStop(0, cfg.colorStart);
      gradient.addColorStop(1, cfg.colorEnd);
      const dataset: any = {
        label: cfg.label,
        data: cfg.data,
        backgroundColor: gradient,
        borderRadius: 8,
        maxBarThickness: 36,
        categoryPercentage: 0.7,
        barPercentage: 0.7
      };
      if (cfg.showMinutes) dataset.showMinutes = true;
      if (cfg.valueFormatter) dataset.valueFormatter = cfg.valueFormatter;
      return dataset;
    });
    const showLegend = datasetsConfig.some(ds => ds.label && ds.label.trim().length > 0);
    const chart = new Chart(ctx, {
      type: 'bar',
      data: { labels, datasets },
      options: {
        indexAxis: horizontal ? 'y' : 'x',
        responsive: true,
        plugins: {
          title: {
            display: !!titleChart,
            text: titleChart,
            font: { size: 14, weight: '600' },
            color: '#212529',
            padding: { bottom: 20 }
          },
          legend: { display: showLegend, position: 'top' },
          tooltip: {
            ...this.tooltipStyle(),
            callbacks: {
              label: (ctx: any) => {
                const rawValue = horizontal ? ctx.parsed.x : ctx.parsed.y;
                const numericValue = Number(rawValue ?? 0);
                const prefix = ctx.dataset?.label ? `${ctx.dataset.label}: ` : '';
                if (typeof ctx.dataset?.valueFormatter === 'function') {
                  const custom = ctx.dataset.valueFormatter(numericValue, ctx);
                  let formattedCustom = `${prefix}${custom}`;
                  if (tooltipExtra) {
                    const extra = tooltipExtra(ctx);
                    if (extra) formattedCustom += ` a ${extra}`;
                  }
                  return formattedCustom;
                }
                const hours = Math.round(numericValue * 100) / 100;
                let formatted = `${prefix}${hours} h`;
                if (ctx.dataset?.showMinutes) {
                  const minutos = Math.round(hours * 60);
                  formatted += ` (${minutos} min)`;
                }
                if (tooltipExtra) {
                  const extra = tooltipExtra(ctx);
                  if (extra) formatted += ` a ${extra}`;
                }
                return formatted;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0,0,0,0.06)' },
            ticks: { font: { size: 11 } },
            stacked,
            title: {
              display: !!labelY,
              text: labelY,
              font: { size: 12, weight: '600' },
              color: '#495057'
            }
          },
          x: {
            grid: { display: false },
            ticks: { font: { size: 11 }, maxRotation: 60, minRotation: 40 },
            stacked,
            title: {
              display: !!labelX,
              text: labelX,
              font: { size: 12, weight: '600' },
              color: '#495057'
            }
          }
        }
      }
    });
    this.charts.set(elId, chart);
    const hasData = datasetsConfig.some(cfg => (cfg.data || []).some(val => (val || 0) > 0));
    if (hasData) {
      this.chartsWithData.add(elId);
    }
  }

  private renderHorasPorDiaTareaChart(rows: any[]) {
    if (!rows || !rows.length) {
      this.destroyChartByCanvasId('chartHorasDiaTarea');
      this.destroyChartByCanvasId('chartHorasIterDistrib');
      this.horasDiaDetalle = [];
      this.horasTareaDetalle = [];
      return;
    }
    const dayMap = new Map<string, Map<string, number>>();
    const totalPorTarea = new Map<string, number>();
    const totalPorDia = new Map<string, number>();
    const fechasPorDia = new Map<string, string>(); // Agregar map para fechas

    rows.forEach(row => {
      const dia = this.nombreDiaDesdeFecha(row?.fecha);
      if (!dia) return;
      const tarea = row?.tareaNombre || 'Sin tarea';
      const minutos = Number(row?.minutos || 0);
      if (!dayMap.has(dia)) dayMap.set(dia, new Map());
      const tareasDia = dayMap.get(dia)!;
      tareasDia.set(tarea, (tareasDia.get(tarea) || 0) + minutos);
      totalPorDia.set(dia, (totalPorDia.get(dia) || 0) + minutos);
      totalPorTarea.set(tarea, (totalPorTarea.get(tarea) || 0) + minutos);
      if (!fechasPorDia.has(dia)) {
        fechasPorDia.set(dia, this.formatLocalDate(new Date(`${row?.fecha}T00:00:00`)));
      }
    });
    if (!totalPorTarea.size) {
      this.destroyChartByCanvasId('chartHorasDiaTarea');
      this.destroyChartByCanvasId('chartHorasIterDistrib');
      return;
    }
    const labelsDias = this.diasSemanaOrden;
    const horasPorDia = labelsDias.map(dia => {
      const minutos = totalPorDia.get(dia) || 0;
      return Math.round(((minutos / 60) * 100)) / 100;
    });

    const labelsConFecha = labelsDias.map(dia => {
      const fecha = fechasPorDia.get(dia);
      return fecha ? `${dia}\n${fecha}` : dia;
    });

    this.renderBar(
      'chartHorasDiaTarea',
      labelsConFecha,
      horasPorDia,
      '#0d6efd',
      '#6ea8fe',
      false,
      true,
      false,
      'Horas por dia',
      'dias de la Semana',
      'Horas (h)'
    );
    const detalle = this.diasSemanaOrden.map(dia => {
      const tareasDia = dayMap.get(dia);
      const minutos = tareasDia ? Array.from(tareasDia.values()).reduce((acc, val) => acc + val, 0) : 0;
      const fecha = fechasPorDia.get(dia) || '';
      return {
        dia: fecha ? `${dia} (${fecha})` : dia,
        minutos,
        horas: Math.round(((minutos / 60) * 100)) / 100
      };
    });
    this.horasDiaDetalle = detalle;
    const tareasOrdenadas = Array.from(totalPorTarea.entries()).sort((a, b) => b[1] - a[1]);
    const tareasLabels = tareasOrdenadas.map(entry => entry[0]);
    const tareasHoras = tareasOrdenadas.map(entry => Math.round(((entry[1] / 60) * 100)) / 100);
    this.renderBar(
      'chartHorasIterDistrib',
      tareasLabels,
      tareasHoras,
      '#20c997',
      '#7be0c3',
      true,
      true,
      false,
      'Horas por Tarea',
      'Horas (h)',
      'Tareas'
    );
    this.horasTareaDetalle = tareasOrdenadas.map(([tarea, minutos]) => ({
      tarea,
      minutos,
      horas: Math.round(((minutos / 60) * 100)) / 100
    }));
  }

  private renderHorasPorEtapaChart(rows: any[]) {
    const agregados = new Map<string, { nombre: string; minutos: number }>();
    const addEntrada = (idRaw: any, nombreRaw: any, minutosRaw: any) => {
      const nombre = nombreRaw || 'Sin etapa';
      const id = this.toNumber(idRaw);
      const key = Number.isFinite(id ?? NaN) ? `id-${id}` : `nombre-${nombre}`;
      const minutos = Number(minutosRaw || 0);
      if (agregados.has(key)) {
        agregados.get(key)!.minutos += minutos;
      } else {
        agregados.set(key, { nombre, minutos });
      }
    };
    (rows || []).forEach(row => addEntrada(row?.etapaId, row?.etapaNombre, row?.minutos));
    if (this.etapas?.length) {
      this.etapas.forEach(et => {
        const id = this.toNumber(et?.idEtapa);
        const nombre = et?.nombre || 'Sin etapa';
        const key = Number.isFinite(id ?? NaN) ? `id-${id}` : `nombre-${nombre}`;
        if (!agregados.has(key)) {
          agregados.set(key, { nombre, minutos: 0 });
        }
      });
    }
    if (!agregados.size) {
      this.destroyChartByCanvasId('chartHorasEtapa');
      return;
    }
    const ordered: Array<{ nombre: string; minutos: number }> = [];
    if (this.etapas?.length) {
      this.etapas.forEach(et => {
        const id = this.toNumber(et?.idEtapa);
        const nombre = et?.nombre || 'Sin etapa';
        const key = Number.isFinite(id ?? NaN) ? `id-${id}` : `nombre-${nombre}`;
        const entry = agregados.get(key);
        if (entry) {
          ordered.push(entry);
          agregados.delete(key);
        }
      });
    }
    agregados.forEach(entry => ordered.push(entry));
    const labels = ordered.map(e => e.nombre);
    const minutos = ordered.map(e => e.minutos);
    const horas = minutos.map(min => Math.round(((min / 60) * 100)) / 100);
    this.renderPie(
      'chartHorasEtapa',
      labels,
      horas,
      minutos,
      'Horas por Fase (Etapa)'
    );
  }

  private renderPie(
    elId: string,
    labels: string[],
    data: number[],
    minutos?: number[],
    titleChart: string = ''
  ) {
    const canvas: any = document.getElementById(elId);
    if (!canvas) return;
    this.destroyChartByCanvasId(elId);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const total = data.reduce((a, b) => a + b, 0);
    const width = canvas.width || canvas.clientWidth || 300;
    const height = canvas.height || canvas.clientHeight || 300;
    const gradients = labels.map((_, idx) => {
      if (!ctx) return '#0d6efd';
      const colors = this.gradientPalette[idx % this.gradientPalette.length];
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, colors.start);
      gradient.addColorStop(1, colors.end);
      return gradient;
    });
    const percentages = data.map(value => {
      const pct = total > 0 ? (value / total) * 100 : 0;
      return Math.round(pct * 10) / 10;
    });
    const labelsWithPercent = labels.map((label, idx) => {
      const value = percentages[idx] ?? 0;
      const formatted = Number.isInteger(value) ? value.toString() : value.toFixed(1);
      return `${label} (${formatted}%)`;
    });
    const totalRounded = Math.round(total * 10) / 10;
    const totalLabel = Number.isInteger(totalRounded) ? `${totalRounded} h` : `${totalRounded.toFixed(1)} h`;
    const centerText = {
      id: 'centerText',
      afterDraw(c: any) {
        const { ctx, chartArea: { width, height } } = c;
        ctx.save();
        ctx.font = '600 16px system-ui, -apple-system, Segoe UI, Roboto';
        ctx.fillStyle = '#212529';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(totalLabel, width / 2, height / 2);
        ctx.restore();
      }
    };
    const percentLabels = {
      id: 'percentLabels',
      afterDatasetsDraw(c: any) {
        const { ctx } = c;
        const meta = c.getDatasetMeta(0);
        if (!meta?.data?.length) return;
        ctx.save();
        ctx.font = '600 12px system-ui, -apple-system, Segoe UI, Roboto';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        meta.data.forEach((arc: any, idx: number) => {
          const pct = percentages[idx] ?? 0;
          if (pct <= 0) return;
          const formatted = pct >= 10 ? Math.round(pct).toString() : (Math.round(pct * 10) / 10).toFixed(1);
          const text = `${formatted}%`;
          const { x, y } = arc.tooltipPosition();
          ctx.fillStyle = '#212529';
          ctx.strokeStyle = 'rgba(255,255,255,0.7)';
          ctx.lineWidth = 3;
          ctx.strokeText(text, x, y);
          ctx.fillText(text, x, y);
        });
        ctx.restore();
      }
    };
    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labelsWithPercent,
        datasets: [{
          data,
          backgroundColor: gradients,
          ...(minutos ? { minutosData: minutos } : {})
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: !!titleChart,
            text: titleChart,
            font: { size: 14, weight: '600' },
            color: '#212529',
            padding: { bottom: 20 }
          },
          legend: { position: 'bottom' },
          tooltip: {
            ...this.tooltipStyle(),
            callbacks: {
              label: (ctx: any) => {
                const value = ctx.parsed ?? 0;
                const hours = Math.round(value * 100) / 100;
                let minutesText = '';
                const datasetMinutes: number[] | undefined = (ctx.dataset as any)?.minutosData;
                if (Array.isArray(datasetMinutes)) {
                  const minVal = datasetMinutes[ctx.dataIndex];
                  if (typeof minVal === 'number') {
                    minutesText = ` (${minVal} min)`;
                  }
                } else {
                  const minVal = Math.round(hours * 60);
                  minutesText = ` (${minVal} min)`;
                }
                const label = ctx.label ? `${ctx.label}: ` : '';
                return `${label}${hours} h${minutesText}`;
              }
            }
          }
        },
        cutout: '60%'
      },
      plugins: [centerText, percentLabels]
    });
    this.charts.set(elId, chart);
    if (data.some(val => (val || 0) > 0)) {
      this.chartsWithData.add(elId);
    }
  }

  private nombreDiaDesdeFecha(value: any): string | null {
    if (!value) return null;
    const date = typeof value === 'string' ? new Date(`${value}T00:00:00`) : new Date(value);
    if (isNaN(date.getTime())) return null;
    const index = date.getDay();
    return this.diaPorIndice[index] || null;
  }

  private toNumber(value: any): number | null {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private tooltipStyle() {
    return {
      backgroundColor: '#1d1f24',
      borderColor: 'rgba(255,255,255,0.1)',
      borderWidth: 1,
      titleColor: '#ffffff',
      bodyColor: '#f8f9fa',
      titleFont: { size: 13, weight: '600' },
      bodyFont: { size: 12 },
      padding: 12,
      cornerRadius: 10,
      displayColors: true,
      boxPadding: 6,
      caretSize: 7
    };
  }

  private formatLocalDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  chartDataDisponibles(canvasId: string): boolean {
    return this.chartsWithData.has(canvasId);
  }

  mostrarDetalle(tipo: DetalleTipo) {
    this.detalleAbierto = tipo;
  }

  cerrarDetalle() {
    this.detalleAbierto = null;
  }

  onFiltroEtapaChange() {
    this.filtroIteracion = null;
    this.filtroSemana = 0;
    this.semanaBase = null;
    this.reload(true);
  }

  onFiltroIteracionChange() {
    this.filtroSemana = 0;
    this.semanaBase = null;
    this.reload(true);
  }

  onFiltroTiempoChange() {
    this.reload(true);
  }

  detalleTituloActual(): string {
    switch (this.detalleAbierto) {
      case 'horasIteracion': return 'Detalle de estimacion vs ejecucion';
      case 'horasCategoria': return 'Detalle de horas por categoria';
      case 'tareasUsuario': return 'Tareas por usuario';
      case 'horasDiaTarea': return 'Horas por dia (semana actual)';
      case 'horasTarea': return 'Horas por tarea';
      default: return '';
    }
  }

  private nombreEtapaDeIteracion(iteracionId?: number | null): string | null {
    if (!iteracionId || !this.iteraciones?.length) return null;
    const iter = this.iteraciones.find((it: any) => Number(it?.idIteracion) === Number(iteracionId));
    return iter?.etapaNombre || null;
  }

  private obtenerIteracionId(row: any): number | null {
    if (!row) return null;
    const raw = row.iteracionId ?? row.idIteracion ?? row.id;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  }

  iteracionLabel(item: any): string {
    if (!item) return 'Todas las iteraciones';
    const numero = item?.numero ? `Iteracion ${item.numero}` : (item?.nombre || 'Iteracion');
    const etapa = !this.filtroEtapa && item?.etapaNombre ? ` (${item.etapaNombre})` : '';
    return `${numero}${etapa}`;
  }


  abrirGrafico(id: string) {
    this.detalleGrafico = id;

    setTimeout(() => {
      const originalChart = this.charts.get(id);
      if (!originalChart) {
        console.error(`GrAfico con ID ${id} no encontrado`);
        return;
      }

      const canvas = document.getElementById('graficoDetalle') as HTMLCanvasElement;
      if (!canvas) {
        console.error('Canvas graficoDetalle no encontrado');
        return;
      }

      // Destruir grAfico previo si existe
      if (this.graficoAmpliado) {
        try {
          this.graficoAmpliado.destroy();
        } catch { }
        this.graficoAmpliado = null;
      }

      // Obtener contexto del canvas
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clonar solo los datos, NO la configuracion completa
      const configOriginal = originalChart.config;
      const configClonada: any = {
        type: configOriginal.type,
        data: {
          labels: [...(configOriginal.data?.labels || [])],
          datasets: (configOriginal.data?.datasets || []).map((dataset: any) => ({
            label: dataset.label,
            data: [...dataset.data],
            backgroundColor: dataset.backgroundColor,
            borderColor: dataset.borderColor,
            borderRadius: dataset.borderRadius,
            maxBarThickness: dataset.maxBarThickness,
            categoryPercentage: dataset.categoryPercentage,
            barPercentage: dataset.barPercentage,
            showMinutes: dataset.showMinutes,
            cutout: dataset.cutout
          }))
        },
        options: configOriginal.options,
        plugins: configOriginal.plugins
      };

      // Crear grAfico nuevo en el modal
      this.graficoAmpliado = new Chart(ctx, configClonada);
    }, 150);
  }

  // ...existing code...

  cerrarGrafico() {
    if (this.graficoAmpliado) {
      this.graficoAmpliado.destroy();
      this.graficoAmpliado = null;
    }
    this.detalleGrafico = null;
  }

  tituloGrafico(id: string): string {
    const titulos: any = {
      'chartHorasIter': 'Estimacion vs ejecucion',
      'chartHorasIterDistrib': 'Horas por tarea',
      'chartTareasUser': 'Tareas por usuario',
      'chartHorasDiaTarea': 'Horas por dia',
      'chartHorasCategoria': 'Horas por categoria',
      'chartHorasEtapa': 'Horas por etapa'
    };
    return titulos[id] || 'GrAfico';
  }

  descargarGrafico(id: string) {
    const chart = this.charts.get(id);
    if (!chart) {
      console.error(`GrAfico con ID ${id} no encontrado`);
      return;
    }

    try {
      // Obtener la imagen en base64
      const imageUrl = chart.toBase64Image();

      // Crear un elemento <a> temporal para descargar
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `grafico-${id}-${this.formatLocalDate(new Date())}.png`;

      // Disparar la descarga
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error al descargar grAfico:', error);
    }
  }

  descargarGraficoAmpliado() {
    if (!this.graficoAmpliado) {
      console.error('No hay grAfico ampliado para descargar');
      return;
    }

    try {
      const imageUrl = this.graficoAmpliado.toBase64Image();

      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `grafico-ampliado-${this.detalleGrafico}-${this.formatLocalDate(new Date())}.png`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error al descargar grAfico ampliado:', error);
    }
  }

}
