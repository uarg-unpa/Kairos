import { AfterViewInit, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EtapaService } from '../../services/etapa.service';
import { IteracionService } from '../../services/iteracion.service';
import { TaskService } from '../../services/tarea.service';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

declare const Chart: any;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  private charts: any[] = [];

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
      const labels = rows.map(r => `Iter ${r.numero}`);
      const dataMin = rows.map(r => r.minutos || 0);
      const dataHoras = dataMin.map((m: number) => Math.round((m / 60) * 10) / 10);
      this.totalHoras = Math.round((dataHoras.reduce((a: number, b: number) => a + b, 0)) * 10) / 10;
      this.renderBar('chartHorasIter', labels, dataHoras, '#0d6efd', '#6ea8fe');
    });

    const userParams = new URLSearchParams();
    if (this.filtroIteracion) userParams.set('iteracionId', String(this.filtroIteracion));
    else if (this.proyectoId) userParams.set('proyectoId', String(this.proyectoId));
    if (range.from && range.to) { userParams.set('from', range.from); userParams.set('to', range.to); }
    const paramsUser = userParams.toString() ? `?${userParams.toString()}` : '';
    this.http.get<any[]>(`http://localhost:8080/api/tiempos/horas-por-usuario${paramsUser}`).subscribe(rows => {
      // ordenar por horas desc para ranking claro
      const pairs = rows.map(r => ({ label: r.usuarioNombre, minutos: r.minutos || 0 }))
        .map(x => ({ label: x.label, horas: Math.round((x.minutos / 60) * 10) / 10 }))
        .sort((a, b) => b.horas - a.horas);
      const labels = pairs.map(p => p.label);
      const dataHoras = pairs.map(p => p.horas);
      this.renderBar('chartHorasUser', labels, dataHoras, '#198754', '#71d19e', true);
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
      this.totalTareas = tareas.length;
      const completadas = tareas.filter(t => /completad|finalizad/i.test(t.estado || ''));
      this.tareasCompletadas = completadas.length;

      // eficiencia simple: horas reales / estimadas
      const estimadas = tareas.map(t => t.horasEstimadas || 0).reduce((a: number, b: number) => a + b, 0);
      const reales = this.totalHoras; // ya en horas
      this.eficiencia = estimadas > 0 ? Math.min(100, Math.round((reales / estimadas) * 100)) : 0;

      // tareas por estado
      const porEstadoMap = new Map<string, number>();
      tareas.forEach(t => {
        const key = (t.estado || 'Sin estado');
        porEstadoMap.set(key, (porEstadoMap.get(key) || 0) + 1);
      });
      this.renderPie('chartTareasEstado', Array.from(porEstadoMap.keys()), Array.from(porEstadoMap.values()));

      // tareas por usuario
      const porUserMap = new Map<string, number>();
      tareas.forEach(t => {
        const key = (t.usuarioNombre || 'Sin usuario');
        porUserMap.set(key, (porUserMap.get(key) || 0) + 1);
      });
      this.renderBar('chartTareasUser', Array.from(porUserMap.keys()), Array.from(porUserMap.values()), '#ffc107', '#ffe08a', true);
    });
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

  private renderBar(elId: string, labels: string[], data: number[], colorStart: string, colorEnd: string, horizontal = false) {
    const canvas: any = document.getElementById(elId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const g = ctx.createLinearGradient(0, 0, 0, 200);
    g.addColorStop(0, colorStart);
    g.addColorStop(1, colorEnd);
    const chart = new Chart(ctx, {
      type: 'bar',
      data: { labels, datasets: [{ label: '', data, backgroundColor: g, borderRadius: 8, maxBarThickness: 36, categoryPercentage: 0.7, barPercentage: 0.7 }] },
      options: {
        indexAxis: horizontal ? 'y' : 'x',
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: { label: (ctx: any) => `${horizontal ? ctx.parsed.x : ctx.parsed.y} h` }
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

  private renderPie(elId: string, labels: string[], data: number[]) {
    const canvas: any = document.getElementById(elId);
    if (!canvas) return;
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
        datasets: [{ data, backgroundColor: ['#0d6efd', '#198754', '#ffc107', '#dc3545', '#6f42c1', '#20c997'] }]
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom' } }, cutout: '60%' },
      plugins: [centerText]
    });
    this.charts.push(chart);
  }
}
