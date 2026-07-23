/**
 * Rubro / Oficio → Unsplash photo ID mapping.
 *
 * IDs must be old numeric format (timestamp-suffix), e.g. "1482049016688-2d3e1b311543".
 * New short-format IDs (e.g. "ZpIskW1Tuvc") return 404 from the CDN.
 *
 * Verified working IDs:
 *   1482049016688-2d3e1b311543  — food / restaurant
 *   1556742049-0cfed4f6a45d     — grocery / supermarket
 *   1441986300917-64674bd600d8  — clothing store
 *   1517694712202-14dd9538aa97  — bookstore / education
 *   1620653713380-7a34b773fef8  — plumber / pipes
 *   1507679799987-c73779587ccf  — lawyer / professional
 *   1621905251189-08b45d6a269e  — electrician / spark
 *   1581578731548-c64695cc6952  — tools / handyman
 *   1521791136064-7986c2920216  — handshake / business
 *   1453873531674-2151bcd01707  — city / alerts
 */

const RUBRO_PHOTOS: Record<string, string> = {
  // ── Comercios ──
  "Almacén/Despensa":          "1556742049-0cfed4f6a45d",
  "Restaurante/Comida":        "1482049016688-2d3e1b311543",
  "Indumentaria":              "1441986300917-64674bd600d8",
  "Calzado":                   "1441986300917-64674bd600d8",
  "Electrónica":               "",
  "Tecnología/Informática":    "",
  "Electricidad e Iluminacion":"",
  "Ferretería":                "1581578731548-c64695cc6952",
  "Materiales/Construcción":   "1581578731548-c64695cc6952",
  "Farmacia":                  "",
  "Salud/Bienestar":           "",
  "Peluquería/Estética":       "",
  "Librería/Papelería":        "1517694712202-14dd9538aa97",
  "Veterinaria":               "",
  "Deportes":                  "",
  "Mueblería":                 "",
  "Joyería/Relojería":         "",
  "Automotriz/Mecánica":       "",
  "Inmobiliaria":              "",
  "Seguros/Finanzas":          "1521791136064-7986c2920216",
  "Educación/Clases":          "1517694712202-14dd9538aa97",
  "Fotografía/Arte":           "",
  "Contaduría/Administración": "",
  "Agro/Cerealista":           "",
  "Otro":                      "",

  // ── Profesionales — Oficios ──
  "Plomero":            "1620653713380-7a34b773fef8",
  "Electricista":       "1621905251189-08b45d6a269e",
  "Albañil":            "1581578731548-c64695cc6952",
  "Pintor":             "",
  "Gasista":            "",
  "Jardinero":          "",
  "Herrero":            "",
  "Carpintero":         "",
  "Cerrajero":          "",
  "Techista":           "",
  "Soldador":           "",
  "Fumigador":          "",
  "Limpieza":           "",
  "Flete":              "",
  "Climatización":      "",
  "Mecánico":           "",
  "Pinchazos":          "",
  "Yesero":             "",
  "Instalador":         "",

  // ── Profesionales — Profesiones ──
  "Desarrollador de software": "",
  "Contador":                  "",
  "Abogado":                   "1507679799987-c73779587ccf",
  "Arquitecto":                "",
  "Ingeniero":                 "",
  "Diseñador gráfico":         "",
  "Marketing digital":         "",
  "Docente":                   "1517694712202-14dd9538aa97",
  "Psicólogo":                 "",
  "Community manager":         "",
  "Analista de datos":         "",
  "Traductor":                 "",
  "Consultor":                 "1521791136064-7986c2920216",
  "Escribano":                 "",
};

export function getRubroPhotoUrl(key: string): string | null {
  const id = RUBRO_PHOTOS[key];
  if (!id) return null;
  return `https://images.unsplash.com/photo-${id}?w=1200&h=600&fit=crop&q=80`;
}
