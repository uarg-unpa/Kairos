import { AfterViewInit, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EtapaService } from '../../services/etapa.service';
import { IteracionService } from '../../services/iteracion.service';
import { TaskService } from '../../services/tarea.service';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterModule } from '@angular/router';

declare const Chart: any;

type DetalleTipo = 'horasIteracion' | 'horasCategoria' | 'tareasUsuario';

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
  detalleAbierto: DetalleTipo | null = null;
  horasIteracionDetalle: HorasIteracionDetalle[] = [];
  horasCategoriaDetalle: HorasCategoriaDetalle[] = [];
  tareasUsuarioDetalle: TareasUsuarioDetalle[] = [];
  private horasIteracionRows: any[] = [];
  private horasEstimadasPorIteracion = new Map<number, number>();

  ngOnInit(): void {
    this.route.paramMap.subscribe(pm => {
      const id = pm.get('id');
      this.proyectoId = id ? Number(id) : null;
      const data: any = this.route.snapshot.data;
      this.proyectoNombre = data?.['proyecto']?.nombre || null;
      if (this.proyectoId) {
        this.etapaService.getEtapasPorProyecto(this.proyectoId).subscribe(e => this.etapas = e || []);
        this.iteracionService.getIteracionesPorProyectoId(this.proyectoId).subscribe(it => this.iteraciones = it || []);
      } else {
        this.etapaService.getEtapas().subscribe(e => this.etapas = e || []);
        this.iteracionService.getIteraciones().subscribe(it => this.iteraciones = it || []);
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
    if (this.filtroEtapa) {
      this.iteracionService.getIteracionesPorEtapaId(this.filtroEtapa).subscribe(it => this.iteraciones = it || []);
    } else if (this.proyectoId) {
      this.iteracionService.getIteracionesPorProyectoId(this.proyectoId).subscribe(it => this.iteraciones = it || []);
    } else {
      this.iteracionService.getIteraciones().subscribe(it => this.iteraciones = it || []);
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
      this.eficiencia = estimadas > 0 ? Math.min(100, Math.round((reales / estimadas) * 100)) : 0;

      // tareas por usuario
      const porUserMap = new Map<string, number>();
      tareas.forEach(t => {
        const key = (t.usuarioNombre || 'Sin usuario');
        porUserMap.set(key, (porUserMap.get(key) || 0) + 1);
      });
      this.renderBar('chartTareasUser', Array.from(porUserMap.keys()), Array.from(porUserMap.values()), '#ffc107', '#ffe08a', true);
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

    if (!orderedIds.length) {
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

    orderedIds.forEach(iterId => {
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
    const to = today.toISOString().slice(0, 10);
    const clone = (d: Date) => new Date(d.getTime());
    const addDays = (d: Date, n: number) => { const x = clone(d); x.setDate(x.getDate() + n); return x; };
    const startOfWeek = () => { const d = clone(today); const day = d.getDay(); const diff = (day === 0 ? -6 : 1) - day; return addDays(d, diff); };
    const startOfMonth = () => new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfQuarter = () => new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1);

    if (this.filtroTiempo === 'today') {
      return { from: to, to };
    }
    if (this.filtroTiempo === 'week') {
      const f = startOfWeek().toISOString().slice(0, 10);
      return { from: f, to };
    }
    if (this.filtroTiempo === 'month') {
      const f = startOfMonth().toISOString().slice(0, 10);
      return { from: f, to };
    }
    if (this.filtroTiempo === 'quarter') {
      const f = startOfQuarter().toISOString().slice(0, 10);
      return { from: f, to };
    }
    return { from: null, to: null };
  }

  private destroyCharts() {
    this.charts.forEach(c => { try { c.destroy(); } catch {} });
    this.charts = [];
  }

  private destroyChartByCanvasId(elId: string) {
    if (!this.charts.length) return;
    this.charts = this.charts.filter(chart => {
      const sameCanvas = chart?.canvas?.id === elId;
      if (sameCanvas) {
        try { chart.destroy(); } catch {}
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
    showMinutes = false
  ) {
    this.renderBarMulti(elId, labels, [{ label: '', data, colorStart, colorEnd, showMinutes }], horizontal);
  }

  private renderBarMulti(
    elId: string,
    labels: string[],
    datasetsConfig: Array<{ label: string; data: number[]; colorStart: string; colorEnd: string; showMinutes?: boolean }>,
    horizontal = false
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
            callbacks: {
              label: (ctx: any) => {
                const value = horizontal ? ctx.parsed.x : ctx.parsed.y;
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
          y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.06)' }, ticks: { font: { size: 11 } } },
          x: { grid: { display: false }, ticks: { font: { size: 11 } } }
        }
      }
    });
    this.charts.push(chart);
  }

  private renderPie(elId: string, labels: string[], data: number[], minutos?: number[]) {
    const canvas: any = document.getElementById(elId);
    if (!canvas) return;
    this.destroyChartByCanvasId(elId);
    const ctx = canvas.getContext('2d');
    const total = data.reduce((a, b) => a + b, 0);
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
}
