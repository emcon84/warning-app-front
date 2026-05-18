import { http, HttpResponse } from "msw";
import {
  DEMO_COMERCIO, DEMO_POSTS, DEMO_ANALYTICS, DEMO_PLAN, DEMO_SLUG,
} from "./data";
import type { Producto, ComercioOffer, ComercioPost } from "../app/types";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Estado mutable en memoria para la demo
let products = [...DEMO_COMERCIO.productos];
let offers   = [...DEMO_COMERCIO.offers];
let posts    = [...DEMO_POSTS];
let comercio = { ...DEMO_COMERCIO };
let nextId   = 100;

function id() { return `demo-${++nextId}`; }

export function resetDemoState() {
  products = [...DEMO_COMERCIO.productos];
  offers   = [...DEMO_COMERCIO.offers];
  posts    = [...DEMO_POSTS];
  comercio = { ...DEMO_COMERCIO };
  nextId   = 100;
}

export const handlers = [

  // ── Perfil ─────────────────────────────────────────────────────────────────

  http.get(`${API}/api/comercios/${DEMO_SLUG}`, () =>
    HttpResponse.json({ ...comercio, productos: products, offers })
  ),

  http.get(`${API}/api/comercios/me`, () =>
    HttpResponse.json({ ...comercio, productos: products, offers })
  ),

  http.put(`${API}/api/comercios/me`, async ({ request }) => {
    const body = await request.json() as Partial<typeof comercio>;
    comercio = { ...comercio, ...body };
    return HttpResponse.json(comercio);
  }),

  http.post(`${API}/api/comercios/me/fotos`, () =>
    HttpResponse.json({ ok: true })
  ),

  // ── Tracking (no-op) ───────────────────────────────────────────────────────

  http.post(`${API}/api/comercios/${DEMO_SLUG}/track`, () =>
    HttpResponse.json({ ok: true })
  ),

  // ── Recomendaciones ────────────────────────────────────────────────────────

  http.post(`${API}/api/comercios/${DEMO_SLUG}/recommend`, () => {
    comercio = { ...comercio, recommendations: (comercio.recommendations ?? 0) + 1 };
    return HttpResponse.json({ ok: true });
  }),

  http.get(`${API}/api/comercios/${DEMO_SLUG}/reviews`, () =>
    HttpResponse.json([])
  ),

  http.post(`${API}/api/comercios/${DEMO_SLUG}/reviews`, async ({ request }) => {
    const body = await request.json() as { rating: number; comment?: string };
    const review = {
      id: id(),
      rating: body.rating,
      comment: body.comment ?? null,
      createdAt: new Date().toISOString(),
      user: { firstName: "Demo", lastName: "User", imageUrl: null },
    };
    return HttpResponse.json(review, { status: 201 });
  }),

  // ── Sumate ─────────────────────────────────────────────────────────────────

  http.post(`${API}/api/comercios/${DEMO_SLUG}/sumate`, () => {
    comercio = {
      ...comercio,
      _count: { subscripciones: (comercio._count?.subscripciones ?? 0) + 1 },
    };
    return HttpResponse.json({ ok: true });
  }),

  http.delete(`${API}/api/comercios/${DEMO_SLUG}/sumate`, () => {
    comercio = {
      ...comercio,
      _count: { subscripciones: Math.max(0, (comercio._count?.subscripciones ?? 0) - 1) },
    };
    return HttpResponse.json({ ok: true });
  }),

  http.get(`${API}/api/comercios/${DEMO_SLUG}/sumate`, () =>
    HttpResponse.json({ suscripto: false })
  ),

  // ── Productos ──────────────────────────────────────────────────────────────

  http.get(`${API}/api/comercios/me/productos`, () =>
    HttpResponse.json(products)
  ),

  http.post(`${API}/api/comercios/me/productos`, async ({ request }) => {
    const body = await request.json() as Partial<Producto>;
    const nuevo: Producto = {
      id: id(),
      comercioId: "demo-001",
      nombre: body.nombre ?? "Nuevo producto",
      tipo: body.tipo ?? "producto",
      descripcion: body.descripcion ?? null,
      precio: body.precio ?? null,
      foto: null,
      activo: true,
      stock: body.stock ?? null,
      createdAt: new Date().toISOString(),
    };
    products = [...products, nuevo];
    return HttpResponse.json(nuevo, { status: 201 });
  }),

  http.put(`${API}/api/comercios/me/productos/:id`, async ({ params, request }) => {
    const body = await request.json() as Partial<Producto>;
    products = products.map(p =>
      p.id === params.id ? { ...p, ...body } : p
    );
    return HttpResponse.json(products.find(p => p.id === params.id));
  }),

  http.delete(`${API}/api/comercios/me/productos/:id`, ({ params }) => {
    products = products.filter(p => p.id !== params.id);
    return HttpResponse.json({ ok: true });
  }),

  // AI autocompletar (devuelve datos demo)
  http.post(`${API}/api/comercios/me/productos/autocompletar`, async ({ request }) => {
    const body = await request.json() as { nombre: string };
    return HttpResponse.json({
      descripcion: `Descripción generada automáticamente para ${body.nombre}. Calidad premium, ideal para el día a día.`,
      precio: "$25.000",
    });
  }),

  // AI imagen (no-op en demo)
  http.post(`${API}/api/comercios/me/productos/generar-imagen`, () =>
    HttpResponse.json({ url: null, message: "Generación de imágenes deshabilitada en demo." })
  ),

  // ── Ofertas ────────────────────────────────────────────────────────────────

  http.get(`${API}/api/comercios/me/offers`, () =>
    HttpResponse.json(offers)
  ),

  http.post(`${API}/api/comercios/me/offers`, async ({ request }) => {
    const body = await request.json() as Partial<ComercioOffer>;
    const nueva: ComercioOffer = {
      id: id(),
      comercioId: "demo-001",
      titulo: body.titulo ?? "Nueva oferta",
      descripcion: body.descripcion ?? null,
      terminos: body.terminos ?? null,
      precio: body.precio ?? null,
      foto: null,
      validaHasta: body.validaHasta ?? null,
      activa: true,
      createdAt: new Date().toISOString(),
    };
    offers = [...offers, nueva];
    return HttpResponse.json(nueva, { status: 201 });
  }),

  http.put(`${API}/api/comercios/me/offers/:id`, async ({ params, request }) => {
    const body = await request.json() as Partial<ComercioOffer>;
    offers = offers.map(o => o.id === params.id ? { ...o, ...body } : o);
    return HttpResponse.json(offers.find(o => o.id === params.id));
  }),

  http.delete(`${API}/api/comercios/me/offers/:id`, ({ params }) => {
    offers = offers.filter(o => o.id !== params.id);
    return HttpResponse.json({ ok: true });
  }),

  // ── Posts / Comunidad ──────────────────────────────────────────────────────

  http.get(`${API}/api/comercios/${DEMO_SLUG}/posts`, () =>
    HttpResponse.json(posts)
  ),

  http.post(`${API}/api/comercios/${DEMO_SLUG}/posts`, async ({ request }) => {
    const body = await request.json() as Partial<ComercioPost>;
    const nuevo: ComercioPost = {
      id: id(),
      comercioId: "demo-001",
      tipo: body.tipo ?? "novedad",
      contenido: body.contenido ?? "",
      foto: null,
      precioAntes: body.precioAntes ?? null,
      precioDespues: body.precioDespues ?? null,
      fechaSorteo: body.fechaSorteo ?? null,
      likes: 0,
      activo: true,
      createdAt: new Date().toISOString(),
      comercio: { id: "demo-001", nombre: "El Rincón del Demo", slug: DEMO_SLUG, logo: null, rubro: "Indumentaria" },
    };
    posts = [nuevo, ...posts];
    return HttpResponse.json(nuevo, { status: 201 });
  }),

  http.delete(`${API}/api/comercios/${DEMO_SLUG}/posts/:id`, ({ params }) => {
    posts = posts.filter(p => p.id !== params.id);
    return HttpResponse.json({ ok: true });
  }),

  // ── Analytics & Plan ───────────────────────────────────────────────────────

  http.get(`${API}/api/comercios/me/analytics`, () =>
    HttpResponse.json(DEMO_ANALYTICS)
  ),

  http.get(`${API}/api/comercios/me/plan`, () =>
    HttpResponse.json(DEMO_PLAN)
  ),

  // ── Share links (no-op) ────────────────────────────────────────────────────

  http.get(/\/share\//, () =>
    new HttpResponse("<html><body>Demo share</body></html>", {
      headers: { "Content-Type": "text/html" },
    })
  ),
];
