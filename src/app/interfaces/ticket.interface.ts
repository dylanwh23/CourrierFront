export interface Ticket {
  id: number;
  orden_id: number;
  asunto: string;
  estado: string;
  user_id: number;
  agente_id: number;
  // Otros campos opcionales para compatibilidad/mock
}
