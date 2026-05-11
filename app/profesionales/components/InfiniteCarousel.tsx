"use client";

const CAROUSEL_MIN_ITEMS = 6;

interface Props<T extends { id: string }> {
  items: T[];
  renderCard: (item: T) => React.ReactNode;
}

export function InfiniteCarousel<T extends { id: string }>({ items, renderCard }: Props<T>) {
  if (items.length === 0) return null;

  if (items.length < CAROUSEL_MIN_ITEMS) {
    return (
      <div className="overflow-x-auto -mx-4 px-4">
        <div className="flex gap-4 pb-1">
          {items.map((item) => (
            <div key={item.id} className="shrink-0 w-20">
              {renderCard(item)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const itemSlot = 96;
  const copiesPerHalf = Math.max(2, Math.ceil(1600 / (items.length * itemSlot)));
  const totalCopies = copiesPerHalf * 2;
  const repeated = Array.from({ length: totalCopies * items.length }, (_, i) => items[i % items.length]);
  const halfWidthPx = copiesPerHalf * items.length * itemSlot;
  const duration = Math.round(halfWidthPx / 50);

  return (
    <div className="overflow-hidden -mx-4 py-2">
      <div
        className="flex carousel-marquee"
        style={{ gap: "1rem", animationDuration: `${duration}s` }}
      >
        {repeated.map((item, i) => (
          <div key={`${item.id}-${i}`} className="shrink-0 w-20">
            {renderCard(item)}
          </div>
        ))}
      </div>
    </div>
  );
}
