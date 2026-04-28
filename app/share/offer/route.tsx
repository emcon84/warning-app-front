import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

const NO_CACHE = { "Cache-Control": "no-store, no-cache, must-revalidate" };

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

function fallbackImage(W: number, H: number) {
  return new ImageResponse(
    <div
      style={{
        width: `${W}px`,
        height: `${H}px`,
        background:
          "linear-gradient(160deg, #0a0f1a 0%, #0f172a 50%, #0a0f1a 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <span style={{ color: "#475569", fontSize: "48px", fontWeight: 600 }}>
        reportesreconquista.com
      </span>
    </div>,
    { width: W, height: H, headers: NO_CACHE },
  );
}

export async function GET(req: NextRequest) {
  const s = req.nextUrl.searchParams;
  const format = s.get("format") === "feed" ? "feed" : "story";
  const W = 1080;
  const H = format === "feed" ? 1080 : 1920;

  try {
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

    const precioNum = precio ? Number(precio.replace(/\D/g, "")) : 0;
    const precioFormateado = precioNum
      ? `$ ${precioNum.toLocaleString()}`
      : null;

    if (format === "feed") {
      return new ImageResponse(
        <div
          style={{
            width: `${W}px`,
            height: `${H}px`,
            background:
              "linear-gradient(160deg, #0a0f1a 0%, #0f172a 50%, #0a0f1a 100%)",
            display: "flex",
            flexDirection: "row",
            fontFamily: "system-ui, sans-serif",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-150px",
              right: "-150px",
              width: "500px",
              height: "500px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(234,179,8,0.12) 0%, transparent 70%)",
              display: "flex",
            }}
          />

          <div
            style={{
              width: "50%",
              height: "100%",
              background: "#1e293b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {fotoData ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={fotoData}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <span
                style={{ color: "#334155", fontSize: "80px", fontWeight: 600 }}
              >
                Oferta
              </span>
            )}
          </div>

          <div
            style={{
              width: "50%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              position: "relative",
            }}
          >
            <div
              style={{
                width: "100%",
                background: "linear-gradient(90deg, #ca8a04, #eab308)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "28px 0",
              }}
            >
              <span
                style={{
                  color: "#0a0f1a",
                  fontSize: "42px",
                  fontWeight: 900,
                  textTransform: "uppercase",
                }}
              >
                OFERTA
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                padding: "36px 40px 20px",
              }}
            >
              {logoData ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoData}
                  width={72}
                  height={72}
                  style={{
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "3px solid rgba(234,179,8,0.4)",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    background: "#1e293b",
                    border: "3px solid rgba(234,179,8,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{
                      color: "#475569",
                      fontSize: "32px",
                      fontWeight: 700,
                    }}
                  >
                    C
                  </span>
                </div>
              )}
              <div
                style={{ display: "flex", flexDirection: "column", gap: "4px" }}
              >
                <span style={{ color: "#64748b", fontSize: "20px" }}>
                  oferta de
                </span>
                <span
                  style={{
                    color: "#f1f5f9",
                    fontSize: "28px",
                    fontWeight: 800,
                    lineHeight: 1.1,
                  }}
                >
                  {comercioNombre}
                </span>
              </div>
            </div>

            <div
              style={{
                padding: "0 40px 20px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                flex: 1,
              }}
            >
              <span
                style={{
                  color: "#ffffff",
                  fontSize: "44px",
                  fontWeight: 800,
                  lineHeight: 1.1,
                }}
              >
                {titulo}
              </span>
              {validaHasta && (
                <span style={{ color: "#475569", fontSize: "22px" }}>
                  Valida hasta {validaHasta}
                </span>
              )}
            </div>

            {precioFormateado && (
              <div
                style={{
                  background: "rgba(234,179,8,0.12)",
                  border: "3px solid rgba(234,179,8,0.5)",
                  borderRadius: "20px",
                  margin: "0 40px 28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "20px 0",
                }}
              >
                <span
                  style={{
                    color: "#fbbf24",
                    fontSize: "72px",
                    fontWeight: 900,
                    lineHeight: 1,
                  }}
                >
                  {precioFormateado}
                </span>
              </div>
            )}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px 40px",
                gap: "10px",
              }}
            >
              <div
                style={{
                  width: "5px",
                  height: "5px",
                  borderRadius: "50%",
                  background: "#334155",
                  display: "flex",
                }}
              />
              <span
                style={{ color: "#475569", fontSize: "22px", fontWeight: 600 }}
              >
                reportesreconquista.com
              </span>
              <div
                style={{
                  width: "5px",
                  height: "5px",
                  borderRadius: "50%",
                  background: "#334155",
                  display: "flex",
                }}
              />
            </div>
          </div>
        </div>,
        { width: W, height: H, headers: NO_CACHE },
      );
    }

    return new ImageResponse(
      <div
        style={{
          width: "1080px",
          height: "1920px",
          background:
            "linear-gradient(160deg, #0a0f1a 0%, #0f172a 50%, #0a0f1a 100%)",
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
            top: "-200px",
            right: "-200px",
            width: "700px",
            height: "700px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(234,179,8,0.12) 0%, transparent 70%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "200px",
            left: "-150px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)",
            display: "flex",
          }}
        />

        <div
          style={{
            width: "100%",
            background:
              "linear-gradient(90deg, #ca8a04 0%, #eab308 50%, #ca8a04 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "36px 0",
          }}
        >
          <span
            style={{
              color: "#0a0f1a",
              fontSize: "80px",
              fontWeight: 900,
              letterSpacing: "-1px",
              textTransform: "uppercase",
            }}
          >
            SUPER OFERTA
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "32px",
            width: "100%",
            padding: "52px 72px 40px",
          }}
        >
          {logoData ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoData}
              width={110}
              height={110}
              style={{
                borderRadius: "50%",
                objectFit: "cover",
                border: "4px solid rgba(234,179,8,0.4)",
              }}
            />
          ) : (
            <div
              style={{
                width: 110,
                height: 110,
                borderRadius: "50%",
                background: "#1e293b",
                border: "4px solid rgba(234,179,8,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{ color: "#475569", fontSize: "48px", fontWeight: 700 }}
              >
                C
              </span>
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={{ color: "#64748b", fontSize: "28px" }}>
              oferta de
            </span>
            <span
              style={{
                color: "#f1f5f9",
                fontSize: "48px",
                fontWeight: 800,
                lineHeight: 1.1,
              }}
            >
              {comercioNombre}
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            padding: "0 72px 44px",
            gap: "12px",
          }}
        >
          <span
            style={{
              color: "#ffffff",
              fontSize: "72px",
              fontWeight: 800,
              lineHeight: 1.1,
            }}
          >
            {titulo}
          </span>
          {validaHasta && (
            <span style={{ color: "#475569", fontSize: "32px" }}>
              Valida hasta {validaHasta}
            </span>
          )}
        </div>

        <div
          style={{
            width: "936px",
            flex: 1,
            borderRadius: "40px",
            overflow: "hidden",
            background: "#1e293b",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid rgba(255,255,255,0.06)",
          }}
        >
          {fotoData ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={fotoData}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <span
              style={{ color: "#334155", fontSize: "48px", fontWeight: 600 }}
            >
              Sin foto
            </span>
          )}
        </div>

        {precioFormateado && (
          <div
            style={{
              background:
                "linear-gradient(135deg, rgba(234,179,8,0.15) 0%, rgba(234,179,8,0.08) 100%)",
              border: "3px solid rgba(234,179,8,0.5)",
              borderRadius: "28px",
              padding: "32px 80px",
              margin: "44px 0 0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                color: "#fbbf24",
                fontSize: "120px",
                fontWeight: 900,
                lineHeight: 1,
              }}
            >
              {precioFormateado}
            </span>
          </div>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "44px 0 52px",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#334155",
              display: "flex",
            }}
          />
          <span
            style={{
              color: "#475569",
              fontSize: "32px",
              fontWeight: 600,
              letterSpacing: "0.5px",
            }}
          >
            reportesreconquista.com
          </span>
          <div
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#334155",
              display: "flex",
            }}
          />
        </div>
      </div>,
      { width: 1080, height: 1920, headers: NO_CACHE },
    );
  } catch (err) {
    console.error("[share/offer]", err);
    return fallbackImage(W, H);
  }
}
