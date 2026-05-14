"use client";

interface Props {
  nombre: string;
  tipo: "producto" | "servicio";
  descripcion: string;
  precio: string;
  stock: string;
  submitting: boolean;
  submitError: string | null;
  autocompleting: boolean;
  onNombre: (v: string) => void;
  onTipo: (v: "producto" | "servicio") => void;
  onDescripcion: (v: string) => void;
  onPrecio: (v: string) => void;
  onStock: (v: string) => void;
  onSubmit: () => void;
}

export default function Step2Datos({
  nombre, tipo, descripcion, precio, stock,
  submitting, submitError, autocompleting,
  onNombre, onTipo, onDescripcion, onPrecio, onStock,
}: Props) {
  const inputCls = "w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500";

  return (
    <div className="p-5 space-y-4 pb-8">
      <div>
        <p className="text-lg font-bold text-gray-900 dark:text-white">Los datos</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Que es lo que ofreces</p>
      </div>

      {autocompleting && (
        <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-xl border border-amber-200 dark:border-amber-800">
          <div className="w-3 h-3 border-2 border-t-transparent border-amber-500 rounded-full animate-spin flex-shrink-0" />
          Analizando la foto con IA para autocompletar...
        </div>
      )}

      <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        {(["producto", "servicio"] as const).map(t => (
          <button
            key={t}
            onClick={() => onTipo(t)}
            className={`flex-1 py-2.5 text-sm font-semibold capitalize transition-colors ${
              tipo === t
                ? "bg-amber-500 text-white"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            {t === "producto" ? "Producto" : "Servicio"}
          </button>
        ))}
      </div>

      <input
        type="text"
        value={nombre}
        onChange={e => onNombre(e.target.value)}
        placeholder="Nombre del producto *"
        autoFocus
        className={inputCls}
      />

      <textarea
        value={descripcion}
        onChange={e => onDescripcion(e.target.value)}
        placeholder="Descripcion (opcional)"
        rows={3}
        className={`${inputCls} resize-none`}
      />

      <input
        type="text"
        value={precio}
        onChange={e => onPrecio(e.target.value)}
        placeholder="Precio (ej: $1.500)"
        className={inputCls}
      />

      <input
        type="number"
        value={stock}
        onChange={e => onStock(e.target.value)}
        placeholder="Stock (sin limite si se deja vacio)"
        className={inputCls}
        min="0"
      />

      {submitError && (
        <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-xl">{submitError}</p>
      )}
    </div>
  );
}
