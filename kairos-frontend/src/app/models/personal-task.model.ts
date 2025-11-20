export interface PersonalTask {
    id: number;
    nombre: string;
    descripcion: string;
    fechaCreacion: string;
    estado: 'BORRADOR' | 'PROPUESTA' | 'ACEPTADA' | 'RECHAZADA';
    proyectoPropuestoId?: number;
    categoriaPropuestaId?: number;
    usuario?: { id: number; nombre: string; email: string };
}
