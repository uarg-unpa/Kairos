import { inject } from '@angular/core';
import { ResolveFn, ActivatedRouteSnapshot } from '@angular/router';
import { ProyectoService } from '../services/proyecto.service';

export const proyectoResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  const id = Number(route.paramMap.get('id'));
  if (!Number.isFinite(id)) return null as any;
  return inject(ProyectoService).getProyectoById(id);
};

