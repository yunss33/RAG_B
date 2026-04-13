import { getOutline } from "@/lib/api";

export default async function OutlinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const outline = await getOutline(id);
  return (
    <section className="panel">
      <h2>章节计划</h2>
      <div className="list">
        {outline.map((section) => (
          <div className="card" key={section.id}>
            <strong>{section.code}. {section.title}</strong>
            <p>{section.goal}</p>
            <p className="muted">证据需求：{section.evidence_requirements.join(" / ")}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

