import { Component } from '@angular/core';

@Component({
  selector: 'app-calculadora',
  imports: [],
  templateUrl: './calculadora.component.html',
  styleUrl: './calculadora.component.css'
})
export class CalculadoraComponent {
 resultado: number | null = null;

  calcularCosto(tipo: string, depto: string, peso: string) {
    let tipoValor = 0;
    let deptoValor = 0;

    switch (tipo) {
      case 'Documento':
        tipoValor = 1;
        break;
      case 'Paquete pequeño':
        tipoValor = 2;
        break;
      case 'Paquete mediano':
        tipoValor = 3;
        break;
      case 'Paquete grande':
        tipoValor = 4;
        break;
    }

    if (depto === 'Montevideo' || depto === 'Canelones') {
      deptoValor = 1;
    } else {
      deptoValor = 3;
    }

    this.resultado = tipoValor + deptoValor;
  }
}
