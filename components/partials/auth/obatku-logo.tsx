'use client'
import Image from 'next/image';
import { useTheme } from "next-themes";

const ObatkuLogo = () => {
  const { theme: mode } = useTheme();
  
  return (
    <div className="flex items-center gap-3">
      {/* Icon/Logo Obat */}
      <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-6 h-6 text-white"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2L13.09 8.26L19 7.27L14.64 12L19 16.73L13.09 15.74L12 22L10.91 15.74L5 16.73L9.36 12L5 7.27L10.91 8.26L12 2Z"
            fill="currentColor"
          />
          <circle cx="12" cy="12" r="3" fill="white" />
        </svg>
      </div>
      
      {/* Teks Logo */}
      <div className="flex flex-col">
        <span className="text-xl font-bold text-primary">OBATKU</span>
        <span className="text-xs text-muted-foreground -mt-1">Sistem Manajemen Obat Pertanian</span>
      </div>
    </div>
  );
}

export default ObatkuLogo;
