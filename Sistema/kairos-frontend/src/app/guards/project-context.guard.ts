import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ProjectContextService } from '../services/project-context.service';

export const projectContextGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const ctx = inject(ProjectContextService);
  const last = ctx.getLastProjectId();
  const target = (route.data?.['target'] as string) || state.url.replace(/^\//, '');
  if (last) {
    return router.parseUrl(`/proyecto/${last}/${target}`);
  }
  return router.parseUrl('/inicio');
};

