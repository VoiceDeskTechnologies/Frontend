import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HANDSFREE | AI That Works for Your Business",
  description: "Let HANDSFREE handle your business calls with AI phone agents that speak, listen, understand, and take action.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en"><body>{children}</body></html>
  );
}
