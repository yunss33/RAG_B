'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getProject, getProjectStatus } from '@/lib/api';
import { ProjectActions } from '@/components/project-actions';
import { AgentActivityPanel } from '@/components/agent-activity-panel';
import { TaskTimeline } from '@/components/task-timeline';
import { ThoughtProcess } from '@/components/thought-process';
import { MessagePanel } from '@/components/message-panel';

interface Agent {
  id: string;
  role: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  name: string;
  icon: string;
  section?: string;
  perspective?: string;
}

interface Task {
  id: string;
  name: string;
  agent: string;
  timestamp: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  logId?: string;
}

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const [projectId, setProjectId] = useState<string>('');
  const [status, setStatus] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  useEffect(() => {
    async function loadData() {
      try {
        const { id } = params;
        console.log('Loading project data for id:', id);
        setProjectId(id);
        
        console.log('Fetching project status...');
        const statusData = await getProjectStatus(id);
        console.log('Project status data:', statusData);
        
        console.log('Fetching project data...');
        const projectData = await getProject(id);
        console.log('Project data:', projectData);
        
        setStatus(statusData);
        setProject(projectData);
      } catch (error) {
        console.error('Error loading project data:', error);
      }
    }
    loadData();
  }, [params]);

  const agents: Agent[] = project?.run_state?.active_agents
    ? Object.entries(project.run_state.active_agents).map(([id, data]: [string, any]) => ({
        id,
        role: data.role,
        status: data.status as any,
        name: data.role,
        icon: '',
        section: data.section,
        perspective: data.perspective,
      }))
    : [];

  const tasks: Task[] = project?.run_state?.agent_logs
    ? project.run_state.agent_logs.map((log: any) => ({
        id: log.id,
        name: log.task_name,
        agent: log.agent_role,
        timestamp: log.start_time || '',
        status: log.status as any,
        logId: log.id,
      }))
    : [];

  const selectedLog = selectedAgent
    ? project?.run_state?.agent_logs?.find((log: any) => log.agent_instance_id === selectedAgent.id)
    : selectedTask
    ? project?.run_state?.agent_logs?.find((log: any) => log.id === selectedTask.logId)
    : null;

  if (!status || !project) {
    return (
      <div className="page">
        <div className="panel">
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="three-column-layout">
        {/* 左侧：智能体活动面板 */}
        <div className="left-panel">
          <div className="stack">
            <AgentActivityPanel
              agents={agents}
              onAgentClick={setSelectedAgent}
              selectedAgentId={selectedAgent?.id}
            />
            <div className="panel">
              <h2>项目状态</h2>
              <p>当前阶段：<strong>{status.stage}</strong></p>
              <p className="muted">
                文件 {status.source_file_count} 个，需求 {status.requirement_count} 条，草稿 {status.draft_count} 节，审查问题 {status.review_issue_count} 条。
              </p>
              <ProjectActions projectId={projectId} />
            </div>
            <div className="panel">
              <h2>工作导航</h2>
              <div className="stack" style={{ gap: '8px' }}>
                <Link className="button" href={`/projects/${projectId}/upload`} style={{ textAlign: 'center' }}>资料上传</Link>
                <Link className="button secondary" href={`/projects/${projectId}/requirements`} style={{ textAlign: 'center' }}>解析结果</Link>
                <Link className="button secondary" href={`/projects/${projectId}/outline`} style={{ textAlign: 'center' }}>章节计划</Link>
                <Link className="button secondary" href={`/projects/${projectId}/drafts`} style={{ textAlign: 'center' }}>草稿与审查</Link>
                <Link className="button secondary" href={`/projects/${projectId}/images`} style={{ textAlign: 'center' }}>图片选择</Link>
                <Link className="button secondary" href={`/projects/${projectId}/final`} style={{ textAlign: 'center' }}>终稿预览</Link>
              </div>
            </div>
          </div>
        </div>

        {/* 中间：任务时间线 */}
        <div className="center-panel">
          <TaskTimeline
            tasks={tasks}
            onTaskClick={setSelectedTask}
            selectedTaskId={selectedTask?.id}
            isPlaying={isPlaying}
            onPlayPause={() => setIsPlaying(!isPlaying)}
            playbackSpeed={playbackSpeed}
            onSpeedChange={setPlaybackSpeed}
            onTaskJump={(taskId) => {
              const task = tasks.find(t => t.id === taskId);
              if (task) {
                setSelectedTask(task);
              }
            }}
            selectedLog={selectedLog}
          />
        </div>

        {/* 右侧：实时消息面板 */}
        <div className="right-panel">
          <MessagePanel projectId={projectId} />
        </div>
      </div>
    </div>
  );
}

