import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from '@/components/theme-provider';
import { ProjectProvider } from '@/contexts/ProjectProvider';
import { LanguageProvider } from '@/contexts/LanguageProvider';
import { AuthProvider } from '@/contexts/AuthProvider';
import { AuthDialog } from '@/components/auth-dialog';
import { UiThemeProvider } from '@/contexts/UiThemeProvider';

export const metadata: Metadata = {
  title: 'Bito AI',
  description: 'An AI Chat application powered by Bito AI, developed by JDev.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Nunito:wght@400;600;700&family=VT323&family=Press+Start+2P&family=Orbitron:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <UiThemeProvider>
            <LanguageProvider>
              <AuthProvider>
                <ProjectProvider>
                  {children}
                  <AuthDialog />
                </ProjectProvider>
              </AuthProvider>
            </LanguageProvider>
            <Toaster />
          </UiThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
