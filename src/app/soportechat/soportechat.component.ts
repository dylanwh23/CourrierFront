import { Component, ViewChild, ElementRef, AfterViewChecked, OnInit, OnDestroy, Inject, PLATFORM_ID, NgModule } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { TicketService } from '../servicios/ticket.service';
import { UsuarioService } from '../servicios/usuario.service';
import { RouterLink } from '@angular/router';
import { ThisReceiver } from '@angular/compiler';
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
  tickets: Ticket[] = [];
  
  ticketSeleccionado: Ticket | null = null;

  mensajesPorTicket: { [ticketId: number]: Mensaje[] } = {};

  mensajeUsuario = '';

  escribiendoAgente = false;

  usuarioTicket: any = null;
  esAgente: boolean = false;
  userId = 0;
  agenteNombre = '';
  agenteApellido = '';
  estadoConexion: 'activo' | 'desconectado' = 'desconectado';

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

  private sseSubscription?: Subscription;


  @ViewChild('mensajesContainer') mensajesContainer!: ElementRef<HTMLDivElement>;

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
    error: (err) => {
      console.error('No se pudo verificar si es agente:', err);
      // Podés mostrar algún mensaje o manejar el estado sin bloquear
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
  // crear ticket
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
      next: (ticketCreado) => {
        this.tickets.push(ticketCreado);
        this.cerrarModal();
        this.cargarTickets();
      },
      error: (err) => {
        console.error('Error creando ticket:', err);

        const mensaje = err?.error?.error ;
        alert(mensaje);
      }
    });
  }
  // cargar tickets
 cargarTickets() {
  this.ticketService.getMisTickets().subscribe({
    next: tickets => {
      // Ordenar: pendientes arriba, luego completados, dentro de cada grupo por id descendente
      this.tickets = tickets.sort((a, b) => {
        // Primero ordenar por estado: pendiente primero
        if (a.estado === 'pendiente' && b.estado !== 'pendiente') return -1;
        if (a.estado !== 'pendiente' && b.estado === 'pendiente') return 1;

        // Si tienen el mismo estado, ordenar por id descendente (mayor primero)
        return b.id - a.id;
      });
    }
  });
}

  //  Cambiar estado de conexión
  toggleEstadoConexion() {
    this.estadoConexion = this.estadoConexion === 'activo' ? 'desconectado' : 'activo';
    this.usuarioService.actualizarEstadoAgente({ estado: this.estadoConexion }).subscribe();
  }
  //  Seleccionar ticket en el cosod e la izquierda
  seleccionarTicket(ticket: Ticket) {
    this.ticketSeleccionado = ticket;
    this.usuarioTicket = null;

    this.cargarMensajes(ticket.id);
    this.suscribirSSE(ticket.id);
    this.cargarUsuario(ticket);

    this.mensajeUsuario = '';
  }
  //  Cargar mensajes del ticket seleccionado
  private cargarMensajes(ticketId: number) {
    this.ticketService.getMensajesPorTicket(ticketId).subscribe({
      next: mensajes => {
        this.mensajesPorTicket[ticketId] = mensajes.map((m: any) => ({
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
  // eventos pusher
  private suscribirSSE(ticketId: number) {
    if (this.sseSubscription) {
      this.sseSubscription.unsubscribe();
    }
  // eventos pusher mensjes
    this.sseSubscription = this.ticketService.escucharMensajes(ticketId).subscribe({
      next: data => {
        if (data.user_id === this.userId) {
          //  Ignorar mensaje si es del mismo usuario (ya se agregó localmente)
          return;
        }

        if (!this.mensajesPorTicket[ticketId]) {
          this.mensajesPorTicket[ticketId] = [];
        }

        this.mensajesPorTicket[ticketId].push({
          texto: data.contenido,
          esUsuario: false //  viene de otro usuario
        });

        setTimeout(() => this.scrollToBottom(), 0);
      },
      error: err => {
        console.error('Error SSE:', err);
      }
    });
  }
  // Cargar usuario del ticket seleccionado
  // Si el ticket tiene es agente_id, cargar ese usuario, sino cargar user_id
  private cargarUsuario(ticket: Ticket) {
    const idUsuario =
      this.userId === ticket.user_id && ticket.agente_id ? ticket.agente_id : ticket.user_id;

    if (idUsuario) {
      this.usuarioService.consultarUsuarioPorIdSoloAgentes(idUsuario).subscribe({
        next: usuario => (this.usuarioTicket = usuario),
        error: () => (this.usuarioTicket = null)
      });
    }
  }

  get mensajes(): Mensaje[] {
    if (!this.ticketSeleccionado) return [];
    return this.mensajesPorTicket[this.ticketSeleccionado.id] || [];
  }

  enviarMensaje(event: Event) {
    event.preventDefault();
    const texto = this.mensajeUsuario.trim();
    if (!texto || !this.ticketSeleccionado) return;

    // Añadir mensaje inmediatamente en UI (optimistic update)
    const ticketId = this.ticketSeleccionado.id;
    if (!this.mensajesPorTicket[ticketId]) {
      this.mensajesPorTicket[ticketId] = [];
    }
    const mensajeLocal: Mensaje = {
      texto,
      esUsuario: true,
      enviado: false // estado pendiente
    };
    this.mensajesPorTicket[ticketId].push(mensajeLocal);
    this.mensajeUsuario = '';
    setTimeout(() => this.scrollToBottom(), 0);

    // Enviar mensaje al backend
    const mensajePayload = { contenido: texto, user_id: this.userId };
    this.ticketService.addMensaje(ticketId, mensajePayload).subscribe({
      next: nuevoMensaje => {
        // Actualizar estado del mensaje local a enviado
        mensajeLocal.enviado = true;
        // Opcional: actualizar texto o datos si backend devuelve algo distinto
      },
      error: err => {
        console.error('Error enviando mensaje:', err);
        // Opcional: marcar mensaje como error o eliminarlo de la lista
        mensajeLocal.enviado = false;
        // También puedes mostrar un aviso al usuario
      }
    });
  }
  marcarComoCompletado(ticketId?: number) {
    if (!ticketId) return; // No hacer nada si es undefined o null o 0

    this.ticketService.cambiarEstado(ticketId, 'completado').subscribe({
      next: () => {
        this.cargarTickets();
         if (this.tickets.length > 0) {
        this.seleccionarTicket(this.tickets[0]);
      }
      },
      error: err => {
        console.error('Error al cambiar estado del ticket:', err);
      }
    });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom() {
    if (this.mensajesContainer) {
      const el = this.mensajesContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }

  ngOnDestroy(): void {
    if (this.sseSubscription) {
      this.sseSubscription.unsubscribe();
    }
  }

  // variables modal 
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