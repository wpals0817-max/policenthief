import type { Metadata, Viewport } from "next";
import "./globals.css";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export const metadata: Metadata = {
  title: "경찰과 도둑 | 실시간 야외 술래잡기 게임",
  description: "친구들과 함께하는 실시간 GPS 기반 경찰과 도둑 게임. 링크 공유로 쉽게 참여하고, 실시간으로 위치를 추적하며 스릴 넘치는 추격전을 즐겨보세요!",
  keywords: ["경찰과 도둑", "술래잡기", "야외게임", "GPS게임", "실시간게임"],
  authors: [{ name: "Policenthief Team" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "경도",
  },
  openGraph: {
    title: "경찰과 도둑 - 실시간 야외 술래잡기",
    description: "친구들과 함께하는 GPS 기반 추격 게임",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <link rel="preconnect" href="https://unpkg.com" />
      </head>
      <body className="antialiased min-h-screen bg-[#0a0a0a]">
        <ErrorBoundary>
          <ServiceWorkerRegister />
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
