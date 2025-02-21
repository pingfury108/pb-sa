'use client';

import { useState } from 'react';
import { Geist, Geist_Mono } from "next/font/google";
import { MainNav } from "@/components/nav";
import { Toaster } from "@/components/ui/toaster";
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
  const [isMobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}>
        <AuthProvider>
          <Toaster />
          <div className="relative flex min-h-screen flex-col">
            <div className={`flex-1 items-start ${isLoginPage ? '' : 'md:grid md:grid-cols-[220px_1fr]'}`}>
              {!isLoginPage && (
                <>
                  <button 
                    onClick={() => setMobileNavOpen(!isMobileNavOpen)}
                    className="md:hidden fixed top-2 left-2 z-40 p-2 rounded-lg bg-gray-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>

                  <aside className={`fixed top-0 z-30 -ml-2 h-screen w-64 shrink-0 border-r bg-background transition-transform md:sticky md:translate-x-0 ${
                    isMobileNavOpen ? 'translate-x-0' : '-translate-x-full'
                  } md:block`}>
                    <div className="h-full py-6 pl-8 pr-6">
                      <nav className="space-y-6">
                        <div className="flex flex-col space-y-2">
                          <h2 className="text-lg font-semibold">导航菜单</h2>
                          <MainNav />
                        </div>
                      </nav>
                    </div>
                  </aside>

                  {isMobileNavOpen && (
                    <div 
                      className="fixed inset-0 z-20 bg-black/50 md:hidden"
                      onClick={() => setMobileNavOpen(false)}
                    />
                  )}
                </>
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
