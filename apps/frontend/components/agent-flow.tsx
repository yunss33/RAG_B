interface Agent {
  id: string;
  name: string;
  type: string;
  description: string;
  capabilities: string[];
}

interface Relationship {
  source: string;
  target: string;
  type: string;
  description: string;
}

interface AgentFlowProps {
  agents: Agent[];
  relationships: Relationship[];
}

export default function AgentFlow({ agents, relationships }: AgentFlowProps) {
  // 简单的布局算法
  const layoutAgents = () => {
    const positions: Record<string, { x: number; y: number }> = {};
    const width = 800;
    const height = 400;
    const padding = 100;
    
    // 计算每个智能体的位置
    agents.forEach((agent, index) => {
      const angle = (index / agents.length) * Math.PI * 2;
      const radius = Math.min(width, height) / 3;
      const x = padding + width / 2 + Math.cos(angle) * radius;
      const y = padding + height / 2 + Math.sin(angle) * radius;
      positions[agent.id] = { x, y };
    });
    
    return positions;
  };

  const agentPositions = layoutAgents();
  const getAgentTypeColor = (type: string) => {
    const colors = {
      general: '#4CAF50',
      analyzer: '#2196F3',
      planner: '#FF9800',
      writer: '#9C27B0',
      reviewer: '#F44336',
      coordinator: '#607D8B',
    };
    return colors[type as keyof typeof colors] || '#9E9E9E';
  };

  const getRelationshipTypeColor = (type: string) => {
    const colors = {
      data: '#2196F3',
      instruction: '#FF9800',
      coordination: '#4CAF50',
      supervision: '#F44336',
    };
    return colors[type as keyof typeof colors] || '#9E9E9E';
  };

  return (
    <div className="agent-flow">
      <svg width="100%" height="500" viewBox="0 0 1000 500">
        {/* 绘制连接线 */}
        {relationships.map((relationship, index) => {
          const sourcePos = agentPositions[relationship.source];
          const targetPos = agentPositions[relationship.target];
          
          if (sourcePos && targetPos) {
            return (
              <g key={index}>
                <path
                  d={`M ${sourcePos.x} ${sourcePos.y} L ${targetPos.x} ${targetPos.y}`}
                  stroke={getRelationshipTypeColor(relationship.type)}
                  strokeWidth="2"
                  fill="none"
                  markerEnd="url(#arrowhead)"
                />
                <text
                  x={(sourcePos.x + targetPos.x) / 2}
                  y={(sourcePos.y + targetPos.y) / 2 - 10}
                  textAnchor="middle"
                  fill="#666"
                  fontSize="12"
                >
                  {relationship.description}
                </text>
              </g>
            );
          }
          return null;
        })}

        {/* 绘制智能体节点 */}
        {agents.map((agent) => {
          const pos = agentPositions[agent.id];
          if (pos) {
            return (
              <g key={agent.id}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="40"
                  fill={getAgentTypeColor(agent.type)}
                  stroke="white"
                  strokeWidth="2"
                />
                <text
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  fill="white"
                  fontSize="14"
                  fontWeight="bold"
                >
                  {agent.name}
                </text>
                <text
                  x={pos.x}
                  y={pos.y + 20}
                  textAnchor="middle"
                  fill="white"
                  fontSize="10"
                >
                  {agent.type}
                </text>
              </g>
            );
          }
          return null;
        })}

        {/* 箭头标记 */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
          </marker>
        </defs>
      </svg>

      <div className="legend">
        <h4>图例</h4>
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#4CAF50' }}></span>
            <span>通用智能体</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#2196F3' }}></span>
            <span>分析智能体</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#FF9800' }}></span>
            <span>规划智能体</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#9C27B0' }}></span>
            <span>写作智能体</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#F44336' }}></span>
            <span>审查智能体</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#607D8B' }}></span>
            <span>协调智能体</span>
          </div>
        </div>
      </div>
    </div>
  );
}
