
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SessionTokenService {
    private _token: string | null = null;

    private expiredSubject = new Subject<void>();
    expired$ = this.expiredSubject.asObservable();

    get token(): string | null {
        return this._token;
    }

    set token(value: string | null) {
        this._token = value;
    }

    expire(): void {
        this._token = null;
        this.expiredSubject.next();
    }
}
