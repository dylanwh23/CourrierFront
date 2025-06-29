import { Component, AfterViewChecked, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotService } from '../servicios/chatbot.service'; // Asegúrate de la ruta correcta

interface Mensaje {
  texto: string;
  esUsuario: boolean;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.css'
})
export class ChatbotComponent implements AfterViewChecked {
  mostrarChat = false;
  mensajeUsuario = '';
  mensajes: Mensaje[] = [
    { texto: '¡Hola! ¿En qué puedo ayudarte?', esUsuario: false }
  ];

  @ViewChild('mensajesContainer') mensajesContainer!: ElementRef<HTMLDivElement>;

  constructor(private chatbotService: ChatbotService) {}

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  enviarMensaje(event: Event) {
    event.preventDefault();
    const texto = this.mensajeUsuario.trim();
    if (!texto) return;

    this.mensajes.push({ texto, esUsuario: true });
    this.mensajeUsuario = '';

    // Llama al backend para obtener la respuesta de la IA
    this.chatbotService.enviarMensaje(texto).subscribe({
      next: (resp) => {
        // Ajusta la lógica según la respuesta del backend
        if (resp.tickets) {
          // Si la respuesta contiene lista de tickets
          this.mensajes.push({
            texto: 'Tus tickets:\n' + resp.tickets.map((t: any) => `#${t.id}: ${t.asunto} [${t.estado}]`).join('\n'),
            esUsuario: false
          });
        } else if (resp.respuesta) {
          // Si la respuesta es solo texto
          this.mensajes.push({
            texto: resp.respuesta,
            esUsuario: false
          });
        } else {
          // Respuesta genérica si no hay coincidencia
          this.mensajes.push({
            texto: 'No entendí tu pedido. ¿Podrías intentar de nuevo?',
            esUsuario: false
          });
        }
        setTimeout(() => this.scrollToBottom(), 0);
      },
      error: (error) => {
        // Trata de mostrar el mensaje retornado por el backend
        let detalle = 'Ha ocurrido un error comunicando con el asistente.';

        // Si el servidor responde con un mensaje específico en JSON
        if (error?.error?.respuesta) {
          detalle = error.error.respuesta;
        } else if (error?.error?.message) {
          detalle = error.error.message;
        } else if (error?.message) {
          // Si el error tiene un mensaje general (ej: fallo de conexión)
          detalle = `Error de conexión: ${error.message}`;
        }

        console.error('Error en chatbot:', error);

        this.mensajes.push({
          texto: detalle,
          esUsuario: false
        });

        setTimeout(() => this.scrollToBottom(), 0);
      }

    });
    setTimeout(() => this.scrollToBottom(), 0);
  }

  private scrollToBottom() {
    if (this.mensajesContainer) {
      this.mensajesContainer.nativeElement.scrollTop = this.mensajesContainer.nativeElement.scrollHeight;
    }
  }
}
