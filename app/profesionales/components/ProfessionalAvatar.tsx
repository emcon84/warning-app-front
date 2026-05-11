"use client";

import Image from "next/image";

interface Props {
  foto?: string | null;
  nombre: string;
  gradient?: string;
}

export function ProfessionalAvatar({ foto, nombre, gradient = "from-gray-600 to-gray-700" }: Props) {
  if (foto)
    return (
      <Image
        src={foto}
        alt={nombre}
        className="w-full h-full object-cover"
        width={64}
        height={64}
      />
    );
  return (
    <div className={`w-full h-full flex items-center justify-center bg-linear-to-br ${gradient} text-2xl font-bold text-white`}>
      {nombre[0].toUpperCase()}
    </div>
  );
}
