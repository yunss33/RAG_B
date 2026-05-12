'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FolderKanban,
  Container,
  Settings,
  Activity,
  ChevronLeft,
  ChevronRight,
  Terminal,
} from 'lucide-react';
import { useState } from 'react';

const navItems: { href: string; label: string; icon: any }[] = [
  { href: '/', label: '仪表盘', icon: LayoutDashboard },
  { href: '/projects', label: '项目管理', icon: FolderKanban },
  { href: '/docker', label: 'Docker 管理', icon: Container },
  { href: '/logs', label: '操作日志', icon: Activity },
  { href: '/settings', label: '设置', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white transition-all duration-300 z-50 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <Terminal className="w-8 h-8 text-primary-400" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                ServiceHub
              </span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-600/20 text-primary-400 shadow-lg shadow-primary-600/20'
                    : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-primary-400' : ''}`} />
                {!collapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-700/50">
          {!collapsed && (
            <div className="text-xs text-gray-500">
              <p>版本 1.0.0</p>
              <p className="mt-1">© 2024 ServiceHub</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
