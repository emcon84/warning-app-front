"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, Check, Instagram, Link } from "lucide-react";
import { useConfetti } from "../../hooks/useConfetti";

import { API_URL } from "../../lib/api/client";

interface Props {
  comercio: {
    id: string;
    nombre: string;
    slug: string;
    logo?: string | null;
    whatsapp: string;
  };
  getToken: () => Promise<string | null>;
  onComplete: (producto: { id: string; nombre: string; precio?: string | null; foto?: string | null }) => void;
  onClose: () => void;
}

const TOTAL = 3;

const variants = {
  enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
};

export default function NuevoProductoWizard({ comercio, getToken, onComplete, onClose }: Props) {
  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const { fire } = useConfetti();

  function goNext() { setDir(1); setStep(s => s + 1); }
  function goBack() { setDir(-1); setStep(s => s - 1); }

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [generatingImg, setGeneratingImg] = useState(false);
  const [aiGenUrl, setAiGenUrl] = useState<string | null>(null);
  const [aiGenNombre, setAiGenNombre] = useState("");
  const [imgGenError, setImgGenError] = useState<string | null>(null);

  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState<"producto" | "servicio">("producto");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [stock, setStock] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdProduct, setCreatedProduct] = useState<{
    id: string;
    nombre: string;
    precio?: string | null;
    foto?: string | null;
  } | null>(null);

  const [downloading, setDownloading] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [autocompleting, setAutocompleting] = useState(false);

  useEffect(() => {
    if (step === 3) fire();
  }, [step, fire]);

  function handleFileSelected(file: File) {
    setPhotoFile(file);
    setAiGenUrl(null);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    runAutocompletar(file);
  }

  async function runAutocompletar(file: File) {
    setAutocompleting(true);
    try {
      const token = await getToken();
      const fd = new FormData();
      fd.append("photo", file);
      const res = await fetch(`/api/comercios/me/productos/autocompletar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.nombre) setNombre(data.nombre);
      if (data.precio) setPrecio(data.precio);
      if (data.tipo === "servicio" || data.tipo === "producto") setTipo(data.tipo);
      if (data.descripcion) setDescripcion(data.descripcion);
    } catch {
      // silent — autocompletar es opcional
    } finally {
      setAutocompleting(false);
    }
  }

  async function handleGenerateAI() {
    if (!photoFile) return;
    setGeneratingImg(true);
    setImgGenError(null);
    try {
      const token = await getToken();
      const fd = new FormData();
      fd.append("photo", photoFile);
      if (aiGenNombre || nombre) fd.append("nombre", aiGenNombre || nombre);
      const res = await fetch(`/api/comercios/me/productos/generar-imagen`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) throw new Error("error");
      const data = await res.json();
      setAiGenUrl(data.url ?? data.imageUrl ?? data.foto ?? null);
    } catch {
      setImgGenError("No se pudo generar la imagen. Intenta de nuevo.");
    } finally {
      setGeneratingImg(false);
    }
  }

  async function handleSubmit() {
    if (!nombre.trim()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const token = await getToken();
      const fd = new FormData();
      fd.append("nombre", nombre.trim());
      fd.append("tipo", tipo);
      if (descripcion) fd.append("descripcion", descripcion);
      if (precio) fd.append("precio", precio);
      if (stock) fd.append("stock", stock);
      if (aiGenUrl) fd.append("generatedPhotoUrl", aiGenUrl);
      else if (photoFile) fd.append("photo", photoFile);

      const res = await fetch(`/api/comercios/me/productos`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) throw new Error("error");
      const data = await res.json();
      setCreatedProduct(data);
      goNext();
    } catch {
      setSubmitError("No se pudo guardar el producto. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDownloadShare() {
    const fotoRaw = createdProduct?.foto ?? "";
    const foto = fotoRaw
      ? fotoRaw.startsWith("http") ? fotoRaw : `${fotoRaw}`
      : "";
    const logoRaw = comercio.logo ?? "";
    const logo = logoRaw
      ? logoRaw.startsWith("http") ? logoRaw : `${logoRaw}`
      : "";
    const params = new URLSearchParams({
      nombre: createdProduct?.nombre ?? "",
      tipo,
      comercio: comercio.nombre,
      ...(createdProduct?.precio ? { precio: createdProduct.precio } : {}),
      ...(foto ? { foto } : {}),
      ...(logo ? { logo } : {}),
    });
    const shareUrl = `${window.location.origin}/share/producto?${params}`;
    try {
      setDownloading(true);
      const res = await fetch(shareUrl);
      const blob = await res.blob();
      const file = new File([blob], "producto-instagram.jpg", { type: blob.type });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: createdProduct?.nombre });
      } else {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "producto-instagram.jpg";
        a.click();
      }
    } catch {
    } finally {
      setDownloading(false);
    }
  }

  async function handleCopyLink() {
    const productSlug = createdProduct?.id ?? "";
    const link = `${window.location.origin}/comercio/${comercio.slug}`;
    try {
      await navigator.clipboard.writeText(link);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {}
  }

  function handleAddAnother() {
    if (createdProduct) onComplete(createdProduct);
    setStep(1);
    setDir(1);
    setPhotoFile(null);
    setPhotoPreview(null);
    setAiGenUrl(null);
    setAiGenNombre("");
    setImgGenError(null);
    setNombre("");
    setTipo("producto");
    setDescripcion("");
    setPrecio("");
    setStock("");
    setSubmitError(null);
    setCreatedProduct(null);
    setLinkCopied(false);
  }

  const fotoPreviewUrl = aiGenUrl ?? photoPreview;
  const logoUrl = comercio.logo
    ? comercio.logo.startsWith("http") ? comercio.logo : `${comercio.logo}`
    : null;

  return (
    <div className="fixed inset-0 z-[3000] bg-white dark:bg-gray-950 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-safe-top pt-4 pb-3 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <span className="text-sm font-semibold text-gray-900 dark:text-white">Nuevo producto</span>
        <span className="text-xs font-medium text-gray-400 dark:text-gray-500">{step}/{TOTAL}</span>
      </div>

      <div className="flex-shrink-0 h-1 bg-gray-100 dark:bg-gray-800">
        <div
          className="h-full bg-amber-500 transition-all duration-500 ease-out"
          style={{ width: `${(step / TOTAL) * 100}%` }}
        />
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain relative">
        <AnimatePresence custom={dir} mode="wait">
          <motion.div
            key={step}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="absolute inset-0 overflow-y-auto"
          >
            {step === 1 && (
              <Step1Foto
                photoPreview={fotoPreviewUrl}
                aiGenUrl={aiGenUrl}
                generatingImg={generatingImg}
                imgGenError={imgGenError}
                aiGenNombre={aiGenNombre}
                hasPhoto={!!photoFile}
                onFileSelected={handleFileSelected}
                onClearPhoto={() => { setPhotoFile(null); setPhotoPreview(null); setAiGenUrl(null); }}
                onGenerateAI={handleGenerateAI}
                onAiGenNombreChange={setAiGenNombre}
              />
            )}
            {step === 2 && (
              <Step2Datos
                nombre={nombre}
                tipo={tipo}
                descripcion={descripcion}
                precio={precio}
                stock={stock}
                submitting={submitting}
                submitError={submitError}
                autocompleting={autocompleting}
                onNombre={setNombre}
                onTipo={setTipo}
                onDescripcion={setDescripcion}
                onPrecio={setPrecio}
                onStock={setStock}
                onSubmit={handleSubmit}
              />
            )}
            {step === 3 && (
              <Step3Listo
                createdProduct={createdProduct}
                comercio={comercio}
                tipo={tipo}
                logoUrl={logoUrl}
                downloading={downloading}
                linkCopied={linkCopied}
                onDownloadShare={handleDownloadShare}
                onCopyLink={handleCopyLink}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex-shrink-0 border-t border-gray-100 dark:border-gray-800 px-4 py-4 pb-safe-bottom flex gap-3">
        {step === 1 && (
          <button
            onClick={goNext}
            className="flex-1 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-white font-semibold text-sm transition-colors"
          >
            Siguiente
          </button>
        )}
        {step === 2 && (
          <>
            <button
              onClick={goBack}
              className="px-5 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Atras
            </button>
            <button
              onClick={handleSubmit}
              disabled={!nombre.trim() || submitting}
              className="flex-1 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors"
            >
              {submitting ? "Guardando..." : "Continuar"}
            </button>
          </>
        )}
        {step === 3 && (
          <>
            <button
              onClick={handleAddAnother}
              className="flex-1 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Agregar otro
            </button>
            <button
              onClick={() => { if (createdProduct) onComplete(createdProduct); onClose(); }}
              className="flex-1 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-white font-semibold text-sm transition-colors"
            >
              Ver catalogo
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function Step1Foto({
  photoPreview,
  aiGenUrl,
  generatingImg,
  imgGenError,
  aiGenNombre,
  hasPhoto,
  onFileSelected,
  onClearPhoto,
  onGenerateAI,
  onAiGenNombreChange,
}: {
  photoPreview: string | null;
  aiGenUrl: string | null;
  generatingImg: boolean;
  imgGenError: string | null;
  aiGenNombre: string;
  hasPhoto: boolean;
  onFileSelected: (f: File) => void;
  onClearPhoto: () => void;
  onGenerateAI: () => void;
  onAiGenNombreChange: (v: string) => void;
}) {
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onFileSelected(file);
    e.target.value = "";
  }

  return (
    <div className="p-5 space-y-4 pb-8">
      <div>
        <p className="text-lg font-bold text-gray-900 dark:text-white">La foto del producto</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Opcional — podés agregarla despues</p>
      </div>

      {!photoPreview ? (
        <button
          onClick={() => galleryRef.current?.click()}
          className="w-full aspect-square max-h-72 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center gap-3 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Camera className="w-10 h-10 text-gray-300 dark:text-gray-600" />
          <span className="text-sm text-gray-400 dark:text-gray-500">Subí la foto del producto</span>
        </button>
      ) : (
        <div className="relative w-full aspect-square max-h-72">
          <Image
            src={photoPreview}
            alt="preview"
            fill
            className="rounded-3xl object-cover"
            unoptimized
          />
          {aiGenUrl && (
            <div className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              IA
            </div>
          )}
          <button
            onClick={onClearPhoto}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => cameraRef.current?.click()}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
        >
          <Camera className="w-4 h-4" />
          Camara
        </button>
        <button
          onClick={() => galleryRef.current?.click()}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Galeria
        </button>
      </div>

      {hasPhoto && (
        <div className="space-y-2">
          <input
            type="text"
            value={aiGenNombre}
            onChange={e => onAiGenNombreChange(e.target.value)}
            placeholder="Nombre del producto (para la IA)"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            onClick={onGenerateAI}
            disabled={generatingImg}
            className="w-full py-2.5 rounded-xl bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {generatingImg ? (
              <>
                <div className="w-4 h-4 border-2 border-t-transparent border-current rounded-full animate-spin" />
                Generando...
              </>
            ) : (
              "Generar imagen con IA"
            )}
          </button>
          {imgGenError && (
            <p className="text-xs text-red-500">{imgGenError}</p>
          )}
        </div>
      )}

      <input ref={galleryRef} type="file" accept="image/*" className="hidden" onChange={handleInputChange} />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleInputChange} />
    </div>
  );
}

function Step2Datos({
  nombre, tipo, descripcion, precio, stock,
  submitting, submitError, autocompleting,
  onNombre, onTipo, onDescripcion, onPrecio, onStock, onSubmit,
}: {
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
}) {
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

function Step3Listo({
  createdProduct, comercio, tipo, logoUrl,
  downloading, linkCopied,
  onDownloadShare, onCopyLink,
}: {
  createdProduct: { id: string; nombre: string; precio?: string | null; foto?: string | null } | null;
  comercio: { nombre: string; slug: string };
  tipo: string;
  logoUrl: string | null;
  downloading: boolean;
  linkCopied: boolean;
  onDownloadShare: () => void;
  onCopyLink: () => void;
}) {
  const fotoRaw = createdProduct?.foto ?? "";
  const foto = fotoRaw ? (fotoRaw.startsWith("http") ? fotoRaw : `${API_URL}${fotoRaw}`) : "";
  const logo = logoUrl ?? "";

  const params = new URLSearchParams({
    nombre: createdProduct?.nombre ?? "",
    tipo,
    comercio: comercio.nombre,
    ...(createdProduct?.precio ? { precio: createdProduct.precio } : {}),
    ...(foto ? { foto } : {}),
    ...(logo ? { logo } : {}),
  });

  return (
    <div className="p-5 space-y-6 pb-8">
      <div className="flex flex-col items-center gap-3 pt-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
          className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center"
        >
          <Check className="w-8 h-8 text-white" strokeWidth={3} />
        </motion.div>
        <div className="text-center">
          <p className="text-xl font-black text-gray-900 dark:text-white">Producto publicado</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Ya aparece en tu catalogo</p>
        </div>
      </div>

      <div className="border-t border-gray-100 dark:border-gray-800" />

      <div className="space-y-3">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">Compartilo en Instagram</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">Genera tu story con un tap y compartilo</p>

        <div className="flex justify-center">
          <div
            className="relative rounded-2xl overflow-hidden shadow-lg"
            style={{ width: 150, aspectRatio: "9/16" }}
          >
            <Image
              src={`/share/producto?${params}`}
              alt="preview story"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        </div>

        <button
          onClick={onDownloadShare}
          disabled={downloading}
          className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
        >
          <Instagram className="w-4 h-4" />
          {downloading ? "Descargando..." : "Descargar para Instagram"}
        </button>

        <button
          onClick={onCopyLink}
          className="w-full py-3 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
        >
          <Link className="w-4 h-4" />
          {linkCopied ? "Link copiado" : "Copiar link del producto"}
        </button>
      </div>
    </div>
  );
}
