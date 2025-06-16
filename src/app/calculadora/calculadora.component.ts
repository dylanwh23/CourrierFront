import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-calculadora',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './calculadora.component.html',
  styleUrl: './calculadora.component.css'
})
export class CalculadoraComponent {
  resultado: number | null = null;
  tarifaSugerida: string = '';

  departamentos: string[] = [
    'Artigas', 'Canelones', 'Cerro Largo', 'Colonia', 'Durazno',
    'Flores', 'Florida', 'Lavalleja', 'Maldonado', 'Montevideo',
    'Paysandú', 'Río Negro', 'Rivera', 'Rocha', 'Salto',
    'San José', 'Soriano', 'Tacuarembó', 'Treinta y Tres'
  ];

  calcularCosto(tipo: string, depto: string, pesoInput: string): void {
    const peso = parseFloat(pesoInput);

    if (!peso || peso <= 0) {
      this.resultado = null;
      this.tarifaSugerida = '';
      return;
    }

    let costoPorKg = 0;

    if (peso <= 0.9) {
      costoPorKg = 21.90;
      this.tarifaSugerida = 'Envío pequeño';
    } else if (peso <= 5) {
      costoPorKg = 21.90;
      this.tarifaSugerida = 'Envío pequeño';
    } else if (peso <= 20) {
      costoPorKg = 16.50;
      this.tarifaSugerida = 'Envío regular';
    } else if (peso <= 40) {
      costoPorKg = 13.20;
      this.tarifaSugerida = 'Tarifa Extra';
    } else {
      this.tarifaSugerida = 'Cotizar tarifa personalizada';
      this.resultado = null;
      return;
    }

    this.resultado = peso * costoPorKg;
  }
}
