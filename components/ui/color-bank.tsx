// # START OF Color Bank Component - Color palette for info cards
// Purpose: Provide a collection of distinct, aesthetic colors for UI components
// Returns: Color configuration object with 10+ distinct colors

export const colorBank = {
  blue: {
    bg: "bg-blue-500",
    bgLight: "bg-blue-50",
    bgDark: "bg-blue-600",
    text: "text-blue-700",
    textLight: "text-blue-600",
    border: "border-blue-200",
    hover: "hover:bg-blue-600",
  },
  purple: {
    bg: "bg-purple-500",
    bgLight: "bg-purple-50",
    bgDark: "bg-purple-600",
    text: "text-purple-700",
    textLight: "text-purple-600",
    border: "border-purple-200",
    hover: "hover:bg-purple-600",
  },
  indigo: {
    bg: "bg-indigo-500",
    bgLight: "bg-indigo-50",
    bgDark: "bg-indigo-600",
    text: "text-indigo-700",
    textLight: "text-indigo-600",
    border: "border-indigo-200",
    hover: "hover:bg-indigo-600",
  },
  teal: {
    bg: "bg-teal-500",
    bgLight: "bg-teal-50",
    bgDark: "bg-teal-600",
    text: "text-teal-700",
    textLight: "text-teal-600",
    border: "border-teal-200",
    hover: "hover:bg-teal-600",
  },
  emerald: {
    bg: "bg-emerald-500",
    bgLight: "bg-emerald-50",
    bgDark: "bg-emerald-600",
    text: "text-emerald-700",
    textLight: "text-emerald-600",
    border: "border-emerald-200",
    hover: "hover:bg-emerald-600",
  },
  amber: {
    bg: "bg-amber-500",
    bgLight: "bg-amber-50",
    bgDark: "bg-amber-600",
    text: "text-amber-700",
    textLight: "text-amber-600",
    border: "border-amber-200",
    hover: "hover:bg-amber-600",
  },
  rose: {
    bg: "bg-rose-500",
    bgLight: "bg-rose-50",
    bgDark: "bg-rose-600",
    text: "text-rose-700",
    textLight: "text-rose-600",
    border: "border-rose-200",
    hover: "hover:bg-rose-600",
  },
  cyan: {
    bg: "bg-cyan-500",
    bgLight: "bg-cyan-50",
    bgDark: "bg-cyan-600",
    text: "text-cyan-700",
    textLight: "text-cyan-600",
    border: "border-cyan-200",
    hover: "hover:bg-cyan-600",
  },
  violet: {
    bg: "bg-violet-500",
    bgLight: "bg-violet-50",
    bgDark: "bg-violet-600",
    text: "text-violet-700",
    textLight: "text-violet-600",
    border: "border-violet-200",
    hover: "hover:bg-violet-600",
  },
  fuchsia: {
    bg: "bg-fuchsia-500",
    bgLight: "bg-fuchsia-50",
    bgDark: "bg-fuchsia-600",
    text: "text-fuchsia-700",
    textLight: "text-fuchsia-600",
    border: "border-fuchsia-200",
    hover: "hover:bg-fuchsia-600",
  },
  sky: {
    bg: "bg-sky-500",
    bgLight: "bg-sky-50",
    bgDark: "bg-sky-600",
    text: "text-sky-700",
    textLight: "text-sky-600",
    border: "border-sky-200",
    hover: "hover:bg-sky-600",
  },
  lime: {
    bg: "bg-lime-500",
    bgLight: "bg-lime-50",
    bgDark: "bg-lime-600",
    text: "text-lime-700",
    textLight: "text-lime-600",
    border: "border-lime-200",
    hover: "hover:bg-lime-600",
  },
} as const;

export type ColorBankKey = keyof typeof colorBank;

export const getColorBankKeys = (): ColorBankKey[] => {
  return Object.keys(colorBank) as ColorBankKey[];
};

// # END OF Color Bank Component

