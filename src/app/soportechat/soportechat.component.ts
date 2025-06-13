import { Component, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Ticket {
  id: number;
  numero: string;
  nombre: string;
  email: string;
  ultimaConsulta: string;
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
export class SoportechatComponent implements AfterViewChecked {
  tickets: Ticket[] = [
    { id: 1, numero: '12345', nombre: 'Juan Pérez', email: 'juan.perez@email.com', ultimaConsulta: 'Estado de envío' },
    { id: 2, numero: '12346', nombre: 'Ana Gómez', email: 'ana.gomez@email.com', ultimaConsulta: 'Costo de envío' },
    // ...puedes agregar más tickets de ejemplo...
  ];

  ticketSeleccionado: Ticket | null = null;

  // Mensajes por ticket
  mensajesPorTicket: { [ticketId: number]: Mensaje[] } = {};

  mensajeUsuario = '';

  escribiendoAgente = false;

  @ViewChild('mensajesContainer') mensajesContainer!: ElementRef<HTMLDivElement>;

  seleccionarTicket(ticket: Ticket) {
    this.ticketSeleccionado = ticket;
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
