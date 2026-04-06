import { Doctor } from "../types";

export const ESPECIALIDADES = [
  "Clínico", "Cardiología", "Pediatría", "Ginecología", "Traumatología",
  "Oftalmología", "Dermatología", "Neurología", "Psiquiatría", "Odontología",
  "Kinesiología", "Endocrinología", "Gastroenterología", "Urología",
  "Otorrinolaringología", "Psicología", "Nutrición", "Reumatología"
]

export const OBRAS_SOCIALES = ["IAPOS", "PAMI", "OSDE", "Swiss Medical", "Particular"]

const SPECIALTY_COLORS: Record<string, string> = {
  "Sanatorio / Clínica":    "#1d4ed8", // blue-700 (destacado, diferente al resto)
  "Médico clínico":         "#3b82f6", // blue
  "Clínico":                "#3b82f6",
  "Cardiólogo":             "#ef4444", // red
  "Cardiología":            "#ef4444",
  "Pediatra":               "#f97316", // orange
  "Pediatría":              "#f97316",
  "Ginecólogo":             "#ec4899", // pink
  "Ginecología":            "#ec4899",
  "Traumatólogo":           "#78716c", // stone
  "Traumatología":          "#78716c",
  "Oftalmólogo":            "#06b6d4", // cyan
  "Oftalmología":           "#06b6d4",
  "Dermatólogo":            "#f59e0b", // amber
  "Dermatología":           "#f59e0b",
  "Neurólogo":              "#8b5cf6", // violet
  "Neurología":             "#8b5cf6",
  "Psiquiatra":             "#a855f7", // purple
  "Psiquiatría":            "#a855f7",
  "Odontólogo":             "#14b8a6", // teal
  "Odontología":            "#14b8a6",
  "Kinesiólogo":            "#22c55e", // green
  "Kinesiología":           "#22c55e",
  "Endocrinólogo":          "#eab308", // yellow
  "Endocrinología":         "#eab308",
  "Gastroenterólogo":       "#84cc16", // lime
  "Gastroenterología":      "#84cc16",
  "Urólogo":                "#0ea5e9", // sky
  "Urología":               "#0ea5e9",
  "Otorrinolaringólogo":    "#64748b", // slate
  "Otorrinolaringología":   "#64748b",
  "Psicólogo":              "#f43f5e", // rose
  "Psicología":             "#f43f5e",
  "Nutricionista":          "#10b981", // emerald
  "Nutrición":              "#10b981",
  "Reumatólogo":            "#6366f1", // indigo
  "Reumatología":           "#6366f1",
}

export function getDoctorPinColor(doctor: Doctor): string {
  return SPECIALTY_COLORS[doctor.especialidad] ?? "#6b7280"
}

const stethoscopeSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6 6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/>
  <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/>
  <circle cx="20" cy="10" r="2"/>
</svg>`

const buildingSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
  <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>
  <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/>
  <path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>
</svg>`

export function getDoctorIconSvg(doctor: Doctor): string {
  const color = getDoctorPinColor(doctor)
  const hasObraSocial = doctor.obrasSociales && doctor.obrasSociales.length > 0
  const opacity = hasObraSocial ? "1" : "0.65"
  const isSanatorio = doctor.especialidad === "Sanatorio / Clínica"
  const icon = isSanatorio ? buildingSvg : stethoscopeSvg
  const size = isSanatorio ? "42px" : "36px"

  return `
    <div style="
      position: relative;
      width: 38px;
      height: 44px;
      display: flex;
      flex-direction: column;
      align-items: center;
    ">
      <div style="
        background-color: ${color};
        opacity: ${opacity};
        width: ${size};
        height: ${size};
        border-radius: 50%;
        border: 2.5px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.25), 0 0 0 1px ${color}33;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        ${icon}
      </div>
      <div style="
        width: 2px;
        height: 8px;
        background-color: ${color};
        opacity: ${opacity};
      "></div>
    </div>
  `
}
