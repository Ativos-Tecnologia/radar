import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import { ThemeProvider } from "@/contexts/theme-context";
import { EnteProvider } from "@/contexts/ente-context";
import { QueryProvider } from "@/lib/query-client";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const initialThemeScript = `
(function () {
  try {
    const storedTheme = window.localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = storedTheme || (prefersDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', theme === 'dark');
  } catch (error) {
    console.warn('Failed to set initial theme', error);
  }
})();
`;

export const metadata: Metadata = {
  title: "Radar - Sistema de Gestão de Precatórios",
  description: "Sistema de gestão e controle de precatórios",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: initialThemeScript }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <EnteProvider>
          <ThemeProvider>
            <AuthProvider>
              <QueryProvider>
                {children}
              </QueryProvider>
            </AuthProvider>
          </ThemeProvider>
        </EnteProvider>
      </body>
    </html>
  );
}
