import {
  Component, ViewChild, ElementRef, AfterViewChecked, OnInit,
  OnDestroy, Inject, PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { TicketService } from '../servicios/ticket.service';
import { UsuarioService } from '../servicios/usuario.service';
import { RouterLink } from '@angular/router';
import { Ticket } from '../interfaces/ticket.interface';
import { Mensaje } from '../interfaces/mensaje.interface';

@Component({
  selector: 'app-soportechat',
  templateUrl: './soportechat.component.html',
  styleUrls: ['./soportechat.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink]
})

export class SoportechatComponent implements AfterViewChecked, OnInit, OnDestroy {

  // Variables principales de estado
  tickets: Ticket[] = [];
  ticketSeleccionado: Ticket | null = null;
  mensajesPorTicket: { [ticketId: number]: Mensaje[] } = {};
  nuevosMensajesPorTicket: { [ticketId: number]: number } = {};//para globitos notificacion
  private mensajeSubscriptions: Subscription[] = [];//para globitos notificacion
  mensajeUsuario = '';
  usuarioTicket: any = null;
  esAgente: boolean = false;
  userId = 0;
  agenteNombre = '';
  agenteApellido = '';
  estadoConexion: 'activo' | 'desconectado' = 'desconectado';


  // Modal creación de ticket
  mostrarModalCrearTicket = false;
  nuevoTicket: {
    orden_id: number | null,
    asunto: string,
    user_id: number | null
  } = {
      orden_id: null,
      asunto: '',
      user_id: null
    };

  // Subscripciones
  private suscripcionTicketEventos?: Subscription;
  private mensajeSubscription?: Subscription;

  // Referencia al contenedor de mensajes
  @ViewChild('mensajesContainer') mensajesContainer!: ElementRef<HTMLDivElement>;

  constructor(
    private ticketService: TicketService,
    private usuarioService: UsuarioService,
    @Inject(PLATFORM_ID) private platformId: Object

  ) { console.log('SoportechatComponent constructor'); }

  // ====== INIT & DESTRUCCIÓN ======
  ngOnInit(): void {
    this.InitEsAgente();

    if (isPlatformBrowser(this.platformId)) {
      this.agenteNombre = localStorage.getItem('user_name') || '';
      this.agenteApellido = localStorage.getItem('user_surname') || '';
      this.userId = Number(localStorage.getItem('user_id')) || 0;
      document.title = `Soporte ChinaGO - ${this.agenteNombre} ${this.agenteApellido}`;
    }

    if (this.userId > 0) {
      this.suscribirEventosTickets();
    }
    this.cargarTickets();
  }

  ngOnDestroy(): void {
    if (this.mensajeSubscription) this.mensajeSubscription.unsubscribe();
    if (this.suscripcionTicketEventos) this.suscripcionTicketEventos.unsubscribe();
  }

  // ====== FUNCIONES DE TICKETS ======
  cargarTickets() {
    console.log('[CARGAR TICKETS]');
    console.trace();
    this.ticketService.getMisTickets().subscribe({
      next: tickets => {
        this.tickets = tickets.sort((a, b) => {
          if (a.estado === 'pendiente' && b.estado !== 'pendiente') return -1;
          if (a.estado !== 'pendiente' && b.estado === 'pendiente') return 1;
          return b.id - a.id;

        });
        this.suscribirMensajesPendientes();
        if (this.tickets.length === 0) {
          this.ticketSeleccionado = null;
          return;
        }

        if (this.ticketSeleccionado) {
          const existe = this.tickets.find(t => t.id === this.ticketSeleccionado!.id);
          if (existe) {
            this.seleccionarTicket(existe);
            return;
          }
        }

        this.seleccionarTicket(this.tickets[0]);
      },
      error: (err) => {
        console.error('Error al cargar tickets:', err);
        this.ticketSeleccionado = null;
      }
    });
  }

  seleccionarTicket(ticket: Ticket) {
    this.ticketSeleccionado = ticket;
    this.usuarioTicket = null;
    this.nuevosMensajesPorTicket[ticket.id] = 0;
    this.cargarMensajes(ticket.id);

    this.cargarUsuario(ticket);
    this.mensajeUsuario = '';
  }

  marcarComoCompletado(ticketId?: number) {
    if (!ticketId) return;
    this.ticketService.cambiarEstado(ticketId, 'completado').subscribe({
      next: () => this.cargarTickets(),
      error: err => console.error('Error al cambiar estado del ticket:', err)
    });
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
      next: ticketCreado => {
        this.tickets.push(ticketCreado);
        this.cerrarModal();
        this.cargarTickets();
      },
      error: err => {
        console.error('Error creando ticket:', err);
        alert(err?.error?.error);
      }
    });
  }

  // ====== FUNCIONES DE MENSAJES ======
  get mensajes(): Mensaje[] {
    if (!this.ticketSeleccionado) return [];
    return this.mensajesPorTicket[this.ticketSeleccionado.id] || [];
  }

  enviarMensaje(event: Event) {
    event.preventDefault();
    const texto = this.mensajeUsuario.trim();
    if (!texto || !this.ticketSeleccionado) return;

    const ticketId = this.ticketSeleccionado.id;
    if (!this.mensajesPorTicket[ticketId]) {
      this.mensajesPorTicket[ticketId] = [];
    }

    const mensajeLocal: Mensaje = {
      texto,
      esUsuario: true,
      enviado: false
    };
    this.mensajesPorTicket[ticketId].push(mensajeLocal);
    this.mensajeUsuario = '';
    setTimeout(() => this.scrollToBottom(), 0);

    const mensajePayload = { contenido: texto, user_id: this.userId };
    this.ticketService.addMensaje(ticketId, mensajePayload).subscribe({
      next: () => mensajeLocal.enviado = true,
      error: err => {
        console.error('Error enviando mensaje:', err);
        mensajeLocal.enviado = false;
      }
    });
  }

  private cargarMensajes(ticketId: number) {
    this.ticketService.getMensajesPorTicket(ticketId).subscribe({
      next: mensajes => {

        this.mensajesPorTicket[ticketId] = mensajes.map(m => ({
          texto: m.contenido,
          esUsuario: m.user_id === this.userId
        }));
        setTimeout(() => this.scrollToBottom(), 0);
      },
      error: () => {
        this.mensajesPorTicket[ticketId] = [];
      }
    });
  }



  // ====== FUNCIONES PUSHER / SSE ======
  private suscribirEventosTickets() {
    if (this.suscripcionTicketEventos) this.suscripcionTicketEventos.unsubscribe();
    const canal = `usuario.${this.userId}`;
    console.log(`Suscribiendo a canal: ${canal}`);
    this.suscripcionTicketEventos = this.ticketService.escucharTicketActualizado(this.userId).subscribe({
      next: data => {
        console.log('Evento Ticket recibido', data);
        this.cargarTickets();
      },
      error: err => console.error('Error en suscripción Pusher:', err)
    });
  }
  // eventos pusher para mensajes tanto pendientes como actualeies
  private suscribirMensajesPendientes() {
    // Limpiamos suscripciones previas
    this.mensajeSubscriptions.forEach(sub => sub.unsubscribe());
    this.mensajeSubscriptions = [];

    const pendientes = this.tickets.filter(t => t.estado === 'pendiente');

    pendientes.forEach(ticket => {
      const sub = this.ticketService.escucharMensajes(ticket.id).subscribe({
        next: data => {
          if (data.user_id === this.userId) return;
          if (!this.mensajesPorTicket[ticket.id]) this.mensajesPorTicket[ticket.id] = [];

          this.mensajesPorTicket[ticket.id].push({
            texto: data.contenido,
            esUsuario: false
          });

          // Actualizar contador de mensajes nuevos solo si NO está seleccionado el ticket
          if (this.ticketSeleccionado?.id !== ticket.id) {
            this.nuevosMensajesPorTicket[ticket.id] = (this.nuevosMensajesPorTicket[ticket.id] || 0) + 1;
          }

          setTimeout(() => this.scrollToBottom(), 0);
        },
        error: err => console.error('Error SSE:', err)
      });

      this.mensajeSubscriptions.push(sub);
    });
  }

  // ====== FUNCIONES USUARIO ======
  private cargarUsuario(ticket: Ticket) {
    const idUsuario = this.userId === ticket.user_id && ticket.agente_id ? ticket.agente_id : ticket.user_id;
    if (idUsuario) {
      this.usuarioService.consultarUsuarioPorIdSoloAgentes(idUsuario).subscribe({
        next: usuario => this.usuarioTicket = usuario,
        error: () => this.usuarioTicket = null
      });
    }
  }
  toggleEstadoConexion() {
    this.estadoConexion = this.estadoConexion === 'activo' ? 'desconectado' : 'activo';
    this.usuarioService.actualizarEstadoAgente({ estado: this.estadoConexion }).subscribe();
  }
  InitEsAgente() {
    this.usuarioService.esAgente().subscribe({
      next: (res) => {
        this.esAgente = res.es_agente;
        this.estadoConexion = res.estado === 'activo' ? 'activo' : 'desconectado';
      },
      error: (err) => {
        console.error('No se pudo verificar si es agente:', err);
      }
    });
  }
  // ====== FUNCIONES UI / DOM ======
  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom() {
    if (this.mensajesContainer) {
      const el = this.mensajesContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
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


} 