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

  // Tarifa por departamento actualizada
  private tarifasPorDepartamento: { [key: string]: number } = {
    'Montevideo': 0,
    'Canelones': 2,
    'San José': 5,
    'Maldonado': 5,
    // Resto: 8
  };

  calcularCosto(tipo: string, depto: string, pesoInput: string): void {
    const peso = parseFloat(pesoInput);

    if (!peso || peso <= 0 || !tipo || !depto) {
      this.resultado = null;
      this.tarifaSugerida = '';
      return;
    }

    let costoPorKg = 0;
    let mensaje = '';

    if (tipo === 'Envio pequeño') {
      if (peso > 3) {
        this.resultado = null;
        this.tarifaSugerida = 'Peso excede el máximo para Envío pequeño.';
        return;
      }
      costoPorKg = 19.80;
      mensaje = 'Envío pequeño';
    }

    else if (tipo === 'Envio regular') {
      if (peso <= 0.9) {
        this.resultado = null;
        this.tarifaSugerida = 'Peso mínimo no válido para Envío regular.';
        return;
      } else if (peso <= 5) {
        costoPorKg = 21.90;
      } else if (peso <= 20) {
        costoPorKg = 16.50;
      } else if (peso <= 40) {
        costoPorKg = 13.20;
      } else {
        this.resultado = null;
        this.tarifaSugerida = 'Peso excede el máximo para Envío regular. Cotizar tarifa personalizada.';
        return;
      }
      mensaje = 'Envío regular';
    }

    else if (tipo === 'Tarifa Extra') {
      if (peso <= 10) {
        costoPorKg = 25.00;
      } else if (peso <= 30) {
        costoPorKg = 20.00;
      } else {
        this.resultado = null;
        this.tarifaSugerida = 'Peso excede el máximo para Tarifa Extra. Cotizar tarifa personalizada.';
        return;
      }
      mensaje = 'Tarifa Extra';
    }

    // Cálculo del costo base
    this.resultado = peso * costoPorKg;

    // Tarifa por departamento
    const tarifaDepto = this.tarifasPorDepartamento[depto] ?? 8;
    this.resultado += tarifaDepto;

    // Mensaje final
    this.tarifaSugerida = `${mensaje} - USD ${costoPorKg.toFixed(2)}/kg + USD ${tarifaDepto.toFixed(2)} por envío a ${depto}`;
  }
}
