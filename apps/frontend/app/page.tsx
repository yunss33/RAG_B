'use client';

import { useQuery } from '@tanstack/react-query';
import Layout from '../components/layout';
import {
  Activity,
  Server,
  Container,
  Image,
  Cpu,
  HardDrive,
  MemoryStick,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import api from '../lib/api';

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  color,
}: {
  title: string;
  value: number | string;
  icon: any;
  trend?: 'up' | 'down';
  trendValue?: string;
  color: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && trendValue && (
          <div
            className={`flex items-center text-sm ${
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {trend === 'up' ? (
              <ArrowUpRight className="w-4 h-4 mr-1" />
            ) : (
              <ArrowDownRight className="w-4 h-4 mr-1" />
            )}
            {trendValue}
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold text-gray-900 dark:text-white">
          {value}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{title}</p>
      </div>
    </div>
  );
}

function ActivityItem({
  action,
  target,
  status,
  time,
}: {
  action: string;
  target: string;
  status: 'success' | 'failed';
  time: string;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <div className="flex items-center space-x-3">
        <div
          className={`w-2 h-2 rounded-full ${
            status === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}
        />
        <div>
          <p className="text-sm text-gray-900 dark:text-white">
            <span className="font-medium">{action}</span> {target}
          </p>
          <p className="text-xs text-gray-500">{time}</p>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ['system-stats'],
    queryFn: api.system.stats,
    refetchInterval: 30000,
  });

  const { data: logs } = useQuery({
    queryKey: ['logs'],
    queryFn: () => api.logs.list(),
    refetchInterval: 10000,
  });

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            仪表盘
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            实时监控系统状态
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="运行中的项目"
            value={stats?.runningProjects || 0}
            icon={Server}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
          />
          <StatCard
            title="总项目数"
            value={stats?.totalProjects || 0}
            icon={Activity}
            color="bg-gradient-to-br from-purple-500 to-purple-600"
          />
          <StatCard
            title="运行中的容器"
            value={stats?.runningContainers || 0}
            icon={Container}
            color="bg-gradient-to-br from-green-500 to-green-600"
          />
          <StatCard
            title="Docker 镜像"
            value={stats?.totalImages || 0}
            icon={Image}
            color="bg-gradient-to-br from-orange-500 to-orange-600"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              系统资源
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Cpu className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      CPU 使用率
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {stats?.cpuUsage?.toFixed(1) || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${stats?.cpuUsage || 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <MemoryStick className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      内存使用率
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {stats?.memoryUsage?.toFixed(1) || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${stats?.memoryUsage || 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <HardDrive className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      磁盘使用率
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {stats?.diskUsage?.toFixed(1) || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${stats?.diskUsage || 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              最近活动
            </h2>
            <div className="space-y-2">
              {logs && logs.length > 0 ? (
                logs.slice(0, 8).map((log: any) => (
                  <ActivityItem
                    key={log.id}
                    action={log.action}
                    target={log.targetType}
                    status={log.status}
                    time={new Date(log.timestamp).toLocaleString('zh-CN')}
                  />
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                  暂无活动记录
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
