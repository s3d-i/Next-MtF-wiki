import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "next-themes";

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
        <ThemeProvider value={{ dark: "sunset", light: "cupcake" }}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
