import Link from "next/link";
import { MapPin, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-6 text-center">
      <div className="flex flex-col items-center gap-6 max-w-md">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
            <MapPin className="w-10 h-10 text-blue-400" strokeWidth={1.5} />
          </div>
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            ?
          </span>
        </div>

        <div className="space-y-2">
          <p className="text-blue-400 font-semibold text-sm uppercase tracking-widest font-montserrat">
            Error 404
          </p>
          <h1 className="text-3xl font-bold text-white font-montserrat">
            Esta pagina no existe
          </h1>
          <p className="text-gray-400 text-base leading-relaxed">
            Parece que te perdiste en el mapa. La pagina que buscas no esta disponible o fue removida.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Link
            href="/app"
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-5 rounded-xl transition-colors font-montserrat"
          >
            <Home className="w-4 h-4" />
            Ir al mapa
          </Link>
          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold py-3 px-5 rounded-xl transition-colors font-montserrat"
          >
            <ArrowLeft className="w-4 h-4" />
            Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
