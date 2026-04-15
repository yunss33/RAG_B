"use client";

import React, { useState, useEffect } from 'react';
import { getSkills, getSkillRecommendations, executeSkill } from '@/lib/api';

const SkillsPage = () => {
  const [skills, setSkills] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 测试项目ID
  const testProjectId = 'test-project-123';

  // 获取技能列表
  useEffect(() => {
    const fetchSkills = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getSkills();
        setSkills(data.skills || []);
      } catch (err) {
        setError('获取技能列表失败');
        console.error('获取技能列表失败:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, []);

  // 获取技能推荐
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const data = await getSkillRecommendations(testProjectId);
        setRecommendations(data || []);
      } catch (err) {
        console.error('获取技能推荐失败:', err);
      }
    };

    fetchRecommendations();
  }, []);

  // 执行技能
  const handleExecuteSkill = async (skillName: string) => {
    setLoading(true);
    setError(null);
    setExecutionResult(null);
    setSelectedSkill(skillName);

    try {
      // 根据技能类型添加不同的上下文
      let context = {};
      if (skillName === 'web_devtools') {
        context = { url: 'https://example.com' };
      } else if (skillName === 'jinhui_stack_debug') {
        context = { issue_type: 'frontend' };
      }

      const result = await executeSkill(skillName, testProjectId, context);
      setExecutionResult(result.result);
    } catch (err: any) {
      setError(`执行技能失败: ${err.message || '未知错误'}`);
      console.error('执行技能失败:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">技能系统展示</h1>

      {/* 错误信息 */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* 技能列表 */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">可用技能</h2>
        {loading && !selectedSkill ? (
          <div className="text-center py-8">加载中...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skills.map((skill) => (
              <div key={skill.name} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-medium mb-2">{skill.name}</h3>
                <p className="text-gray-600 mb-4">{skill.description}</p>
                <div className="text-sm text-gray-500 mb-4">
                  <span className="mr-4">分类: {skill.category}</span>
                  {skill.dependencies && skill.dependencies.length > 0 && (
                    <span>依赖: {skill.dependencies.join(', ')}</span>
                  )}
                </div>
                <button
                  onClick={() => handleExecuteSkill(skill.name)}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                  disabled={loading}
                >
                  {loading && selectedSkill === skill.name ? '执行中...' : '执行技能'}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 技能推荐 */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">技能推荐</h2>
        <div className="border rounded-lg p-6">
          {recommendations.length > 0 ? (
            <ul className="space-y-4">
              {recommendations.map((rec, index) => (
                <li key={index} className="flex items-start">
                  <div className="bg-blue-100 text-blue-800 font-semibold rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-1">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-medium">{rec.skill_name}</h3>
                    <p className="text-gray-600">{rec.reason}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">暂无推荐技能</p>
          )}
        </div>
      </section>

      {/* 执行结果 */}
      {executionResult && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">执行结果</h2>
          <div className="border rounded-lg p-6 bg-gray-50">
            <h3 className="font-medium mb-2">技能: {selectedSkill}</h3>
            <pre className="bg-white p-4 rounded overflow-auto">
              {JSON.stringify(executionResult, null, 2)}
            </pre>
          </div>
        </section>
      )}

      {/* 技能系统说明 */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">技能系统说明</h2>
        <div className="border rounded-lg p-6">
          <h3 className="font-medium mb-2">功能特点</h3>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>基于工厂模式和池模式实现的技能系统</li>
            <li>支持技能注册、发现和执行</li>
            <li>技能之间的依赖关系管理</li>
            <li>基于项目状态的智能技能推荐</li>
            <li>支持异步技能执行</li>
          </ul>
          <h3 className="font-medium mb-2">已集成的技能</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>parse_requirements: 解析招标文件，提取需求项</li>
            <li>plan_outline: 规划项目大纲结构</li>
            <li>write_drafts: 撰写各章节草稿</li>
            <li>review_project: 审查项目内容</li>
            <li>suggest_images: 为项目建议图片</li>
            <li>assemble_html: 组装HTML标书</li>
            <li>web_devtools: Web开发工具技能</li>
            <li>jinhui_stack_debug: 锦恢堆栈调试技能</li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default SkillsPage;