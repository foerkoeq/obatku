"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@iconify/react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Icon icon="heroicons:exclamation-triangle" className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <CardTitle>Terjadi Kesalahan</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Maaf, terjadi kesalahan yang tidak terduga.
          </p>
          <Button onClick={reset} className="w-full">
            Coba Lagi
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 