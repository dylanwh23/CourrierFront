import { Component, ViewChild, ElementRef, AfterViewChecked, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TicketService } from '../servicios/ticket.service';
import { UsuarioService } from '../servicios/usuario.service';
import { RouterLink } from '@angular/router';

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
  imports: [CommonModule, FormsModule, RouterLink]
})
export class SoportechatComponent implements AfterViewChecked, OnInit {
  tickets: Ticket[] = [];
  ticketSeleccionado: Ticket | null = null;

  // Mensajes por ticket
  mensajesPorTicket: { [ticketId: number]: Mensaje[] } = {};

  mensajeUsuario = '';

  escribiendoAgente = false;

  usuarioTicket: any = null;

  agenteNombre: string = '';
  agenteApellido: string = '';

  @ViewChild('mensajesContainer') mensajesContainer!: ElementRef<HTMLDivElement>;

  constructor(
    private ticketService: TicketService,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    // Llama al endpoint que lista los tickets del agente autenticado
    this.ticketService.getMisTicketsAgente().subscribe({
      next: (tickets) => {
        this.tickets = tickets;
      }
    });
    this.agenteNombre = localStorage.getItem('user_name') || '';
    this.agenteApellido = localStorage.getItem('user_surname') || '';
    document.title = `Soporte ChinaGO - ${this.agenteNombre} ${this.agenteApellido}`;
  }

  seleccionarTicket(ticket: Ticket) {
    this.ticketSeleccionado = ticket;
    // Consulta los datos del usuario del ticket
    this.usuarioTicket = null;
    if (ticket.user_id) {
      this.usuarioService.consultarUsuarioPorIdSoloAgentes(ticket.user_id).subscribe({
        next: (usuario) => {
          this.usuarioTicket = usuario;
        },
        error: () => {
          this.usuarioTicket = null;
        }
      });
    }
    // Inicializa los mensajes si no existen para el ticket
    if (!this.mensajesPorTicket[ticket.id]) {
      this.mensajesPorTicket[ticket.id] = [
        { texto: 'Hola, el bot no pudo responder mi consulta.', esUsuario: false },
        { texto: '¡Hola! Soy un agente de ChinaGO. ¿En qué puedo ayudarte?', esUsuario: true }
      ];
    }
    this.mensajeUsuario = '';
    setTimeout(() => this.scrollToBottom(), 0);
  }

  get mensajes(): Mensaje[] {
    if (!this.ticketSeleccionado) return [];
    return this.mensajesPorTicket[this.ticketSeleccionado.id] || [];
  }

  enviarMensaje(event: Event) {
    event.preventDefault();
    const texto = this.mensajeUsuario.trim();
    if (!texto || !this.ticketSeleccionado) return;
    this.mensajesPorTicket[this.ticketSeleccionado.id].push({ texto, esUsuario: true });
    this.mensajeUsuario = '';

    // Mostrar "escribiendo" del agente
    this.escribiendoAgente = true;

    setTimeout(() => {
      if (!this.ticketSeleccionado) return;
      this.mensajesPorTicket[this.ticketSeleccionado.id].push({
        texto: 'Esta es una respuesta automática del agente.',
        esUsuario: false
      });
      this.escribiendoAgente = false;
      setTimeout(() => this.scrollToBottom(), 0);
    }, 700);

    setTimeout(() => this.scrollToBottom(), 0);
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom() {
    if (this.mensajesContainer) {
      this.mensajesContainer.nativeElement.scrollTop = this.mensajesContainer.nativeElement.scrollHeight;
    }
  }
}
