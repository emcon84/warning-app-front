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

function rgba(r: number, g: number, b: number, a: number): string {
  return `rgba(${r},${g},${b},${a})`;
}

async function getDominantColor(imageUrl: string): Promise<[number, number, number]> {
  const FALLBACK: [number, number, number] = [120, 53, 15];
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
      if (max - min < 35) continue;
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

  const bg1 = darken(dr, dg, db, 0.10);
  const bg2 = darken(dr, dg, db, 0.28);
  const bg3 = darken(dr, dg, db, 0.45);
  const accent = toHex(dr, dg, db);
  const accentLight = toHex(
    Math.min(255, Math.floor(dr * 1.4 + 50)),
    Math.min(255, Math.floor(dg * 1.4 + 50)),
    Math.min(255, Math.floor(db * 1.4 + 50)),
  );
  const orb1 = rgba(dr, dg, db, 0.28);
  const orb2 = rgba(
    Math.min(255, Math.floor(dr * 1.2 + 30)),
    Math.min(255, Math.floor(dg * 1.2 + 30)),
    Math.min(255, Math.floor(db * 1.2 + 30)),
    0.15,
  );
  const logoInitial = (comercioNombre[0] ?? "C").toUpperCase();

  return new ImageResponse(
    (
      <div
        style={{
          width: `${W}px`,
          height: `${H}px`,
          background: `linear-gradient(160deg, ${bg1} 0%, ${bg2} 35%, ${bg3} 65%, ${bg1} 100%)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Orb top-right */}
        <div
          style={{
            position: "absolute",
            top: -160,
            right: -160,
            width: 580,
            height: 580,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${orb1} 0%, transparent 65%)`,
            display: "flex",
          }}
        />
        {/* Orb bottom-left */}
        <div
          style={{
            position: "absolute",
            bottom: 200,
            left: -120,
            width: 460,
            height: 460,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${orb2} 0%, transparent 65%)`,
            display: "flex",
          }}
        />

        {/* Comercio header */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 32,
            width: "100%",
            padding: "80px 72px 48px",
          }}
        >
          {logoData ? (
            <img
              src={logoData}
              width={110}
              height={110}
              style={{ borderRadius: "50%", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 110,
                height: 110,
                borderRadius: "50%",
                background: rgba(dr, dg, db, 0.25),
                border: `5px solid ${rgba(dr, dg, db, 0.6)}`,
              }}
            >
              <span style={{ color: accentLight, fontSize: 52, fontWeight: 800 }}>
                {logoInitial}
              </span>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ color: rgba(255, 255, 255, 0.5), fontSize: 26, fontWeight: 500 }}>
              catalogo de
            </span>
            <span style={{ color: "#ffffff", fontSize: 46, fontWeight: 800, lineHeight: 1.1 }}>
              {comercioNombre}
            </span>
          </div>
        </div>

        {/* Foto hero */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 936,
            height: 980,
            borderRadius: 48,
            overflow: "hidden",
            background: rgba(dr, dg, db, 0.15),
            border: `2px solid ${rgba(dr, dg, db, 0.3)}`,
            position: "relative",
          }}
        >
          {fotoData ? (
            <img
              src={fotoData}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <span style={{ color: rgba(dr, dg, db, 0.5), fontSize: 44, fontWeight: 600 }}>
              Sin foto
            </span>
          )}
          {isServicio && (
            <div
              style={{
                position: "absolute",
                top: 32,
                left: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(90deg,#7c3aed,#8b5cf6)",
                borderRadius: 20,
                padding: "16px 36px",
              }}
            >
              <span style={{ color: "#fff", fontSize: 36, fontWeight: 800, letterSpacing: 1 }}>
                SERVICIO
              </span>
            </div>
          )}
        </div>

        {/* Nombre */}
        <div
          style={{
            display: "flex",
            width: "100%",
            padding: "52px 72px 0",
          }}
        >
          <span style={{ color: "#ffffff", fontSize: 86, fontWeight: 900, lineHeight: 1.05 }}>
            {nombre}
          </span>
        </div>

        {/* Precio */}
        {precioFormateado ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: accent,
              borderRadius: 999,
              padding: "28px 80px",
              marginTop: 40,
            }}
          >
            <span style={{ color: "#000000", fontSize: 108, fontWeight: 900, lineHeight: 1 }}>
              {precioFormateado}
            </span>
          </div>
        ) : (
          <div style={{ display: "flex", height: 40 }} />
        )}

        {/* Footer */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            marginTop: "auto",
            paddingBottom: 52,
          }}
        >
          <div
            style={{
              display: "flex",
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: rgba(255, 255, 255, 0.25),
            }}
          />
          <span style={{ color: rgba(255, 255, 255, 0.4), fontSize: 30, fontWeight: 600 }}>
            reportesreconquista.com
          </span>
          <div
            style={{
              display: "flex",
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: rgba(255, 255, 255, 0.25),
            }}
          />
        </div>
      </div>
    ),
    { width: W, height: H, headers: NO_CACHE },
  );
}
