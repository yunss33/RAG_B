'use client';
import { useState, useCallback, useEffect } from 'react';

interface Node {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    name: string;
    description: string;
    capabilities: string[];
  };
}

interface NodeInspectorProps {
  node: Node | null;
  onUpdate: (node: Node) => void;
  onDelete: (nodeId: string) => void;
}

export default function NodeInspector({ node, onUpdate, onDelete }: NodeInspectorProps) {
  const [editedNode, setEditedNode] = useState<Node | null>(null);
  const [newCapability, setNewCapability] = useState('');

  useEffect(() => {
    setEditedNode(node);
  }, [node]);

  const handleUpdate = useCallback((field: string, value: any) => {
    if (editedNode) {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        setEditedNode({
          ...editedNode,
          [parent]: {
            ...editedNode[parent as keyof Node],
            [child]: value,
          },
        });
      } else {
        setEditedNode({
          ...editedNode,
          [field]: value,
        });
      }
    }
  }, [editedNode]);

  const handleUpdateData = useCallback((field: string, value: any) => {
    if (editedNode) {
      setEditedNode({
        ...editedNode,
        data: {
          ...editedNode.data,
          [field]: value,
        },
      });
    }
  }, [editedNode]);

  const handleAddCapability = useCallback(() => {
    if (editedNode && newCapability) {
      setEditedNode({
        ...editedNode,
        data: {
          ...editedNode.data,
          capabilities: [...editedNode.data.capabilities, newCapability],
        },
      });
      setNewCapability('');
    }
  }, [editedNode, newCapability]);

  const handleRemoveCapability = useCallback((index: number) => {
    if (editedNode) {
      setEditedNode({
        ...editedNode,
        data: {
          ...editedNode.data,
          capabilities: editedNode.data.capabilities.filter((_, i) => i !== index),
        },
      });
    }
  }, [editedNode]);

  const handleSave = useCallback(() => {
    if (editedNode) {
      onUpdate(editedNode);
    }
  }, [editedNode, onUpdate]);

  const handleDelete = useCallback(() => {
    if (editedNode) {
      onDelete(editedNode.id);
    }
  }, [editedNode, onDelete]);

  if (!node) {
    return (
      <div className="node-inspector">
        <h3>节点检查器</h3>
        <div className="empty-state">
          <p>选择一个节点进行编辑</p>
        </div>
      </div>
    );
  }

  return (
    <div className="node-inspector">
      <h3>节点检查器</h3>
      <div className="inspector-section">
        <h4>基本信息</h4>
        <div className="form-group">
          <label>名称</label>
          <input
            type="text"
            value={editedNode?.data.name || ''}
            onChange={(e) => handleUpdateData('name', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>描述</label>
          <textarea
            value={editedNode?.data.description || ''}
            onChange={(e) => handleUpdateData('description', e.target.value)}
            rows={3}
          />
        </div>
      </div>
      <div className="inspector-section">
        <h4>能力</h4>
        <div className="capabilities">
          {editedNode?.data.capabilities.map((capability, index) => (
            <div key={index} className="capability-item">
              <span>{capability}</span>
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
              onClick={handleAddCapability}
            >
              添加
            </button>
          </div>
        </div>
      </div>
      <div className="inspector-section">
        <h4>位置</h4>
        <div className="form-row">
          <div className="form-group">
            <label>X</label>
            <input
              type="number"
              value={editedNode?.position.x || 0}
              onChange={(e) => handleUpdate('position.x', parseFloat(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label>Y</label>
            <input
              type="number"
              value={editedNode?.position.y || 0}
              onChange={(e) => handleUpdate('position.y', parseFloat(e.target.value))}
            />
          </div>
        </div>
      </div>
      <div className="inspector-actions">
        <button
          type="button"
          className="button"
          onClick={handleSave}
        >
          保存
        </button>
        <button
          type="button"
          className="button danger"
          onClick={handleDelete}
        >
          删除
        </button>
      </div>
    </div>
  );
}
