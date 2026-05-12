export const OFICIOS_SUGERIDOS = [
  "Plomero",
  "Electricista",
  "Albañil",
  "Pintor",
  "Gasista",
  "Jardinero",
  "Herrero",
  "Carpintero",
  "Climatización",
  "Cerrajero",
  "Techista",
  "Soldador",
  "Fumigador",
  "Limpieza",
  "Flete",
  "Mecánico",
  "Yesero",
  "Instalador",
];

export const PROFESIONES_SUGERIDAS = [
  "Desarrollador de software",
  "Contador",
  "Abogado",
  "Arquitecto",
  "Ingeniero",
  "Diseñador gráfico",
  "Marketing digital",
  "Administración",
  "Docente",
  "Psicólogo",
  "Community manager",
  "Analista de datos",
  "Traductor",
  "Consultor",
  "Escribano",
];

export const TOTAL_STEPS = 4;

export const STEP_VARIANTS = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

export const ICON_VARIANTS = {
  hidden: { scale: 0.7, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { delay: 0.1, duration: 0.3 } },
};
