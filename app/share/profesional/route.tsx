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
  const nombre = s.get("nombre") ?? "";
  const apellido = s.get("apellido") ?? "";
  const oficios = s.get("oficios") ?? "";
  const barrio = s.get("barrio") ?? "";
  const slug = s.get("slug") ?? "";
  const foto = s.get("foto") ?? "";
  const isStory = s.get("format") !== "feed";

  const W = 1080;
  const H = isStory ? 1920 : 1080;

  const fotoData = foto ? await toDataUrl(foto) : "";
  const profileUrl = `reportesreconquista.com/profesional/${slug}`;
  const nombreCompleto = `${nombre} ${apellido}`.trim();

  if (isStory) {
    return new ImageResponse(
      (
        <div
          style={{
            width: `${W}px`,
            height: `${H}px`,
            background: "linear-gradient(160deg, #0a0f1a 0%, #0f172a 50%, #0a0f1a 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            fontFamily: "system-ui, sans-serif",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative blobs */}
          <div style={{ position: "absolute", top: "-200px", right: "-200px", width: "700px", height: "700px", borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)", display: "flex" }} />
          <div style={{ position: "absolute", bottom: "200px", left: "-150px", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)", display: "flex" }} />

          {/* Banner */}
          <div style={{ width: "100%", background: "linear-gradient(90deg, #1d4ed8 0%, #3b82f6 50%, #1d4ed8 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "36px 0" }}>
            <span style={{ color: "#ffffff", fontSize: "72px", fontWeight: 900, letterSpacing: "-1px", textTransform: "uppercase" }}>
              ¡NUEVO EN OFICIOS!
            </span>
          </div>

          {/* Foto de perfil */}
          <div style={{
            width: "380px",
            height: "380px",
            borderRadius: "50%",
            overflow: "hidden",
            background: "#1e293b",
            border: "8px solid rgba(59,130,246,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "80px 0 0",
          }}>
            {fotoData ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={fotoData} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ color: "#334155", fontSize: "120px" }}>👤</span>
            )}
          </div>

          {/* Nombre */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", padding: "52px 72px 0", textAlign: "center" }}>
            <span style={{ color: "#f1f5f9", fontSize: "80px", fontWeight: 900, lineHeight: 1.05 }}>{nombreCompleto}</span>
            {oficios && (
              <div style={{ display: "flex", background: "rgba(59,130,246,0.15)", border: "2px solid rgba(59,130,246,0.3)", borderRadius: "100px", padding: "16px 48px" }}>
                <span style={{ color: "#93c5fd", fontSize: "40px", fontWeight: 600, textTransform: "capitalize" }}>{oficios}</span>
              </div>
            )}
            {barrio && (
              <span style={{ color: "#475569", fontSize: "36px" }}>{barrio}, Reconquista</span>
            )}
          </div>

          {/* CTA */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px" }}>
            <span style={{ color: "#94a3b8", fontSize: "36px" }}>Contactalo en</span>
            <span style={{ color: "#3b82f6", fontSize: "40px", fontWeight: 700 }}>{profileUrl}</span>
          </div>

          {/* Footer */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 0 52px", gap: "16px" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#334155", display: "flex" }} />
            <span style={{ color: "#475569", fontSize: "32px", fontWeight: 600, letterSpacing: "0.5px" }}>reportesreconquista.com</span>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#334155", display: "flex" }} />
          </div>
        </div>
      ),
      { width: W, height: H }
    );
  }

  // Feed 1:1
  return new ImageResponse(
    (
      <div
        style={{
          width: `${W}px`,
          height: `${H}px`,
          background: "linear-gradient(160deg, #0a0f1a 0%, #0f172a 50%, #0a0f1a 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative blob */}
        <div style={{ position: "absolute", top: "-150px", right: "-150px", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)", display: "flex" }} />

        {/* Banner */}
        <div style={{ width: "100%", background: "linear-gradient(90deg, #1d4ed8 0%, #3b82f6 50%, #1d4ed8 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "28px 0" }}>
          <span style={{ color: "#ffffff", fontSize: "56px", fontWeight: 900, letterSpacing: "-1px", textTransform: "uppercase" }}>
            ¡NUEVO EN OFICIOS!
          </span>
        </div>

        {/* Content row */}
        <div style={{ display: "flex", flex: 1, width: "100%", alignItems: "center", gap: "0" }}>
          {/* Foto */}
          <div style={{ width: "460px", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, padding: "48px" }}>
            <div style={{ width: "360px", height: "360px", borderRadius: "50%", overflow: "hidden", background: "#1e293b", border: "8px solid rgba(59,130,246,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {fotoData ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={fotoData} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ color: "#334155", fontSize: "100px" }}>👤</span>
              )}
            </div>
          </div>

          {/* Info */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "48px 52px 40px", gap: "0" }}>
            <span style={{ color: "#f1f5f9", fontSize: "52px", fontWeight: 900, lineHeight: 1.05, marginBottom: "20px" }}>{nombreCompleto}</span>
            {oficios && (
              <div style={{ display: "flex", background: "rgba(59,130,246,0.15)", border: "2px solid rgba(59,130,246,0.3)", borderRadius: "100px", padding: "10px 28px", marginBottom: "16px", width: "fit-content" }}>
                <span style={{ color: "#93c5fd", fontSize: "28px", fontWeight: 600, textTransform: "capitalize" }}>{oficios}</span>
              </div>
            )}
            {barrio && <span style={{ color: "#475569", fontSize: "26px", marginBottom: "auto" }}>{barrio}, Reconquista</span>}
            <span style={{ color: "#3b82f6", fontSize: "24px", fontWeight: 600, marginTop: "32px" }}>{profileUrl}</span>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 0", gap: "12px", background: "rgba(0,0,0,0.3)", width: "100%" }}>
          <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#334155", display: "flex" }} />
          <span style={{ color: "#475569", fontSize: "26px", fontWeight: 600 }}>reportesreconquista.com</span>
          <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#334155", display: "flex" }} />
        </div>
      </div>
    ),
    { width: W, height: H }
  );
}
