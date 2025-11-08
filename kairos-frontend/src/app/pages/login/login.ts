import { AfterViewInit, Component, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ConfigService } from '../../services/config.service';

declare const google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements AfterViewInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private config = inject(ConfigService);
  private cdr = inject(ChangeDetectorRef);
  configError = '';

  ngAfterViewInit(): void {
    try {
      const clientId = this.getGoogleClientId();
      if (!clientId) {
        this.configError = 'Falta googleClientId en assets/env.json';
        this.cdr.detectChanges();
        return;
      }
      google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: any) => this.handleCredential(response?.credential)
      });
      const btn = document.getElementById('googleBtn');
      if (btn) {
        google.accounts.id.renderButton(btn, { theme: 'outline', size: 'large', width: 280 });
      }
    } catch (e) {
      console.error('No se pudo inicializar Google Sign-In:', e);
      this.configError = 'No se pudo inicializar Google Sign-In';
      this.cdr.detectChanges();
    }
  }

  private getGoogleClientId(): string {
    const fromConfig = this.config.get('googleClientId');
    const isPlaceholder = (val?: string | null) => !val || /TU_CLIENT_ID_DE_GOOGLE|PON_AQUI_TU_CLIENT_ID_DE_GOOGLE/i.test(val);
    if (!isPlaceholder(fromConfig)) return String(fromConfig);
    const meta = document.querySelector('meta[name="google-client-id"]') as HTMLMetaElement | null;
    const fromMeta = meta?.content?.trim();
    if (!isPlaceholder(fromMeta) && fromMeta) return fromMeta;
    console.error('Google Client ID no configurado. Define googleClientId en assets/env.json');
    return '';
  }

  private handleCredential(idToken: string | undefined): void {
    if (!idToken) return;
    this.auth.exchangeGoogleToken(idToken).subscribe({
      next: () => this.router.navigate(['/inicio']),
      error: (err) => console.error('Error autenticando con backend', err)
    });
  }
}
