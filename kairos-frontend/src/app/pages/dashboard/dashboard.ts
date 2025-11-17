import { AfterViewInit, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EtapaService } from '../../services/etapa.service';
import { IteracionService } from '../../services/iteracion.service';
import { TaskService } from '../../services/tarea.service';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterModule } from '@angular/router';

declare const Chart: any;

type DetalleTipo = 'horasIteracion' | 'horasCategoria' | 'tareasUsuario' | 'horasDiaTarea';

interface HorasIteracionDetalle {
  etiqueta: string;
  horas: number;
  minutos: number;
  etapa?: string | null;
  estimadas: number;
}

interface HorasCategoriaDetalle {
  categoria: string;
  horas: number;
  minutos: number;
}

interface TareasUsuarioDetalle {
  usuario: string;
  cantidad: number;
}

interface HorasDiaDetalle {
  dia: string;
  horas: number;
  minutos: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './dashboard.html'
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  private etapaService = inject(EtapaService);
  private iteracionService = inject(IteracionService);
  private taskService = inject(TaskService);
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);

  etapas: any[] = [];
  iteraciones: any[] = [];
  filtroEtapa: number | null = null;
  filtroIteracion: number | null = null;
  filtroTiempo: 'today' | 'week' | 'month' | 'quarter' | 'all' = 'week';
  proyectoId: number | null = null;

  // métricas
  totalTareas = 0;
  tareasCompletadas = 0;
  totalHoras = 0; // horas reales (minutos agregados / 60)
  eficiencia = 0; // (reales/estimadas)*100 si hay estimadas
  proyectoNombre: string | null = null;
  atrasadasCount = 0;
  proximasCount = 0;

  private charts: any[] = [];
  private chartsWithData = new Set<string>();
  detalleAbierto: DetalleTipo | null = null;
  horasIteracionDetalle: HorasIteracionDetalle[] = [];
  horasCategoriaDetalle: HorasCategoriaDetalle[] = [];
  tareasUsuarioDetalle: TareasUsuarioDetalle[] = [];
  horasDiaDetalle: HorasDiaDetalle[] = [];
  private horasIteracionRows: any[] = [];
  private horasEstimadasPorIteracion = new Map<number, number>();
  private iteracionActivaId: number | null = null;
  private semanaBaseDate: Date | null = null;
  semanaOffset = 0;
  semanaLabel = '';
  semanaMaxOffset = 0;
  private readonly diasSemanaOrden = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];
  private readonly diaPorIndice = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
  private readonly mesesCortos = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

  ngOnInit(): void {
    this.route.paramMap.subscribe(pm => {
      const id = pm.get('id');
      this.proyectoId = id ? Number(id) : null;
      const data: any = this.route.snapshot.data;
      this.proyectoNombre = data?.['proyecto']?.nombre || null;
      this.cargarIteracionActiva(this.proyectoId);
      if (this.proyectoId) {
        this.etapaService.getEtapasPorProyecto(this.proyectoId).subscribe(e => this.etapas = e || []);
        this.iteracionService.getIteracionesPorProyectoId(this.proyectoId).subscribe(it => {
          this.iteraciones = it || [];
          this.actualizarBaseSemanaPorFiltro();
        });
      } else {
        this.etapaService.getEtapas().subscribe(e => this.etapas = e || []);
        this.iteracionService.getIteraciones().subscribe(it => {
          this.iteraciones = it || [];
          this.actualizarBaseSemanaPorFiltro();
        });
      }
    });
  }

  ngAfterViewInit(): void {
    // Cargar datos iniciales
    setTimeout(() => this.reload(), 0);
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }

  reload() {
    this.destroyCharts();
    this.semanaOffset = 0;
    this.semanaLabel = '';
    this.actualizarBaseSemanaPorFiltro();
    if (this.filtroEtapa) {
      this.iteracionService.getIteracionesPorEtapaId(this.filtroEtapa).subscribe(it => {
        this.iteraciones = it || [];
        this.actualizarBaseSemanaPorFiltro();
      });
    } else if (this.proyectoId) {
      this.iteracionService.getIteracionesPorProyectoId(this.proyectoId).subscribe(it => {
        this.iteraciones = it || [];
        this.actualizarBaseSemanaPorFiltro();
      });
    } else {
      this.iteracionService.getIteraciones().subscribe(it => {
        this.iteraciones = it || [];
        this.actualizarBaseSemanaPorFiltro();
      });
    }
    // 1) datasets desde backend de tiempos (reales)
    const range = this.computeRange();
    const iterParams = new URLSearchParams();
    if (this.filtroEtapa) iterParams.set('etapaId', String(this.filtroEtapa));
    else if (this.proyectoId) iterParams.set('proyectoId', String(this.proyectoId));
    if (range.from && range.to) { iterParams.set('from', range.from); iterParams.set('to', range.to); }
    const paramsIter = iterParams.toString() ? `?${iterParams.toString()}` : '';
    this.http.get<any[]>(`http://localhost:8080/api/tiempos/horas-por-iteracion${paramsIter}`).subscribe(rows => {
      this.horasIteracionRows = rows || [];
      this.actualizarHorasIteracionChart();
    });

    const categoriaParams = new URLSearchParams();
    if (this.filtroIteracion) categoriaParams.set('iteracionId', String(this.filtroIteracion));
    else if (this.proyectoId) categoriaParams.set('proyectoId', String(this.proyectoId));
    if (range.from && range.to) { categoriaParams.set('from', range.from); categoriaParams.set('to', range.to); }
    const paramsCategoria = categoriaParams.toString() ? `?${categoriaParams.toString()}` : '';
    this.http.get<any[]>(`http://localhost:8080/api/tiempos/horas-por-categoria${paramsCategoria}`).subscribe(rows => {
      const pairs = rows.map(r => ({
        categoria: r.categoriaNombre || 'Sin categoría',
        minutos: r.minutos || 0
      })).sort((a, b) => b.minutos - a.minutos);
      const labels = pairs.map(p => p.categoria);
      const dataHoras = pairs.map(p => Math.round(((p.minutos / 60) * 100)) / 100);
      const dataMinutos = pairs.map(p => p.minutos);
      this.renderPie('chartHorasCategoria', labels, dataHoras, dataMinutos);
      this.horasCategoriaDetalle = pairs.map(p => ({
        categoria: p.categoria,
        horas: Math.round(((p.minutos / 60) * 100)) / 100,
        minutos: p.minutos
      }));
    });

    this.fetchHorasPorDiaTarea();

    const etapaParams = new URLSearchParams();
    if (this.proyectoId) etapaParams.set('proyectoId', String(this.proyectoId));
    if (this.filtroIteracion) etapaParams.set('iteracionId', String(this.filtroIteracion));
    if (range.from && range.to) { etapaParams.set('from', range.from); etapaParams.set('to', range.to); }
    const paramsEtapa = etapaParams.toString() ? `?${etapaParams.toString()}` : '';
    this.http.get<any[]>(`http://localhost:8080/api/tiempos/horas-por-etapa${paramsEtapa}`).subscribe(rows => {
      this.renderHorasPorEtapaChart(rows || []);
    }, () => this.destroyChartByCanvasId('chartHorasEtapa'));

    // 2) tareas para métricas y gráficos complementarios
    const tareas$ = this.proyectoId ? this.taskService.getTareasPorProyecto(this.proyectoId) : this.taskService.getTareas();
    tareas$.subscribe(ts => {
      const filtrar = (t: any) => {
        if (this.filtroIteracion && t.iteracionId !== this.filtroIteracion) return false;
        if (this.proyectoId && this.iteraciones?.length) {
          const ids = new Set(this.iteraciones.map(it => it.idIteracion));
          if (!ids.has(t.iteracionId)) return false;
        }
        return true;
      };
      const tareas = (ts || []).filter(filtrar);
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

      // eficiencia simple: horas reales / estimadas
      // calcular atrasadas y próximas a vencer (7 días)
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
      const pendientes = tareas.filter(esPendiente);
      this.atrasadasCount = pendientes.filter(t => {
        const f = parseFecha(t.fechaFin);
        return !!f && f < hoy;
      }).length;
      this.proximasCount = pendientes.filter(t => {
        const f = parseFecha(t.fechaFin);
        return !!f && f >= hoy && f <= limite;
      }).length;

      const estimadas = tareas.map(t => t.horasEstimadas || 0).reduce((a: number, b: number) => a + b, 0);
      const reales = this.totalHoras; // ya en horas
      if (estimadas > 0) {
        const rawPct = Math.round((reales / estimadas) * 100);
        this.eficiencia = Math.max(0, rawPct);
      } else {
        this.eficiencia = 0;
      }

      // tareas por usuario
      const porUserMap = new Map<string, number>();
      tareas.forEach(t => {
        const key = (t.usuarioNombre || 'Sin usuario');
        porUserMap.set(key, (porUserMap.get(key) || 0) + 1);
      });
      const tareasUserLabels = Array.from(porUserMap.keys());
      const tareasUserData = Array.from(porUserMap.values());
      const tareasTooltipFormatter = (value: number | null | undefined, ctx: any) => {
        const cantidad = Math.round(value ?? 0);
        const label = ctx.label ? `${ctx.label}: ` : '';
        const sufijo = cantidad === 1 ? 'tarea' : 'tareas';
        return `${label}${cantidad} ${sufijo}`;
      };
      this.renderBar(
        'chartTareasUser',
        tareasUserLabels,
        tareasUserData,
        '#ffc107',
        '#ffe08a',
        true,
        false,
        false,
        tareasTooltipFormatter
      );
      this.tareasUsuarioDetalle = Array.from(porUserMap.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([usuario, cantidad]) => ({ usuario, cantidad }));

      // Actualiza el texto del card "Próximos vencimientos" en caso de que la plantilla tenga texto fijo
      try {
        const cards = document.querySelectorAll('.row.mb-5.g-4.justify-content-between .col-md-6');
        const proximasCard = cards && cards.length > 1 ? cards[1] as HTMLElement : null;
        const titleEl = proximasCard?.querySelector('h4.mb-2');
        if (titleEl && titleEl.textContent && titleEl.textContent.trim().startsWith('Pr')) {
          titleEl.textContent = 'Próximos vencimientos';
        }
        const spanEl = proximasCard?.querySelector('span.fs-5');
        if (spanEl) {
          if (this.proximasCount > 0) {
            spanEl.classList.remove('text-muted');
            spanEl.textContent = `${this.proximasCount} ${this.proximasCount === 1 ? 'tarea próxima a vencer' : 'tareas próximas a vencer'}`;
          } else {
            spanEl.classList.add('text-muted');
            spanEl.textContent = 'No hay tareas próximas a vencer';
          }
        }
      } catch {}
    });
  }

  private actualizarHorasIteracionChart() {
    const orderedIds: number[] = [];
    const pushId = (value: number | null | undefined) => {
      if (value === null || value === undefined) return;
      const numericId = Number(value);
      if (!Number.isFinite(numericId)) return;
      if (!orderedIds.includes(numericId)) orderedIds.push(numericId);
    };

    this.horasIteracionRows.forEach(row => pushId(this.obtenerIteracionId(row)));
    this.horasEstimadasPorIteracion.forEach((_, iterId) => pushId(iterId));

    const preferId = this.filtroIteracion ?? this.iteracionActivaId;
    let ids = orderedIds;
    if (typeof preferId === 'number' && Number.isFinite(preferId)) {
      const filtered = orderedIds.filter(id => id === preferId);
      if (filtered.length) {
        ids = filtered;
      }
    }

    if (!ids.length) {
      this.horasIteracionDetalle = [];
      this.destroyChartByCanvasId('chartHorasIter');
      this.destroyChartByCanvasId('chartHorasIterDistrib');
      this.totalHoras = 0;
      return;
    }

    const labels: string[] = [];
    const realesHoras: number[] = [];
    const estimadasHoras: number[] = [];
    const detalleRows: HorasIteracionDetalle[] = [];

    ids.forEach(iterId => {
      const row = this.horasIteracionRows.find(r => this.obtenerIteracionId(r) === iterId) || null;
      const iterInfo = this.iteraciones?.find((it: any) => Number(it?.idIteracion) === iterId);
      const numero = row?.numero ?? iterInfo?.numero;
      const nombre = row?.nombre;
      const chartLabel = numero ? `Iter ${numero}` : (nombre || `Iter ${iterId}`);
      const etapa = row?.etapaNombre || row?.etapa || this.nombreEtapaDeIteracion(iterId) || null;
      const minutos = row ? Number(row.minutos || 0) : 0;
      const horasReales = Math.round(((minutos / 60) * 100)) / 100;
      const horasEstimadasRaw = this.horasEstimadasPorIteracion.get(iterId) ?? 0;
      const horasEstimadas = Math.round((horasEstimadasRaw) * 10) / 10;

      labels.push(chartLabel);
      realesHoras.push(horasReales);
      estimadasHoras.push(horasEstimadas);

      const etiquetaDetalle = numero
        ? `Iteración ${numero}${nombre ? ` - ${nombre}` : ''}`
        : (nombre ? nombre : `Iteración ${iterId}`);
      detalleRows.push({
        etiqueta: etiquetaDetalle,
        etapa,
        horas: horasReales,
        minutos,
        estimadas: horasEstimadas
      });
    });

    this.totalHoras = Math.round((realesHoras.reduce((a, b) => a + b, 0)) * 10) / 10;

    this.renderBarMulti('chartHorasIter', labels, [
      { label: 'Ejecución', data: realesHoras, colorStart: '#0d6efd', colorEnd: '#6ea8fe', showMinutes: true },
      { label: 'Estimación', data: estimadasHoras, colorStart: '#6610f2', colorEnd: '#c29bfe' }
    ]);
    this.renderBar('chartHorasIterDistrib', labels, realesHoras, '#0d6efd', '#6ea8fe', true, true);
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

  private computeWeeklyRange(offsetWeeks = this.semanaOffset): { from: string, to: string, labelFrom: Date, labelTo: Date } {
    const today = new Date();
    const baseSource = this.semanaBaseDate ? new Date(this.semanaBaseDate) : today;
    const base = new Date(baseSource);
    if (offsetWeeks > 0) {
      base.setDate(base.getDate() - (offsetWeeks * 7));
    } else if (offsetWeeks < 0) {
      base.setDate(base.getDate() + (Math.abs(offsetWeeks) * 7));
    }
    const start = this.startOfWeek(base);
    const labelEnd = new Date(start);
    labelEnd.setDate(labelEnd.getDate() + 6);
    const effectiveEnd = labelEnd.getTime() > today.getTime() ? today : labelEnd;
    return {
      from: this.formatLocalDate(start),
      to: this.formatLocalDate(effectiveEnd),
      labelFrom: start,
      labelTo: labelEnd
    };
  }

  private startOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private destroyCharts() {
    this.charts.forEach(c => { try { c.destroy(); } catch {} });
    this.charts = [];
    this.chartsWithData.clear();
  }

  private destroyChartByCanvasId(elId: string) {
    if (!this.charts.length) return;
    this.charts = this.charts.filter(chart => {
      const sameCanvas = chart?.canvas?.id === elId;
      if (sameCanvas) {
        try { chart.destroy(); } catch {}
        this.chartsWithData.delete(elId);
      }
      return !sameCanvas;
    });
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
    valueFormatter?: (value: number | null | undefined, ctx: any) => string
  ) {
    this.renderBarMulti(
      elId,
      labels,
      [{ label: '', data, colorStart, colorEnd, showMinutes, valueFormatter }],
      horizontal,
      stacked
    );
  }

  private renderBarMulti(
    elId: string,
    labels: string[],
    datasetsConfig: Array<{
      label: string;
      data: number[];
      colorStart: string;
      colorEnd: string;
      showMinutes?: boolean;
      valueFormatter?: (value: number | null | undefined, ctx: any) => string;
    }>,
    horizontal = false,
    stacked = false
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
          legend: { display: showLegend, position: 'top' },
          tooltip: {
            ...this.tooltipStyle(),
            callbacks: {
              label: (ctx: any) => {
                const value = horizontal ? ctx.parsed.x : ctx.parsed.y;
                const formatter = ctx.dataset?.valueFormatter;
                if (typeof formatter === 'function') {
                  return formatter(value, ctx);
                }
                const hours = Math.round((value ?? 0) * 100) / 100;
                const prefix = ctx.dataset?.label ? `${ctx.dataset.label}: ` : '';
                let formatted = `${prefix}${hours} h`;
                if (ctx.dataset?.showMinutes) {
                  const minutos = Math.round(hours * 60);
                  formatted += ` (${minutos} min)`;
                }
                return formatted;
              }
            }
          }
        },
        scales: {
          y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.06)' }, ticks: { font: { size: 11 } }, stacked },
          x: { grid: { display: false }, ticks: { font: { size: 11 } }, stacked }
        }
      }
    });
    this.charts.push(chart);
    const hasData = datasetsConfig.some(cfg => (cfg.data || []).some(val => (val || 0) > 0));
    if (hasData) {
      this.chartsWithData.add(elId);
    }
  }

  cambiarSemana(delta: number) {
    if (delta > 0) {
      if (this.semanaOffset >= this.semanaMaxOffset) return;
    } else if (delta < 0) {
      if (this.semanaOffset === 0) return;
    }
    const nextOffset = this.semanaOffset + delta;
    if (nextOffset < 0) return;
    if (this.semanaMaxOffset >= 0 && nextOffset > this.semanaMaxOffset) return;
    this.semanaOffset = nextOffset;
    this.fetchHorasPorDiaTarea();
  }

  private fetchHorasPorDiaTarea() {
    const diaParams = new URLSearchParams();
    if (this.proyectoId) diaParams.set('proyectoId', String(this.proyectoId));
    if (this.filtroEtapa) diaParams.set('etapaId', String(this.filtroEtapa));
    if (this.filtroIteracion) diaParams.set('iteracionId', String(this.filtroIteracion));
    const weekRange = this.computeWeeklyRange();
    diaParams.set('from', weekRange.from);
    diaParams.set('to', weekRange.to);
    const paramsDia = diaParams.toString() ? `?${diaParams.toString()}` : '';
    this.semanaLabel = this.formatWeekRangeLabel(weekRange.labelFrom, weekRange.labelTo);
    this.http.get<any[]>(`http://localhost:8080/api/tiempos/horas-por-dia-tarea${paramsDia}`).subscribe(rows => {
      this.renderHorasPorDiaTareaChart(rows || []);
    }, () => {
      this.destroyChartByCanvasId('chartHorasDiaTarea');
      this.horasDiaDetalle = [];
    });
  }

  private renderHorasPorDiaTareaChart(rows: any[]) {
    if (!rows || !rows.length) {
      this.destroyChartByCanvasId('chartHorasDiaTarea');
      this.horasDiaDetalle = [];
      return;
    }
    const dayMap = new Map<string, Map<string, number>>();
    const totalPorTarea = new Map<string, number>();
    rows.forEach(row => {
      const dia = this.nombreDiaDesdeFecha(row?.fecha);
      if (!dia) return;
      const tarea = row?.tareaNombre || 'Sin tarea';
      const minutos = Number(row?.minutos || 0);
      if (!dayMap.has(dia)) dayMap.set(dia, new Map());
      const tareasDia = dayMap.get(dia)!;
      tareasDia.set(tarea, (tareasDia.get(tarea) || 0) + minutos);
      totalPorTarea.set(tarea, (totalPorTarea.get(tarea) || 0) + minutos);
    });
    if (!totalPorTarea.size) {
      this.destroyChartByCanvasId('chartHorasDiaTarea');
      return;
    }
    const labels = this.diasSemanaOrden;
    const topEntries = Array.from(totalPorTarea.entries()).sort((a, b) => b[1] - a[1]);
    const maxSeries = 5;
    const topTareas = topEntries.slice(0, maxSeries).map(entry => entry[0]);
    const otrasTareas = topEntries.slice(maxSeries).map(entry => entry[0]);
    const palette = [
      { start: '#0d6efd', end: '#6ea8fe' },
      { start: '#198754', end: '#6cc59d' },
      { start: '#ffc107', end: '#ffe08a' },
      { start: '#dc3545', end: '#f28b94' },
      { start: '#20c997', end: '#7be0c3' },
      { start: '#6f42c1', end: '#c8a4ff' }
    ];
    const datasetLabels = otrasTareas.length ? [...topTareas, 'Otros'] : topTareas;
    const datasets = datasetLabels.map((label, idx) => {
      const colors = palette[idx % palette.length];
      const data = labels.map(dia => {
        const tareasDia = dayMap.get(dia);
        if (!tareasDia) return 0;
        if (label === 'Otros' && otrasTareas.length) {
          const minutosOtros = otrasTareas.reduce((acc, nombre) => acc + (tareasDia.get(nombre) || 0), 0);
          return Math.round(((minutosOtros / 60) * 100)) / 100;
        }
        const minutos = tareasDia.get(label) || 0;
        return Math.round(((minutos / 60) * 100)) / 100;
      });
      return { label, data, colorStart: colors.start, colorEnd: colors.end, showMinutes: true };
    });
    this.renderBarMulti('chartHorasDiaTarea', labels, datasets, false, true);
    const detalle = this.diasSemanaOrden.map(dia => {
      const tareasDia = dayMap.get(dia);
      const minutos = tareasDia ? Array.from(tareasDia.values()).reduce((acc, val) => acc + val, 0) : 0;
      return {
        dia,
        minutos,
        horas: Math.round(((minutos / 60) * 100)) / 100
      };
    });
    this.horasDiaDetalle = detalle;
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
    this.renderPie('chartHorasEtapa', labels, horas, minutos);
  }

  private renderPie(elId: string, labels: string[], data: number[], minutos?: number[]) {
    const canvas: any = document.getElementById(elId);
    if (!canvas) return;
    this.destroyChartByCanvasId(elId);
    const ctx = canvas.getContext('2d');
    const total = Math.round(data.reduce((a, b) => a + b, 0) * 100) / 100;
    const centerText = {
      id: 'centerText',
      afterDraw(c: any) {
        const { ctx, chartArea: { width, height } } = c;
        ctx.save();
        ctx.font = '600 16px system-ui, -apple-system, Segoe UI, Roboto';
        ctx.fillStyle = '#212529';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(total), width / 2, height / 2);
        ctx.restore();
      }
    };
    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: ['#0d6efd', '#198754', '#ffc107', '#dc3545', '#6f42c1', '#20c997'],
          ...(minutos ? { minutosData: minutos } : {})
        }]
      },
      options: {
        responsive: true,
        plugins: {
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
      plugins: [centerText]
    });
    this.charts.push(chart);
    if (data.some(val => (val || 0) > 0)) {
      this.chartsWithData.add(elId);
    }
  }

  private nombreDiaDesdeFecha(value: any): string | null {
    if (!value) return null;
    let date: Date;
    if (typeof value === 'string') {
      const normalized = value.includes('T') ? value : `${value}T00:00:00`;
      date = new Date(normalized);
    } else {
      date = new Date(value);
    }
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

  private formatWeekRangeLabel(from: Date, to: Date): string {
    return `Semana ${this.formatShortLabel(from)} - ${this.formatShortLabel(to)}`;
  }

  private formatShortLabel(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = this.mesesCortos[date.getMonth()] || '';
    return `${day} ${month} ${date.getFullYear()}`;
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

  detalleTituloActual(): string {
    switch (this.detalleAbierto) {
      case 'horasIteracion': return 'Detalle de estimación vs ejecución';
      case 'horasCategoria': return 'Detalle de horas por categoría';
      case 'tareasUsuario': return 'Tareas por usuario';
      case 'horasDiaTarea': return 'Horas por día (semana actual)';
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

  private actualizarBaseSemanaPorFiltro() {
    const base = this.obtenerFechaBaseSemana();
    this.semanaBaseDate = base;
    this.semanaMaxOffset = this.calcularSemanaMaxOffset(base);
  }

  private obtenerFechaBaseSemana(): Date | null {
    if (this.filtroIteracion && this.iteraciones?.length) {
      const iter = this.iteraciones.find((it: any) => Number(it?.idIteracion) === Number(this.filtroIteracion));
      if (iter) {
        const fin = iter?.fechaFin ? new Date(iter.fechaFin) : null;
        const inicio = iter?.fechaInicio ? new Date(iter.fechaInicio) : null;
        const candidate = this.getValidDate(fin) || this.getValidDate(inicio);
        if (candidate) {
          const today = new Date();
          return candidate.getTime() > today.getTime() ? today : candidate;
        }
      }
    }
    return null;
  }

  private getValidDate(value: Date | null): Date | null {
    if (!value) return null;
    return isNaN(value.getTime()) ? null : value;
  }

  private calcularSemanaMaxOffset(baseDate: Date | null): number {
    if (!baseDate) return 0;
    const iterStart = this.obtenerFechaInicioIteracionFiltro();
    if (!iterStart) return 0;
    const baseStart = this.startOfWeek(baseDate);
    const earliestStart = this.startOfWeek(iterStart);
    const diffMs = baseStart.getTime() - earliestStart.getTime();
    if (diffMs <= 0) return 0;
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    return Math.floor(diffMs / weekMs);
  }

  private obtenerFechaInicioIteracionFiltro(): Date | null {
    if (!this.filtroIteracion || !this.iteraciones?.length) return null;
    const iter = this.iteraciones.find((it: any) => Number(it?.idIteracion) === Number(this.filtroIteracion));
    if (!iter?.fechaInicio) return null;
    const inicio = new Date(iter.fechaInicio);
    return isNaN(inicio.getTime()) ? null : inicio;
  }

  private cargarIteracionActiva(proyectoId: number | null) {
    if (!proyectoId) {
      this.iteracionActivaId = null;
      return;
    }
    this.iteracionService.getIteracionActualPorProyecto(proyectoId).subscribe({
      next: iter => {
        const id = Number(iter?.idIteracion);
        this.iteracionActivaId = Number.isFinite(id) ? id : null;
        this.actualizarHorasIteracionChart();
      },
      error: () => {
        this.iteracionActivaId = null;
        this.actualizarHorasIteracionChart();
      }
    });
  }
}
