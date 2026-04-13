import Link from "next/link";
import { getProjectStatus } from "@/lib/api";
import { ProjectActions } from "@/components/project-actions";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const status = await getProjectStatus(id);
  return (
    <div className="stack">
      <section className="panel">
        <h2>项目状态</h2>
        <p>当前阶段：<strong>{status.stage}</strong></p>
        <p className="muted">
          文件 {status.source_file_count} 个，需求 {status.requirement_count} 条，草稿 {status.draft_count} 节，审查问题 {status.review_issue_count} 条。
        </p>
        <ProjectActions projectId={id} />
      </section>
      <section className="panel">
        <h2>工作导航</h2>
        <div className="actions">
          <Link className="button" href={`/projects/${id}/upload`}>资料上传</Link>
          <Link className="button secondary" href={`/projects/${id}/requirements`}>解析结果</Link>
          <Link className="button secondary" href={`/projects/${id}/outline`}>章节计划</Link>
          <Link className="button secondary" href={`/projects/${id}/drafts`}>草稿与审查</Link>
          <Link className="button secondary" href={`/projects/${id}/images`}>图片选择</Link>
          <Link className="button secondary" href={`/projects/${id}/final`}>终稿预览</Link>
        </div>
      </section>
    </div>
  );
}

