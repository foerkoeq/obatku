import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - Sistem Manajemen Obat Pertanian",
  description: "Masuk ke Sistem Manajemen Obat Pertanian",
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default Layout;
