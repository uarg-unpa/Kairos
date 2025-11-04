import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Etapa } from '../../models/etapa.model';
import { EtapaService } from '../../services/etapa.service';

@Component({
  selector: 'app-etapas',
  standalone: true,
  templateUrl: './etapas.component.html',
  styleUrls: ['./etapas.component.css'],
  imports: [CommonModule, FormsModule, RouterModule]
})
export class EtapasComponent implements OnInit {
  proyectoId?: number;
  etapas: Etapa[] = [];
  loading = false;
  private addEtapaModal: any;

  nuevaEtapa: any = {
    nombre: '',
    descripcion: '',
    fechaInicio: '',
    fechaFin: ''
  };

  constructor(private etapaService: EtapaService) {}

  ngOnInit(): void {
    this.cargar();
    const modalEl = document.getElementById('addEtapaModal');
    // @ts-ignore
    if (modalEl && (window as any).bootstrap) {
      // @ts-ignore
      this.addEtapaModal = new (window as any).bootstrap.Modal(modalEl);
    }
  }

  cargar(): void {
    this.loading = true;
    const pid = this.proyectoId;
    this.etapaService.getEtapas().subscribe({
      next: (data) => { this.etapas = data; },
      error: () => { this.etapas = []; },
      complete: () => { this.loading = false; }
    });
  }

  abrirModal() { this.addEtapaModal?.show(); }
  cerrarModal() { this.addEtapaModal?.hide(); }

  crearEtapa() {
    if (!this.proyectoId) { alert('Ingresá un Proyecto ID'); return; }
    if (!this.nuevaEtapa.nombre?.trim()) { alert('Nombre es obligatorio'); return; }

    const body = {
      nombre: this.nuevaEtapa.nombre,
      descripcion: this.nuevaEtapa.descripcion,
      fechaInicio: this.nuevaEtapa.fechaInicio || null,
      fechaFin: this.nuevaEtapa.fechaFin || null
    };

    this.etapaService.crearEtapa(body).subscribe({
      next: () => {
        this.cerrarModal();
        this.nuevaEtapa = { nombre: '', descripcion: '', fechaInicio: '', fechaFin: '' };
        this.cargar();
      },
      error: (err) => {
        console.error(err);
        alert('Error al crear la etapa');
      }
    });
  }
}
