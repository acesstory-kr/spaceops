import AuthLanding from './auth-landing';
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "공간 운영 캘린더",
  description: "함께 기록하고 확인하는 공간 운영 업무",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased"><AuthLanding/>{children}</body>
    </html>
  );
}
