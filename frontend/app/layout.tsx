import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "FactorX — Commercial Cashflow Passport",
  description:
    "Turn verified commercial payments into a portable credit identity on Creditcoin using Attestcoin Protocol.",
};

const themeBoot = `(function(){try{var t=localStorage.getItem("factorx-theme");if(!t)t=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";document.documentElement.classList.toggle("dark",t==="dark");}catch(e){document.documentElement.classList.add("dark");}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
      </head>
      <body className="min-h-screen antialiased">
        <Providers>
          <ThemeProvider>{children}</ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
