import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import {
  ProgressProvider,
  ProgressBar,
  SkeletonProvider,
} from "../components/progress";

export const metadata: Metadata = {
  title: "MtF.wiki",
  description: "MtF.wiki",
  icons: {
    apple: {
      url: "/favicon/apple-touch-icon.png",
      sizes: "180x180",
      type: "image/png",
    },
    icon: [
      {
        url: "/favicon/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/favicon/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
    ],
  },
  manifest: "/favicon/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <body className={`antialiased`}>
        <ProgressProvider>
          <SkeletonProvider>
            <ThemeProvider
              attribute="data-theme"
              defaultTheme="system"
              enableSystem={true}
              themes={["system", "light", "dark"]}
              value={{ dark: "sunset", light: "cupcake" }}
            >
              <ProgressBar className="fixed h-1 shadow-lg shadow-sky-500/20 bg-sky-500 top-0 z-50" />
              {children}
            </ThemeProvider>
          </SkeletonProvider>
        </ProgressProvider>
      </body>
    </html>
  );
}
