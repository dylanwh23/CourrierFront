export interface Ticket {
  id: number;
  numero?: string;
  nombre?: string;
  email?: string;
  ultimaConsulta?: string;
  asunto?: string;
  orden_id?: number;
  estado?: string;
  user_id?: number;
  agente_id?: number;
  agente_email?: string;
  created_at?:string;
}