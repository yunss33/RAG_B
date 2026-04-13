import Link from "next/link";
import { getProjects } from "@/lib/api";
import { ProjectActions } from "@/components/project-actions";

export default async function HomePage() {
  const projects = await getProjects();
  return (
    <div className="grid">
      <section className="panel">
        <h2>项目列表</h2>
        <div className="list">
          {projects.length === 0 ? <p className="muted">还没有项目，先创建一个。</p> : null}
          {projects.map((project) => (
            <div className="card project-card" key={project.id}>
              <div>
                <h3>{project.name}</h3>
                <p className="muted">阶段：{project.run_state.stage}</p>
                <div className="actions">
                  <Link className="button" href={`/projects/${project.id}`}>进入项目</Link>
                  <Link className="button secondary" href={`/projects/${project.id}/upload`}>上传资料</Link>
                </div>
              </div>
              <ProjectActions projectId={project.id} />
            </div>
          ))}
        </div>
      </section>
      <section className="stack">
        <div className="panel">
          <h2>当前 MVP 覆盖</h2>
          <ul>
            <li>项目创建、资料上传、资料入库</li>
            <li>招标解析、章节规划、章节草稿</li>
            <li>审查问题输出、图片建议、人工确认</li>
            <li>HTML 终稿装配与预览</li>
          </ul>
        </div>
        <div className="panel">
          <h2>固定主链路</h2>
          <p className="muted">创建项目 → 上传资料 → 入库 → 启动主流程 → 查看草稿与图片建议 → 确认图片 → 预览终稿</p>
        </div>
      </section>
    </div>
  );
}

