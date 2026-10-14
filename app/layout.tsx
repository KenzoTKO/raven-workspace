import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Raven Workspace",
  description: "Private operations workspace for Raven Network"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
