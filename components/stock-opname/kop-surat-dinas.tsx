// # START OF Kop Surat Dinas Component
// Purpose: Reusable official letterhead component for government document prints
// Features: Logo, institution name, address, contact info

"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { KopSuratDinas } from "@/lib/types/stock-opname";

export interface KopSuratDinasProps {
  data: KopSuratDinas;
  className?: string;
  /** Whether to show bottom border */
  showBorder?: boolean;
  /** Compact mode for smaller print */
  compact?: boolean;
}

const KopSuratDinasComponent: React.FC<KopSuratDinasProps> = ({
  data,
  className,
  showBorder = true,
  compact = false,
}) => {
  return (
    <header
      className={cn(
        showBorder && "border-b-[3px] border-black pb-3 mb-4",
        className
      )}
    >
      <div className="flex items-start gap-4">
        {/* Logo */}
        <div
          className={cn(
            "flex-shrink-0",
            compact ? "w-12 h-12" : "w-16 h-16"
          )}
        >
          {data.logo ? (
            <img
              src={data.logo}
              alt="Logo Dinas"
              className="w-full h-full object-contain"
            />
          ) : (
            <div
              className={cn(
                "w-full h-full border-2 border-gray-400 flex items-center justify-center",
                "text-[8px] text-gray-500 font-bold rounded-sm"
              )}
            >
              LOGO
            </div>
          )}
        </div>

        {/* Header Text */}
        <div className="flex-1 text-center">
          <h1
            className={cn(
              "font-bold leading-tight uppercase",
              compact ? "text-sm" : "text-base"
            )}
          >
            {data.namaInstansi}
          </h1>
          <h2
            className={cn(
              "font-bold leading-tight mt-0.5 uppercase",
              compact ? "text-xs" : "text-sm"
            )}
          >
            {data.namaDinas}
          </h2>
          <div
            className={cn(
              "mt-1.5 leading-snug",
              compact ? "text-[9px]" : "text-[10px]"
            )}
          >
            <p>{data.alamat}</p>
            <p>
              Telepon: {data.telepon}
              {data.website && (
                <span className="ml-3">Laman: {data.website}</span>
              )}
            </p>
            <p>Pos-el: {data.email}</p>
          </div>
        </div>

        {/* Spacer for symmetry */}
        <div
          className={cn(
            "flex-shrink-0",
            compact ? "w-12" : "w-16"
          )}
        />
      </div>
    </header>
  );
};

export default KopSuratDinasComponent;

// # END OF Kop Surat Dinas Component
