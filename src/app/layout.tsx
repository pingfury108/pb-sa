'use client';

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MainNav } from "@/components/nav";
import { usePathname } from 'next/navigation';
import { AuthProvider } from "@/components/AuthProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}>
        <AuthProvider>
          <div className="relative flex min-h-screen flex-col">
            <div className={`flex-1 items-start ${isLoginPage ? '' : 'md:grid md:grid-cols-[220px_1fr]'}`}>
              {!isLoginPage && (
                <aside className="fixed top-0 z-30 -ml-2 hidden h-screen w-full shrink-0 border-r md:sticky md:block">
                  <div className="h-full py-6 pl-8 pr-6">
                    <nav className="space-y-6">
                      <div className="flex flex-col space-y-2">
                        <h2 className="text-lg font-semibold">导航菜单</h2>
                        <MainNav />
                      </div>
                    </nav>
                  </div>
                </aside>
              )}
              <main className="relative py-6 px-4 md:px-8 lg:px-12">
                {children}
              </main>
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
