"use client";

import { useState } from "react";
import { MessageSquare, RefreshCw, Copy, Check } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export function AdminOutreachTab() {
  const { isDark } = useTheme();
  const bgCard = isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200";
  const bgInput = isDark ? "bg-gray-800 border-gray-700 text-white placeholder-gray-600" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400";
  const bgToggle = isDark ? "bg-gray-800" : "bg-gray-100";
  const textPrimary = isDark ? "text-white" : "text-gray-900";
  const textMuted = isDark ? "text-gray-500" : "text-gray-400";
  const textDim = isDark ? "text-gray-700" : "text-gray-400";
  const toggleInactive = isDark ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600";
  const btnRegen = isDark ? "bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900";
  const textSecondary = isDark ? "text-gray-400" : "text-gray-500";
  const btnGreen = isDark ? "bg-green-900/40 text-green-400 border-green-800/50 hover:bg-green-900/70" : "bg-green-50 text-green-600 border-green-200 hover:bg-green-100";
  const [destinatario, setDestinatario] = useState<"comercio" | "profesional">("comercio");
  const [tipo, setTipo] = useState<"visita" | "registro">("visita");
  const [nombre, setNombre] = useState("");
  const [rubro, setRubro] = useState("");
  const [contacto, setContacto] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [copied, setCopied] = useState(false);

  function generateMessage() {
    const n = nombre.trim();
    const r = rubro.trim();
    const c = contacto.trim();
    if (!n) return;

    const saludo = c ? `Hola ${c}!` : "Hola!";

    if (destinatario === "comercio") {
      if (tipo === "visita") {
        const rubros = r ? `que buscan ${r.toLowerCase()}` : "que buscan un comercio local";
        setMensaje(
`${saludo} Soy el creador de reportesreconquista.com, la app gratuita de Reconquista.

Es una herramienta para que los vecinos de Reconquista ${rubros} te encuentren a vos: perfil con fotos, catálogo y WhatsApp directo. 100% gratis.

En las próximas semanas vamos a tener el apoyo de empresas como Elías Yapur y otras para darle visibilidad a la plataforma. Los comercios que se registren ahora van a quedar como Comercios Fundadores, con un emblema especial y posicionados primeros en el listado, antes de que eso pase.

¿Te viene bien que esta semana pase por el local a mostrártela en persona?

https://reportesreconquista.com`
        );
      } else {
        const rubroStr = r ? ` Si alguien en Reconquista busca ${r.toLowerCase()}, aparecés vos.` : "";
        setMensaje(
`${saludo} Soy el creador de reportesreconquista.com, la app gratuita de Reconquista.

Estamos armando el directorio digital de comercios locales y me gustaría invitarte a registrar ${n}. En dos minutos cargás tu perfil con foto, descripción, catálogo de productos con precios y un botón de WhatsApp directo para que los clientes te contacten sin vueltas.

La diferencia con Instagram es clave: acá la gente no "pasa el tiempo", sino que busca activamente lo que necesita.${rubroStr} Sin depender del algoritmo, sin que tu publicación se pierda en el feed.

Además te damos un QR imprimible para la vidriera. Todo gratis, el registro tarda menos de 5 minutos:

https://reportesreconquista.com/comercio/nuevo`
        );
      }
    } else {
      const oficioStr = r ? ` Los vecinos que buscan ${r.toLowerCase()} en Reconquista te pueden encontrar a vos.` : "";
      const oficioNec = r ? ` Si alguien en Reconquista necesita ${r.toLowerCase()}, aparecés vos.` : "";
      if (tipo === "visita") {
        setMensaje(
`${saludo} Soy el creador de reportesreconquista.com, la app gratuita de Reconquista.

Estamos armando el directorio de profesionales de oficio de la ciudad y me gustaría mostrarte la plataforma.${oficioStr} Ver tu perfil y contactarte directo por chat, sin algoritmo, sin tener que publicar todos los días.

Los profesionales que se registren ahora van a quedar primeros en el listado antes de que la plataforma crezca.

¿Te viene bien que esta semana pase a mostrártela en persona?

https://reportesreconquista.com`
        );
      } else {
        setMensaje(
`${saludo} Soy el creador de reportesreconquista.com, la app gratuita de Reconquista.

Estamos armando el directorio de profesionales de la ciudad y me gustaría invitarte a registrarte como ${n}. En dos minutos cargás tu perfil con tu oficio, zona de trabajo y un chat directo para que los clientes te encuentren a vos.${oficioNec} Sin depender del algoritmo.

El registro es gratuito y tarda menos de 5 minutos:

https://reportesreconquista.com/profesional/nuevo`
        );
      }
    }
  }

  async function copyMessage() {
    await navigator.clipboard.writeText(mensaje);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className={`p-5 rounded-2xl border ${bgCard}`}>
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-4 h-4 text-blue-400" />
          <p className={`text-sm font-bold ${textPrimary}`}>Generador de mensajes de captacion</p>
        </div>

        <div className={`flex rounded-xl ${bgToggle} p-1 mb-3`}>
          <button
            onClick={() => { setDestinatario("comercio"); setMensaje(""); }}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${
              destinatario === "comercio" ? "bg-amber-600 text-white" : `${toggleInactive}`
            }`}
          >
            Comercio
          </button>
          <button
            onClick={() => { setDestinatario("profesional"); setMensaje(""); }}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${
              destinatario === "profesional" ? "bg-purple-600 text-white" : `${toggleInactive}`
            }`}
          >
            Profesional
          </button>
        </div>

        <div className={`flex rounded-xl ${bgToggle} p-1 mb-5`}>
          <button
            onClick={() => { setTipo("visita"); setMensaje(""); }}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${
              tipo === "visita" ? "bg-blue-600 text-white" : `${toggleInactive}`
            }`}
          >
            Solicitar visita
          </button>
          <button
            onClick={() => { setTipo("registro"); setMensaje(""); }}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${
              tipo === "registro" ? "bg-blue-600 text-white" : `${toggleInactive}`
            }`}
          >
            Invitar a registrarse
          </button>
        </div>

        <p className={`text-xs ${textMuted} mb-5`}>
          {tipo === "visita"
            ? destinatario === "comercio" ? "Para cerrar una visita presencial al local." : "Para cerrar una visita con el profesional."
            : destinatario === "comercio" ? "Para cuando quieren registrarse solos desde el link." : "Para que se registren solos como profesional."}
        </p>

        <div className="flex flex-col gap-3">
          <div>
            <label className={`text-xs ${textMuted} mb-1.5 block`}>
              {destinatario === "comercio" ? "Nombre del comercio" : "Nombre / apellido"} *
            </label>
            <input
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder={destinatario === "comercio" ? "Ej: Fiambrería Don Luis" : "Ej: Juan García"}
              className={`w-full px-3 py-2.5 rounded-xl ${bgInput} text-sm focus:outline-none focus:border-gray-500`}
            />
          </div>
          <div>
            <label className={`text-xs ${textMuted} mb-1.5 block`}>
              {destinatario === "comercio" ? "Rubro" : "Oficio"} <span className={`${textDim}`}>(opcional)</span>
            </label>
            <input
              value={rubro}
              onChange={e => setRubro(e.target.value)}
              placeholder={destinatario === "comercio" ? "Ej: Almacén, Peluquería, Ferretería..." : "Ej: Plomero, Electricista, Pintor..."}
              className={`w-full px-3 py-2.5 rounded-xl ${bgInput} text-sm focus:outline-none focus:border-gray-500`}
            />
          </div>
          <div>
            <label className={`text-xs ${textMuted} mb-1.5 block`}>
              Nombre del contacto <span className={`${textDim}`}>(opcional)</span>
            </label>
            <input
              value={contacto}
              onChange={e => setContacto(e.target.value)}
              placeholder="Ej: Luis, María..."
              className={`w-full px-3 py-2.5 rounded-xl ${bgInput} text-sm focus:outline-none focus:border-gray-500`}
            />
          </div>

          <button
            onClick={generateMessage}
            disabled={!nombre.trim()}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-4 h-4" /> Generar mensaje
          </button>
        </div>
      </div>

      {mensaje && (
        <div className={`p-5 rounded-2xl border ${bgCard}`}>
          <div className="flex items-center justify-between mb-3">
            <p className={`text-xs font-semibold ${textSecondary}`}>Mensaje generado</p>
            <div className="flex gap-2">
              <button
                onClick={generateMessage}
                className={`p-1.5 rounded-lg ${btnRegen} transition-colors`}
                title="Regenerar"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={copyMessage}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${btnGreen} text-xs font-semibold transition-colors`}
              >
                {copied ? <><Check className="w-3.5 h-3.5" /> Copiado!</> : <><Copy className="w-3.5 h-3.5" /> Copiar</>}
              </button>
            </div>
          </div>
          <textarea
            value={mensaje}
            onChange={e => setMensaje(e.target.value)}
            rows={7}
            className={`w-full px-3 py-3 rounded-xl ${bgInput} text-sm resize-none focus:outline-none focus:border-gray-500 leading-relaxed`}
          />
          <p className={`text-xs ${textDim} mt-2`}>Podés editar el texto antes de copiarlo.</p>
        </div>
      )}
    </div>
  );
}
