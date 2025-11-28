import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { jsPDF } from 'jspdf';
import { HorasIteracionDetalle, HorasCategoriaDetalle, TareasUsuarioDetalle, HorasDiaDetalle, HorasTareaDetalle } from './dashboard';

declare const Chart: any;

@Component({
    selector: 'app-dashboard-export',
    standalone: true,
    imports: [CommonModule],
    template: `
    <button class="btn btn-primary" (click)="exportarDashboard()" [disabled]="isExporting">
      <i class="bi bi-file-earmark-pdf"></i> 
      {{ isExporting ? 'Generando...' : 'Exportar Reporte' }}
    </button>
  `
})
export class DashboardExportComponent {
    @Input() proyecto: any = null;
    @Input() semanaActual: { inicio: string; fin: string } = { inicio: '', fin: '' };
    @Input() tareasCompletadas: number = 0;
    @Input() totalTareas: number = 0;
    @Input() totalHoras: number = 0;
    @Input() eficiencia: number = 0;
    @Input() atrasadasCount: number = 0;
    @Input() proximasCount: number = 0;
    @Input() charts: Map<string, any> = new Map();
    @Input() chartsWithData: Set<string> = new Set();
    @Input() filtroTiempo: string = 'all';
    @Input() horasIteracionDetalle: HorasIteracionDetalle[] = [];
    @Input() horasCategoriaDetalle: HorasCategoriaDetalle[] = [];
    @Input() tareasUsuarioDetalle: TareasUsuarioDetalle[] = [];
    @Input() horasDiaDetalle: HorasDiaDetalle[] = [];
    @Input() horasTareaDetalle: HorasTareaDetalle[] = [];

    isExporting = false;

    // --- COLORES CORPORATIVOS ---
    private readonly COLORS = {
        PRIMARY: [41, 128, 185],    // #2980b9 (Azul profesional)
        SECONDARY: [44, 62, 80],    // #2c3e50 (Gris oscuro / Azul noche)
        ACCENT: [230, 126, 34],     // #e67e22 (Naranja para destaques)
        BG_HEADER: [236, 240, 241], // #ecf0f1 (Gris muy claro)
        BG_ROW_ODD: [255, 255, 255],// Blanco
        BG_ROW_EVEN: [248, 249, 250], // Gris muy suave
        TEXT_DARK: [44, 62, 80],
        TEXT_LIGHT: [255, 255, 255],
        BORDER: [189, 195, 199]
    };

    async exportarDashboard() {
        this.isExporting = true;

        try {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 15;

            // Cargar logos
            const kairosLogo = await this.loadImage('Kairos Logo.png');
            const unpaLogo = await this.loadImage('UNPA-UARG.png');

            let projectLogo: HTMLImageElement | null = null;
            if (this.proyecto && this.proyecto.logo) {
                try {
                    projectLogo = await this.loadImage(this.proyecto.logo);
                } catch (e) {
                    console.warn('No se pudo cargar el logo del proyecto', e);
                }
            }

            // --- PORTADA / PRIMERA PÁGINA ---
            this.agregarEncabezado(doc, kairosLogo, unpaLogo);

            let y = 40;

            // Título del Proyecto con Logo
            if (this.proyecto && this.proyecto.nombre) {
                if (projectLogo) {
                    const logoW = 30;
                    const logoH = 30;
                    const x = (pageWidth - logoW) / 2;
                    doc.addImage(projectLogo, 'PNG', x, y, logoW, logoH);
                    y += logoH + 10;
                }

                doc.setFont('helvetica', 'bold');
                doc.setFontSize(22);
                doc.setTextColor(this.COLORS.SECONDARY[0], this.COLORS.SECONDARY[1], this.COLORS.SECONDARY[2]);
                doc.text(this.proyecto.nombre, pageWidth / 2, y, { align: 'center' });
                y += 15;
            }

            // Información del Proyecto (Diseño Card)
            if (this.proyecto) {
                if (y + 50 > pageHeight) { doc.addPage(); this.agregarEncabezado(doc, kairosLogo, unpaLogo); y = margin + 30; }
                this.agregarInformacionProyecto(doc, margin, y);
                y += 55;
            }

            // Resumen General (Diseño Grid con Cajas de Color)
            if (y + 60 > pageHeight) { doc.addPage(); this.agregarEncabezado(doc, kairosLogo, unpaLogo); y = margin + 30; }
            this.agregarResumenGeneral(doc, margin, y);
            y += 75;

            // --- GRÁFICOS ---
            const chartsToExport = [
                { id: 'chartHorasIter', title: 'Estimación vs Ejecución' },
                { id: 'chartTareasUser', title: 'Tareas por Usuario' },
                { id: 'chartHorasIterDistrib', title: 'Horas por Tarea' },
                { id: 'chartHorasDiaTarea', title: 'Horas por Día' },
                { id: 'chartHorasCategoria', title: 'Horas por Categoría' },
                { id: 'chartHorasEtapa', title: 'Horas por Etapa' }
            ];

            const container = document.createElement('div');
            container.style.position = 'absolute';
            container.style.left = '-9999px';
            container.style.top = '-9999px';
            document.body.appendChild(container);

            for (const item of chartsToExport) {
                if (!this.chartsWithData.has(item.id)) continue;

                doc.addPage();
                this.agregarEncabezado(doc, kairosLogo, unpaLogo);
                let y = margin + 25;

                // Título Sección Gráfico
                doc.setFontSize(16);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(this.COLORS.PRIMARY[0], this.COLORS.PRIMARY[1], this.COLORS.PRIMARY[2]);
                doc.text(item.title, margin, y);

                // Línea decorativa bajo título
                doc.setDrawColor(this.COLORS.ACCENT[0], this.COLORS.ACCENT[1], this.COLORS.ACCENT[2]);
                doc.setLineWidth(0.5);
                doc.line(margin, y + 2, margin + 15, y + 2); // Línea corta de acento
                doc.setDrawColor(200);
                doc.line(margin + 15, y + 2, pageWidth - margin, y + 2); // Resto gris

                y += 15;

                // Imagen del gráfico
                const imgData = await this.generarImagenGraficoExpandido(item.id, container);
                if (imgData) {
                    const imgWidth = pageWidth - margin * 2;
                    const imgHeight = 90; // Un poco más chico para dar espacio
                    doc.addImage(imgData, 'PNG', margin, y, imgWidth, imgHeight);
                    y += imgHeight + 15;
                }

                // Tabla de detalles
                y = this.agregarTablaDetalles(doc, item.id, y, margin);
            }

            document.body.removeChild(container);

            // Numeración
            this.agregarNumerosPagina(doc);

            doc.save(`reporte-dashboard-${this.formatLocalDate(new Date())}.pdf`);

        } catch (error) {
            console.error('Error al exportar dashboard:', error);
        } finally {
            this.isExporting = false;
        }
    }

    private loadImage(url: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = url;
            img.onload = () => resolve(img);
            img.onerror = (e) => reject(e);
        });
    }

    private agregarEncabezado(doc: jsPDF, kairosLogo: HTMLImageElement | null, unpaLogo: HTMLImageElement | null) {
        const pageWidth = doc.internal.pageSize.getWidth();

        // Barra superior de color
        doc.setFillColor(this.COLORS.PRIMARY[0], this.COLORS.PRIMARY[1], this.COLORS.PRIMARY[2]);
        doc.rect(0, 0, pageWidth, 5, 'F');

        const logoW = 12;
        const logoH = 12;
        const headerY = 10;

        if (kairosLogo) doc.addImage(kairosLogo, 'PNG', 15, headerY, logoW, logoH);
        if (unpaLogo) doc.addImage(unpaLogo, 'PNG', pageWidth - 15 - logoW, headerY, logoW, logoH);

        // Texto central encabezado
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.setFont('helvetica', 'normal');
        const fechaStr = `Generado el ${new Date().toLocaleDateString()} a las ${new Date().toLocaleTimeString()}`;
        doc.text('Reporte de Estado del Proyecto', pageWidth / 2, headerY + 5, { align: 'center' });
        doc.setFontSize(8);
        doc.text(fechaStr, pageWidth / 2, headerY + 10, { align: 'center' });

        // --- RANGO DE FECHA (Derecha o Centro abajo) ---
        let rangoTexto = 'Rango: Histórico';
        switch (this.filtroTiempo) {
            case 'quarter': rangoTexto = 'Rango: Últimos 90 días'; break;
            case 'month': rangoTexto = 'Rango: Últimos 30 días'; break;
            case 'week': rangoTexto = 'Rango: Semana Actual'; break;
            case 'today': rangoTexto = 'Rango: Hoy'; break;
            case 'all': rangoTexto = 'Rango: Histórico'; break;
        }

        doc.setFontSize(9);
        doc.setTextColor(this.COLORS.PRIMARY[0], this.COLORS.PRIMARY[1], this.COLORS.PRIMARY[2]);
        doc.setFont('helvetica', 'bold');
        // Lo ponemos debajo de la fecha o a la derecha
        doc.text(rangoTexto, pageWidth / 2, headerY + 15, { align: 'center' });

        // Línea separadora suave
        doc.setDrawColor(220);
        doc.setLineWidth(0.1);
        doc.line(15, 28, pageWidth - 15, 28);
    }

    private agregarInformacionProyecto(doc: jsPDF, margin: number, startY: number) {
        const pageWidth = doc.internal.pageSize.getWidth();
        const boxWidth = pageWidth - margin * 2;
        const boxHeight = 45;

        // Fondo suave para la "tarjeta"
        doc.setFillColor(252, 252, 252);
        doc.setDrawColor(this.COLORS.BORDER[0], this.COLORS.BORDER[1], this.COLORS.BORDER[2]);
        doc.roundedRect(margin, startY, boxWidth, boxHeight, 2, 2, 'FD');

        // Borde lateral de acento
        doc.setFillColor(this.COLORS.ACCENT[0], this.COLORS.ACCENT[1], this.COLORS.ACCENT[2]);
        doc.rect(margin, startY, 2, boxHeight, 'F');

        let y = startY + 10;
        const xLabel = margin + 8;
        const xValue = margin + 50;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(this.COLORS.SECONDARY[0], this.COLORS.SECONDARY[1], this.COLORS.SECONDARY[2]);
        doc.text('Información General', xLabel, y);
        y += 8;

        doc.setFontSize(10);
        const info = [
            { label: 'Estado:', value: this.proyecto.estado || 'Activo' },
            { label: 'Inicio:', value: this.proyecto.fechaInicio ? new Date(this.proyecto.fechaInicio).toLocaleDateString() : '-' },
            { label: 'Fin:', value: this.proyecto.fechaFin ? new Date(this.proyecto.fechaFin).toLocaleDateString() : '-' },
            { label: 'Descripción:', value: this.proyecto.descripcion || 'Sin descripción' }
        ];

        info.forEach(item => {
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(80);
            doc.text(item.label, xLabel, y);

            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0);

            // Manejo simple de texto largo para descripción
            if (item.label === 'Descripción:') {
                const splitText = doc.splitTextToSize(item.value, boxWidth - 55);
                doc.text(splitText, xValue, y);
            } else {
                doc.text(item.value, xValue, y);
            }
            y += 6;
        });
    }

    private agregarResumenGeneral(doc: jsPDF, margin: number, startY: number) {
        const pageWidth = doc.internal.pageSize.getWidth();
        const boxWidth = pageWidth - margin * 2;
        let y = startY;

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(this.COLORS.PRIMARY[0], this.COLORS.PRIMARY[1], this.COLORS.PRIMARY[2]);
        doc.text('Métricas Clave', margin, y);
        y += 8;

        // Grid de 2x3 tarjetas
        const gap = 5;
        const cardW = (boxWidth - gap) / 2;
        const cardH = 20;

        const metrics = [
            { label: 'Tareas Completadas', value: `${this.tareasCompletadas} / ${this.totalTareas}`, color: [46, 204, 113] }, // Verde
            { label: 'Avance Total', value: `${this.totalTareas ? Math.round((this.tareasCompletadas / this.totalTareas) * 100) : 0}%`, color: [52, 152, 219] }, // Azul
            { label: 'Horas Trabajadas', value: `${this.totalHoras.toFixed(1)} h`, color: [241, 196, 15] }, // Amarillo
            { label: 'Eficiencia', value: `${this.eficiencia}%`, color: this.eficiencia >= 100 ? [46, 204, 113] : [231, 76, 60] }, // Verde/Rojo
            { label: 'Tareas Atrasadas', value: `${this.atrasadasCount}`, color: this.atrasadasCount > 0 ? [231, 76, 60] : [149, 165, 166] },
            { label: 'Próx. Vencimientos', value: `${this.proximasCount}`, color: this.proximasCount > 0 ? [230, 126, 34] : [149, 165, 166] }
        ];

        let currentX = margin;
        let currentY = y;

        metrics.forEach((m, i) => {
            // Fondo tarjeta
            doc.setFillColor(255, 255, 255);
            doc.setDrawColor(220);
            doc.roundedRect(currentX, currentY, cardW, cardH, 1, 1, 'FD');

            // Barra de color lateral
            doc.setFillColor(m.color[0], m.color[1], m.color[2]);
            doc.rect(currentX, currentY, 2, cardH, 'F');

            // Valor (Grande)
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(50);
            doc.text(m.value, currentX + cardW - 5, currentY + 13, { align: 'right' });

            // Label (Pequeño)
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100);
            doc.text(m.label, currentX + 6, currentY + 8);

            // Mover cursor
            if (i % 2 === 0) {
                currentX += cardW + gap;
            } else {
                currentX = margin;
                currentY += cardH + gap;
            }
        });
    }

    private agregarTablaDetalles(doc: jsPDF, chartId: string, startY: number, margin: number): number {
        let y = startY;
        doc.setFontSize(10);
        const pageWidth = doc.internal.pageSize.getWidth();
        const boxWidth = pageWidth - (margin * 2);
        const rowHeight = 8;
        const headerHeight = 9;

        // Verificar espacio
        if (y + 20 > doc.internal.pageSize.getHeight()) {
            doc.addPage();
            y = margin;
        }

        // --- ENCABEZADO TABLA ---
        doc.setFillColor(this.COLORS.SECONDARY[0], this.COLORS.SECONDARY[1], this.COLORS.SECONDARY[2]);
        doc.rect(margin, y, boxWidth, headerHeight, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);

        const textY = y + 6;

        // Definición de columnas según gráfico
        let columns: { header: string, x: number, align?: 'left' | 'right' | 'center' }[] = [];

        switch (chartId) {
            case 'chartHorasIter':
                columns = [
                    { header: 'ETIQUETA', x: margin + 2 },
                    { header: 'ETAPA', x: margin + 60 },
                    { header: 'ESTIMADAS', x: margin + 110, align: 'right' },
                    { header: 'REALES', x: margin + 140, align: 'right' },
                    { header: 'DIF', x: margin + 170, align: 'right' }
                ];
                break;
            case 'chartHorasCategoria':
                columns = [
                    { header: 'CATEGORÍA', x: margin + 2 },
                    { header: 'TIEMPO TOTAL', x: margin + 150, align: 'right' }
                ];
                break;
            case 'chartTareasUser':
                columns = [
                    { header: 'USUARIO', x: margin + 2 },
                    { header: 'TAREAS ASIGNADAS', x: margin + 150, align: 'right' }
                ];
                break;
            case 'chartHorasDiaTarea':
                columns = [
                    { header: 'FECHA', x: margin + 2 },
                    { header: 'TIEMPO REGISTRADO', x: margin + 150, align: 'right' }
                ];
                break;
            case 'chartHorasIterDistrib':
                columns = [
                    { header: 'TAREA', x: margin + 2 },
                    { header: 'TIEMPO', x: margin + 150, align: 'right' }
                ];
                break;
        }

        // Dibujar headers
        columns.forEach(col => {
            doc.text(col.header, col.x, textY, { align: col.align as any || 'left' });
        });

        y += headerHeight;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0);

        // --- FILAS ---
        const printRows = (items: any[], renderRow: (item: any, currentY: number) => void) => {
            items.forEach((item, index) => {
                // Salto de página
                if (y + rowHeight > doc.internal.pageSize.getHeight() - margin) {
                    doc.addPage();
                    y = margin;
                    // Repetir header en nueva página
                    doc.setFillColor(this.COLORS.SECONDARY[0], this.COLORS.SECONDARY[1], this.COLORS.SECONDARY[2]);
                    doc.rect(margin, y, boxWidth, headerHeight, 'F');
                    doc.setTextColor(255);
                    doc.setFont('helvetica', 'bold');
                    columns.forEach(col => doc.text(col.header, col.x, y + 6, { align: col.align as any || 'left' }));
                    y += headerHeight;
                    doc.setTextColor(0);
                    doc.setFont('helvetica', 'normal');
                }

                // Zebra Striping
                if (index % 2 === 0) {
                    doc.setFillColor(this.COLORS.BG_ROW_ODD[0], this.COLORS.BG_ROW_ODD[1], this.COLORS.BG_ROW_ODD[2]);
                } else {
                    doc.setFillColor(this.COLORS.BG_ROW_EVEN[0], this.COLORS.BG_ROW_EVEN[1], this.COLORS.BG_ROW_EVEN[2]);
                }
                doc.rect(margin, y, boxWidth, rowHeight, 'F');

                // Renderizar contenido
                renderRow(item, y + 5.5);

                // Borde inferior suave
                doc.setDrawColor(230);
                doc.line(margin, y + rowHeight, margin + boxWidth, y + rowHeight);

                y += rowHeight;
            });
        };

        switch (chartId) {
            case 'chartHorasIter':
                printRows(this.horasIteracionDetalle, (d, cy) => {
                    const diff = d.horas - d.estimadas;
                    doc.text(d.etiqueta, columns[0].x, cy);
                    doc.text(d.etapa || '-', columns[1].x, cy);
                    doc.text(d.estimadas.toFixed(1), columns[2].x, cy, { align: 'right' });
                    doc.text(`${d.horas}h (${d.minutos}m)`, columns[3].x, cy, { align: 'right' });

                    doc.setTextColor(diff > 0 ? 46 : 231, diff > 0 ? 204 : 76, diff > 0 ? 113 : 60); // Verde/Rojo
                    doc.setFont('helvetica', 'bold');
                    doc.text((diff > 0 ? '+' : '') + diff.toFixed(1), columns[4].x, cy, { align: 'right' });
                    doc.setTextColor(0);
                    doc.setFont('helvetica', 'normal');
                });
                break;

            case 'chartHorasCategoria':
                printRows(this.horasCategoriaDetalle, (d, cy) => {
                    doc.text(d.categoria, columns[0].x, cy);
                    doc.text(`${d.horas}h ${d.minutos}m`, columns[1].x, cy, { align: 'right' });
                });
                break;

            case 'chartTareasUser':
                printRows(this.tareasUsuarioDetalle, (d, cy) => {
                    doc.text(d.usuario, columns[0].x, cy);
                    doc.text(d.cantidad.toString(), columns[1].x, cy, { align: 'right' });
                });
                break;

            case 'chartHorasDiaTarea':
                printRows(this.horasDiaDetalle, (d, cy) => {
                    doc.text(d.dia, columns[0].x, cy);
                    doc.text(`${d.horas}h ${d.minutos}m`, columns[1].x, cy, { align: 'right' });
                });
                break;

            case 'chartHorasIterDistrib':
                printRows(this.horasTareaDetalle, (d, cy) => {
                    const tareaNombre = d.tarea.length > 60 ? d.tarea.substring(0, 60) + '...' : d.tarea;
                    doc.text(tareaNombre, columns[0].x, cy);
                    doc.text(`${d.horas}h ${d.minutos}m`, columns[1].x, cy, { align: 'right' });
                });
                break;
        }

        return y;
    }

    private agregarNumerosPagina(doc: jsPDF) {
        const pageCount = doc.getNumberOfPages();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            if (i === 1) continue; // No en portada

            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(`Página ${i} de ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        }
    }

    private async generarImagenGraficoExpandido(chartId: string, container: HTMLElement): Promise<string | null> {
        return new Promise((resolve) => {
            const originalChart = this.charts.get(chartId);
            if (!originalChart) {
                resolve(null);
                return;
            }

            const canvas = document.createElement('canvas');
            canvas.width = 800;
            canvas.height = 400;
            container.appendChild(canvas);

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                resolve(null);
                return;
            }

            const configOriginal = originalChart.config;
            const configClonada: any = {
                type: configOriginal.type,
                data: {
                    labels: [...(configOriginal.data?.labels || [])],
                    datasets: (configOriginal.data?.datasets || []).map((dataset: any) => ({
                        ...dataset,
                        data: [...dataset.data]
                    }))
                },
                options: {
                    ...configOriginal.options,
                    animation: false,
                    responsive: false,
                    devicePixelRatio: 2
                },
                plugins: configOriginal.plugins
            };

            const tempChart = new Chart(ctx, configClonada);

            setTimeout(() => {
                try {
                    const img = tempChart.toBase64Image();
                    tempChart.destroy();
                    container.removeChild(canvas);
                    resolve(img);
                } catch (e) {
                    resolve(null);
                }
            }, 100);
        });
    }

    private formatLocalDate(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}
