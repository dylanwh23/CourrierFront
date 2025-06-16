import { Injectable, NgZone, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import Pusher from 'pusher-js';


@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private apiUrl = 'http://localhost:8000';
  private http = inject(HttpClient);
  
  private ngZone = inject(NgZone);  // INYECTAR NgZone aquí

  // Subject para notificar a componentes de nuevos mensajes
  private mensajeObserverSubject = new Subject<any>();
  public mensajeObserver$ = this.mensajeObserverSubject.asObservable();


  
  constructor() {
     

  }

  getMisTicketsAgente(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/misTickets`, { withCredentials: true });
  }

  getMensajesPorTicket(ticketId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/mensajesPorTicket/${ticketId}`, { withCredentials: true });
  }

  addMensaje(ticketId: number, mensaje: { contenido: string, user_id: number }): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/addMensaje/${ticketId}`,
      mensaje,
      { withCredentials: true }
    );
  }

escucharMensajes(ticketId: number): Observable<any> {
  return new Observable(observer => {
    const pusher = new Pusher('70d89654e257e8793754', {
      cluster: 'sa1',
      // No authEndpoint acá, porque es público
    });

    const channel = pusher.subscribe(`ticket.${ticketId}`); // canal público

    console.log('Suscribiéndome al canal público:', channel);

    channel.bind('nuevo-mensaje', (data: any) => {
      this.ngZone.run(() => observer.next(data));
    });

    return () => {
      pusher.unsubscribe(`ticket.${ticketId}`);
    };
  });
}
}