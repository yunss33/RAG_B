import { getRequirements } from "@/lib/api";

export default async function RequirementsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const requirements = await getRequirements(id);
  return (
    <section className="panel">
      <h2>招标解析结果</h2>
      <table className="table">
        <thead>
          <tr>
            <th>类别</th>
            <th>标准化要求</th>
            <th>硬性</th>
            <th>风险</th>
          </tr>
        </thead>
        <tbody>
          {requirements.map((item) => (
            <tr key={item.id}>
              <td>{item.category}</td>
              <td>{item.normalized_text}</td>
              <td>{item.mandatory ? "是" : "否"}</td>
              <td>{item.risk_level}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

