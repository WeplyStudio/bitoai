import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from '@/components/theme-provider';
import { ProjectProvider } from '@/contexts/ProjectProvider';
import { LanguageProvider } from '@/contexts/LanguageProvider';
import { AuthProvider } from '@/contexts/AuthProvider';
import { AuthDialog } from '@/components/auth-dialog';

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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-muted/30">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>
            <AuthProvider>
              <ProjectProvider>
                {children}
                <AuthDialog />
              </ProjectProvider>
            </AuthProvider>
          </LanguageProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
