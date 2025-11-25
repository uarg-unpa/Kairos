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
    @Input() horasIteracionDetalle: HorasIteracionDetalle[] = [];
    @Input() horasCategoriaDetalle: HorasCategoriaDetalle[] = [];
    @Input() tareasUsuarioDetalle: TareasUsuarioDetalle[] = [];
    @Input() horasDiaDetalle: HorasDiaDetalle[] = [];
    @Input() horasTareaDetalle: HorasTareaDetalle[] = [];

    isExporting = false;


    async exportarDashboard() {
        this.isExporting = true;

        try {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 15;

            // Cargar logos solo una vez
            const kairosLogo = await this.loadImage('Kairos Logo.png');
            const unpaLogo = await this.loadImage('UNPA-UARG.png');

            // Cargar logo del proyecto si existe
            let projectLogo: HTMLImageElement | null = null;
            if (this.proyecto && this.proyecto.logo) {
                try {
                    projectLogo = await this.loadImage(this.proyecto.logo);
                } catch (e) {
                    console.warn('No se pudo cargar el logo del proyecto', e);
                }
            }

            // Aplicar encabezado en primera página
            this.agregarEncabezado(doc, kairosLogo, unpaLogo);

            let y = 35; // más cerca del encabezado
            // espacio debajo del encabezado
            console.log("PROYECTO RECIBIDO EN EXPORT:", this.proyecto);

            // ----- TÍTULO DEL PROYECTO -----
            if (this.proyecto && this.proyecto.nombre) {

                // Si hay logo del proyecto, mostrarlo
                if (projectLogo) {
                    const logoW = 25;
                    const logoH = 25;
                    const x = (pageWidth - logoW) / 2;
                    doc.addImage(projectLogo, 'PNG', x, y, logoW, logoH);
                    y += logoH + 5;
                }

                doc.setFont('helvetica', 'bold');
                doc.setFontSize(18);

                doc.text(
                    this.proyecto.nombre,
                    pageWidth / 2,
                    y,
                    { align: 'center' }
                );

                y += 15;
            }
            // --- Información del Proyecto ---
            if (this.proyecto) {
                if (y + 60 > pageHeight) {
                    doc.addPage();
                    this.agregarEncabezado(doc, kairosLogo, unpaLogo);
                    y = margin + 25;
                }
                this.agregarInformacionProyecto(doc, margin, y);
                y += 60;
            }

            // --- Resumen General ---
            this.agregarResumenGeneral(doc, margin, y);
            y += 70;



            // --- Gráficos ---
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

                // --- Nueva Página para cada gráfico ---
                doc.addPage();
                this.agregarEncabezado(doc, kairosLogo, unpaLogo);
                let y = margin + 25;

                // Título del gráfico
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.text(item.title, margin, y);
                y += 10;

                // Imagen del gráfico
                const imgData = await this.generarImagenGraficoExpandido(item.id, container);
                if (imgData) {
                    const imgWidth = pageWidth - margin * 2;
                    const imgHeight = 100;

                    doc.addImage(imgData, 'PNG', margin, y, imgWidth, imgHeight);
                    y += imgHeight + 10;
                }

                // Tabla de detalles
                y = this.agregarTablaDetalles(doc, item.id, y, margin);
            }

            document.body.removeChild(container);

            // Numeros de pagina al final
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



    private agregarResumenGeneral(doc: jsPDF, margin: number, startY: number) {
        const pageWidth = doc.internal.pageSize.getWidth();
        const boxWidth = pageWidth - margin * 2;


        const cols = 2;

        const rowHeight = 15;
        const colWidth = boxWidth / cols;

        let y = startY;

        // ------- FONDO Y BORDE GENERAL -------
        const totalHeight = 60;
        doc.setFillColor(250, 250, 250);
        doc.rect(margin, y, boxWidth, totalHeight, 'F');
        doc.setDrawColor(180, 180, 180);
        doc.rect(margin, y, boxWidth, totalHeight);

        // ------- TÍTULO CENTRADO (FILA 1) -------
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        const titleY = y + rowHeight / 1.7;

        doc.text(
            'Resumen General',
            margin + boxWidth / 2,
            titleY,
            { align: 'center' }
        );

        // línea debajo del título
        doc.line(margin, y + rowHeight, margin + boxWidth, y + rowHeight);

        // ------- DATOS (FILAS 2, 3, 4) -------
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);

        const leftColumn = [
            `Tareas Completadas: ${this.tareasCompletadas} / ${this.totalTareas}`,
            `Horas Trabajadas: ${this.totalHoras.toFixed(1)} h`,
            `Tareas Atrasadas: ${this.atrasadasCount}`
        ];

        const rightColumn = [
            `Avance: ${this.totalTareas ? Math.round((this.tareasCompletadas / this.totalTareas) * 100) : 0}%`,
            `Eficiencia: ${this.eficiencia}%`,
            `Próximos Vencimientos: ${this.proximasCount}`
        ];

        let currentY = y + rowHeight + rowHeight / 1.7;

        for (let i = 0; i < leftColumn.length; i++) {
            // Columna izquierda -> centrado dentro de la celda
            doc.text(
                leftColumn[i],
                margin + colWidth / 2,
                currentY,
                { align: 'center' }
            );

            // Columna derecha -> centrado dentro de la celda
            doc.text(
                rightColumn[i],
                margin + colWidth + colWidth / 2,
                currentY,
                { align: 'center' }
            );

            // Línea horizontal entre filas (siempre debajo de cada fila)
            const lineY = y + rowHeight * (i + 2);
            doc.line(margin, lineY, margin + boxWidth, lineY);

            currentY += rowHeight;
        }
    }




    private agregarInformacionProyecto(doc: jsPDF, margin: number, startY: number) {
        let y = startY;
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Información del Proyecto', margin, y);
        y += 10;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');

        const info = [
            `Nombre: ${this.proyecto.nombre}`,
            `Descripción: ${this.proyecto.descripcion || 'Sin descripción'}`,
            `Estado: ${this.proyecto.estado || 'Activo'}`,
            `Fecha de Inicio: ${this.proyecto.fechaInicio ? new Date(this.proyecto.fechaInicio).toLocaleDateString() : 'No definida'}`,
            `Fecha de Fin: ${this.proyecto.fechaFin ? new Date(this.proyecto.fechaFin).toLocaleDateString() : 'No definida'}`
        ];

        info.forEach(line => {
            // Manejo de texto largo para descripcion
            const splitText = doc.splitTextToSize(`• ${line}`, doc.internal.pageSize.getWidth() - (margin * 2) - 5);
            doc.text(splitText, margin + 5, y);
            y += (7 * splitText.length);
        });
    }

    private agregarNumerosPagina(doc: jsPDF) {
        const pageCount = doc.getNumberOfPages();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            // Omitir numero en portada (pag 1)
            if (i === 1) continue;

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
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

    private agregarTablaDetalles(doc: jsPDF, chartId: string, startY: number, margin: number): number {
        let y = startY;
        doc.setFontSize(10);
        const pageWidth = doc.internal.pageSize.getWidth();
        const boxWidth = pageWidth - (margin * 2);
        const rowHeight = 7;
        const headerHeight = 8;

        // Verificar espacio inicial para encabezado
        if (y + 20 > doc.internal.pageSize.getHeight()) {
            doc.addPage();
            y = margin;
        }

        let boxStartY = y;

        // Funcion auxiliar para cerrar la caja en la pagina actual
        const closeBox = () => {
            doc.setDrawColor(0);
            doc.rect(margin, boxStartY, boxWidth, y - boxStartY);
        };

        // Dibujar encabezado con fondo
        doc.setFillColor(240, 240, 240);
        doc.rect(margin, y, boxWidth, headerHeight, 'F');
        doc.setFont('helvetica', 'bold');

        const textY = y + 5.5; // Centrado vertical aproximado

        switch (chartId) {
            case 'chartHorasIter':
                doc.text('Etiqueta', margin + 2, textY);
                doc.text('Etapa', margin + 50, textY); // Nueva columna
                doc.text('Estimadas', margin + 90, textY);
                doc.text('Reales', margin + 120, textY);
                doc.text('Diferencia', margin + 150, textY);
                break;

            case 'chartHorasCategoria':
                doc.text('Categoría', margin + 2, textY);
                doc.text('Tiempo', margin + 100, textY);
                break;

            case 'chartTareasUser':
                doc.text('Usuario', margin + 2, textY);
                doc.text('Tareas', margin + 100, textY);
                break;

            case 'chartHorasDiaTarea':
                doc.text('Día', margin + 2, textY);
                doc.text('Tiempo', margin + 100, textY);
                break;

            case 'chartHorasIterDistrib':
                doc.text('Tarea', margin + 2, textY);
                doc.text('Tiempo', margin + 120, textY);
                break;
        }

        y += headerHeight;
        doc.setFont('helvetica', 'normal');

        const printRows = (items: any[], renderRow: (item: any, currentY: number) => void) => {
            items.forEach(item => {
                // Verificar salto de pagina
                if (y + rowHeight > doc.internal.pageSize.getHeight() - margin) {
                    closeBox(); // Cerrar caja en pagina actual
                    doc.addPage();
                    y = margin;
                    boxStartY = y;
                    doc.line(margin, y, margin + boxWidth, y); // Linea superior en nueva pagina
                }

                renderRow(item, y + 5);
                y += rowHeight;

                // Linea separadora interna
                doc.setDrawColor(220, 220, 220);
                doc.line(margin, y, margin + boxWidth, y);
            });
        };

        switch (chartId) {
            case 'chartHorasIter':
                printRows(this.horasIteracionDetalle, (d, currentY) => {
                    const diff = d.horas - d.estimadas;
                    doc.text(d.etiqueta, margin + 2, currentY);
                    doc.text(d.etapa || '-', margin + 50, currentY); // Mostrar etapa
                    doc.text(d.estimadas.toFixed(1), margin + 90, currentY);
                    doc.text(`${d.horas}h ${d.minutos}m`, margin + 120, currentY);
                    doc.setTextColor(diff > 0 ? 200 : 0, diff > 0 ? 0 : 150, 0);
                    doc.text(diff.toFixed(1), margin + 150, currentY);
                    doc.setTextColor(0, 0, 0);
                });
                break;

            case 'chartHorasCategoria':
                printRows(this.horasCategoriaDetalle, (d, currentY) => {
                    doc.text(d.categoria, margin + 2, currentY);
                    doc.text(`${d.horas}h ${d.minutos}m`, margin + 100, currentY);
                });
                break;

            case 'chartTareasUser':
                printRows(this.tareasUsuarioDetalle, (d, currentY) => {
                    doc.text(d.usuario, margin + 2, currentY);
                    doc.text(d.cantidad.toString(), margin + 100, currentY);
                });
                break;

            case 'chartHorasDiaTarea':
                printRows(this.horasDiaDetalle, (d, currentY) => {
                    doc.text(d.dia, margin + 2, currentY);
                    doc.text(`${d.horas}h ${d.minutos}m`, margin + 100, currentY);
                });
                break;

            case 'chartHorasIterDistrib':
                printRows(this.horasTareaDetalle, (d, currentY) => {
                    const tareaNombre = d.tarea.length > 50 ? d.tarea.substring(0, 50) + '...' : d.tarea;
                    doc.text(tareaNombre, margin + 2, currentY);
                    doc.text(`${d.horas}h ${d.minutos}m`, margin + 120, currentY);
                });
                break;
        }

        closeBox(); // Cerrar caja final
        return y;
    }

    private agregarEncabezado(doc: jsPDF, kairosLogo: HTMLImageElement | null, unpaLogo: HTMLImageElement | null) {
        const pageWidth = doc.internal.pageSize.getWidth();

        const logoW = 15;
        const logoH = 15;

        if (kairosLogo)
            doc.addImage(kairosLogo, 'PNG', 15, 10, logoW, logoH);

        if (unpaLogo)
            doc.addImage(unpaLogo, 'PNG', pageWidth - 15 - logoW, 10, logoW, logoH);

        // Fecha de generación centrada
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const fechaStr = `Generado: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
        doc.text(fechaStr, pageWidth / 2, 20, { align: 'center' });

        // Línea separadora
        doc.setDrawColor(180);
        doc.line(15, 25, pageWidth - 15, 25);
    }

}
