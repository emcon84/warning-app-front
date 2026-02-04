import { ReportCategory } from "../types";
import {
  Trash2,
  Lightbulb,
  Construction,
  Trees,
  ShieldAlert,
  Droplet,
  Droplets,
  Footprints,
  CircleAlert,
  Sparkles,
  Paintbrush,
  Trash,
  TreePine,
  Hammer,
  Car,
  Lamp,
  Dog,
  Bug,
  SignpostBig,
  ParkingCircle,
  Bus,
  Users,
} from "lucide-react";

export const getCategoryLabel = (category: ReportCategory): string => {
  const labels: Record<ReportCategory, string> = {
    basura: "Recolección de basura",
    alumbrado: "Alumbrado público",
    baches: "Baches en vía pública",
    pastizales: "Limpieza de pastizales",
    robo: "Robo",
    personas_sospechosas: "Personas sospechosas",
    fugas_agua: "Fugas de agua",
    drenaje: "Problemas de drenaje",
    banquetas: "Banquetas dañadas",
    semaforos: "Semáforos descompuestos",
    limpieza: "Falta de limpieza",
    graffiti: "Grafiti/vandalismo",
    escombros: "Escombros o residuos voluminosos",
    arboles: "Árboles caídos o peligrosos",
    vandalismo: "Daños a propiedad pública",
    vehiculos_abandonados: "Vehículos abandonados",
    iluminacion: "Falta de iluminación",
    animales_callejeros: "Animales callejeros",
    plagas: "Plagas urbanas",
    senalizacion: "Señalización dañada",
    estacionamiento: "Problemas de estacionamiento",
    transporte: "Problemas de transporte público",
  };
  return labels[category];
};

export const getCategoryIcon = (category: ReportCategory) => {
  const icons = {
    basura: Trash2,
    alumbrado: Lightbulb,
    baches: Construction,
    pastizales: Trees,
    robo: ShieldAlert,
    personas_sospechosas: Users,
    fugas_agua: Droplet,
    drenaje: Droplets,
    banquetas: Footprints,
    semaforos: CircleAlert,
    limpieza: Sparkles,
    graffiti: Paintbrush,
    escombros: Trash,
    arboles: TreePine,
    vandalismo: Hammer,
    vehiculos_abandonados: Car,
    iluminacion: Lamp,
    animales_callejeros: Dog,
    plagas: Bug,
    senalizacion: SignpostBig,
    estacionamiento: ParkingCircle,
    transporte: Bus,
  };
  return icons[category];
};

export const getCategoryIconSvg = (category: ReportCategory): string => {
  const svgs: Record<ReportCategory, string> = {
    basura: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`,
    alumbrado: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>`,
    baches: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></svg>`,
    pastizales: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 10v.2A3 3 0 0 1 8.9 16H5a3 3 0 0 1-1-5.8V10a3 3 0 0 1 6 0Z"/><path d="M7 16v6"/><path d="M13 19v3"/><path d="M12 19h8.3a1 1 0 0 0 .7-1.7L18 14h.3a1 1 0 0 0 .7-1.7L16 9h.2a1 1 0 0 0 .8-1.7L13 3l-1.4 1.5"/></svg>`,
    robo: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>`,
    personas_sospechosas: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    fugas_agua: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`,
    drenaje: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"/><path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"/></svg>`,
    banquetas: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-2.5a2 2 0 0 1-2-2 2 2 0 0 0-2-2 2 2 0 0 0-2 2 2 2 0 0 1-2 2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z"/><path d="M3 13h18"/></svg>`,
    semaforos: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>`,
    limpieza: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9.937 15.5-.5-2a1.5 1.5 0 0 1 .728-1.683L12 10.5l2.835 1.317a1.5 1.5 0 0 1 .728 1.683l-.5 2a1.5 1.5 0 0 1-1.456 1.136h-2.614A1.5 1.5 0 0 1 9.937 15.5z"/><path d="M12 7.5V2"/><path d="m6 12 6-6 6 6"/></svg>`,
    graffiti: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 16 4 4L6.5 21 3 22l1-3.5L3 17l13-13a3 3 0 1 1 4 4L7 21"/><path d="m14.5 5.5 4 4"/></svg>`,
    escombros: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>`,
    arboles: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m17 14 3 3.3a1 1 0 0 1-.7 1.7H4.7a1 1 0 0 1-.7-1.7L7 14h-.3a1 1 0 0 1-.7-1.7L9 9h-.2A1 1 0 0 1 8 7.3L12 3l4 4.3a1 1 0 0 1-.8 1.7H15l3 3.3a1 1 0 0 1-.7 1.7H17z"/><path d="M12 22v-3"/></svg>`,
    vandalismo: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 12-8.373 8.373a1 1 0 1 1-3-3L12 9"/><path d="m18 15 4-4"/><path d="m21.5 11.5-1.914-1.914A2 2 0 0 1 19 8.172V7l-2.26-2.26a6 6 0 0 0-4.202-1.756L9 2.96l.92.82A6.18 6.18 0 0 1 12 8.4V10l2 2h1.172a2 2 0 0 1 1.414.586L18.5 14.5"/></svg>`,
    vehiculos_abandonados: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>`,
    iluminacion: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2h6l3 7H6l3-7Z"/><path d="M12 9v13"/><path d="M9 22h6"/></svg>`,
    animales_callejeros: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="20" cy="16" r="2"/><path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z"/></svg>`,
    plagas: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m8 2 1.88 1.88"/><path d="M14.12 3.88 16 2"/><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6"/><path d="M12 20v-9"/><path d="M6.53 9C4.6 8.8 3 7.1 3 5"/><path d="M6 13H2"/><path d="M3 21c0-2.1 1.7-3.9 3.8-4"/><path d="M20.97 5c0 2.1-1.6 3.8-3.5 4"/><path d="M22 13h-4"/><path d="M17.2 17c2.1.1 3.8 1.9 3.8 4"/></svg>`,
    senalizacion: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 13v8"/><path d="M12 3v3"/><path d="M18 6a2 2 0 0 1 1.387.56l2.307 2.22a1 1 0 0 1 0 1.44l-2.307 2.22A2 2 0 0 1 18 13H6a2 2 0 0 1-1.387-.56l-2.306-2.22a1 1 0 0 1 0-1.44l2.306-2.22A2 2 0 0 1 6 6z"/></svg>`,
    estacionamiento: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/></svg>`,
    transporte: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/><circle cx="7" cy="18" r="2"/><path d="M9 18h5"/><circle cx="16" cy="18" r="2"/></svg>`,
  };
  return svgs[category];
};

export const getCategoryColor = (category: ReportCategory): string => {
  const colors: Record<ReportCategory, string> = {
    basura: "bg-orange-100 text-orange-800 border-orange-300",
    alumbrado: "bg-yellow-100 text-yellow-800 border-yellow-300",
    baches: "bg-red-100 text-red-800 border-red-300",
    pastizales: "bg-green-100 text-green-800 border-green-300",
    robo: "bg-purple-100 text-purple-800 border-purple-300",
    personas_sospechosas: "bg-red-100 text-red-800 border-red-300",
    fugas_agua: "bg-blue-100 text-blue-800 border-blue-300",
    drenaje: "bg-cyan-100 text-cyan-800 border-cyan-300",
    banquetas: "bg-stone-100 text-stone-800 border-stone-300",
    semaforos: "bg-amber-100 text-amber-800 border-amber-300",
    limpieza: "bg-sky-100 text-sky-800 border-sky-300",
    graffiti: "bg-pink-100 text-pink-800 border-pink-300",
    escombros: "bg-gray-100 text-gray-800 border-gray-300",
    arboles: "bg-emerald-100 text-emerald-800 border-emerald-300",
    vandalismo: "bg-rose-100 text-rose-800 border-rose-300",
    vehiculos_abandonados: "bg-slate-100 text-slate-800 border-slate-300",
    iluminacion: "bg-yellow-100 text-yellow-800 border-yellow-300",
    animales_callejeros: "bg-orange-100 text-orange-800 border-orange-300",
    plagas: "bg-red-100 text-red-800 border-red-300",
    senalizacion: "bg-indigo-100 text-indigo-800 border-indigo-300",
    estacionamiento: "bg-violet-100 text-violet-800 border-violet-300",
    transporte: "bg-blue-100 text-blue-800 border-blue-300",
  };
  return colors[category];
};
