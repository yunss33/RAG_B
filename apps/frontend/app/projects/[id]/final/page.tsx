import { getFinalHtml } from "@/lib/api";

export default async function FinalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getFinalHtml(id);
  return (
    <section className="panel">
      <h2>HTML 终稿预览</h2>
      {!result.html ? <p className="muted">终稿尚未生成。请先完成图片确认并继续装配。</p> : null}
      {result.html ? (
        <iframe
          className="html-preview"
          srcDoc={result.html}
          title="final-html-preview"
        />
      ) : null}
    </section>
  );
}
