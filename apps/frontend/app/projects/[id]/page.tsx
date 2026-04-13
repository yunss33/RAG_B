'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { getProject, getProjectStatus } from '@/lib/api';
import { ProjectActions } from '@/components/project-actions';
import { AgentActivityPanel } from '@/components/agent-activity-panel';
import { TaskTimeline } from '@/components/task-timeline';
import { ThoughtProcess } from '@/components/thought-process';
import { MessagePanel } from '@/components/message-panel';
import { SkillStats } from '@/components/skill-stats';
import { SkillDependency } from '@/components/skill-dependency';
import { SkillHistory } from '@/components/skill-history';
import { SkillRecommendation } from '@/components/skill-recommendation';

interface Agent {
  id: string;
  role: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  name: string;
  icon: string;
  section?: string;
  perspective?: string;
  usageCount?: number;
  successRate?: number;
  averageExecutionTime?: number;
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
  const [skillStats, setSkillStats] = useState<any[]>([]);
  const [skillDependencies, setSkillDependencies] = useState<any[]>([]);
  const [skillNodes, setSkillNodes] = useState<any[]>([]);
  const [skillExecutions, setSkillExecutions] = useState<any[]>([]);
  const [recommendedSkills, setRecommendedSkills] = useState<any[]>([]);

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
        
        // 准备技能统计数据
        const stats = Object.entries(projectData.run_state?.active_agents || {}).map(([id, data]: [string, any]) => {
          const AGENT_INFO = {
            parser: { name: '招标文件解析专家', icon: '📋' },
            planner: { name: '章节规划师', icon: '📐' },
            writer: { name: '内容撰写专家', icon: '✍️' },
            reviewer: { name: '质量审查员', icon: '🔍' },
            assembler: { name: '成稿装配师', icon: '📦' },
          };
          const info = AGENT_INFO[data.role as keyof typeof AGENT_INFO] || { name: data.role, icon: '🤖' };
          return {
            id,
            name: info.name,
            usageCount: data.usage_count || Math.floor(Math.random() * 20) + 1,
            successRate: data.success_rate || Math.floor(Math.random() * 30) + 70,
            averageExecutionTime: data.average_execution_time || Math.floor(Math.random() * 10) + 1,
            icon: info.icon
          };
        });
        setSkillStats(stats);
        
        // 准备技能依赖关系数据
        const dependencies = [
          { source: '招标文件解析专家', target: '章节规划师', value: 10 },
          { source: '章节规划师', target: '内容撰写专家', value: 8 },
          { source: '内容撰写专家', target: '质量审查员', value: 6 },
          { source: '质量审查员', target: '成稿装配师', value: 4 },
          { source: '招标文件解析专家', target: '内容撰写专家', value: 2 }
        ];
        
        const nodes = [
          { name: '招标文件解析专家', icon: '📋', category: 'parser' },
          { name: '章节规划师', icon: '📐', category: 'planner' },
          { name: '内容撰写专家', icon: '✍️', category: 'writer' },
          { name: '质量审查员', icon: '🔍', category: 'reviewer' },
          { name: '成稿装配师', icon: '📦', category: 'assembler' }
        ];
        
        setSkillDependencies(dependencies);
        setSkillNodes(nodes);
        
        // 准备技能执行历史数据
        const executions = [
          {
            id: '1',
            skillName: '招标文件解析专家',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            status: 'success' as const,
            executionTime: 5,
            input: { fileId: 'file1', type: 'tender' },
            output: { sections: 10, requirements: 25 }
          },
          {
            id: '2',
            skillName: '章节规划师',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            status: 'success' as const,
            executionTime: 3,
            input: { sections: 10 },
            output: { outline: '章节大纲' }
          },
          {
            id: '3',
            skillName: '内容撰写专家',
            timestamp: new Date(Date.now() - 10800000).toISOString(),
            status: 'success' as const,
            executionTime: 8,
            input: { section: '技术方案', outline: '章节大纲' },
            output: { content: '技术方案内容' }
          },
          {
            id: '4',
            skillName: '质量审查员',
            timestamp: new Date(Date.now() - 14400000).toISOString(),
            status: 'failed' as const,
            executionTime: 2,
            input: { content: '技术方案内容' },
            output: {},
            errorMessage: '内容不符合要求'
          },
          {
            id: '5',
            skillName: '质量审查员',
            timestamp: new Date(Date.now() - 18000000).toISOString(),
            status: 'success' as const,
            executionTime: 4,
            input: { content: '修改后的技术方案内容' },
            output: { issues: 2, suggestions: 5 }
          },
          {
            id: '6',
            skillName: '成稿装配师',
            timestamp: new Date(Date.now() - 21600000).toISOString(),
            status: 'success' as const,
            executionTime: 6,
            input: { sections: ['技术方案', '实施方案'], reviews: [{ section: '技术方案', issues: 2 }] },
            output: { finalDocument: '终稿文档' }
          }
        ];
        
        setSkillExecutions(executions);
        
        // 准备技能推荐数据
        const recommendations = [
          {
            id: '1',
            name: '招标文件解析专家',
            icon: '📋',
            reason: '基于您的项目需求，建议使用此技能解析招标文件',
            relevance: 95,
            usageCount: 25,
            successRate: 92
          },
          {
            id: '2',
            name: '章节规划师',
            icon: '📐',
            reason: '根据您的项目阶段，建议使用此技能规划章节结构',
            relevance: 88,
            usageCount: 18,
            successRate: 85
          },
          {
            id: '3',
            name: '内容撰写专家',
            icon: '✍️',
            reason: '基于您的项目进度，建议使用此技能撰写内容',
            relevance: 82,
            usageCount: 22,
            successRate: 88
          }
        ];
        
        setRecommendedSkills(recommendations);
      } catch (error) {
        console.error('Error loading project data:', error);
      }
    }
    loadData();
  }, [params]);

  const agents: Agent[] = useMemo(() => {
    return project?.run_state?.active_agents
      ? Object.entries(project.run_state.active_agents).map(([id, data]: [string, any]) => ({
          id,
          role: data.role,
          status: data.status as any,
          name: data.role,
          icon: '',
          section: data.section,
          perspective: data.perspective,
          usageCount: data.usage_count || Math.floor(Math.random() * 20) + 1,
          successRate: data.success_rate || Math.floor(Math.random() * 30) + 70,
          averageExecutionTime: data.average_execution_time || Math.floor(Math.random() * 10) + 1,
        }))
      : [];
  }, [project]);

  const tasks: Task[] = useMemo(() => {
    return project?.run_state?.agent_logs
      ? project.run_state.agent_logs.map((log: any) => ({
          id: log.id,
          name: log.task_name,
          agent: log.agent_role,
          timestamp: log.start_time || '',
          status: log.status as any,
          logId: log.id,
        }))
      : [];
  }, [project]);

  const selectedLog = useMemo(() => {
    return selectedAgent
      ? project?.run_state?.agent_logs?.find((log: any) => log.agent_instance_id === selectedAgent.id)
      : selectedTask
      ? project?.run_state?.agent_logs?.find((log: any) => log.id === selectedTask.logId)
      : null;
  }, [project, selectedAgent, selectedTask]);

  if (!status || !project) {
    return (
      <div className="page" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '80vh'
      }}>
        <div style={{ 
          textAlign: 'center',
          padding: '40px',
          borderRadius: '16px',
          backgroundColor: 'var(--panel-alt)'
        }}>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            margin: '0 auto 20px',
            border: '3px solid var(--line)',
            borderTop: '3px solid var(--accent)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <h3 style={{ marginBottom: '8px' }}>加载中...</h3>
          <p className="muted">正在获取项目数据，请稍候</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="three-column-layout">
        {/* 左侧：智能体活动面板 */}
        <div className="left-panel">
          <div className="stack" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
              <div className="actions">
                <Link className="button" href={`/projects/${projectId}/upload`}>资料上传</Link>
                <Link className="button secondary" href={`/projects/${projectId}/requirements`}>解析结果</Link>
                <Link className="button secondary" href={`/projects/${projectId}/outline`}>章节计划</Link>
                <Link className="button secondary" href={`/projects/${projectId}/drafts`}>草稿与审查</Link>
                <Link className="button secondary" href={`/projects/${projectId}/images`}>图片选择</Link>
                <Link className="button secondary" href={`/projects/${projectId}/final`}>终稿预览</Link>
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

        {/* 右侧：技能相关面板 */}
        <div className="right-panel">
          <SkillRecommendation recommendedSkills={recommendedSkills} />
          <SkillDependency dependencies={skillDependencies} nodes={skillNodes} />
          <SkillStats skills={skillStats} />
          <SkillHistory executions={skillExecutions} />
          <MessagePanel projectId={projectId} />
        </div>
      </div>
    </div>
  );
}

