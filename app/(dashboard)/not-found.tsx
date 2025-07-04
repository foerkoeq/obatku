import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@iconify/react";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Icon icon="heroicons:magnifying-glass" className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <CardTitle>Halaman Tidak Ditemukan</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Halaman yang Anda cari tidak dapat ditemukan.
          </p>
          <Button asChild className="w-full">
            <Link href="/">
              Kembali ke Dashboard
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 