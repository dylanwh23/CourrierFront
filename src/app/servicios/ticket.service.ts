import { Injectable, NgZone, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import Pusher from 'pusher-js';
import { Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

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

  // Subject para notificar actualizaciones de tickets
  private ticketActualizadoSubject = new Subject<any>();
  public ticketActualizado$ = this.ticketActualizadoSubject.asObservable();



  constructor() {
    // Opcional: Intenta cargar el usuario al iniciar el servicio
    // Esto es útil si el usuario ya tiene una sesión activa en el backend

  }

  crearTicket(ticket: {
    orden_id: number,
    asunto: string,
    user_id: number
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/crearTickets`, ticket,{ withCredentials: true });
  }

  getMisTickets(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/misTickets`, { withCredentials: true });
  }

  getMensajesPorTicket(ticketId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/mensajesPorTicket/${ticketId}`, { withCredentials: true });
  }
  cambiarEstado(ticketId: number, estado: string) {
    return this.http.post<any>(`${this.apiUrl}/tickets/${ticketId}/estado`, { estado }, { withCredentials: true });
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
      //  Habilitar logs de Pusher
      Pusher.logToConsole = true;

      const canal = `ticket.${ticketId}`;
      console.log(' Suscribiéndome al canal:', canal);

      const pusher = new Pusher('70d89654e257e8793754', {
        cluster: 'sa1',
        forceTLS: true // o false si usás Laravel WebSockets en localhost
      });

      const channel = pusher.subscribe(canal);

      channel.bind('MensajeEnviado', (data: any) => {
        console.log(' [MENSAJE RECIBIDO] Evento MensajeEnviado:', data);
        this.ngZone.run(() => observer.next(data));
      });

      // Verificar conexión
      pusher.connection.bind('connected', () => {
        console.log('✅ Conectado a Pusher');
      });

      pusher.connection.bind('error', (err: any) => {
        console.error('❌ Error en conexión Pusher:', err);
      });

      // Cleanup
      return () => {
        console.log('❌ Desuscribiéndome del canal:', canal);
        pusher.unsubscribe(canal);
       
      };
    });
  }

 escucharTicketActualizado(userId: number, esAgente: boolean = false): Observable<any> {
  return new Observable(observer => {
    Pusher.logToConsole = true;
    const canal = esAgente ? `agente.${userId}` : `usuario.${userId}`;
    const pusher = new Pusher('70d89654e257e8793754', {
      cluster: 'sa1',
      forceTLS: true,
    });

    const channel = pusher.subscribe(canal);

    channel.bind('TicketActualizado', (data: any) => {
      this.ngZone.run(() => {
        observer.next(data);
        this.ticketActualizadoSubject.next(data);
      });
    });
    return () => {
      pusher.unsubscribe(canal);
       //  Esto cierra toda la conexión WebSocket
    };
  });
}
  // Métodos helper para iniciar escucha según el rol
  escucharComoUsuario(userId: number): Observable<any> {
    return this.escucharTicketActualizado(userId, false);
  }

  escucharComoAgente(agenteId: number): Observable<any> {
    return this.escucharTicketActualizado(agenteId, true);
  }
}
