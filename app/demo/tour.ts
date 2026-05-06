import { driver } from "driver.js";

export type DemoTab = "perfil" | "catalogo" | "publicaciones" | "ofertas" | "estadisticas";

export interface TourCallbacks {
  setTab: (tab: DemoTab) => void;
  openProductModal: () => void;
  openPostModal: () => void;
  openOfferModal: () => void;
}

export function buildDemoTour(cb: TourCallbacks) {
  return driver({
    showProgress: true,
    progressText: "{{current}} de {{total}}",
    nextBtnText: "Siguiente →",
    prevBtnText: "← Anterior",
    doneBtnText: "¡Listo!",
    allowClose: true,
    overlayOpacity: 0.6,
    popoverClass: "demo-tour-popover",
    steps: [

      // ── 1. Bienvenida ──────────────────────────────────────────────────────
      {
        popover: {
          title: "👋 Bienvenido a la demo interactiva",
          description:
            "En los próximos minutos vas a explorar todas las funcionalidades de tu comercio. Podés hacer clic en cada elemento y probar todo como si fuera la app real.",
          side: "over",
          align: "center",
        },
      },

      // ── 2. Pestaña Perfil ──────────────────────────────────────────────────
      {
        element: "[data-tour='tab-perfil']",
        popover: {
          title: "🏪 Tu perfil público",
          description:
            "Esta es la vista que ven tus clientes. Tiene tu nombre, rubro, horario, dirección y el botón de contacto por WhatsApp.",
          side: "bottom",
          align: "start",
          onNextClick: () => {
            cb.setTab("perfil");
            driver().moveNext();
          },
        },
      },

      // ── 3. Datos del perfil ────────────────────────────────────────────────
      {
        element: "[data-tour='perfil-header']",
        popover: {
          title: "📋 Tu información",
          description:
            "Nombre, rubro, barrio y descripción. Todo esto aparece en el directorio de Reconquista cuando alguien te busca.",
          side: "bottom",
          align: "start",
        },
      },

      // ── 4. Botón WhatsApp ──────────────────────────────────────────────────
      {
        element: "[data-tour='whatsapp-btn']",
        popover: {
          title: "💬 Contacto directo",
          description:
            "Con un toque, el cliente abre WhatsApp con un mensaje pre-cargado para contactarte. Sin intermediarios.",
          side: "top",
          align: "center",
        },
      },

      // ── 5. Sumate ──────────────────────────────────────────────────────────
      {
        element: "[data-tour='sumate-btn']",
        popover: {
          title: "🔔 Botón Sumate",
          description:
            "Los clientes tocan este botón para seguirte. Cuando publicás algo nuevo, reciben una notificación. Es tu base de suscriptores propia.",
          side: "top",
          align: "center",
        },
      },

      // ── 6. Ir a Catálogo ───────────────────────────────────────────────────
      {
        element: "[data-tour='tab-catalogo']",
        popover: {
          title: "📦 Catálogo de productos",
          description:
            "Ahora vamos a ver tu catálogo y agregar un producto nuevo. ¡Hacé clic en la pestaña!",
          side: "bottom",
          align: "start",
          onNextClick: () => {
            cb.setTab("catalogo");
            setTimeout(() => driver().moveNext(), 300);
          },
        },
      },

      // ── 7. Lista de productos ──────────────────────────────────────────────
      {
        element: "[data-tour='productos-list']",
        popover: {
          title: "🛍️ Tus productos",
          description:
            "Estos son los productos que tus clientes pueden ver y agregar al carrito. Podés editarlos o eliminarlos en cualquier momento.",
          side: "top",
          align: "center",
        },
      },

      // ── 8. Botón agregar producto ──────────────────────────────────────────
      {
        element: "[data-tour='add-producto-btn']",
        popover: {
          title: "➕ Agregá un producto",
          description:
            "Tocá este botón para agregar un nuevo producto al catálogo. Completá el formulario y guardá.",
          side: "bottom",
          align: "end",
          onNextClick: () => {
            cb.openProductModal();
            setTimeout(() => driver().moveNext(), 400);
          },
        },
      },

      // ── 9. Modal de producto ───────────────────────────────────────────────
      {
        element: "[data-tour='producto-modal']",
        popover: {
          title: "📝 Formulario de producto",
          description:
            "Completá el nombre, precio y descripción. Podés subir una foto y agregar el stock disponible. Cuando estés listo, guardá el producto.",
          side: "left",
          align: "center",
        },
      },

      // ── 10. Ir a Publicaciones ─────────────────────────────────────────────
      {
        element: "[data-tour='tab-publicaciones']",
        popover: {
          title: "📢 Publicaciones",
          description:
            "Las publicaciones llegan a todos los usuarios que se sumaron a tu comercio como notificación. También aparecen en el feed de la app.",
          side: "bottom",
          align: "start",
          onNextClick: () => {
            cb.setTab("publicaciones");
            setTimeout(() => driver().moveNext(), 300);
          },
        },
      },

      // ── 11. Feed de posts ──────────────────────────────────────────────────
      {
        element: "[data-tour='posts-list']",
        popover: {
          title: "📰 Tu feed",
          description:
            "Acá aparecen todas tus publicaciones: ofertas, novedades y sorteos. Los clientes pueden dar like y compartirlas.",
          side: "top",
          align: "center",
        },
      },

      // ── 12. Crear post ─────────────────────────────────────────────────────
      {
        element: "[data-tour='add-post-btn']",
        popover: {
          title: "✏️ Nueva publicación",
          description:
            "Tocá acá para crear una oferta, novedad o sorteo. Se publica al instante y notifica a tus seguidores.",
          side: "bottom",
          align: "end",
          onNextClick: () => {
            cb.openPostModal();
            setTimeout(() => driver().moveNext(), 400);
          },
        },
      },

      // ── 13. Modal de post ──────────────────────────────────────────────────
      {
        element: "[data-tour='post-modal']",
        popover: {
          title: "📣 Crear publicación",
          description:
            "Elegí el tipo (oferta, novedad o sorteo), escribí el contenido y publicá. Podés agregar fotos y precios.",
          side: "left",
          align: "center",
        },
      },

      // ── 14. Ir a Ofertas ───────────────────────────────────────────────────
      {
        element: "[data-tour='tab-ofertas']",
        popover: {
          title: "🏷️ Ofertas destacadas",
          description:
            "Las ofertas aparecen en una sección especial de tu perfil, diferenciadas de las publicaciones del feed.",
          side: "bottom",
          align: "start",
          onNextClick: () => {
            cb.setTab("ofertas");
            setTimeout(() => driver().moveNext(), 300);
          },
        },
      },

      // ── 15. Lista de ofertas ───────────────────────────────────────────────
      {
        element: "[data-tour='ofertas-list']",
        popover: {
          title: "🎯 Ofertas activas",
          description:
            "Cada oferta puede tener título, descripción, fecha de vencimiento y foto. Aparecen destacadas en tu perfil.",
          side: "top",
          align: "center",
        },
      },

      // ── 16. Ir a Estadísticas ──────────────────────────────────────────────
      {
        element: "[data-tour='tab-estadisticas']",
        popover: {
          title: "📊 Estadísticas",
          description:
            "Por último, veamos cómo medís el rendimiento de tu comercio en la app.",
          side: "bottom",
          align: "start",
          onNextClick: () => {
            cb.setTab("estadisticas");
            setTimeout(() => driver().moveNext(), 300);
          },
        },
      },

      // ── 17. Dashboard de stats ─────────────────────────────────────────────
      {
        element: "[data-tour='stats-panel']",
        popover: {
          title: "📈 Tu rendimiento",
          description:
            "Visitas al perfil, clics en WhatsApp, recomendaciones recibidas. Todo en tiempo real para que sepas cómo está rindiendo tu comercio.",
          side: "top",
          align: "center",
        },
      },

      // ── 18. Fin ────────────────────────────────────────────────────────────
      {
        popover: {
          title: "🎉 ¡Ya lo conocés todo!",
          description:
            "Registrá tu comercio gratis y empezá a conectar con los vecinos de Reconquista. Cualquier duda, escribinos por WhatsApp.",
          side: "over",
          align: "center",
        },
      },
    ],
  });
}
