import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";

const inter = Inter({ subsets: ["latin"], weight: ['300', '400', '500', '600', '700', '800'] });

export const metadata: Metadata = {
  title: "FuturePath AI - AI-Native Workforce Intelligence",
  description: "Bridge the gap between academic theory and industry reality. FuturePath AI uses predictive modeling and professional simulations to align your education directly with high-trajectory career outcomes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "PLACEHOLDER_CLIENT_ID.apps.googleusercontent.com";

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning className={`${inter.className} min-h-screen antialiased`} style={{ background: '#0a0f1e', color: '#f1f5f9' }}>
        <GoogleOAuthProvider clientId={googleClientId}>
          <QueryProvider>
            {children}
          </QueryProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
