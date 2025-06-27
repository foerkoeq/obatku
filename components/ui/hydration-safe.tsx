"use client";

import { useEffect, useState } from "react";

interface HydrationSafeProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function HydrationSafe({ children, fallback = null }: HydrationSafeProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
} 