import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DeepBS MVP",
  description: "标书多智能体 MVP 工作台"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="page">
          <div className="hero">
            <div className="pill">单租户内部版 / 中文优先 / Human in the Loop</div>
            <h1>DeepBS 标书多智能体工作台</h1>
            <p className="muted">
              打通招标解析、RAG、章节写作、审查、图片选择与 HTML 成稿的最小闭环。
            </p>
            <div className="actions">
              <Link className="button" href="/">项目列表</Link>
              <Link className="button secondary" href="/projects/new">创建项目</Link>
              <Link className="button secondary" href="/orchestration">智能体编排</Link>
            </div>
          </div>
          {children}
        </div>
      </body>
    </html>
  );
}

