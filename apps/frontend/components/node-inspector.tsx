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
      if (confirm('确定要删除这个节点吗？')) {
        onDelete(editedNode.id);
      }
    }
  }, [editedNode, onDelete]);

  if (!node) {
    return (
      <div className="node-inspector">
        <div className="empty-state">
          <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>🎯</div>
          <p style={{ margin: '0', color: '#6a5f52' }}>选择一个节点进行编辑</p>
        </div>
      </div>
    );
  }

  return (
    <div className="node-inspector">
      <div style={{ padding: '16px', backgroundColor: '#fffaf4', borderBottom: '1px solid #d9c8b0' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 600 }}>节点设置</h3>
        <p style={{ margin: '0', fontSize: '12px', color: '#6a5f52' }}>{node.type} 智能体</p>
      </div>
      
      <div style={{ padding: '16px' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 600, color: '#251f18' }}>名称</label>
          <input
            type="text"
            value={editedNode?.data.name || ''}
            onChange={(e) => handleUpdateData('name', e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d9c8b0',
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: 'inherit',
            }}
          />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 600, color: '#251f18' }}>描述</label>
          <textarea
            value={editedNode?.data.description || ''}
            onChange={(e) => handleUpdateData('description', e.target.value)}
            rows={3}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d9c8b0',
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: 'inherit',
              resize: 'vertical',
            }}
          />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 600, color: '#251f18' }}>能力</label>
          <div style={{ marginBottom: '8px' }}>
            {editedNode?.data.capabilities.map((capability, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 10px',
                backgroundColor: '#fff1e0',
                borderRadius: '8px',
                marginBottom: '4px',
                fontSize: '14px',
              }}>
                <span>{capability}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveCapability(index)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#b3562d',
                    cursor: 'pointer',
                    fontSize: '16px',
                    lineHeight: '1',
                    padding: '0 4px',
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={newCapability}
              onChange={(e) => setNewCapability(e.target.value)}
              placeholder="添加能力"
              style={{
                flex: '1',
                padding: '8px 12px',
                border: '1px solid #d9c8b0',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'inherit',
              }}
            />
            <button
              type="button"
              onClick={handleAddCapability}
              style={{
                padding: '8px 16px',
                backgroundColor: '#b3562d',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontFamily: 'inherit',
              }}
            >
              添加
            </button>
          </div>
        </div>
        
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 600, color: '#251f18' }}>位置</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ flex: '1' }}>
              <input
                type="number"
                value={editedNode?.position.x || 0}
                onChange={(e) => handleUpdate('position.x', parseFloat(e.target.value))}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d9c8b0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                }}
              />
            </div>
            <div style={{ flex: '1' }}>
              <input
                type="number"
                value={editedNode?.position.y || 0}
                onChange={(e) => handleUpdate('position.y', parseFloat(e.target.value))}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d9c8b0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                }}
              />
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            onClick={handleSave}
            style={{
              flex: '1',
              padding: '10px 16px',
              backgroundColor: '#b3562d',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontFamily: 'inherit',
              fontWeight: 500,
            }}
          >
            保存
          </button>
          <button
            type="button"
            onClick={handleDelete}
            style={{
              flex: '1',
              padding: '10px 16px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontFamily: 'inherit',
              fontWeight: 500,
            }}
          >
            删除
          </button>
        </div>
      </div>
    </div>
  );
}
