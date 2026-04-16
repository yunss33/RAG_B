import { useState } from 'react';

interface Agent {
  id: string;
  name: string;
  type: string;
  description: string;
  capabilities: string[];
}

interface AgentEditorProps {
  agents: Agent[];
  onAddAgent: (agent: Omit<Agent, 'id'>) => void;
  onUpdateAgent: (agent: Agent) => void;
  onDeleteAgent: (agentId: string) => void;
}

export default function AgentEditor({ agents, onAddAgent, onUpdateAgent, onDeleteAgent }: AgentEditorProps) {
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [newAgent, setNewAgent] = useState<Omit<Agent, 'id'>>({
    name: '',
    type: 'general',
    description: '',
    capabilities: [],
  });
  const [newCapability, setNewCapability] = useState('');

  const agentTypes = [
    { value: 'general', label: '通用智能体' },
    { value: 'analyzer', label: '分析智能体' },
    { value: 'planner', label: '规划智能体' },
    { value: 'writer', label: '写作智能体' },
    { value: 'reviewer', label: '审查智能体' },
    { value: 'coordinator', label: '协调智能体' },
  ];

  const handleAddCapability = (agent: Agent | Omit<Agent, 'id'>) => {
    if (newCapability) {
      if (editingAgent) {
        setEditingAgent({
          ...editingAgent,
          capabilities: [...editingAgent.capabilities, newCapability],
        });
      } else {
        setNewAgent({
          ...newAgent,
          capabilities: [...newAgent.capabilities, newCapability],
        });
      }
      setNewCapability('');
    }
  };

  const handleRemoveCapability = (index: number) => {
    if (editingAgent) {
      setEditingAgent({
        ...editingAgent,
        capabilities: editingAgent.capabilities.filter((_, i) => i !== index),
      });
    } else {
      setNewAgent({
        ...newAgent,
        capabilities: newAgent.capabilities.filter((_, i) => i !== index),
      });
    }
  };

  const handleSaveAgent = () => {
    if (editingAgent) {
      onUpdateAgent(editingAgent);
      setEditingAgent(null);
    } else {
      if (newAgent.name) {
        onAddAgent(newAgent);
        setNewAgent({
          name: '',
          type: 'general',
          description: '',
          capabilities: [],
        });
      }
    }
  };

  return (
    <div className="agent-editor">
      <div className="card">
        <h4>{editingAgent ? '编辑智能体' : '添加智能体'}</h4>
        <div className="form">
          <div className="form-group">
            <label>名称</label>
            <input
              type="text"
              value={editingAgent?.name || newAgent.name}
              onChange={(e) => {
                if (editingAgent) {
                  setEditingAgent({ ...editingAgent, name: e.target.value });
                } else {
                  setNewAgent({ ...newAgent, name: e.target.value });
                }
              }}
              placeholder="智能体名称"
            />
          </div>
          <div className="form-group">
            <label>类型</label>
            <select
              value={editingAgent?.type || newAgent.type}
              onChange={(e) => {
                if (editingAgent) {
                  setEditingAgent({ ...editingAgent, type: e.target.value });
                } else {
                  setNewAgent({ ...newAgent, type: e.target.value });
                }
              }}
            >
              {agentTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>描述</label>
            <textarea
              value={editingAgent?.description || newAgent.description}
              onChange={(e) => {
                if (editingAgent) {
                  setEditingAgent({ ...editingAgent, description: e.target.value });
                } else {
                  setNewAgent({ ...newAgent, description: e.target.value });
                }
              }}
              placeholder="智能体描述"
              rows={3}
            />
          </div>
          <div className="form-group">
            <label>能力</label>
            <div className="capabilities">
              {(editingAgent?.capabilities || newAgent.capabilities).map((capability, index) => (
                <div key={index} className="capability-tag">
                  {capability}
                  <button
                    type="button"
                    className="remove-button"
                    onClick={() => handleRemoveCapability(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
              <div className="add-capability">
                <input
                  type="text"
                  value={newCapability}
                  onChange={(e) => setNewCapability(e.target.value)}
                  placeholder="添加能力"
                />
                <button
                  type="button"
                  className="add-button"
                  onClick={() => handleAddCapability(editingAgent || newAgent)}
                >
                  添加
                </button>
              </div>
            </div>
          </div>
          <div className="actions">
            <button
              type="button"
              className="button"
              onClick={handleSaveAgent}
            >
              {editingAgent ? '保存修改' : '添加智能体'}
            </button>
            {editingAgent && (
              <button
                type="button"
                className="button secondary"
                onClick={() => setEditingAgent(null)}
              >
                取消
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="agent-list">
        <h4>智能体列表</h4>
        {agents.length === 0 ? (
          <p className="muted">还没有智能体，先添加一个。</p>
        ) : (
          <div className="list">
            {agents.map((agent) => (
              <div key={agent.id} className="card agent-card">
                <div>
                  <h5>{agent.name}</h5>
                  <p className="muted">类型：{agentTypes.find(t => t.value === agent.type)?.label}</p>
                  <p>{agent.description}</p>
                  <div className="capabilities-list">
                    {agent.capabilities.map((capability, index) => (
                      <span key={index} className="capability-tag">
                        {capability}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="actions">
                  <button
                    type="button"
                    className="button small"
                    onClick={() => setEditingAgent(agent)}
                  >
                    编辑
                  </button>
                  <button
                    type="button"
                    className="button small danger"
                    onClick={() => onDeleteAgent(agent.id)}
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
