"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useConfetti } from "../../hooks/useConfetti";
import { API_URL } from "../../lib/api/client";
import Step1Foto from "./wizard/Step1Foto";
import Step2Datos from "./wizard/Step2Datos";
import Step3Listo from "./wizard/Step3Listo";

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
      const res = await fetch(`${API_URL}/api/comercios/me/productos/autocompletar`, {
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
      const res = await fetch(`${API_URL}/api/comercios/me/productos/generar-imagen`, {
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

      const res = await fetch(`${API_URL}/api/comercios/me/productos`, {
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

