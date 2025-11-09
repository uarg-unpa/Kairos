export interface Proyecto {
  idProyecto?: number;
  nombre: string;
  equipo: string;
  descripcion: string;
  fechaInicio?: string; // opcional
  fechaCreacion: string;
  estado: string;
  logo?: string; // base64 o URL
}