'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../../components/layout';
import {
  Container,
  Image,
  Play,
  Square,
  RotateCcw,
  Trash2,
  RefreshCw,
  Download,
  Plus,
  Terminal,
  Eye,
  X,
  FileCode,
} from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

function ContainerModal({
  isOpen,
  onClose,
  container,
}: {
  isOpen: boolean;
  onClose: () => void;
  container: any;
}) {
  const [logs, setLogs] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    if (!container) return;
    setLoading(true);
    try {
      const data = await api.docker.containers.logs(container.id, 200);
      setLogs(data || '暂无日志');
    } catch (error) {
      setLogs('获取日志失败');
    }
    setLoading(false);
  };

  if (!isOpen || !container) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl mx-4 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Container className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {container.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">镜像</p>
              <p className="font-medium text-gray-900 dark:text-white truncate">
                {container.image}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">状态</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {container.state}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">创建时间</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {new Date(container.created).toLocaleString('zh-CN')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">ID</p>
              <p className="font-medium text-gray-900 dark:text-white font-mono text-sm">
                {container.id.substring(0, 12)}
              </p>
            </div>
          </div>

          {container.ports && container.ports.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-2">端口映射</p>
              <div className="flex flex-wrap gap-2">
                {container.ports.map((port: any, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm"
                  >
                    {port.publicPort}:{port.privatePort}/{port.type}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-hidden p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900 dark:text-white flex items-center space-x-2">
              <Terminal className="w-5 h-5" />
              <span>日志</span>
            </h3>
            <button
              onClick={fetchLogs}
              disabled={loading}
              className="btn btn-secondary text-sm flex items-center space-x-1"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>刷新</span>
            </button>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 h-64 overflow-auto">
            <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">
              {logs || '点击刷新获取日志'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

function PullImageModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [repo, setRepo] = useState('');
  const [tag, setTag] = useState('latest');

  const pullMutation = useMutation({
    mutationFn: () => api.docker.images.pull(repo, tag),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docker-images'] });
      toast.success('镜像拉取成功');
      onClose();
      setRepo('');
      setTag('latest');
    },
    onError: (error: any) => {
      toast.error(error.message || '拉取失败');
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
            <Download className="w-6 h-6 text-primary-600" />
            <span>拉取镜像</span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            pullMutation.mutate();
          }}
          className="p-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              镜像名称 *
            </label>
            <input
              type="text"
              required
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              className="input"
              placeholder="nginx, redis, postgres..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              标签
            </label>
            <input
              type="text"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="input"
              placeholder="latest, alpine, 5.0..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              取消
            </button>
            <button
              type="submit"
              disabled={pullMutation.isPending}
              className="btn btn-primary"
            >
              {pullMutation.isPending ? '拉取中...' : '拉取镜像'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Docker() {
  const [activeTab, setActiveTab] = useState<'containers' | 'images' | 'compose'>('containers');
  const [selectedContainer, setSelectedContainer] = useState<any>(null);
  const [isPullModalOpen, setIsPullModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: containers, isLoading: containersLoading } = useQuery({
    queryKey: ['docker-containers'],
    queryFn: api.docker.containers.list,
    refetchInterval: 10000,
  });

  const { data: images, isLoading: imagesLoading } = useQuery({
    queryKey: ['docker-images'],
    queryFn: api.docker.images.list,
    refetchInterval: 30000,
  });

  const startContainer = useMutation({
    mutationFn: (id: string) => api.docker.containers.start(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docker-containers'] });
      toast.success('容器已启动');
    },
    onError: () => toast.error('启动失败'),
  });

  const stopContainer = useMutation({
    mutationFn: (id: string) => api.docker.containers.stop(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docker-containers'] });
      toast.success('容器已停止');
    },
    onError: () => toast.error('停止失败'),
  });

  const restartContainer = useMutation({
    mutationFn: (id: string) => api.docker.containers.restart(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docker-containers'] });
      toast.success('容器已重启');
    },
    onError: () => toast.error('重启失败'),
  });

  const removeContainer = useMutation({
    mutationFn: (id: string) => api.docker.containers.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docker-containers'] });
      toast.success('容器已删除');
    },
    onError: () => toast.error('删除失败'),
  });

  const removeImage = useMutation({
    mutationFn: (id: string) => api.docker.images.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docker-images'] });
      toast.success('镜像已删除');
    },
    onError: () => toast.error('删除失败'),
  });

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  const tabs = [
    { id: 'containers', label: '容器', icon: Container, count: containers?.length || 0 },
    { id: 'images', label: '镜像', icon: Image, count: images?.length || 0 },
    { id: 'compose', label: 'Compose', icon: FileCode, count: 0 },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Docker 管理
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              管理容器、镜像和 Compose 服务
            </p>
          </div>
          <button
            onClick={() => setIsPullModalOpen(true)}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Download className="w-5 h-5" />
            <span>拉取镜像</span>
          </button>
        </div>

        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {activeTab === 'containers' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {containersLoading ? (
              <div className="p-8 text-center">
                <RefreshCw className="w-8 h-8 text-gray-400 mx-auto animate-spin" />
                <p className="mt-2 text-gray-500">加载中...</p>
              </div>
            ) : containers && containers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        名称
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        镜像
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        状态
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        端口
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {containers.map((container) => (
                      <tr
                        key={container.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <Container className="w-5 h-5 text-gray-400" />
                            <span className="font-medium text-gray-900 dark:text-white">
                              {container.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {container.image}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              container.status === 'running'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : container.status === 'exited'
                                ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            }`}
                          >
                            {container.status === 'running' ? '运行中' : container.status === 'exited' ? '已停止' : container.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {container.ports && container.ports.length > 0
                            ? container.ports.map((p: any) => `${p.publicPort || '?'}:${p.privatePort}`).join(', ')
                            : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => setSelectedContainer(container)}
                              className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                              title="查看详情"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {container.status === 'running' ? (
                              <>
                                <button
                                  onClick={() => stopContainer.mutate(container.id)}
                                  disabled={stopContainer.isPending}
                                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                  title="停止"
                                >
                                  <Square className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => restartContainer.mutate(container.id)}
                                  disabled={restartContainer.isPending}
                                  className="p-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
                                  title="重启"
                                >
                                  <RotateCcw className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => startContainer.mutate(container.id)}
                                disabled={startContainer.isPending}
                                className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                title="启动"
                              >
                                <Play className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => {
                                if (confirm('确定要删除这个容器吗？')) {
                                  removeContainer.mutate(container.id);
                                }
                              }}
                              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="删除"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16">
                <Container className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  暂无容器
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  当前没有 Docker 容器在运行
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'images' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {imagesLoading ? (
              <div className="p-8 text-center">
                <RefreshCw className="w-8 h-8 text-gray-400 mx-auto animate-spin" />
                <p className="mt-2 text-gray-500">加载中...</p>
              </div>
            ) : images && images.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        镜像
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        标签
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        大小
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        创建时间
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {images.map((image) => (
                      <tr
                        key={image.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <Image className="w-5 h-5 text-gray-400" />
                            <span className="font-medium text-gray-900 dark:text-white">
                              {image.repository}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-medium">
                            {image.tag}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatSize(image.size)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(image.created).toLocaleString('zh-CN')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => {
                              if (confirm('确定要删除这个镜像吗？')) {
                                removeImage.mutate(image.id);
                              }
                            }}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="删除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16">
                <Image className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  暂无镜像
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  拉取一个镜像开始使用
                </p>
                <button
                  onClick={() => setIsPullModalOpen(true)}
                  className="btn btn-primary"
                >
                  拉取镜像
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'compose' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-16 text-center">
            <FileCode className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Docker Compose
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              在 compose 目录放置 docker-compose.yml 文件来管理服务
            </p>
          </div>
        )}
      </div>

      {selectedContainer && (
        <ContainerModal
          isOpen={!!selectedContainer}
          onClose={() => setSelectedContainer(null)}
          container={selectedContainer}
        />
      )}

      <PullImageModal
        isOpen={isPullModalOpen}
        onClose={() => setIsPullModalOpen(false)}
      />
    </Layout>
  );
}
