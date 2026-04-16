import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "智能体编排",
  description: "智能体编排工作台"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
      </body>
    </html>
  );
}

