"use client";

interface Props {
  data: Record<string, Record<string, number>>;
  isDark: boolean;
}

export function StoreAnalyticsChart({ data, isDark }: Props) {
  const days: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    days.push(d.toISOString().slice(0, 10));
  }

  const values = days.map((d) => {
    const day = data[d] ?? {};
    return Object.values(day).reduce((a, b) => a + b, 0);
  });

  const maxVal = Math.max(...values, 1);

  return (
    <div className="flex items-end gap-[2px] h-24 w-full">
      {values.map((v, i) => (
        <div
          key={i}
          title={`${days[i]}: ${v}`}
          className="flex-1 rounded-sm transition-all"
          style={{
            height: `${Math.max((v / maxVal) * 100, v > 0 ? 8 : 2)}%`,
            backgroundColor: v > 0
              ? isDark ? "rgb(99,102,241)" : "rgb(79,70,229)"
              : isDark ? "rgb(31,41,55)" : "rgb(229,231,235)",
          }}
        />
      ))}
    </div>
  );
}
