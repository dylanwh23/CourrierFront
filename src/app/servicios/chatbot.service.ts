// chatbot.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ChatbotService {
  private apiUrl = 'http://localhost:8000'; // Ajusta tu URL si es necesario

  constructor(private http: HttpClient) {}

  enviarMensaje(mensaje: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/chatbot`, { mensaje }, { withCredentials: true });
  }
}
