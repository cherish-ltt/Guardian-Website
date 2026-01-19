import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Guardian-Website",
  description: "Guardian-Website 管理中心 - 基于 Next.js 16、React 19 和 shadcn/ui 的现代化认证系统前端应用，提供用户友好的 Web 界面来管理认证、授权和相关业务功能。",
  keywords: ["Guardian", "认证系统", "双因素认证", "Next.js", "React", "管理后台"],
  authors: [{ name: "Guardian Team" }],
  creator: "Guardian Team",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    siteName: 'Guardian-Website',
    title: 'Guardian-Website',
    description: 'Guardian-Website 管理中心 - 基于 Next.js 16、React 19 和 shadcn/ui 的现代化认证系统前端应用',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
