"use client";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-red-900/30 border border-red-800 flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Algo salió mal</h2>
          <p className="text-sm text-gray-400 mt-1">No pudimos cargar esta página. Intentá de nuevo.</p>
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={reset}
            className="w-full py-3 rounded-2xl bg-white text-gray-950 font-semibold text-sm hover:bg-gray-100 transition-colors"
          >
            Intentar de nuevo
          </button>
          <a href="/" className="w-full py-2.5 rounded-2xl text-gray-400 text-sm hover:text-white transition-colors">
            Volver al inicio
          </a>
        </div>
      </div>
    </div>
  );
}
