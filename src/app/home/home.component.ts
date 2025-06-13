import { Component, AfterViewInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Carousel } from 'flowbite';
import type {
  CarouselItem,
  CarouselOptions,
  CarouselInterface,
  InstanceOptions
} from 'flowbite';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  carousel: CarouselInterface | undefined;
  private timerId: any;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}
// para solucionar errores de Flowbite en SSR, se debe usar isPlatformBrowser para verificar si estamos en el navegador
  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const carouselElement = document.getElementById('animation-carousel');
    if (!carouselElement) return;

    const items: CarouselItem[] = [
      { position: 0, el: document.getElementById('carousel-item-1')! },
      { position: 1, el: document.getElementById('carousel-item-2')! },
      { position: 2, el: document.getElementById('carousel-item-3')! },
      { position: 3, el: document.getElementById('carousel-item-4')! },
      { position: 4, el: document.getElementById('carousel-item-5')! }
    ];

    const indicators = [
      document.getElementById('carousel-indicator-1'),
      document.getElementById('carousel-indicator-2'),
      document.getElementById('carousel-indicator-3'),
      document.getElementById('carousel-indicator-4'),
      document.getElementById('carousel-indicator-5')
    ];

    const options: CarouselOptions = {
      defaultPosition: 0,
      interval: 5000,
      indicators: {
        items: indicators.map((el, idx) => ({
          position: idx,
          el: el!
        })),
        activeClasses: 'bg-white border-white',
        inactiveClasses: 'bg-gray-500 border-white opacity-50'
      }
    };

    const instanceOptions: InstanceOptions = {
      id: 'animation-carousel',
      override: true
    };

    this.carousel = new Carousel(carouselElement, items, options, instanceOptions);

    // Función para reiniciar el timer y avanzar automáticamente
    const resetTimer = () => {
      if (this.timerId) clearInterval(this.timerId);
      this.timerId = setInterval(() => {
        this.carousel?.next();
      }, 5000);
    };

    // Iniciar el timer
    resetTimer();

    // Sincronizar botones prev/next y reiniciar timer al usarlos
    const $prevButton = document.getElementById('data-carousel-prev');
    const $nextButton = document.getElementById('data-carousel-next');
    $prevButton?.addEventListener('click', () => {
      this.carousel?.prev();
      resetTimer();
    });
    $nextButton?.addEventListener('click', () => {
      this.carousel?.next();
      resetTimer();
    });

    // Sincronizar los indicadores (circulitos) y reiniciar timer al usarlos
    indicators.forEach((btn, idx) => {
      if (btn) {
        btn.addEventListener('click', () => {
          this.carousel?.slideTo(idx);
          resetTimer();
        });
      }
    });
  }

  ngOnDestroy() {
    if (this.timerId) clearInterval(this.timerId);
  }
}
