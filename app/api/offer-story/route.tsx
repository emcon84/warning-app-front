import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

async function toDataUrl(url: string): Promise<string> {
  if (!url) return "";
  try {
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) return "";
    const buf = await r.arrayBuffer();
    const b64 = Buffer.from(buf).toString("base64");
    const mime = r.headers.get("content-type") ?? "image/jpeg";
    return `data:${mime};base64,${b64}`;
  } catch {
    return "";
  }
}

export async function GET(req: NextRequest) {
  const s = req.nextUrl.searchParams;
  const titulo = s.get("titulo") ?? "";
  const precio = s.get("precio") ?? "";
  const foto = s.get("foto") ?? "";
  const comercioNombre = s.get("comercio") ?? "";
  const logo = s.get("logo") ?? "";
  const validaHasta = s.get("validaHasta") ?? "";

  const [fotoData, logoData] = await Promise.all([
    foto ? toDataUrl(foto) : Promise.resolve(""),
    logo ? toDataUrl(logo) : Promise.resolve(""),
  ]);

  const precioFormateado = precio
    ? `$ ${Number(precio.replace(/\D/g, "")).toLocaleString("es-AR")}`
    : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1080px",
          height: "1920px",
          background: "#0a0f1a",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "80px 72px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "36px",
            width: "100%",
            marginBottom: "56px",
          }}
        >
          {logoData ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoData}
              width={120}
              height={120}
              style={{ borderRadius: "50%", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                background: "#1e293b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 52,
              }}
            >
              🏪
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <span style={{ color: "#64748b", fontSize: "30px" }}>
              Nueva oferta de
            </span>
            <span
              style={{ color: "#f1f5f9", fontSize: "44px", fontWeight: 700 }}
            >
              {comercioNombre}
            </span>
          </div>
        </div>

        {/* Offer title + date */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            marginBottom: "52px",
            gap: "16px",
          }}
        >
          <span
            style={{
              color: "#ffffff",
              fontSize: "64px",
              fontWeight: 800,
              lineHeight: 1.15,
            }}
          >
            {titulo}
          </span>
          {validaHasta && (
            <span style={{ color: "#475569", fontSize: "34px" }}>
              Válida hasta {validaHasta}
            </span>
          )}
        </div>

        {/* Product photo */}
        <div
          style={{
            width: "100%",
            flex: 1,
            borderRadius: "40px",
            overflow: "hidden",
            marginBottom: "52px",
            background: "#1e293b",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {fotoData ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={fotoData}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <span style={{ color: "#334155", fontSize: "48px" }}>
              Sin foto
            </span>
          )}
        </div>

        {/* Price */}
        {precioFormateado && (
          <div
            style={{
              background: "rgba(250, 204, 21, 0.08)",
              border: "3px solid #854d0e",
              borderRadius: "28px",
              padding: "28px 72px",
              marginBottom: "52px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{ color: "#fbbf24", fontSize: "108px", fontWeight: 900 }}
            >
              {precioFormateado}
            </span>
          </div>
        )}

        {/* Branding */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: "auto",
          }}
        >
          <span style={{ color: "#1e293b", fontSize: "28px" }}>
            reportesreconquista.com
          </span>
        </div>
      </div>
    ),
    { width: 1080, height: 1920 }
  );
}
