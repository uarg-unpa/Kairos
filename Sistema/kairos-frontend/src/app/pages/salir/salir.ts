import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TimerService } from '../../services/timer.service';

@Component({
  selector: 'app-salir',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './salir.html'
})
export class SalirComponent implements OnInit {
  private auth = inject(AuthService);
  private timer = inject(TimerService);

  ngOnInit(): void {
    // Solo limpia el token para mostrar esta vista; no redirige automÃ¡ticamente
    this.timer.getActive().subscribe({
      next: (active) => {
        if (active) {
          const ok = window.confirm('Tenés un cronómetro activo. ¿Detener y salir?');
          if (!ok) {
            history.back();
            return;
          }
          this.timer.stop().subscribe({
            next: () => { this.timer.resetState(); this.auth.logout(); },
            error: () => { this.timer.resetState(); this.auth.logout(); },
          });
        } else {
          this.timer.resetState(); this.auth.logout();
        }
      },
      error: () => { this.timer.resetState(); this.auth.logout(); },
    });
  }
}





