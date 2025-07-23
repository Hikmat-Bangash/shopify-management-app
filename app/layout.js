import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import AppShell from './AppShell';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Seller Management app",
  description: "Manage your Shopify store with ease",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-w-screen">
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
