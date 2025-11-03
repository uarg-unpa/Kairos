import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Iteracion } from '../../models/iteracion.model';
import { IteracionService } from '../../services/iteracion.service';

@Component({
  selector: 'app-iteraciones',
  standalone: true,
  templateUrl: './iteraciones.component.html',
  styleUrls: ['./iteraciones.component.css'],
  imports: [CommonModule, RouterModule]
})
export class IteracionesComponent implements OnInit {
  etapaId!: number;
  iteraciones: Iteracion[] = [];
  loading = false;
  private addIterModal: any;

  nuevaIter: any = {
    numero: null as number | null,
    descripcion: '',
    fechaInicio: '',
    fechaFin: ''
  };

  constructor(private route: ActivatedRoute, private iteracionService: IteracionService) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(p => {
      const id = Number(p.get('etapaId'));
      if (id) {
        this.etapaId = id;
        this.cargar();
      }
    });

    const modalEl = document.getElementById('addIterModal');
    // @ts-ignore
    if (modalEl && (window as any).bootstrap) {
      // @ts-ignore
      this.addIterModal = new (window as any).bootstrap.Modal(modalEl);
    }
  }

  cargar(): void {
    this.loading = true;
    this.iteracionService.getIteracionesPorEtapa(this.etapaId).subscribe({
      next: (data) => { this.iteraciones = data; },
      error: () => { this.iteraciones = []; },
      complete: () => { this.loading = false; }
    });
  }

  abrirModal() { this.addIterModal?.show(); }
  cerrarModal() { this.addIterModal?.hide(); }

  crearIteracion() {
    if (!this.nuevaIter.numero && this.nuevaIter.numero !== 0) {
      alert('Ingresá el número de iteración');
      return;
    }
    const body = {
      numero: Number(this.nuevaIter.numero),
      descripcion: this.nuevaIter.descripcion,
      fechaInicio: this.nuevaIter.fechaInicio || null,
      fechaFin: this.nuevaIter.fechaFin || null
    } as Partial<Iteracion>;

    this.iteracionService.crearIteracion(this.etapaId, body).subscribe({
      next: () => {
        this.cerrarModal();
        this.nuevaIter = { numero: null, descripcion: '', fechaInicio: '', fechaFin: '' };
        this.cargar();
      },
      error: (err) => { console.error(err); alert('Error al crear iteración'); }
    });
  }
}
