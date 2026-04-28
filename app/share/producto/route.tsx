import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const NO_CACHE = { "Cache-Control": "no-store, no-cache, must-revalidate" };

async function toDataUrl(url: string): Promise<string> {
  if (!url) return "";
  try {
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) return "";
    const buf = await r.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let binary = "";
    for (let i = 0; i < bytes.length; i += 8192) {
      binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
    }
    const mime = r.headers.get("content-type") ?? "image/jpeg";
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
  const precioFormateado = precioNum ? `$ ${precioNum.toLocaleString()}` : "";

  const isServicio = tipo === "servicio";
  const badgeBg = isServicio
    ? "linear-gradient(90deg, #7c3aed 0%, #8b5cf6 50%, #7c3aed 100%)"
    : "linear-gradient(90deg, #1d4ed8 0%, #3b82f6 50%, #1d4ed8 100%)";
  const badgeLabel = isServicio ? "SERVICIO" : "PRODUCTO";
  const accentColor = isServicio ? "#a78bfa" : "#60a5fa";
  const accentBorder = isServicio ? "rgba(139,92,246,0.5)" : "rgba(59,130,246,0.5)";
  const accentBg = isServicio
    ? "linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(139,92,246,0.08) 100%)"
    : "linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(59,130,246,0.08) 100%)";
  const orbeColor1 = isServicio ? "rgba(139,92,246,0.12)" : "rgba(59,130,246,0.12)";
  const orbeColor2 = isServicio ? "rgba(234,179,8,0.06)" : "rgba(234,179,8,0.08)";

  return new ImageResponse(
    (
      <div
        style={{
          width: `${W}px`, height: `${H}px`,
          background: "linear-gradient(160deg, #0a0f1a 0%, #0f172a 50%, #0a0f1a 100%)",
          display: "flex", flexDirection: "column", alignItems: "center",
          fontFamily: "system-ui, sans-serif", position: "relative", overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", top: "-200px", right: "-200px", width: "700px", height: "700px", borderRadius: "50%", background: `radial-gradient(circle, ${orbeColor1} 0%, transparent 70%)`, display: "flex" }} />
        <div style={{ position: "absolute", bottom: "200px", left: "-150px", width: "500px", height: "500px", borderRadius: "50%", background: `radial-gradient(circle, ${orbeColor2} 0%, transparent 70%)`, display: "flex" }} />

        <div style={{ width: "100%", background: badgeBg, display: "flex", alignItems: "center", justifyContent: "center", padding: "36px 0" }}>
          <span style={{ color: "#ffffff", fontSize: "80px", fontWeight: 900, letterSpacing: "-1px", textTransform: "uppercase" }}>{badgeLabel}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "32px", width: "100%", padding: "52px 72px 40px" }}>
          {logoData
            ? <img src={logoData} width={110} height={110} style={{ borderRadius: "50%", objectFit: "cover", border: `4px solid ${accentBorder}` }} />
            : <div style={{ width: 110, height: 110, borderRadius: "50%", background: "#1e293b", border: `4px solid ${accentBorder}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#475569", fontSize: "48px", fontWeight: 700 }}>C</span>
              </div>
          }
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={{ color: "#64748b", fontSize: "28px" }}>catalogo de</span>
            <span style={{ color: "#f1f5f9", fontSize: "48px", fontWeight: 800, lineHeight: 1.1 }}>{comercioNombre}</span>
          </div>
        </div>

        <div style={{ display: "flex", width: "100%", padding: "0 72px 44px" }}>
          <span style={{ color: "#ffffff", fontSize: "72px", fontWeight: 800, lineHeight: 1.1 }}>{nombre}</span>
        </div>

        <div style={{
          width: "936px", flex: 1, borderRadius: "40px", overflow: "hidden",
          background: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center",
          border: "2px solid rgba(255,255,255,0.06)",
        }}>
          {fotoData
            ? <img src={fotoData} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <span style={{ color: "#334155", fontSize: "48px", fontWeight: 600 }}>Sin foto</span>
          }
        </div>

        {precioFormateado
          ? <div style={{
              background: accentBg, border: `3px solid ${accentBorder}`, borderRadius: "28px",
              padding: "32px 80px", margin: "44px 0 0",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ color: accentColor, fontSize: "120px", fontWeight: 900, lineHeight: 1 }}>{precioFormateado}</span>
            </div>
          : <div style={{ height: "44px" }} />
        }

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "44px 0 52px", gap: "16px" }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#334155", display: "flex" }} />
          <span style={{ color: "#475569", fontSize: "32px", fontWeight: 600, letterSpacing: "0.5px" }}>reportesreconquista.com</span>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#334155", display: "flex" }} />
        </div>
      </div>
    ),
    { width: W, height: H, headers: NO_CACHE }
  );
}
