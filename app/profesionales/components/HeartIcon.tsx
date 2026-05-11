"use client";

export function HeartIcon({ filled, dark }: { filled: boolean; dark: boolean }) {
  return (
    <svg
      className={`w-4 h-4 transition-colors ${filled ? "text-red-400" : dark ? "text-gray-600 group-hover:text-red-400" : "text-gray-300 group-hover:text-red-400"}`}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
  );
}
