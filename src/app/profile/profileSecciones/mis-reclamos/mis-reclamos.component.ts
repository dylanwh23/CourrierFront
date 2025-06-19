import { Component, ViewChild, ElementRef, AfterViewChecked, OnInit, OnDestroy, Inject, PLATFORM_ID, HostBinding } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { TicketService } from '../../../servicios/ticket.service';
import { UsuarioService } from '../../../servicios/usuario.service';
import { RouterLink } from '@angular/router';
import { Ticket } from '../../../interfaces/ticket.interface';
import { Mensaje } from '../../../interfaces/mensaje.interface'; 

@Component({
  selector: 'app-mis-reclamos',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './mis-reclamos.component.html',
  styleUrl: './mis-reclamos.component.css',
})
export class MisReclamosComponent implements AfterViewChecked, OnInit, OnDestroy {

  @HostBinding('class') classes = 'flex flex-col min-h-5/6 min-w-5/6 bg-white mx-auto p-4 rounded-lg shadow-lg';

  mensajesPorTicket: { [ticketId: number]: Mensaje[] } = {};
  tickets: Ticket[] = [];
  mostrarModalCrearTicket = false;
  esAgente = false;
  userId = 0;
  agenteNombre = '';
  agenteApellido = '';
  estadoConexion: 'activo' | 'desconectado' = 'desconectado';

  nuevoTicket: {
    orden_id: number | null,
    asunto: string,
    user_id: number | null
  } = {
    orden_id: null,
    asunto: '',
    user_id: null
  };

  constructor(
    private ticketService: TicketService,
    private usuarioService: UsuarioService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    this.usuarioService.esAgente().subscribe({
      next: (res) => {
        this.esAgente = res.es_agente;
        this.estadoConexion = res.estado === 'activo' ? 'activo' : 'desconectado';
      },
      error: () => {
        console.error('No se pudo verificar si es agente');
      }
    });

    if (isPlatformBrowser(this.platformId)) {
      this.agenteNombre = localStorage.getItem('user_name') || '';
      this.agenteApellido = localStorage.getItem('user_surname') || '';
      this.userId = Number(localStorage.getItem('user_id')) || 0;
      document.title = `Soporte ChinaGO - ${this.agenteNombre} ${this.agenteApellido}`;
    }

    this.cargarTickets();
  }

  abrirModalCrearTicket() {
    this.mostrarModalCrearTicket = true;
  }

  cerrarModal() {
    this.mostrarModalCrearTicket = false;
    this.limpiarNuevoTicket();
  }

  limpiarNuevoTicket() {
    this.nuevoTicket = {
      orden_id: null,
      asunto: '',
      user_id: null
    };
  }

  crearTicket() {
    if (!this.nuevoTicket.orden_id || !this.nuevoTicket.asunto.trim()) {
      alert('Por favor, completa todos los campos.');
      return;
    }

    const payload = {
      orden_id: this.nuevoTicket.orden_id!,
      asunto: this.nuevoTicket.asunto.trim(),
      user_id: this.esAgente ? this.nuevoTicket.user_id! : this.userId!
    };

    this.ticketService.crearTicket(payload).subscribe({
      next: (ticketCreado: Ticket) => {
        this.tickets.push(ticketCreado);
        this.cerrarModal();
        this.cargarTickets();
      },
      error: (err) => {
        console.error('Error creando ticket:', err);
        const mensaje = err?.error?.error;
        alert(mensaje);
      }
    });
  }

   cargarTickets() {
    this.ticketService.getMisTickets().subscribe({
      next: (tickets: Ticket[]) => {
        this.tickets = tickets.sort((a, b) => {
          if (a.estado === 'pendiente' && b.estado !== 'pendiente') return -1;
          if (a.estado !== 'pendiente' && b.estado === 'pendiente') return 1;
          return b.id - a.id;
        });

        // Opcional: cargar últimos mensajes para cada ticket si tienes API para eso
        this.tickets.forEach(ticket => {
          this.cargarUltimosMensajes(ticket.id);
        });
      },
      error: err => {
        console.error('Error cargando tickets:', err);
      }
    });
  }

  cargarUltimosMensajes(ticketId: number) {
  this.ticketService.getMensajesPorTicket(ticketId).subscribe({
    next: mensajes => {
      this.mensajesPorTicket[ticketId] = mensajes.map((m: any) => ({
        texto: m.contenido,
        esUsuario: false // o m.user_id === this.userId si tenés userId disponible
      }));
    },
    error: () => {
      this.mensajesPorTicket[ticketId] = [];
    }
  });
}

  ngAfterViewChecked() { }
  ngOnDestroy(): void { }
}
