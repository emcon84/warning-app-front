import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import sharp from "sharp";

export const runtime = "nodejs";

const NO_CACHE = { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" };

async function toDataUrl(url: string): Promise<string> {
  if (!url) return "";
  const toFetch = /\.(webp|avif)$/i.test(url) || url.includes("r2.dev")
    ? `https://images.weserv.nl/?url=${encodeURIComponent(url)}&output=jpg&q=90`
    : url;
  try {
    const r = await fetch(toFetch, { cache: "no-store" });
    if (!r.ok) return "";
    const mime = r.headers.get("content-type") ?? "image/jpeg";
    if (mime === "image/webp" || mime === "image/avif") return "";
    const buf = await r.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let binary = "";
    for (let i = 0; i < bytes.length; i += 8192) {
      binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
    }
    return `data:${mime};base64,${btoa(binary)}`;
  } catch {
    return "";
  }
}

function toHex(r: number, g: number, b: number): string {
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function darken(r: number, g: number, b: number, factor: number): string {
  return toHex(
    Math.min(255, Math.floor(r * factor)),
    Math.min(255, Math.floor(g * factor)),
    Math.min(255, Math.floor(b * factor)),
  );
}

async function getDominantColor(imageUrl: string): Promise<[number, number, number]> {
  const FALLBACK: [number, number, number] = [120, 53, 15]; // amber
  try {
    const fetchUrl = imageUrl.includes("r2.dev") || /\.(webp|avif)$/i.test(imageUrl)
      ? `https://images.weserv.nl/?url=${encodeURIComponent(imageUrl)}&output=jpg&w=80&q=80`
      : imageUrl;
    const res = await fetch(fetchUrl, { cache: "no-store" });
    if (!res.ok) return FALLBACK;
    const buf = Buffer.from(await res.arrayBuffer());
    const { data } = await sharp(buf)
      .resize(80, 80, { fit: "cover" })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const buckets: Record<string, number> = {};
    for (let i = 0; i < data.length; i += 3) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const brightness = (r + g + b) / 3;
      if (brightness < 25 || brightness > 225) continue;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      if (max - min < 35) continue; // skip low-saturation (grey) pixels
      const key = `${Math.floor(r / 32)},${Math.floor(g / 32)},${Math.floor(b / 32)}`;
      buckets[key] = (buckets[key] || 0) + 1;
    }
    if (Object.keys(buckets).length === 0) return FALLBACK;
    const top = Object.entries(buckets).sort((a, b) => b[1] - a[1])[0][0];
    const [br, bg, bb] = top.split(",").map(Number);
    return [br * 32 + 16, bg * 32 + 16, bb * 32 + 16];
  } catch {
    return FALLBACK;
  }
}

export async function GET(req: NextRequest) {
  const s = req.nextUrl.searchParams;
  const W = 1080;
  const H = 1920;

  const nombre = s.get("nombre") ?? "";
  const tipo = s.get("tipo") ?? "producto";
  const precio = s.get("precio") ?? "";
  const foto = s.get("foto") ?? "";
  const comercioNombre = s.get("comercio") ?? "";
  const logo = s.get("logo") ?? "";

  const [fotoData, logoData, [dr, dg, db]] = await Promise.all([
    foto ? toDataUrl(foto) : Promise.resolve(""),
    logo ? toDataUrl(logo) : Promise.resolve(""),
    logo ? getDominantColor(logo) : Promise.resolve([120, 53, 15] as [number, number, number]),
  ]);

  const precioNum = precio ? Number(precio.replace(/\D/g, "")) : 0;
  const precioFormateado = precioNum ? `$ ${precioNum.toLocaleString("es-AR")}` : "";
  const isServicio = tipo === "servicio";

  const bg1 = darken(dr, dg, db, 0.12);
  const bg2 = darken(dr, dg, db, 0.32);
  const bg3 = darken(dr, dg, db, 0.50);
  const accentHex = toHex(dr, dg, db);
  const accentLight = toHex(
    Math.min(255, Math.floor(dr * 1.3 + 40)),
    Math.min(255, Math.floor(dg * 1.3 + 40)),
    Math.min(255, Math.floor(db * 1.3 + 40)),
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: `${W}px`, height: `${H}px`,
          background: `linear-gradient(160deg, ${bg1} 0%, ${bg2} 30%, ${bg3} 60%, ${bg1} 100%)`,
          display: "flex", flexDirection: "column", alignItems: "center",
          fontFamily: "system-ui, sans-serif", position: "relative", overflow: "hidden",
        }}
      >
        {/* Orbes decorativos */}
        <div style={{ position: "absolute", top: "-180px", right: "-180px", width: "600px", height: "600px", borderRadius: "50%", background: `radial-gradient(circle, ${accentHex}40 0%, transparent 65%)`, display: "flex" }} />
        <div style={{ position: "absolute", bottom: "220px", left: "-140px", width: "480px", height: "480px", borderRadius: "50%", background: `radial-gradient(circle, ${accentLight}25 0%, transparent 65%)`, display: "flex" }} />

        {/* Header comercio */}
        <div style={{ display: "flex", alignItems: "center", gap: "32px", width: "100%", padding: "80px 72px 48px" }}>
          {logoData
            ? <img src={logoData} width={110} height={110} style={{ borderRadius: "50%", objectFit: "cover", border: `5px solid ${accentHex}90` }} />
            : <div style={{ width: 110, height: 110, borderRadius: "50%", background: `${accentHex}25`, border: `5px solid ${accentHex}60`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: accentLight, fontSize: "52px", fontWeight: 800 }}>{(comercioNombre[0] ?? "C").toUpperCase()}</span>
              </div>
          }
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ color: `${accentLight}aa`, fontSize: "26px", fontWeight: 500 }}>catalogo de</span>
            <span style={{ color: "#ffffff", fontSize: "46px", fontWeight: 800, lineHeight: 1.1, maxWidth: "750px" }}>{comercioNombre}</span>
          </div>
        </div>

        {/* Foto hero */}
        <div style={{
          width: "936px", height: "1000px",
          borderRadius: "48px", overflow: "hidden",
          display: "flex", alignItems: "center", justifyContent: "center",
          background: `${accentHex}18`,
          border: `2px solid ${accentHex}30`,
          boxShadow: `0 40px 120px rgba(0,0,0,0.75), 0 0 0 1px ${accentHex}20`,
          position: "relative",
        }}>
          {fotoData
            ? <img src={fotoData} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <span style={{ color: `${accentHex}60`, fontSize: "44px", fontWeight: 600 }}>Sin foto</span>
          }
          {isServicio && (
            <div style={{ position: "absolute", top: "32px", left: "32px", background: "linear-gradient(90deg,#7c3aed,#8b5cf6)", borderRadius: "20px", padding: "16px 36px", display: "flex" }}>
              <span style={{ color: "#fff", fontSize: "36px", fontWeight: 800, letterSpacing: "1px" }}>SERVICIO</span>
            </div>
          )}
        </div>

        {/* Nombre */}
        <div style={{ width: "100%", padding: "56px 72px 0" }}>
          <span style={{ color: "#ffffff", fontSize: "88px", fontWeight: 900, lineHeight: 1.05, display: "flex" }}>{nombre}</span>
        </div>

        {/* Precio */}
        {precioFormateado
          ? <div style={{ background: accentHex, borderRadius: "999px", padding: "28px 80px", margin: "40px 0 0", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 16px 48px ${accentHex}60` }}>
              <span style={{ color: "#000000", fontSize: "112px", fontWeight: 900, lineHeight: 1 }}>{precioFormateado}</span>
            </div>
          : <div style={{ height: "40px" }} />
        }

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "44px 0 52px", gap: "16px", marginTop: "auto" }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#ffffff30", display: "flex" }} />
          <span style={{ color: "#ffffff55", fontSize: "30px", fontWeight: 600, letterSpacing: "0.5px" }}>reportesreconquista.com</span>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#ffffff30", display: "flex" }} />
        </div>
      </div>
    ),
    { width: W, height: H, headers: NO_CACHE }
  );
}
