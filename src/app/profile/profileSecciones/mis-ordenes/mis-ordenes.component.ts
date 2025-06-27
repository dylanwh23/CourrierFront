import { Component, HostBinding, inject, OnInit, OnDestroy } from '@angular/core';
import { PaqueteService } from '../../../servicios/paquete.service';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormGroup, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsuarioService } from '../../../servicios/usuario.service';
import { Subject } from 'rxjs';
import { takeUntil, switchMap, tap } from 'rxjs/operators';

// --- Interfaces (sin cambios) ---
export interface Ordenes {
  id: number;
  valor_total: number;
  ultima_fecha_actualizacion_estado: Date;
  tracking_id: string;
  descripcion: string;
  compras: Compra[];
  status: string;
}

export interface Compra {
  id: number;
  id_orden: number;
  proveedor: string;
  imagen_factura: string;
  valor_declarado: number;
  descripcion: string;
  estado: string;
}

@Component({
  selector: 'app-mis-ordenes',
  // standalone: true, // Asegúrate que tu componente esté configurado como standalone si es necesario
  imports: [NgIf, ReactiveFormsModule, NgFor, CommonModule],
  templateUrl: './mis-ordenes.component.html',
  styleUrl: './mis-ordenes.component.css'
})
export class MisOrdenesComponent implements OnInit, OnDestroy {
  // --- Propiedades y Inyección de Dependencias ---
  @HostBinding('class') classes = 'flex flex-col my-16 min-h-5/6 min-w-5/6 bg-white mx-auto p-4 rounded-lg shadow-lg';
  
  private paqueteService = inject(PaqueteService);
  public usuarioService = inject(UsuarioService);
  private fb = inject(FormBuilder);
  
  // --- Formularios Reactivos ---
  ordenForm!: FormGroup;
  compraForm!: FormGroup;

  // --- Estado del Componente ---
  isModalOpen = false;
  isCompraModalOpen = false;
  ordenes: Ordenes[] = [];
  user_id?: number;
  
  private destroy$ = new Subject<void>();

  // --- Ciclo de Vida: ngOnInit ---
  ngOnInit(): void {
    this.initForms();
    this.loadUserAndOrders();
  }

  /**
   * Inicializa los formularios reactivos para crear órdenes y compras.
   */
  private initForms(): void {
    this.ordenForm = this.fb.group({
      descripcion: ['', Validators.required],
      proveedor: ['', Validators.required],
      imagen_factura: ['', Validators.required], 
      valor_declarado: ['', [Validators.required, Validators.min(0)]],

      // El user_id se agregará dinámicamente antes de enviar.
    });

    this.compraForm = this.fb.group({
      descripcion: ['', Validators.required],
      proveedor: ['', Validators.required],
      imagen_factura: ['', Validators.required], 
      valor_declarado: ['', [Validators.required, Validators.min(0)]],
    });
  }

  /**
   * Se suscribe al observable del usuario para obtener su ID y luego
   * carga las órdenes asociadas. Este enfoque resiste la recarga de la página.
   */
  private loadUserAndOrders(): void {
    // Asumimos que `usuarioService.currentUser$` es un observable (ej. BehaviorSubject)
    // que emite el usuario actual.
    this.usuarioService.currentUser$
      .pipe(
        tap(user => {
          if (user && user.id) {
            this.user_id = user.id;
          } else {
            console.error("No se pudo obtener el usuario o el ID del usuario.");
            this.ordenes = []; // Limpiar órdenes si no hay usuario
          }
        }),
        switchMap(user => {
          if (!user || !user.id) {
            // Si no hay usuario, retorna un observable vacío para no continuar.
            return []; 
          }
          // Si hay usuario, cambia al observable que obtiene las órdenes.
          return this.paqueteService.getOrdenes(user.id);
        }),
        takeUntil(this.destroy$) // Cancela la suscripción cuando el componente se destruye.
      )
      .subscribe({
        next: (response) => {
          console.log('Órdenes obtenidas exitosamente:', response);
          this.ordenes = response;
        },
        error: (error) => {
          console.error('Error al obtener las órdenes:', error);
          this.ordenes = []; // En caso de error, asegurar que las órdenes estén vacías.
        }
      });
  }

  /**
   * Obtiene la lista de órdenes del usuario actual.
   * Se llama para refrescar la data después de una acción.
   */
  getOrdenes(): void {
    if (this.user_id !== undefined) {
      this.paqueteService.getOrdenes(this.user_id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            console.log('Órdenes actualizadas:', response);
            this.ordenes = response;
          },
          error: (error) => console.error('Error al refrescar las órdenes:', error)
        });
    } else {
      console.error('No se puede refrescar la data porque el User ID es indefinido.');
    }
  }

  /**
   * Maneja la creación de una nueva orden.
   */
  altaOrden(): void {
    if (this.ordenForm.invalid || this.user_id === undefined) {
      console.error("Formulario de orden inválido o ID de usuario no disponible.");
      return;
    }

    const ordenData = {
      ...this.ordenForm.value,
      user_id: this.user_id
    };

    this.paqueteService.altaOrden(ordenData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Orden creada exitosamente:', response);
          this.getOrdenes(); // <<--- ACTUALIZACIÓN AUTOMÁTICA
          this.isModalOpen = false;
          this.ordenForm.reset();
        },
        error: (error) => console.error('Error al crear la orden:', error)
      });
  }

  /**
   * Maneja la creación de una nueva compra asociada a una orden.
   * @param ordenId - El ID de la orden a la que se agregará la compra.
   */
  altaCompra(ordenId: number): void {
    if (this.compraForm.invalid) {
        console.error("Formulario de compra inválido.");
        return;
    }

    this.paqueteService.altaCompra(this.compraForm.value, ordenId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Compra creada exitosamente:', response);
          this.getOrdenes(); // <<--- ACTUALIZACIÓN AUTOMÁTICA
          this.isCompraModalOpen = false;
          this.compraForm.reset();
        },
        error: (error) => console.error('Error al crear la compra:', error)
      });
  }

  confirmarEnvioOrden(orden_id: number): void {
    this.paqueteService.confirmarEnvioOrden(orden_id).subscribe({
      next: (response) => {
        console.log('Orden enviada exitosamente:', response);
        this.getOrdenes(); // <<--- ACTUALIZACIÓN AUTOMÁTICA
      },
      error: (error) => {
        console.error('Error al confirmar envío de orden:', error);
      }
    });
  }

  confirmarRecepcionCompra(compra_id: number): void {
    console.log('Confirmando recepción de compra con ID:', compra_id);
    this.paqueteService.confirmarRecepcionCompra(compra_id).subscribe({
      next: (response) => {
        console.log('Recepción de compra confirmada:', response);
        this.getOrdenes(); // <<--- ACTUALIZACIÓN AUTOMÁTICA
      },
      error: (error) => {
        console.error('Error al confirmar recepción de compra:', error);
      }
    });
  }



  // --- Ciclo de Vida: ngOnDestroy ---
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}