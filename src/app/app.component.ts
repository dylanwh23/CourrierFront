import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from './nav/nav.component';
import { ChatbotComponent } from '../app/chatbot/chatbot.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavComponent,ChatbotComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'CourrierFront';
}
