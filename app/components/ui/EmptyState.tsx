"use client";

interface EmptyStateProps {
  icon: React.ReactNode;
  message: string;
  subMessage?: string;
  action?: { label: string; onClick: () => void };
  isDark: boolean;
}

export function EmptyState({ icon, message, subMessage, action, isDark }: EmptyStateProps) {
  const textMuted = isDark ? "text-gray-600" : "text-gray-400";
  const textSub   = isDark ? "text-gray-700" : "text-gray-300";

  return (
    <div className={`py-12 text-center rounded-2xl border ${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}>
      <div className={`flex justify-center mb-3 ${textMuted}`}>{icon}</div>
      <p className={`text-sm ${textMuted}`}>{message}</p>
      {subMessage && <p className={`text-xs mt-1 ${textSub}`}>{subMessage}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-3 text-xs px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-semibold transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
