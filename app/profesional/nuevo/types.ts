export interface ProfesionalForm {
  nombre: string;
  apellido: string;
  telefono: string;
  whatsapp: string;
  tipo: "oficio" | "profesion" | "";
  oficios: string[];
  oficioCustom: string;
  descripcion: string;
  experiencia: string;
  pin: string;
  pinConfirm: string;
}

export interface AiForm {
  anios: string;
  zona: string;
}
