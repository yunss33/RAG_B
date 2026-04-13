import { useState, useEffect } from 'react';
import { healthCheck, getSkills, parseRequirements, generateOutline, generateContent } from './lib/api';
import type { Project } from './lib/api';

function App() {
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [skills, setSkills] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [project, setProject] = useState<Project>({
    id: 'test-project-1',
    name: '测试项目',
    description: '这是一个测试项目，用于测试前端与后端的连接',
    outline: [],
    outline_confirmed: false,
    config: {
      enable_image_insertion: true,
      enable_rag: true,
    },
    source_files: []
  });
  const [parseResult, setParseResult] = useState<any>(null);
  const [outlineResult, setOutlineResult] = useState<any>(null);
  const [contentResult, setContentResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stepMessages, setStepMessages] = useState<string[]>([]);

  const steps = [
    '健康检查',
    '获取技能列表',
    '解析需求 (parse_requirements)',
    '规划大纲 (plan_outline)',
    '撰写草稿 (write_drafts)'
  ];

  const addMessage = (message: string) => {
    setStepMessages(prev => [...prev, message]);
  };

  // 健康检查
  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    addMessage('开始健康检查...');
    try {
      const result = await healthCheck();
      setHealthStatus(result.result);
      addMessage('✓ 健康检查成功');
      setCurrentStep(1);
    } catch (err) {
      setError('健康检查失败');
      addMessage('✗ 健康检查失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取技能列表
  const fetchSkills = async () => {
    setLoading(true);
    setError(null);
    addMessage('开始获取技能列表...');
    try {
      const result = await getSkills();
      setSkills(result.result?.skills || []);
      addMessage(`✓ 成功获取 ${result.result?.skills?.length || 0} 个技能`);
      setCurrentStep(2);
    } catch (err) {
      setError('获取技能列表失败');
      addMessage('✗ 获取技能列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 解析需求
  const handleParseRequirements = async () => {
    setLoading(true);
    setError(null);
    addMessage('开始解析需求...');
    try {
      const result = await parseRequirements(project);
      setParseResult(result.result);
      if (result.result?.project) {
        setProject(result.result.project);
      }
      addMessage('✓ 需求解析成功');
      setCurrentStep(3);
    } catch (err) {
      setError('解析需求失败');
      addMessage('✗ 解析需求失败');
    } finally {
      setLoading(false);
    }
  };

  // 生成大纲
  const handleGenerateOutline = async () => {
    setLoading(true);
    setError(null);
    addMessage('开始生成大纲...');
    try {
      const result = await generateOutline(project);
      setOutlineResult(result.result);
      if (result.result?.project) {
        setProject(result.result.project);
      }
      addMessage('✓ 大纲生成成功');
      setCurrentStep(4);
    } catch (err) {
      setError('生成大纲失败');
      addMessage('✗ 生成大纲失败');
    } finally {
      setLoading(false);
    }
  };

  // 生成内容
  const handleGenerateContent = async () => {
    setLoading(true);
    setError(null);
    addMessage('开始生成内容...');
    try {
      const result = await generateContent(project);
      setContentResult(result.result);
      if (result.result?.project) {
        setProject(result.result.project);
      }
      addMessage('✓ 内容生成成功');
      setCurrentStep(5);
    } catch (err) {
      setError('生成内容失败');
      addMessage('✗ 生成内容失败');
    } finally {
      setLoading(false);
    }
  };

  // 执行完整流程
  const runFullFlow = async () => {
    setLoading(true);
    setError(null);
    setStepMessages([]);
    setCurrentStep(0);
    
    try {
      // 步骤1: 健康检查
      addMessage('步骤 1/5: 健康检查...');
      const healthResult = await healthCheck();
      setHealthStatus(healthResult.result);
      addMessage('✓ 健康检查成功');
      setCurrentStep(1);
      
      // 步骤2: 获取技能列表
      addMessage('步骤 2/5: 获取技能列表...');
      const skillsResult = await getSkills();
      setSkills(skillsResult.result?.skills || []);
      addMessage(`✓ 成功获取 ${skillsResult.result?.skills?.length || 0} 个技能`);
      setCurrentStep(2);
      
      // 步骤3: 解析需求
      addMessage('步骤 3/5: 解析需求...');
      const parseRes = await parseRequirements(project);
      setParseResult(parseRes.result);
      let currentProject = parseRes.result?.project || project;
      setProject(currentProject);
      addMessage('✓ 需求解析成功');
      setCurrentStep(3);
      
      // 步骤4: 生成大纲
      addMessage('步骤 4/5: 生成大纲...');
      const outlineRes = await generateOutline(currentProject);
      setOutlineResult(outlineRes.result);
      currentProject = outlineRes.result?.project || currentProject;
      setProject(currentProject);
      addMessage('✓ 大纲生成成功');
      setCurrentStep(4);
      
      // 步骤5: 生成内容
      addMessage('步骤 5/5: 生成内容...');
      const contentRes = await generateContent(currentProject);
      setContentResult(contentRes.result);
      currentProject = contentRes.result?.project || currentProject;
      setProject(currentProject);
      addMessage('✓ 内容生成成功');
      setCurrentStep(5);
      
      addMessage('🎉 完整流程执行成功！');
      
    } catch (err) {
      setError(`流程执行失败: ${(err as Error).message}`);
      addMessage('✗ 流程执行失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">投标文档生成系统 - 完整流程测试</h1>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* 一键执行完整流程 */}
        <div className="mb-8 bg-blue-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">一键执行完整流程</h2>
          <button 
            onClick={runFullFlow}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition font-bold"
            disabled={loading}
          >
            {loading ? '执行中...' : '🚀 执行完整流程'}
          </button>
          <p className="mt-2 text-sm text-gray-600">
            依次执行：健康检查 → 获取技能 → 解析需求 → 生成大纲 → 生成内容
          </p>
        </div>

        {/* 进度指示器 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">执行进度</h2>
          <div className="flex flex-wrap gap-2">
            {steps.map((step, index) => (
              <div 
                key={index}
                className={`px-3 py-1 rounded-full text-sm ${
                  index < currentStep 
                    ? 'bg-green-500 text-white' 
                    : index === currentStep 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-300 text-gray-700'
                }`}
              >
                {index < currentStep ? '✓ ' : ''}{step}
              </div>
            ))}
          </div>
        </div>

        {/* 执行日志 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">执行日志</h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-60 overflow-y-auto">
            {stepMessages.length === 0 ? (
              <p className="text-gray-500">等待执行...</p>
            ) : (
              stepMessages.map((msg, index) => (
                <p key={index}>{msg}</p>
              ))
            )}
          </div>
        </div>

        {/* 分步控制 */}
        <div className="mb-8 border-t pt-6">
          <h2 className="text-xl font-semibold mb-4">分步操作</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 健康检查 */}
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">1. 健康检查</h3>
              <button 
                onClick={checkHealth}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition text-sm"
                disabled={loading}
              >
                {loading ? '检查中...' : '检查'}
              </button>
              {healthStatus && (
                <div className="mt-2 text-xs">
                  <span className="text-green-600">✓ 成功</span>
                </div>
              )}
            </div>

            {/* 获取技能列表 */}
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">2. 获取技能</h3>
              <button 
                onClick={fetchSkills}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition text-sm"
                disabled={loading}
              >
                {loading ? '获取中...' : '获取'}
              </button>
              {skills.length > 0 && (
                <div className="mt-2 text-xs">
                  <span className="text-green-600">✓ {skills.length} 个技能</span>
                </div>
              )}
            </div>

            {/* 解析需求 */}
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">3. 解析需求</h3>
              <button 
                onClick={handleParseRequirements}
                className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition text-sm"
                disabled={loading || currentStep < 2}
              >
                {loading ? '解析中...' : '解析'}
              </button>
              {parseResult && (
                <div className="mt-2 text-xs">
                  <span className="text-green-600">✓ 完成</span>
                </div>
              )}
            </div>

            {/* 生成大纲 */}
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">4. 生成大纲</h3>
              <button 
                onClick={handleGenerateOutline}
                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition text-sm"
                disabled={loading || currentStep < 3}
              >
                {loading ? '生成中...' : '生成'}
              </button>
              {outlineResult && (
                <div className="mt-2 text-xs">
                  <span className="text-green-600">✓ 完成</span>
                </div>
              )}
            </div>

            {/* 生成内容 */}
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">5. 生成内容</h3>
              <button 
                onClick={handleGenerateContent}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition text-sm"
                disabled={loading || currentStep < 4}
              >
                {loading ? '生成中...' : '生成'}
              </button>
              {contentResult && (
                <div className="mt-2 text-xs">
                  <span className="text-green-600">✓ 完成</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 技能列表 */}
        {skills.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">技能列表</h2>
            <div className="p-3 bg-gray-50 rounded">
              <ul className="space-y-2">
                {skills.map((skill, index) => (
                  <li key={index} className="border-b pb-2">
                    <strong>{skill.name}</strong>: {skill.description}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* 项目信息 */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">项目信息</h2>
          <div className="p-3 bg-gray-50 rounded">
            <pre className="text-sm overflow-x-auto">{JSON.stringify(project, null, 2)}</pre>
          </div>
        </div>

        {/* 结果详情 */}
        {(parseResult || outlineResult || contentResult) && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">结果详情</h2>
            
            {parseResult && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">解析需求结果</h3>
                <div className="p-3 bg-purple-50 rounded">
                  <pre className="text-sm overflow-x-auto">{JSON.stringify(parseResult, null, 2)}</pre>
                </div>
              </div>
            )}
            
            {outlineResult && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">大纲生成结果</h3>
                <div className="p-3 bg-yellow-50 rounded">
                  <pre className="text-sm overflow-x-auto">{JSON.stringify(outlineResult, null, 2)}</pre>
                </div>
              </div>
            )}
            
            {contentResult && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">内容生成结果</h3>
                <div className="p-3 bg-red-50 rounded">
                  <pre className="text-sm overflow-x-auto">{JSON.stringify(contentResult, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;