"use client";

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  isDark: boolean;
  required?: boolean;
}

export function FormField({ label, children, isDark, required }: FormFieldProps) {
  const labelCls = isDark ? "text-gray-400" : "text-gray-500";
  return (
    <div>
      <label className={`text-xs mb-1.5 block ${labelCls}`}>
        {label}{required && " *"}
      </label>
      {children}
    </div>
  );
}

// Shared className helpers for inputs inside FormField
export function inputClassName(isDark: boolean): string {
  return isDark
    ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-gray-500"
    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-400";
}
