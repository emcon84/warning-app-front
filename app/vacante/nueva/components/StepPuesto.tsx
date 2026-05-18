"use client";

interface Props {
  titulo: string;
  descripcion: string;
  onTitulo: (v: string) => void;
  onDescripcion: (v: string) => void;
  inputCls: string;
  textSec: string;
  textMut: string;
}

export default function StepPuesto({ titulo, descripcion, onTitulo, onDescripcion, inputCls, textSec, textMut }: Props) {
  const INPUT_CLS = `w-full px-4 py-3.5 rounded-2xl ${inputCls} text-base focus:outline-none transition-colors`;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <label className={`text-xs mb-1.5 block ${textSec}`}>Título del puesto</label>
        <input
          type="text"
          value={titulo}
          onChange={(e) => onTitulo(e.target.value)}
          placeholder="Ej: Vendedor/a, Cocinero/a, Administrativo/a..."
          maxLength={150}
          className={INPUT_CLS}
        />
      </div>
      <div>
        <label className={`text-xs mb-1.5 flex items-center justify-between ${textSec}`}>
          <span>Descripción</span>
          <span className={textMut}>{descripcion.length}/1000</span>
        </label>
        <textarea
          value={descripcion}
          onChange={(e) => onDescripcion(e.target.value)}
          placeholder="Descripción del puesto, tareas principales, requisitos, condiciones de trabajo..."
          rows={6}
          maxLength={1000}
          className={`w-full px-4 py-3.5 rounded-2xl border ${inputCls} text-base focus:outline-none transition-colors resize-none`}
        />
      </div>
    </div>
  );
}
