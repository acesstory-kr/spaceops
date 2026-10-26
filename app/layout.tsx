import PwaClient from './pwa-client';
import AuthLanding from './auth-landing';
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SpaceOps 공간관리",
  applicationName:"SpaceOps",
  manifest:"/manifest.webmanifest",
  appleWebApp:{capable:true,statusBarStyle:"default",title:"SpaceOps"},
  description: "함께 기록하고 확인하는 공간 운영 업무",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple:"/icons/apple-touch-icon.png",
  },
};

export const viewport:Viewport={width:"device-width",initialScale:1,viewportFit:"cover",themeColor:"#a57186"};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased"><AuthLanding/><PwaClient/>{children}</body>
    </html>
  );
}
