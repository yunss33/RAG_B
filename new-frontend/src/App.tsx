import { useState, useEffect } from 'react';
import { healthCheck, getSkills, generateOutline, generateContent } from './lib/api';
import type { Project } from './lib/api';

function App() {
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [skills, setSkills] = useState<any[]>([]);
  const [project] = useState<Project>({
    id: 'test-project-1',
    name: '测试项目',
    description: '这是一个测试项目，用于测试前端与后端的连接',
    outline: [],
    outline_confirmed: false,
    config: {
      enable_image_insertion: true,
      enable_rag: true,
    },
  });
  const [outline, setOutline] = useState<any>(null);
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 健康检查
  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await healthCheck();
      setHealthStatus(result.result);
    } catch (err) {
      setError('健康检查失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取技能列表
  const fetchSkills = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getSkills();
      setSkills(result.result?.skills || []);
    } catch (err) {
      setError('获取技能列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 生成大纲
  const handleGenerateOutline = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateOutline(project);
      setOutline(result.result);
    } catch (err) {
      setError('生成大纲失败');
    } finally {
      setLoading(false);
    }
  };

  // 生成内容
  const handleGenerateContent = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateContent(project);
      setContent(result.result);
    } catch (err) {
      setError('生成内容失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">前端后端连接测试</h1>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* 健康检查 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">健康检查</h2>
          <button 
            onClick={checkHealth}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            disabled={loading}
          >
            {loading ? '检查中...' : '检查后端服务'}
          </button>
          {healthStatus && (
            <div className="mt-4 p-3 bg-gray-50 rounded">
              <pre className="text-sm">{JSON.stringify(healthStatus, null, 2)}</pre>
            </div>
          )}
        </div>

        {/* 技能列表 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">技能列表</h2>
          <button 
            onClick={fetchSkills}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
            disabled={loading}
          >
            {loading ? '获取中...' : '获取技能列表'}
          </button>
          {skills.length > 0 && (
            <div className="mt-4 p-3 bg-gray-50 rounded">
              <ul className="space-y-2">
                {skills.map((skill, index) => (
                  <li key={index} className="border-b pb-2">
                    <strong>{skill.name}</strong>: {skill.description}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* 生成大纲 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">生成大纲</h2>
          <button 
            onClick={handleGenerateOutline}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition"
            disabled={loading}
          >
            {loading ? '生成中...' : '生成项目大纲'}
          </button>
          {outline && (
            <div className="mt-4 p-3 bg-gray-50 rounded">
              <pre className="text-sm">{JSON.stringify(outline, null, 2)}</pre>
            </div>
          )}
        </div>

        {/* 生成内容 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">生成内容</h2>
          <button 
            onClick={handleGenerateContent}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
            disabled={loading}
          >
            {loading ? '生成中...' : '生成项目内容'}
          </button>
          {content && (
            <div className="mt-4 p-3 bg-gray-50 rounded">
              <pre className="text-sm">{JSON.stringify(content, null, 2)}</pre>
            </div>
          )}
        </div>

        {/* 项目信息 */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">项目信息</h2>
          <div className="p-3 bg-gray-50 rounded">
            <pre className="text-sm">{JSON.stringify(project, null, 2)}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;