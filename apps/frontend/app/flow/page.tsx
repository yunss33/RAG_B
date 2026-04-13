"use client";

import React, { useState, useEffect } from 'react';
import { getSkills, executeSkill } from '@/lib/api';

const FlowPage = () => {
  const [step, setStep] = useState(1); // 1: 准备阶段, 2: 生成目录, 3: 生成大纲, 4: 生成内容, 5: 完成
  const [projectName, setProjectName] = useState('测试项目');
  const [outline, setOutline] = useState<any[]>([]);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [executionResult, setExecutionResult] = useState<any>(null);

  // 测试项目ID
  const testProjectId = 'test-project-flow';

  // 步骤标题
  const stepTitles = [
    '准备阶段',
    '生成目录',
    '生成大纲',
    '生成内容',
    '完成'
  ];

  // 执行技能
  const handleExecuteSkill = async (skillName: string, context?: any) => {
    setLoading(true);
    setError(null);
    setExecutionResult(null);

    try {
      const result = await executeSkill(skillName, testProjectId, context);
      setExecutionResult(result.result);
      return result.result;
    } catch (err: any) {
      setError(`执行技能失败: ${err.message || '未知错误'}`);
      console.error('执行技能失败:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 生成目录
  const handleGenerateDirectory = async () => {
    try {
      // 先执行需求解析技能
      await handleExecuteSkill('parse_requirements');
      // 然后执行大纲规划技能
      const result = await handleExecuteSkill('plan_outline');
      if (result && result.outline) {
        setOutline(result.outline);
        setStep(3); // 直接进入生成大纲步骤
      }
    } catch (err) {
      // 错误已在 handleExecuteSkill 中处理
    }
  };

  // 确认大纲
  const handleConfirmOutline = () => {
    setStep(4); // 进入生成内容步骤
  };

  // 生成内容
  const handleGenerateContent = async () => {
    try {
      const result = await handleExecuteSkill('write_drafts');
      if (result && result.drafts) {
        setDrafts(result.drafts);
        setStep(5); // 进入完成步骤
      }
    } catch (err) {
      // 错误已在 handleExecuteSkill 中处理
    }
  };

  // 重新开始
  const handleRestart = () => {
    setStep(1);
    setOutline([]);
    setDrafts([]);
    setError(null);
    setExecutionResult(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">标书生成流程测试</h1>

      {/* 错误信息 */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* 步骤导航 */}
      <div className="flex justify-between mb-8">
        {stepTitles.map((title, index) => (
          <div key={index} className={`flex flex-col items-center ${step > index + 1 ? 'text-green-600' : step === index + 1 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${step > index + 1 ? 'bg-green-100 border-2 border-green-600' : step === index + 1 ? 'bg-blue-100 border-2 border-blue-600' : 'bg-gray-100 border-2 border-gray-400'}`}>
              {step > index + 1 ? '✓' : index + 1}
            </div>
            <span className="text-sm">{title}</span>
            {index < stepTitles.length - 1 && (
              <div className={`flex-1 h-1 mt-5 ${step > index + 1 ? 'bg-green-600' : step === index + 1 ? 'bg-blue-600' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* 步骤内容 */}
      <div className="border rounded-lg p-8 mb-8">
        {/* 准备阶段 */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">准备阶段</h2>
            <p className="mb-6">在此阶段，您可以设置项目名称并准备开始标书生成流程。</p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">项目名称</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              />
            </div>
            <button
              onClick={() => setStep(2)}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
            >
              开始生成目录
            </button>
          </div>
        )}

        {/* 生成目录 */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">生成目录</h2>
            <p className="mb-6">系统将分析项目需求并生成标书目录结构。</p>
            <button
              onClick={handleGenerateDirectory}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
              disabled={loading}
            >
              {loading ? '生成中...' : '生成目录'}
            </button>
            {executionResult && (
              <div className="mt-6 p-4 bg-gray-50 rounded">
                <h3 className="font-medium mb-2">执行结果</h3>
                <pre className="text-sm">{JSON.stringify(executionResult, null, 2)}</pre>
              </div>
            )}
          </div>
        )}

        {/* 生成大纲 */}
        {step === 3 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">生成大纲</h2>
            <p className="mb-6">系统已生成标书大纲，请确认大纲结构是否合理。</p>
            {outline.length > 0 ? (
              <div className="mb-6">
                <h3 className="font-medium mb-2">大纲结构</h3>
                <ul className="space-y-2">
                  {outline.map((section, index) => (
                    <li key={index} className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        {section.code}
                      </div>
                      <div>
                        <h4 className="font-medium">{section.title}</h4>
                        <p className="text-sm text-gray-600">{section.goal}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-gray-500 mb-6">大纲正在生成中...</p>
            )}
            <button
              onClick={handleConfirmOutline}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
            >
              确认大纲并生成内容
            </button>
          </div>
        )}

        {/* 生成内容 */}
        {step === 4 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">生成内容</h2>
            <p className="mb-6">系统将根据大纲生成各章节的内容。</p>
            <button
              onClick={handleGenerateContent}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
              disabled={loading}
            >
              {loading ? '生成中...' : '生成内容'}
            </button>
            {executionResult && (
              <div className="mt-6 p-4 bg-gray-50 rounded">
                <h3 className="font-medium mb-2">执行结果</h3>
                <pre className="text-sm">{JSON.stringify(executionResult, null, 2)}</pre>
              </div>
            )}
          </div>
        )}

        {/* 完成 */}
        {step === 5 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">完成</h2>
            <p className="mb-6">标书生成流程已完成！</p>
            {drafts.length > 0 && (
              <div className="mb-6">
                <h3 className="font-medium mb-2">生成的内容</h3>
                <div className="space-y-4">
                  {drafts.map((draft, index) => (
                    <div key={index} className="border rounded p-4">
                      <h4 className="font-medium mb-2">{draft.title}</h4>
                      <div className="text-sm text-gray-600">
                        {draft.content.substring(0, 200)}...
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <button
              onClick={handleRestart}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
            >
              重新开始
            </button>
          </div>
        )}
      </div>

      {/* 流程说明 */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">流程说明</h2>
        <div className="border rounded-lg p-6">
          <h3 className="font-medium mb-2">流程步骤</h3>
          <ol className="list-decimal pl-6 space-y-2 mb-4">
            <li>准备阶段：设置项目名称</li>
            <li>生成目录：系统分析需求并生成目录结构</li>
            <li>生成大纲：系统生成详细的章节大纲</li>
            <li>生成内容：系统根据大纲生成各章节内容</li>
            <li>完成：查看生成的内容</li>
          </ol>
          <h3 className="font-medium mb-2">技术实现</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>使用技能系统执行各个阶段的任务</li>
            <li>技能之间存在依赖关系，确保按正确顺序执行</li>
            <li>实时显示执行结果和错误信息</li>
            <li>提供直观的步骤导航和状态反馈</li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default FlowPage;