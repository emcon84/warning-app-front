import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

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

  const [fotoData, logoData] = await Promise.all([
    foto ? toDataUrl(foto) : Promise.resolve(""),
    logo ? toDataUrl(logo) : Promise.resolve(""),
  ]);

  const precioNum = precio ? Number(precio.replace(/\D/g, "")) : 0;
  const precioFormateado = precioNum ? `$ ${precioNum.toLocaleString("es-AR")}` : "";

  const isServicio = tipo === "servicio";

  return new ImageResponse(
    (
      <div
        style={{
          width: `${W}px`,
          height: `${H}px`,
          background: "linear-gradient(160deg, #1a0a00 0%, #451a03 30%, #78350f 60%, #1a0a00 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-300px",
            right: "-250px",
            width: "800px",
            height: "800px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(251,146,60,0.25) 0%, transparent 60%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "150px",
            left: "-200px",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(234,179,8,0.15) 0%, transparent 60%)",
            display: "flex",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: "32px", width: "100%", padding: "80px 72px 48px" }}>
          {logoData ? (
            <img
              src={logoData}
              width={110}
              height={110}
              style={{
                borderRadius: "50%",
                objectFit: "cover",
                border: "4px solid #f59e0b",
                flexShrink: 0,
              }}
            />
          ) : (
            <div
              style={{
                width: 110,
                height: 110,
                borderRadius: "50%",
                background: "#2a1505",
                border: "4px solid #f59e0b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span style={{ color: "#92400e", fontSize: "52px", fontWeight: 700 }}>C</span>
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "28px" }}>catalogo de</span>
            <span style={{ color: "#ffffff", fontSize: "50px", fontWeight: 800, lineHeight: 1.1 }}>{comercioNombre}</span>
          </div>
        </div>

        <div
          style={{
            width: `${W - 120}px`,
            height: "1000px",
            borderRadius: "48px",
            overflow: "hidden",
            background: "#2a1505",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 40px 120px rgba(0,0,0,0.8)",
            position: "relative",
            flexShrink: 0,
          }}
        >
          {fotoData ? (
            <img
              src={fotoData}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                background: "#2a1505",
                border: "4px dashed #92400e",
                borderRadius: "48px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ color: "#92400e", fontSize: "48px", fontWeight: 600 }}>Sin foto</span>
            </div>
          )}
          {isServicio && (
            <div
              style={{
                position: "absolute",
                top: "32px",
                left: "32px",
                background: "#7c3aed",
                color: "#ffffff",
                fontSize: "36px",
                fontWeight: 800,
                padding: "12px 36px",
                borderRadius: "999px",
                letterSpacing: "1px",
                display: "flex",
              }}
            >
              SERVICIO
            </div>
          )}
        </div>

        <div style={{ display: "flex", width: "100%", padding: "60px 72px 0" }}>
          <span
            style={{
              color: "#ffffff",
              fontSize: "88px",
              fontWeight: 900,
              lineHeight: 1.05,
            }}
          >
            {nombre}
          </span>
        </div>

        {precioFormateado ? (
          <div
            style={{
              background: "#f59e0b",
              borderRadius: "999px",
              padding: "28px 80px",
              margin: "48px 0 0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ color: "#000000", fontSize: "112px", fontWeight: 900, lineHeight: 1 }}>
              {precioFormateado}
            </span>
          </div>
        ) : (
          <div style={{ height: "48px" }} />
        )}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 0 52px",
            marginTop: "auto",
            gap: "6px",
          }}
        >
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "30px", fontWeight: 600 }}>
            reportesreconquista.com
          </span>
          <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "26px" }}>
            catalogo digital | Reconquista
          </span>
        </div>
      </div>
    ),
    { width: W, height: H, headers: NO_CACHE }
  );
}
