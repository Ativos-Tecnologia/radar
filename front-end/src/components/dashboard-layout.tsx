'use client';

import { ReactNode, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  DollarSign,
  Menu,
  X,
  Moon,
  Sun,
  LogOut,
  ChevronDown,
  User,
  Scale,
  BarChart3,
  PiggyBank,
  TrendingUp,
} from 'lucide-react';
import { EnteSelector } from '@/components/ente-selector';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', roles: ['ADMIN', 'OPERADOR', 'VISUALIZADOR'] },
    { icon: Building2, label: 'Entes', href: '/dashboard/entes', roles: ['ADMIN', 'OPERADOR'] },
    { icon: Scale, label: 'Tribunais', href: '/dashboard/tribunais', roles: ['ADMIN', 'OPERADOR', 'VISUALIZADOR'] },
    { icon: PiggyBank, label: 'Saldos', href: '/dashboard/saldos', roles: ['ADMIN', 'OPERADOR', 'VISUALIZADOR'] },
    { icon: BarChart3, label: 'RCL', href: '/dashboard/rcl', roles: ['ADMIN', 'OPERADOR', 'VISUALIZADOR'] },
    { icon: FileText, label: 'Precatórios', href: '/dashboard/precatorios', roles: ['ADMIN', 'OPERADOR', 'VISUALIZADOR'] },
    { icon: TrendingUp, label: 'Histórico de Aportes', href: '/dashboard/aportes', roles: ['ADMIN', 'OPERADOR', 'VISUALIZADOR'] },
  ];

  const visibleMenuItems = menuItems.filter(item => item.roles.includes(user?.role || ''));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Topbar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-30">
        <div className="h-full px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {sidebarOpen ? (
                <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>
            {/* Logo com alternância de tema */}
            {mounted && (
              <Image
                src={theme === 'light' ? '/logo-dark.svg' : '/logo-light.svg'}
                alt="Radar Logo"
                width={120}
                height={40}
                priority
                className="h-8 w-auto"
              />
            )}
            <div className="hidden md:block ml-4">
              <EnteSelector />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Botão Usuários (apenas ADMIN) */}
            {isAdmin && (
              <button
                onClick={() => router.push('/dashboard/usuarios')}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Usuários"
                title="Gerenciar Usuários"
              >
                <Users className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
            )}

            {/* Botão de tema */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Alternar tema"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>

            {/* Menu do usuário */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {user?.fotoUrl ? (
                  <img
                    src={user.fotoUrl}
                    alt={user.nomeCompleto}
                    className="w-8 h-8 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                    {user?.nomeCompleto.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.nomeCompleto}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-300">
                    {user?.role}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                  <a
                    href="/dashboard/perfil"
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    Meu Perfil
                  </a>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 bottom-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 z-20 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <nav className="p-4 space-y-2">
          {visibleMenuItems.map((item) => {
            const isActive = mounted && (pathname === item.href || pathname?.startsWith(item.href + '/'));
            return (
              <a
                key={item.href}
                href={item.href}
                className={`group relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-r-full" />
                )}
                <item.icon className={`w-5 h-5 transition-transform duration-200 ${
                  isActive ? 'scale-110' : 'group-hover:scale-110'
                }`} />
                <span className="font-medium">{item.label}</span>
              </a>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <main
        className={`pt-16 transition-all duration-300 ${
          sidebarOpen ? 'pl-64' : 'pl-0'
        }`}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
