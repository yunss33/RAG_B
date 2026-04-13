import { getDrafts } from "@/lib/api";

export default async function DraftsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getDrafts(id);
  return (
    <div className="grid">
      <section className="panel">
        <h2>章节草稿</h2>
        <div className="list">
          {data.drafts.map((draft: any) => (
            <div className="card" key={draft.id}>
              <strong>{draft.title}</strong>
              <p style={{ whiteSpace: "pre-wrap" }}>{draft.content}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="panel">
        <h2>审查问题</h2>
        <div className="list">
          {data.review_issues.map((issue: any) => (
            <div className="card" key={issue.id}>
              <strong>[{issue.severity}] {issue.section_title}</strong>
              <p>{issue.message}</p>
              <p className="muted">建议：{issue.suggested_action}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

