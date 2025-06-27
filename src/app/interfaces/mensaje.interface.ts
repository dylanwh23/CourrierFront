export interface Mensaje {
  texto: string;
  esUsuario: boolean;
  enviado?: boolean; // opcional para manejar estado de envío
}
