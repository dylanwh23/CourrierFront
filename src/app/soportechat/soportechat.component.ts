import { Component, ViewChild, ElementRef, AfterViewChecked, OnInit, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { TicketService } from '../servicios/ticket.service';
import { UsuarioService } from '../servicios/usuario.service';

interface Ticket {
  id: number;
  numero?: string;
  nombre?: string;
  email?: string;
  ultimaConsulta?: string;
  asunto?: string;
  orden_id?: number;
  estado?: string;
  user_id?: number;
  agente_id?: number;
  agente_email?: string;
}

interface Mensaje {
  texto: string;
  esUsuario: boolean;
}

@Component({
  selector: 'app-soportechat',
  templateUrl: './soportechat.component.html',
  styleUrls: ['./soportechat.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class SoportechatComponent implements AfterViewChecked, OnInit, OnDestroy {
  tickets: Ticket[] = [];
  ticketSeleccionado: Ticket | null = null;

  mensajesPorTicket: { [ticketId: number]: Mensaje[] } = {};

  mensajeUsuario = '';

  escribiendoAgente = false;

  usuarioTicket: any = null;

  agenteNombre: string = '';
  agenteApellido: string = '';

  userId: number = 0;

  private sseSubscription?: Subscription;

  @ViewChild('mensajesContainer') mensajesContainer!: ElementRef<HTMLDivElement>;

  constructor(
    private ticketService: TicketService,
    private usuarioService: UsuarioService,
    @Inject(PLATFORM_ID) private platformId: Object

  ) {}

 ngOnInit(): void {
  this.ticketService.getMisTicketsAgente().subscribe({
    next: (tickets) => {
      this.tickets = tickets;
    }
  });

  if (isPlatformBrowser(this.platformId)) {
    this.agenteNombre = localStorage.getItem('user_name') || '';
    this.agenteApellido = localStorage.getItem('user_surname') || '';
    this.userId = Number(localStorage.getItem('user_id')) || 0;

    // 👇 Este también lo metemos acá adentro
    document.title = `Soporte ChinaGO - ${this.agenteNombre} ${this.agenteApellido}`;
  }
}

  seleccionarTicket(ticket: Ticket) {
    this.ticketSeleccionado = ticket;
    this.usuarioTicket = null;

    // Cargar mensajes previos
    this.ticketService.getMensajesPorTicket(ticket.id).subscribe({
      next: (mensajes) => {
        this.mensajesPorTicket[ticket.id] = mensajes.map((m: any) => ({
          texto: m.contenido,
          esUsuario: m.user_id === this.userId
        }));
        setTimeout(() => this.scrollToBottom(), 0);
      },
      error: () => {
        this.mensajesPorTicket[ticket.id] = [];
      }
    });

    // Cancelar suscripción SSE anterior si existe
    if (this.sseSubscription) {
      this.sseSubscription.unsubscribe();
    }

    // Suscribirse al SSE para recibir nuevos mensajes en tiempo real
    this.sseSubscription = this.ticketService.escucharMensajes(ticket.id).subscribe({
      next: (data) => {
         console.log('Mensaje SSE recibido:', data);
        if (!this.mensajesPorTicket[ticket.id]) {
          this.mensajesPorTicket[ticket.id] = [];
        }

        this.mensajesPorTicket[ticket.id].push({
          texto: data.contenido,
          esUsuario: data.user_id === this.userId
        });

        setTimeout(() => this.scrollToBottom(), 0);
      },
      error: (err) => {
        
        console.error('Error SSE:', err);
      },
      
    });

    // Cargar datos del usuario correspondiente (cliente o agente)
    if (this.userId === ticket.user_id && ticket.agente_id) {
      this.usuarioService.consultarUsuarioPorIdSoloAgentes(ticket.agente_id).subscribe({
        next: (usuario) => {
          this.usuarioTicket = usuario;
        },
        error: () => {
          this.usuarioTicket = null;
        }
      });
    } else if (ticket.user_id) {
      this.usuarioService.consultarUsuarioPorIdSoloAgentes(ticket.user_id).subscribe({
        next: (usuario) => {
          this.usuarioTicket = usuario;
        },
        error: () => {
          this.usuarioTicket = null;
        }
      });
    }

    this.mensajeUsuario = '';
  }

  get mensajes(): Mensaje[] {
    if (!this.ticketSeleccionado) return [];
    return this.mensajesPorTicket[this.ticketSeleccionado.id] || [];
  }

  enviarMensaje(event: Event) {
    event.preventDefault();
    const texto = this.mensajeUsuario.trim();
    if (!texto || !this.ticketSeleccionado) return;

    const mensajePayload = {
      contenido: texto,
      user_id: this.userId
    };

    this.ticketService.addMensaje(this.ticketSeleccionado.id, mensajePayload).subscribe({
      next: (nuevoMensaje) => {
        if (!this.mensajesPorTicket[this.ticketSeleccionado!.id]) {
          this.mensajesPorTicket[this.ticketSeleccionado!.id] = [];
        }
        this.mensajesPorTicket[this.ticketSeleccionado!.id].push({
          texto: nuevoMensaje.contenido,
          esUsuario: true
        });
        this.mensajeUsuario = '';
        setTimeout(() => this.scrollToBottom(), 0);
      }
    });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom() {
    if (this.mensajesContainer) {
      this.mensajesContainer.nativeElement.scrollTop = this.mensajesContainer.nativeElement.scrollHeight;
    }
  }

  ngOnDestroy(): void {
    if (this.sseSubscription) {
      this.sseSubscription.unsubscribe();
    }
  }
}
