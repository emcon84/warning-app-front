export const RUBROS = [
  "Almacén/Despensa",
  "Restaurante/Comida",
  "Indumentaria",
  "Calzado",
  "Electrónica",
  "Tecnología/Informática",
  "Electricidad e Iluminacion",
  "Ferretería",
  "Materiales/Construcción",
  "Farmacia",
  "Salud/Bienestar",
  "Peluquería/Estética",
  "Librería/Papelería",
  "Veterinaria",
  "Deportes",
  "Mueblería",
  "Joyería/Relojería",
  "Automotriz/Mecánica",
  "Inmobiliaria",
  "Seguros/Finanzas",
  "Educación/Clases",
  "Fotografía/Arte",
  "Contaduría/Administración",
  "Agro/Cerealista",
  "Otro",
];

export const TOTAL_STEPS = 5;

export const STEP_VARIANTS = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

export const ICON_VARIANTS = {
  hidden: { scale: 0.7, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { delay: 0.1, duration: 0.3 } },
};
