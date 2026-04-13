'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getProject, getProjectStatus } from '@/lib/api';
import { ProjectActions } from '@/components/project-actions';
import { AgentActivityPanel } from '@/components/agent-activity-panel';
import { TaskTimeline } from '@/components/task-timeline';
import { ThoughtProcess } from '@/components/thought-process';

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

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [projectId, setProjectId] = useState<string>('');
  const [status, setStatus] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  useEffect(() => {
    async function loadData() {
      const { id } = await params;
      setProjectId(id);
      const [statusData, projectData] = await Promise.all([
        getProjectStatus(id),
        getProject(id),
      ]);
      setStatus(statusData);
      setProject(projectData);
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
      <div className="grid" style={{ gridTemplateColumns: '280px 1fr 320px', gap: '16px' }}>
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

        <div className="stack">
          <TaskTimeline
            tasks={tasks}
            onTaskClick={setSelectedTask}
            selectedTaskId={selectedTask?.id}
            isPlaying={isPlaying}
            onPlayPause={() => setIsPlaying(!isPlaying)}
            playbackSpeed={playbackSpeed}
            onSpeedChange={setPlaybackSpeed}
          />
        </div>

        <div className="stack">
          {selectedLog ? (
            <ThoughtProcess
              thoughtChain={selectedLog.thought_chain || []}
              inputData={selectedLog.input_data}
              intermediateOutputs={selectedLog.intermediate_outputs}
              finalOutput={selectedLog.final_output}
              start_time={selectedLog.start_time}
              end_time={selectedLog.end_time}
            />
          ) : (
            <div className="panel">
              <h2>思考过程</h2>
              <div className="text-center text-gray-500 py-8">
                点击智能体或任务查看思考过程
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

