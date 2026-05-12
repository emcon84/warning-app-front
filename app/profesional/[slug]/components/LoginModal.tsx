"use client";

interface Props {
  context: "fav" | "review";
  onClose: () => void;
  onSignUp: () => void;
  onSignIn: () => void;
  isDark: boolean;
}

export function LoginModal({ context, onClose, onSignUp, onSignIn }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-sm w-full flex flex-col gap-4" onClick={e => e.stopPropagation()}>
        <div className="w-12 h-12 rounded-xl bg-indigo-900/50 border border-indigo-800 flex items-center justify-center mx-auto">
          <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <div className="text-center">
          <h3 className="font-bold text-white text-lg">
            {context === "review" ? "Iniciá sesión para opinar" : "Guardá tus favoritos"}
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            {context === "review"
              ? "Necesitás una cuenta para dejar opiniones. Además, solo pueden opinar usuarios que contactaron al profesional."
              : "Creá una cuenta gratis para guardar profesionales favoritos y acceder a ellos desde cualquier dispositivo."}
          </p>
        </div>
        <button
          onClick={onSignUp}
          className="w-full py-3 rounded-2xl bg-white text-gray-950 font-semibold text-sm hover:bg-gray-100 transition-colors"
        >
          Crear cuenta gratis
        </button>
        <button
          onClick={onSignIn}
          className="w-full py-2.5 rounded-2xl text-gray-400 text-sm hover:text-white transition-colors"
        >
          Ya tengo cuenta
        </button>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-600 hover:text-gray-300 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
