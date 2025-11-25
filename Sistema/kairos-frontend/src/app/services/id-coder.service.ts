import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class IdCoderService {

  encode(id: number | string): string {
    const stringId = String(id);
    return btoa(stringId);
  }

  decode(encodedId: string): number | null {
    try {
      const decodedString = atob(encodedId);
      const id = parseInt(decodedString, 10);
      return isNaN(id) ? null : id;
    } catch (e) {
      console.error('Error decodificando ID:', encodedId, e);
      return null;
    }
  }
}