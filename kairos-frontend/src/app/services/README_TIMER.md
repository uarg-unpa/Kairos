Cronómetro (solución frontend-only)

Flujo resumido
- Estado en localStorage namespaced por usuario: clave `kairos.timer.<userId>`.
- Al entrar a Workspace, se consulta `/auth/me` para conocer el `userId` y se restaura solo si la clave pertenece a ese usuario.
- Botones:
  - Iniciar: crea estado local y persiste en localStorage (no llama backend).
  - Pausar/Reanudar: solo ajustan estado local y el contador visual.
  - Detener: calcula segundos efectivos (descuenta pausas), llama a `POST /api/tiempos` y luego limpia localStorage.
- Salir: si hay timer activo (detectado leyendo localStorage), pide confirmación y, si aceptás, registra y limpia antes de cerrar sesión.

Estructura guardada en localStorage
- `kairos.timer.<userId>` → JSON con:
  - `userId`: número
  - `taskId`: número
  - `taskTitle`: string | null
  - `startTime`: timestamp (ms)
  - `isPaused`: boolean
  - `pausedAccumulatedMs`: número
  - `pausedSinceMs`: número | null

Puntos clave
- Namespacing evita que una sesión vea el cronómetro de otra cuenta en el mismo navegador.
- Si el usuario cierra el navegador sin detener, al volver a entrar con el mismo usuario se restaura su cronómetro; con otro usuario, no.
- El backend solo recibe el registro final al pulsar “Detener”.

Archivos relevantes
- Servicio: `src/app/services/timer.service.ts`
- Workspace: `src/app/pages/workspace/workspace-timer.component.*`
- Logout: `src/app/pages/salir/salir.*`

