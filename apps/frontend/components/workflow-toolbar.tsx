'use client';
import { useCallback } from 'react';

interface ToolbarProps {
  zoom: number;
  onZoom: (zoom: number) => void;
  onRunWorkflow: () => void;
}

export default function Toolbar({ zoom, onZoom, onRunWorkflow }: ToolbarProps) {
  const handleZoomIn = useCallback(() => {
    onZoom(Math.min(zoom + 0.1, 2));
  }, [zoom, onZoom]);

  const handleZoomOut = useCallback(() => {
    onZoom(Math.max(zoom - 0.1, 0.5));
  }, [zoom, onZoom]);

  const handleZoomReset = useCallback(() => {
    onZoom(1);
  }, [onZoom]);

  return (
    <div className="workflow-toolbar">
      <div className="toolbar-section">
        <h3>智能体编排</h3>
      </div>
      <div className="toolbar-section">
        <button
          type="button"
          className="toolbar-button"
          title="撤销"
        >
          ↶
        </button>
        <button
          type="button"
          className="toolbar-button"
          title="重做"
        >
          ↷
        </button>
      </div>
      <div className="toolbar-section">
        <button
          type="button"
          className="toolbar-button"
          onClick={handleZoomOut}
          title="缩小"
        >
          −
        </button>
        <span className="zoom-level">{Math.round(zoom * 100)}%</span>
        <button
          type="button"
          className="toolbar-button"
          onClick={handleZoomIn}
          title="放大"
        >
          +
        </button>
        <button
          type="button"
          className="toolbar-button"
          onClick={handleZoomReset}
          title="重置缩放"
        >
          100%
        </button>
      </div>
      <div className="toolbar-section">
        <button
          type="button"
          className="toolbar-button primary"
          onClick={onRunWorkflow}
          title="运行"
        >
          ▶ 运行
        </button>
      </div>
    </div>
  );
}
