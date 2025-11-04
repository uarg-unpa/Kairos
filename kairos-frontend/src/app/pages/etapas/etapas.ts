import { Component, OnInit, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from '../../services/usuarios';
import { EtapaService } from '../../services/etapa.service';
import { Etapa } from '../../models/etapa.model';
import { Router, RouterModule } from '@angular/router';

declare const bootstrap: any;

@Component({
  selector: 'app-etapas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './etapas.html'
})
export class EtapasComponent implements OnInit {
  private addStageModal: any;

  private usuariosService = inject(UsuariosService);
  private etapaService = inject(EtapaService);
  usuarios = this.usuariosService.usuarios; // usable si agregamos responsable en el futuro
  private router = inject(Router);

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

    this.etapaService.getEtapas().subscribe((data) => this.etapas = data);
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
    const payload = { nombre: this.nuevaEtapa.nombre, descripcion: this.nuevaEtapa.descripcion, fechaInicio: this.nuevaEtapa.fechaInicio, fechaFin: this.nuevaEtapa.fechaFin };
    this.etapaService.crearEtapa(payload).subscribe({
      next: (nueva) => {
        this.etapas = [nueva, ...this.etapas];
        this.resetForm();
        this.cerrarModalEtapa();
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
      },
      error: (err) => {
        console.error('Error eliminando etapa', err);
        alert('No se pudo eliminar la etapa');
      }
    });
  }
}
