import type { Professional } from "@/types";

export const PROFESION_KEYWORDS = [
  "desarroll", "contador", "abogad", "arquitect", "ingenier",
  "diseñ", "marketing", "administr", "docente", "psicolog",
  "community", "analista", "traductor", "consultor", "escriban",
  "programador", "software",
];

export const CATEGORIAS_OFICIOS = [
  "Plomero", "Electricista", "Albañil", "Pintor", "Gasista",
  "Jardinero", "Herrero", "Carpintero", "Cerrajero", "Techista",
  "Soldador", "Fumigador", "Limpieza", "Flete", "Climatización",
  "Mecánico", "Pinchazos", "Yesero", "Instalador",
];

export const normalizeText = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export function getProfessionalType(pro: Professional): "profesion" | "oficio" {
  const explicit = normalizeText(pro.tipo ?? "");
  if (explicit === "profesion" || explicit === "profesional") return "profesion";
  if (explicit === "oficio") return "oficio";
  const looksLikeProfesion = pro.oficios.some((o) =>
    PROFESION_KEYWORDS.some((kw) => normalizeText(o).includes(kw))
  );
  return looksLikeProfesion ? "profesion" : "oficio";
}
