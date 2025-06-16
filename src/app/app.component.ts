import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from './nav/nav.component';
import { ChatbotComponent } from '../app/chatbot/chatbot.component';
import { NgIf } from '@angular/common';
import { ActivatedRoute } from '@angular/router'; // Importa ActivatedRoute
import { EmailVerifiedComponent } from './email-verified/email-verified.component';
import { FooterComponent } from './footer/footer.component';  

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavComponent,ChatbotComponent, FooterComponent, NgIf, EmailVerifiedComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'CourrierFront';
  mostrarSuccessAlert: boolean = false;

  constructor(private route: ActivatedRoute) {}
  ngOnInit(): void {
    // Suscríbete a los queryParams para detectar cambios en la URL
    this.route.queryParams.subscribe((params) => {
      // Verifica si el parámetro 'email_verified' existe y es 'success'
      if (params['email_verified'] === 'success') {
        this.mostrarSuccessAlert = true;
      }
    });
  }
}
