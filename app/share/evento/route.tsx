import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import sharp from "sharp";

export const runtime = "nodejs";

const NO_CACHE = { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" };

const W = 1080;
const H = 1920;

async function toDataUrl(url: string): Promise<string> {
  if (!url) return "";
  const src = /\.(webp|avif)$/i.test(url) || url.includes("r2.dev")
    ? `https://images.weserv.nl/?url=${encodeURIComponent(url)}&output=jpg&q=90`
    : url;
  try {
    const r = await fetch(src, { cache: "no-store" });
    if (!r.ok) return "";
    const mime = r.headers.get("content-type") ?? "image/jpeg";
    if (mime === "image/webp" || mime === "image/avif") return "";
    const buf = await r.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let bin = "";
    for (let i = 0; i < bytes.length; i += 8192) bin += String.fromCharCode(...bytes.subarray(i, i + 8192));
    return `data:${mime};base64,${btoa(bin)}`;
  } catch { return ""; }
}

async function getDominantColor(url: string): Promise<[number, number, number]> {
  const FALLBACK: [number, number, number] = [79, 70, 229]; // indigo
  try {
    const src = url.includes("r2.dev") || /\.(webp|avif)$/i.test(url)
      ? `https://images.weserv.nl/?url=${encodeURIComponent(url)}&output=jpg&w=80&q=80`
      : url;
    const res = await fetch(src, { cache: "no-store" });
    if (!res.ok) return FALLBACK;
    const { data } = await sharp(Buffer.from(await res.arrayBuffer()))
      .resize(80, 80, { fit: "cover" }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    const buckets: Record<string, number> = {};
    for (let i = 0; i < data.length; i += 3) {
      const r = data[i], g = data[i+1], b = data[i+2];
      const brightness = (r+g+b)/3;
      if (brightness < 30 || brightness > 220) continue;
      if (Math.max(r,g,b) - Math.min(r,g,b) < 30) continue;
      const k = `${Math.floor(r/32)},${Math.floor(g/32)},${Math.floor(b/32)}`;
      buckets[k] = (buckets[k] || 0) + 1;
    }
    if (!Object.keys(buckets).length) return FALLBACK;
    const [br, bg, bb] = Object.entries(buckets).sort((a, b) => b[1]-a[1])[0][0].split(",").map(Number);
    return [br*32+16, bg*32+16, bb*32+16];
  } catch { return FALLBACK; }
}

function hex(r: number, g: number, b: number) {
  return `#${r.toString(16).padStart(2,"0")}${g.toString(16).padStart(2,"0")}${b.toString(16).padStart(2,"0")}`;
}
function rgba(r: number, g: number, b: number, a: number) { return `rgba(${r},${g},${b},${a})`; }
function lighten(r: number, g: number, b: number, f: number) {
  return hex(Math.min(255,Math.round(r*f+50*(f-1))), Math.min(255,Math.round(g*f+50*(f-1))), Math.min(255,Math.round(b*f+50*(f-1))));
}
function darken(r: number, g: number, b: number, f: number) {
  return hex(Math.round(r*f), Math.round(g*f), Math.round(b*f));
}

const CATEGORIA_ICON: Record<string, string> = {
  "Música": "♪", "Gastronomía": "🍽", "Deportes": "⚽", "Teatro": "🎭",
  "Arte": "🎨", "Fiesta": "🎉", "Feria": "🛍", "Educación": "📚",
  "Solidario": "🤝", "Otro": "📌",
};

function formatFecha(iso: string) {
  try {
    const d = new Date(iso);
    const dias = ["DOM","LUN","MAR","MIÉ","JUE","VIE","SÁB"];
    const meses = ["ENE","FEB","MAR","ABR","MAY","JUN","JUL","AGO","SEP","OCT","NOV","DIC"];
    const hh = d.getHours().toString().padStart(2,"0");
    const mm = d.getMinutes().toString().padStart(2,"0");
    return { dia: dias[d.getDay()], fecha: `${d.getDate()} ${meses[d.getMonth()]}`, hora: `${hh}:${mm}` };
  } catch { return { dia: "", fecha: "", hora: "" }; }
}

export async function GET(req: NextRequest) {
  const s = req.nextUrl.searchParams;
  const nombre    = s.get("nombre")    ?? "Evento";
  const categoria = s.get("categoria") ?? "Otro";
  const lugar     = s.get("lugar")     ?? "";
  const fecha     = s.get("fecha")     ?? "";
  const precio    = s.get("precio")    ?? "";
  const organizador = s.get("organizador") ?? "";
  const banner    = s.get("banner")    ?? "";
  const logo      = s.get("logo")      ?? "";

  const [bannerData, logoData, [dr, dg, db]] = await Promise.all([
    banner ? toDataUrl(banner) : Promise.resolve(""),
    logo   ? toDataUrl(logo)   : Promise.resolve(""),
    banner ? getDominantColor(banner) : Promise.resolve([79, 70, 229] as [number, number, number]),
  ]);

  const f = formatFecha(fecha);
  const accent   = hex(dr, dg, db);
  const accentLt = lighten(dr, dg, db, 1.5);
  const dark1    = darken(dr, dg, db, 0.08);
  const dark2    = darken(dr, dg, db, 0.18);
  const dark3    = darken(dr, dg, db, 0.30);
  const orb1     = rgba(dr, dg, db, 0.35);
  const orb2     = rgba(dr, dg, db, 0.18);
  const catIcon  = CATEGORIA_ICON[categoria] ?? "📌";

  return new ImageResponse(
    (
      <div style={{
        width: W, height: H,
        background: `linear-gradient(175deg, ${dark1} 0%, ${dark2} 40%, ${dark3} 100%)`,
        display: "flex", flexDirection: "column",
        fontFamily: "system-ui, sans-serif",
        position: "relative", overflow: "hidden",
      }}>

        {/* ── Orbs decorativos ── */}
        <div style={{ position:"absolute", top:-200, right:-200, width:700, height:700, borderRadius:"50%", background:`radial-gradient(circle, ${orb1} 0%, transparent 60%)`, display:"flex" }} />
        <div style={{ position:"absolute", bottom:300, left:-150, width:500, height:500, borderRadius:"50%", background:`radial-gradient(circle, ${orb2} 0%, transparent 65%)`, display:"flex" }} />
        <div style={{ position:"absolute", top:"40%", right:-100, width:400, height:400, borderRadius:"50%", background:`radial-gradient(circle, ${rgba(dr,dg,db,0.12)} 0%, transparent 65%)`, display:"flex" }} />

        {/* ── Líneas de diseño ── */}
        <div style={{ position:"absolute", top:0, left:72, width:2, height:H, background:`linear-gradient(180deg, transparent, ${rgba(dr,dg,db,0.4)} 20%, ${rgba(dr,dg,db,0.4)} 80%, transparent)`, display:"flex" }} />
        <div style={{ position:"absolute", top:0, right:72, width:2, height:H, background:`linear-gradient(180deg, transparent, ${rgba(dr,dg,db,0.4)} 20%, ${rgba(dr,dg,db,0.4)} 80%, transparent)`, display:"flex" }} />

        {/* ── Header branding ── */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"64px 96px 0", width:"100%", boxSizing:"border-box" }}>
          <div style={{ display:"flex", alignItems:"center", gap:16 }}>
            <div style={{ width:10, height:10, borderRadius:"50%", background:accentLt, display:"flex" }} />
            <span style={{ color:rgba(255,255,255,0.5), fontSize:28, fontWeight:600, letterSpacing:2 }}>
              REPORTES RECONQUISTA
            </span>
          </div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", background:rgba(255,255,255,0.1), borderRadius:16, padding:"10px 24px", border:`1px solid ${rgba(255,255,255,0.15)}` }}>
            <span style={{ color:rgba(255,255,255,0.7), fontSize:26, fontWeight:700 }}>EVENTO</span>
          </div>
        </div>

        {/* ── Categoria badge ── */}
        <div style={{ display:"flex", alignItems:"center", gap:16, padding:"52px 96px 0", width:"100%", boxSizing:"border-box" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, background:rgba(dr,dg,db,0.3), borderRadius:999, padding:"14px 32px", border:`1px solid ${rgba(dr,dg,db,0.5)}` }}>
            <span style={{ fontSize:34 }}>{catIcon}</span>
            <span style={{ color:accentLt, fontSize:30, fontWeight:800, letterSpacing:1, textTransform:"uppercase" }}>{categoria}</span>
          </div>
        </div>

        {/* ── Nombre del evento ── */}
        <div style={{ display:"flex", flexDirection:"column", padding:"44px 96px 0", width:"100%", boxSizing:"border-box" }}>
          <span style={{ color:"#ffffff", fontSize: nombre.length > 30 ? 80 : nombre.length > 20 ? 96 : 112, fontWeight:900, lineHeight:1.0, letterSpacing:-1 }}>
            {nombre}
          </span>
        </div>

        {/* ── Banner hero ── */}
        <div style={{ display:"flex", margin:"52px 96px 0", borderRadius:40, overflow:"hidden", position:"relative", width:W-192, height:680, flexShrink:0 }}>
          {bannerData ? (
            <img src={bannerData} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
          ) : (
            <div style={{ width:"100%", height:"100%", background:`linear-gradient(135deg, ${rgba(dr,dg,db,0.4)}, ${rgba(dr,dg,db,0.15)})`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span style={{ fontSize:120 }}>{catIcon}</span>
            </div>
          )}
          {/* Overlay gradiente sobre el banner */}
          <div style={{ position:"absolute", inset:0, background:`linear-gradient(180deg, transparent 50%, ${dark3} 100%)`, display:"flex" }} />
          {/* Borde brillante */}
          <div style={{ position:"absolute", inset:0, borderRadius:40, border:`2px solid ${rgba(dr,dg,db,0.5)}`, display:"flex" }} />

          {/* Badge categoría en el banner */}
          <div style={{ position:"absolute", top:28, left:28, display:"flex", alignItems:"center", gap:12, background:"rgba(0,0,0,0.55)", borderRadius:999, padding:"12px 28px", backdropFilter:"blur(8px)" }}>
            <span style={{ fontSize:28 }}>{catIcon}</span>
            <span style={{ color:"rgba(255,255,255,0.9)", fontSize:26, fontWeight:700, letterSpacing:1 }}>{categoria.toUpperCase()}</span>
          </div>
        </div>

        {/* ── Precio destacado ── */}
        {precio && (
          <div style={{ display:"flex", padding:"36px 96px 0", width:"100%", boxSizing:"border-box" }}>
            <div style={{ display:"flex", alignItems:"center", gap:20, background:`linear-gradient(90deg, ${accent}, ${accentLt})`, borderRadius:999, padding:"24px 64px" }}>
              <span style={{ fontSize:36 }}>🎟</span>
              <span style={{ color:"#000", fontSize:72, fontWeight:900, lineHeight:1 }}>{precio}</span>
            </div>
          </div>
        )}

        {/* ── Fecha, Lugar ── */}
        <div style={{ display:"flex", flexDirection:"column", padding:"52px 96px 0", gap:28, width:"100%", boxSizing:"border-box" }}>
          {/* Fecha */}
          {f.fecha && (
            <div style={{ display:"flex", alignItems:"center", gap:28 }}>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:accent, borderRadius:20, width:100, height:100, flexShrink:0 }}>
                <span style={{ color:"#000", fontSize:24, fontWeight:800, letterSpacing:1 }}>{f.dia}</span>
                <span style={{ color:"#000", fontSize:20, fontWeight:600 }}>{f.fecha}</span>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                <span style={{ color:rgba(255,255,255,0.9), fontSize:44, fontWeight:800 }}>{f.fecha} · {f.dia}</span>
                <span style={{ color:accentLt, fontSize:38, fontWeight:700 }}>{f.hora} hs</span>
              </div>
            </div>
          )}

          {/* Lugar */}
          {lugar && (
            <div style={{ display:"flex", alignItems:"center", gap:28 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", background:rgba(255,255,255,0.1), borderRadius:20, width:100, height:100, flexShrink:0, border:`1px solid ${rgba(255,255,255,0.15)}` }}>
                <span style={{ fontSize:44 }}>📍</span>
              </div>
              <span style={{ color:rgba(255,255,255,0.85), fontSize:42, fontWeight:700, lineHeight:1.2 }}>{lugar}</span>
            </div>
          )}
        </div>

        {/* ── Organizador + logo ── */}
        <div style={{ display:"flex", alignItems:"center", gap:24, padding:"40px 96px 0", width:"100%", boxSizing:"border-box", marginTop:"auto" }}>
          {logoData ? (
            <img src={logoData} width={80} height={80} style={{ borderRadius:"50%", objectFit:"cover", border:`3px solid ${rgba(dr,dg,db,0.6)}` }} />
          ) : (
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", width:80, height:80, borderRadius:"50%", background:rgba(dr,dg,db,0.3), border:`3px solid ${rgba(dr,dg,db,0.5)}` }}>
              <span style={{ color:accentLt, fontSize:36, fontWeight:800 }}>{(organizador[0] ?? "E").toUpperCase()}</span>
            </div>
          )}
          <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
            <span style={{ color:rgba(255,255,255,0.45), fontSize:26, fontWeight:500 }}>organiza</span>
            <span style={{ color:rgba(255,255,255,0.9), fontSize:36, fontWeight:800 }}>{organizador || "Reconquista"}</span>
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:20, padding:"40px 96px 72px", width:"100%", boxSizing:"border-box" }}>
          <div style={{ height:1, flex:1, background:`linear-gradient(90deg, transparent, ${rgba(255,255,255,0.15)})`, display:"flex" }} />
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:accentLt, display:"flex" }} />
            <span style={{ color:rgba(255,255,255,0.35), fontSize:26, fontWeight:600, letterSpacing:1 }}>reportesreconquista.com</span>
            <div style={{ width:8, height:8, borderRadius:"50%", background:accentLt, display:"flex" }} />
          </div>
          <div style={{ height:1, flex:1, background:`linear-gradient(90deg, ${rgba(255,255,255,0.15)}, transparent)`, display:"flex" }} />
        </div>
      </div>
    ),
    { width: W, height: H, headers: NO_CACHE },
  );
}
