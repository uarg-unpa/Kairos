export interface Etapa {
  idEtapa: number;
  nombre: string;
  descripcion?: string;
  estado?: 'PENDIENTE' | 'EN_PROGRESO' | 'COMPLETADA';
  fechaInicio?: string;
  fechaFin?: string;
  progreso?: number;
  iteraciones?: number;
  idProyecto?: number;
}
