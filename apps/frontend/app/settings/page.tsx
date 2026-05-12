'use client';

import { useState } from 'react';
import Layout from '../../components/layout';
import {
  Settings as SettingsIcon,
  Server,
  Container,
  Database,
  Bell,
  Shield,
  Save,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';

function SettingSection({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description: string;
  icon: any;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-start space-x-4 mb-6">
        <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
          <Icon className="w-6 h-6 text-primary-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {description}
          </p>
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="font-medium text-gray-900 dark:text-white">{label}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors ${
          checked ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
        }`}
      >
        <span
          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
            checked ? 'left-6' : 'left-1'
          }`}
        />
      </button>
    </div>
  );
}

export default function Settings() {
  const [settings, setSettings] = useState({
    general: {
      autoRefresh: true,
      refreshInterval: 10,
      darkMode: false,
    },
    notifications: {
      enabled: true,
      onSuccess: true,
      onError: true,
      onWarning: false,
    },
    docker: {
      socketPath: '/var/run/docker.sock',
      autoConnect: true,
      defaultRegistry: 'docker.io',
    },
    advanced: {
      logRetention: 30,
      maxConcurrentOperations: 5,
    },
  });

  const handleSave = () => {
    toast.success('设置已保存');
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            设置
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            配置系统各项功能
          </p>
        </div>

        <SettingSection
          title="常规设置"
          description="管理界面显示和刷新设置"
          icon={SettingsIcon}
        >
          <Toggle
            label="自动刷新"
            description="自动刷新数据列表"
            checked={settings.general.autoRefresh}
            onChange={(checked) =>
              setSettings({
                ...settings,
                general: { ...settings.general, autoRefresh: checked },
              })
            }
          />
          <div className="py-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              刷新间隔（秒）
            </label>
            <input
              type="number"
              value={settings.general.refreshInterval}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  general: {
                    ...settings.general,
                    refreshInterval: parseInt(e.target.value),
                  },
                })
              }
              className="input w-32"
              min={5}
              max={60}
            />
          </div>
          <Toggle
            label="深色模式"
            description="启用深色主题"
            checked={settings.general.darkMode}
            onChange={(checked) =>
              setSettings({
                ...settings,
                general: { ...settings.general, darkMode: checked },
              })
            }
          />
        </SettingSection>

        <SettingSection
          title="通知设置"
          description="配置操作通知方式"
          icon={Bell}
        >
          <Toggle
            label="启用通知"
            description="显示操作结果通知"
            checked={settings.notifications.enabled}
            onChange={(checked) =>
              setSettings({
                ...settings,
                notifications: { ...settings.notifications, enabled: checked },
              })
            }
          />
          <Toggle
            label="成功通知"
            description="操作成功时显示通知"
            checked={settings.notifications.onSuccess}
            onChange={(checked) =>
              setSettings({
                ...settings,
                notifications: {
                  ...settings.notifications,
                  onSuccess: checked,
                },
              })
            }
          />
          <Toggle
            label="错误通知"
            description="操作失败时显示通知"
            checked={settings.notifications.onError}
            onChange={(checked) =>
              setSettings({
                ...settings,
                notifications: {
                  ...settings.notifications,
                  onError: checked,
                },
              })
            }
          />
        </SettingSection>

        <SettingSection
          title="Docker 设置"
          description="配置 Docker 连接"
          icon={Container}
        >
          <div className="py-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Docker Socket 路径
            </label>
            <input
              type="text"
              value={settings.docker.socketPath}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  docker: { ...settings.docker, socketPath: e.target.value },
                })
              }
              className="input"
              placeholder="/var/run/docker.sock"
            />
          </div>
          <div className="py-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              默认镜像仓库
            </label>
            <select
              value={settings.docker.defaultRegistry}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  docker: { ...settings.docker, defaultRegistry: e.target.value },
                })
              }
              className="input"
            >
              <option value="docker.io">Docker Hub</option>
              <option value="ghcr.io">GitHub Container Registry</option>
              <option value="gcr.io">Google Container Registry</option>
            </select>
          </div>
        </SettingSection>

        <SettingSection
          title="高级设置"
          description="高级配置选项"
          icon={Shield}
        >
          <div className="py-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              日志保留天数
            </label>
            <input
              type="number"
              value={settings.advanced.logRetention}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  advanced: {
                    ...settings.advanced,
                    logRetention: parseInt(e.target.value),
                  },
                })
              }
              className="input w-32"
              min={7}
              max={365}
            />
          </div>
          <div className="py-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              最大并发操作数
            </label>
            <input
              type="number"
              value={settings.advanced.maxConcurrentOperations}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  advanced: {
                    ...settings.advanced,
                    maxConcurrentOperations: parseInt(e.target.value),
                  },
                })
              }
              className="input w-32"
              min={1}
              max={20}
            />
          </div>
        </SettingSection>

        <div className="flex justify-end">
          <button onClick={handleSave} className="btn btn-primary flex items-center space-x-2">
            <Save className="w-5 h-5" />
            <span>保存设置</span>
          </button>
        </div>
      </div>
    </Layout>
  );
}
