'use client';
import { forwardRef, useState, useCallback, useRef, useEffect } from 'react';

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

interface Edge {
  id: string;
  source: string;
  target: string;
  label: string;
}

interface WorkflowCanvasProps {
  nodes: Node[];
  edges: Edge[];
  selectedNode: Node | null;
  onNodeSelect: (node: Node) => void;
  onNodeUpdate: (node: Node) => void;
  onNodeDelete: (nodeId: string) => void;
  onEdgeAdd: (edge: Edge) => void;
  onEdgeDelete: (edgeId: string) => void;
  zoom: number;
  pan: { x: number; y: number };
  onPan: (pan: { x: number; y: number }) => void;
}

const WorkflowCanvas = forwardRef<HTMLDivElement, WorkflowCanvasProps>(({
  nodes,
  edges,
  selectedNode,
  onNodeSelect,
  onNodeUpdate,
  onNodeDelete,
  onEdgeAdd,
  onEdgeDelete,
  zoom,
  pan,
  onPan,
}, ref) => {
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [connecting, setConnecting] = useState<string | null>(null);
  const [connectionStart, setConnectionStart] = useState({ x: 0, y: 0 });
  const [connectionEnd, setConnectionEnd] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleNodeMouseDown = useCallback((nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDraggingNode(nodeId);
    setDragStart({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (draggingNode) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      const node = nodes.find(n => n.id === draggingNode);
      if (node) {
        onNodeUpdate({
          ...node,
          position: {
            x: node.position.x + deltaX / zoom,
            y: node.position.y + deltaY / zoom,
          },
        });
      }
      setDragStart({ x: e.clientX, y: e.clientY });
    }

    if (connecting) {
      setConnectionEnd({ x: e.clientX, y: e.clientY });
    }
  }, [draggingNode, dragStart, nodes, onNodeUpdate, zoom, connecting]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (draggingNode) {
      setDraggingNode(null);
    }

    if (connecting) {
      // 检查是否连接到了另一个节点
      const targetNode = nodes.find(node => {
        const rect = canvasRef.current?.querySelector(`[data-node-id="${node.id}"]`)?.getBoundingClientRect();
        if (rect) {
          return (
            e.clientX >= rect.left &&
            e.clientX <= rect.right &&
            e.clientY >= rect.top &&
            e.clientY <= rect.bottom
          );
        }
        return false;
      });

      if (targetNode && targetNode.id !== connecting) {
        // 检查是否已经存在相同的边
        const existingEdge = edges.find(
          edge => edge.source === connecting && edge.target === targetNode.id
        );

        if (!existingEdge) {
          onEdgeAdd({
            id: `e${connecting}-${targetNode.id}`,
            source: connecting,
            target: targetNode.id,
            label: '连接',
          });
        }
      }

      setConnecting(null);
    }
  }, [draggingNode, connecting, nodes, edges, onEdgeAdd]);

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    // 点击空白处取消选择
    onNodeSelect(null as unknown as Node);
  }, [onNodeSelect]);

  const handleConnectStart = useCallback((nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConnecting(nodeId);
    setConnectionStart({ x: e.clientX, y: e.clientY });
    setConnectionEnd({ x: e.clientX, y: e.clientY });
  }, []);

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

  return (
    <div
      ref={(el) => {
        ref.current = el;
        canvasRef.current = el;
      }}
      className="workflow-canvas"
      style={{
        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
        transformOrigin: '0 0',
      }}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="canvas-grid">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="grid-line horizontal"></div>
        ))}
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="grid-line vertical"></div>
        ))}
      </div>

      {/* 绘制连接线 */}
      {edges.map((edge) => {
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);
        if (sourceNode && targetNode) {
          return (
            <div key={edge.id} className="edge">
              <svg width="100%" height="100%" className="edge-svg">
                <path
                  d={`M ${sourceNode.position.x + 100} ${sourceNode.position.y + 50} L ${targetNode.position.x} ${targetNode.position.y + 50}`}
                  stroke="#999"
                  strokeWidth="2"
                  fill="none"
                  markerEnd="url(#arrowhead)"
                />
                <text
                  x={(sourceNode.position.x + targetNode.position.x + 100) / 2}
                  y={(sourceNode.position.y + targetNode.position.y + 100) / 2 - 10}
                  textAnchor="middle"
                  fill="#666"
                  fontSize="12"
                >
                  {edge.label}
                </text>
              </svg>
            </div>
          );
        }
        return null;
      })}

      {/* 绘制连接预览 */}
      {connecting && (
        <div className="edge-preview">
          <svg width="100%" height="100%">
            <path
              d={`M ${connectionStart.x} ${connectionStart.y} L ${connectionEnd.x} ${connectionEnd.y}`}
              stroke="#2196F3"
              strokeWidth="2"
              strokeDasharray="5,5"
              fill="none"
              markerEnd="url(#arrowhead)"
            />
          </svg>
        </div>
      )}

      {/* 绘制节点 */}
      {nodes.map((node) => (
        <div
          key={node.id}
          data-node-id={node.id}
          className={`node ${selectedNode?.id === node.id ? 'selected' : ''}`}
          style={{
            left: node.position.x,
            top: node.position.y,
            borderColor: getAgentTypeColor(node.type),
          }}
          onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
        >
          <div className="node-header" style={{ backgroundColor: getAgentTypeColor(node.type) }}>
            <span className="node-title">{node.data.name}</span>
            <span className="node-type">{node.type}</span>
          </div>
          <div className="node-content">
            <p className="node-description">{node.data.description}</p>
            <div className="node-capabilities">
              {node.data.capabilities.map((capability, index) => (
                <span key={index} className="capability-tag">
                  {capability}
                </span>
              ))}
            </div>
          </div>
          <div className="node-ports">
            <div className="port input-port">
              <div className="port-dot"></div>
            </div>
            <div 
              className="port output-port"
              onMouseDown={(e) => handleConnectStart(node.id, e)}
            >
              <div className="port-dot"></div>
            </div>
          </div>
        </div>
      ))}

      {/* 箭头标记 */}
      <svg width="0" height="0">
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#999" />
          </marker>
        </defs>
      </svg>
    </div>
  );
});

WorkflowCanvas.displayName = 'WorkflowCanvas';

export default WorkflowCanvas;
