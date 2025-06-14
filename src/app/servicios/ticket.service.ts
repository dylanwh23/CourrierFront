import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private apiUrl = 'http://localhost:8000';

  private http = inject(HttpClient);

  constructor() { }

  getMisTicketsAgente(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/misTicketsAgente`, { withCredentials: true });
  }
}
