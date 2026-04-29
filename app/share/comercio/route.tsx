import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

const NO_CACHE = { "Cache-Control": "no-store, no-cache, must-revalidate" };

async function toDataUrl(url: string): Promise<string> {
  if (!url) return "";
  // Satori only supports jpeg, png, gif — convert webp/avif via proxy
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
  const isStory = s.get("format") !== "feed";
  const W = 1080;
  const H = isStory ? 1920 : 1080;

  const nombre = s.get("nombre") ?? "";
  const rubro = s.get("rubro") ?? "";
  const barrio = s.get("barrio") ?? "";
  const slug = s.get("slug") ?? "";
  const foto = s.get("foto") ?? "";
  const logo = s.get("logo") ?? "";

  const [fotoData, logoData] = await Promise.all([
    foto ? toDataUrl(foto) : Promise.resolve(""),
    logo ? toDataUrl(logo) : Promise.resolve(""),
  ]);

  const profileUrl = `reportesreconquista.com/comercio/${slug}`;
  const rubroBarrio = barrio ? `${rubro} - ${barrio}` : rubro;

  if (isStory) {
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
          <div style={{ position: "absolute", top: "-200px", right: "-200px", width: "700px", height: "700px", borderRadius: "50%", background: "radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 70%)", display: "flex" }} />
          <div style={{ position: "absolute", bottom: "200px", left: "-150px", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)", display: "flex" }} />

          <div style={{ width: "100%", background: "linear-gradient(90deg, #15803d 0%, #22c55e 50%, #15803d 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "36px 0" }}>
            <span style={{ color: "#ffffff", fontSize: "72px", fontWeight: 900, letterSpacing: "-1px", textTransform: "uppercase" }}>NUEVO COMERCIO</span>
          </div>

          <div style={{ width: "936px", height: "800px", borderRadius: "40px", overflow: "hidden", background: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid rgba(255,255,255,0.06)", margin: "52px 0 0" }}>
            {foto
              ? <img src={fotoData} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : logo
                ? <img src={logoData} style={{ width: "360px", height: "360px", objectFit: "contain", borderRadius: "32px" }} />
                : <span style={{ color: "#334155", fontSize: "80px", fontWeight: 600 }}>Sin foto</span>
            }
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "32px", width: "100%", padding: "48px 72px 0" }}>
            {logo
              ? <img src={logoData} width={100} height={100} style={{ borderRadius: "50%", objectFit: "cover", border: "4px solid rgba(34,197,94,0.5)" }} />
              : <div style={{ width: 100, height: 100, borderRadius: "50%", background: "#1e293b", border: "4px solid rgba(34,197,94,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "#475569", fontSize: "44px", fontWeight: 700 }}>C</span>
                </div>
            }
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <span style={{ color: "#f1f5f9", fontSize: "56px", fontWeight: 800, lineHeight: 1.1 }}>{nombre}</span>
              <span style={{ color: "#64748b", fontSize: "32px" }}>{rubroBarrio}</span>
            </div>
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "20px", padding: "0 72px" }}>
            <span style={{ color: "#94a3b8", fontSize: "36px" }}>Ingresa a ver su perfil en</span>
            <div style={{ display: "flex", background: "rgba(34,197,94,0.10)", border: "2px solid rgba(34,197,94,0.25)", borderRadius: "24px", padding: "28px 48px", width: "100%" }}>
              <span style={{ color: "#22c55e", fontSize: "34px", fontWeight: 700, wordBreak: "break-all", textAlign: "center", width: "100%" }}>{profileUrl}</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 0 52px", gap: "16px" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#334155", display: "flex" }} />
            <span style={{ color: "#475569", fontSize: "32px", fontWeight: 600, letterSpacing: "0.5px" }}>reportesreconquista.com</span>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#334155", display: "flex" }} />
          </div>
        </div>
      ),
      { width: W, height: H, headers: NO_CACHE }
    );
  }

  // Feed 1:1
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
        <div style={{ position: "absolute", top: "-150px", right: "-150px", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 70%)", display: "flex" }} />

        <div style={{ width: "100%", background: "linear-gradient(90deg, #15803d 0%, #22c55e 50%, #15803d 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "28px 0" }}>
          <span style={{ color: "#ffffff", fontSize: "58px", fontWeight: 900, letterSpacing: "-1px", textTransform: "uppercase" }}>NUEVO COMERCIO</span>
        </div>

        <div style={{ display: "flex", flex: 1, width: "100%", gap: "0" }}>
          <div style={{ width: "520px", height: "100%", background: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {foto
              ? <img src={fotoData} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <span style={{ color: "#334155", fontSize: "80px", fontWeight: 600 }}>Sin foto</span>
            }
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "52px 52px 40px", gap: "0" }}>
            {logo
              ? <img src={logoData} width={90} height={90} style={{ borderRadius: "50%", objectFit: "cover", border: "4px solid rgba(34,197,94,0.5)", marginBottom: "28px" }} />
              : <div style={{ width: 90, height: 90, borderRadius: "50%", background: "#1e293b", border: "4px solid rgba(34,197,94,0.3)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "28px" }}>
                  <span style={{ color: "#475569", fontSize: "40px", fontWeight: 700 }}>C</span>
                </div>
            }
            <span style={{ color: "#f1f5f9", fontSize: "48px", fontWeight: 800, lineHeight: 1.1, marginBottom: "12px" }}>{nombre}</span>
            <span style={{ color: "#64748b", fontSize: "28px", marginBottom: "auto" }}>{rubro}</span>
            {barrio
              ? <span style={{ color: "#475569", fontSize: "24px", marginBottom: "24px" }}>{barrio}</span>
              : <span style={{ display: "none" }} />
            }
            <span style={{ color: "#22c55e", fontSize: "24px", fontWeight: 600, marginTop: "auto" }}>{profileUrl}</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 0", gap: "12px", background: "rgba(0,0,0,0.3)", width: "100%" }}>
          <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#334155", display: "flex" }} />
          <span style={{ color: "#475569", fontSize: "26px", fontWeight: 600 }}>reportesreconquista.com</span>
          <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#334155", display: "flex" }} />
        </div>
      </div>
    ),
    { width: W, height: H, headers: NO_CACHE }
  );
}
