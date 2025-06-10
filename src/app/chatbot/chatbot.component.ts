import { Component, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  enviarMensaje(event: Event) {
    event.preventDefault();
    const texto = this.mensajeUsuario.trim();
    if (!texto) return;

    this.mensajes.push({ texto, esUsuario: true });
    this.mensajeUsuario = '';

    setTimeout(() => {
      this.mensajes.push({
        texto: 'Esta es una respuesta automática del chatbot.',
        esUsuario: false
      });
      
      setTimeout(() => this.scrollToBottom(), 0);
    }, 700);

    
    setTimeout(() => this.scrollToBottom(), 0);
  }

  private scrollToBottom() {
    if (this.mensajesContainer) {
      this.mensajesContainer.nativeElement.scrollTop = this.mensajesContainer.nativeElement.scrollHeight;
    }
  }
}