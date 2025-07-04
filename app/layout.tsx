import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import MountedProvider from "@/providers/mounted.provider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import DirectionProvider from "@/providers/direction-provider";
import AuthProvider from "@/providers/auth.provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sistem Manajemen Obat Pertanian",
  description: "Aplikasi manajemen stok dan transaksi obat pertanian",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" dir="ltr" suppressHydrationWarning>
      <body className={`${inter.className} dashcode-app`} suppressHydrationWarning>
        <AuthProvider>
          <ThemeProvider>
            <MountedProvider>
              <DirectionProvider direction="ltr">
                {children}
              </DirectionProvider>
            </MountedProvider>
            <Toaster />
            <SonnerToaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
} 