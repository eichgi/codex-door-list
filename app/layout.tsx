import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dool Fest 2026 | Dool List",
  description: "Regístrate para Dool Fest 2026.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
