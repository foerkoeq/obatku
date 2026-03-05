"use client";

/**
 * Floating Scan Button
 * 
 * Tombol floating untuk membuka QR scanner.
 * - Desktop: FAB (Floating Action Button) di pojok kanan bawah
 * - Mobile: Disembunyikan karena terintegrasi di bottom navigation
 */

import React from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";

interface FloatingScanButtonProps {
  /** Callback saat tombol ditekan */
  onClick: () => void;
  /** Custom class */
  className?: string;
}

const FloatingScanButton: React.FC<FloatingScanButtonProps> = ({
  onClick,
  className,
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        // Base
        "group fixed z-40 flex items-center gap-2 cursor-pointer",
        // Position: pojok kanan bawah
        "bottom-6 right-6",
        // Style
        "bg-primary text-primary-foreground",
        "rounded-full shadow-lg shadow-primary/25",
        // Size
        "h-14 w-14",
        // Hover effects
        "hover:shadow-xl hover:shadow-primary/30 hover:scale-105",
        "active:scale-95",
        // Transition
        "transition-all duration-300 ease-out",
        // Hidden on mobile (dipakai di bottom nav)
        "hidden md:flex items-center justify-center",
        className
      )}
      aria-label="Scan QR Code"
      title="Scan QR Code"
    >
      {/* Camera/QR icon */}
      <Icon
        icon="heroicons:qr-code-20-solid"
        className="w-6 h-6 transition-transform group-hover:scale-110"
      />

      {/* Pulse ring animation */}
      <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping opacity-75 pointer-events-none" />
    </button>
  );
};

export default FloatingScanButton;
