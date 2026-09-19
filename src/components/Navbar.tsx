import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Plus,
  UserCheck,
  Shield,
  Eye,
  AlertTriangle,
  Clock,
  Calendar,
  FileWarning,
  Menu,
  CheckCircle2,
} from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { UserRole } from '../types';

interface NavbarProps {
  onOpenSearch: () => void;
  onOpenQuickCreate: (type?: string) => void;
  onNavigate: (view: string, sub?: string) => void;
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSearch,
  onOpenQuickCreate,
  onNavigate,
  onToggleSidebar,
}) => {
  const { currentUser, setCurrentUser, users, stats, followUps, tasks, contracts } = useCrm();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const totalAlerts =
    stats.followUpsOverdueCount +
    stats.followUpsTodayCount +
    stats.tasksOverdueCount +
    stats.contractsExpiringCount;

  return (
    <header
      id="crm-main-navbar"
      className="h-16 border-b border-slate-200 bg-white sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 shadow-2xs"
    >
      {/* Left side: Mobile Toggle & Global Search */}
      <div className="flex items-center gap-3 w-full max-w-md">
        <button
          id="btn-sidebar-toggle-mobile"
          type="button"
          onClick={onToggleSidebar}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg lg:hidden"
          title="Alternar menu lateral"
        >
          <Menu size={20} />
        </button>

        <div
          id="btn-trigger-global-search"
          onClick={onOpenSearch}
          className="flex items-center w-full px-3 py-1.5 text-sm text-slate-400 bg-slate-100 hover:bg-slate-200/80 rounded-lg border border-slate-200/80 cursor-pointer transition-colors"
        >
          <Search size={16} className="text-slate-400 mr-2 shrink-0" />
          <span className="truncate">Buscar clientes, contatos, tarefas, arquivos...</span>
          <kbd className="hidden sm:inline-block ml-auto text-[10px] uppercase font-mono px-1.5 py-0.5 bg-white border border-slate-300 rounded text-slate-500 shadow-2xs">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right side: Quick Add, Alerts, Role Switcher */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Add Button */}
        <button
          id="btn-quick-create"
          type="button"
          onClick={() => onOpenQuickCreate()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
          title="Criar novo registro rápido"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Novo</span>
        </button>

        {/* Notifications / Alerts Popover */}
        <div className="relative" ref={notifRef}>
          <button
            id="btn-notifications"
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="Alertas e Notificações do Sistema"
          >
            <Bell size={20} />
            {totalAlerts > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white ring-2 ring-white">
                {totalAlerts}
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              id="dropdown-notifications"
              className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white p-3 shadow-xl border border-slate-200 z-50 text-slate-800 animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                <h3 className="font-semibold text-sm text-slate-900 flex items-center gap-1.5">
                  <Bell size={16} className="text-blue-600" />
                  Alertas e Pendências
                </h3>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                  {totalAlerts} pendentes
                </span>
              </div>

              <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
                {stats.followUpsOverdueCount > 0 && (
                  <div
                    onClick={() => {
                      onNavigate('followups', 'atrasados');
                      setShowNotifications(false);
                    }}
                    className="p-2.5 rounded-lg bg-rose-50 border border-rose-200/80 hover:bg-rose-100/70 transition-colors cursor-pointer flex items-start gap-2.5"
                  >
                    <AlertTriangle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-rose-900">
                        {stats.followUpsOverdueCount} Follow-up(s) Atrasado(s)
                      </div>
                      <div className="text-[11px] text-rose-700 mt-0.5">
                        Exigem contato prioritário imediato com o cliente.
                      </div>
                    </div>
                  </div>
                )}

                {stats.followUpsTodayCount > 0 && (
                  <div
                    onClick={() => {
                      onNavigate('followups', 'hoje');
                      setShowNotifications(false);
                    }}
                    className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 hover:bg-amber-100/70 transition-colors cursor-pointer flex items-start gap-2.5"
                  >
                    <Clock size={16} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-amber-900">
                        {stats.followUpsTodayCount} Follow-up(s) Agendados para Hoje
                      </div>
                      <div className="text-[11px] text-amber-700 mt-0.5">
                        Contatos comerciais programados na sua agenda de hoje.
                      </div>
                    </div>
                  </div>
                )}

                {stats.tasksOverdueCount > 0 && (
                  <div
                    onClick={() => {
                      onNavigate('tarefas');
                      setShowNotifications(false);
                    }}
                    className="p-2.5 rounded-lg bg-red-50 border border-red-200 hover:bg-red-100/70 transition-colors cursor-pointer flex items-start gap-2.5"
                  >
                    <Calendar size={16} className="text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-red-900">
                        {stats.tasksOverdueCount} Tarefa(s) com Prazo Vencido
                      </div>
                      <div className="text-[11px] text-red-700 mt-0.5">
                        Atividades operacionais que não foram marcadas como concluídas.
                      </div>
                    </div>
                  </div>
                )}

                {stats.contractsExpiringCount > 0 && (
                  <div
                    onClick={() => {
                      onNavigate('contratos');
                      setShowNotifications(false);
                    }}
                    className="p-2.5 rounded-lg bg-orange-50 border border-orange-200 hover:bg-orange-100/70 transition-colors cursor-pointer flex items-start gap-2.5"
                  >
                    <FileWarning size={16} className="text-orange-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-orange-900">
                        {stats.contractsExpiringCount} Contrato(s) Próximos do Vencimento
                      </div>
                      <div className="text-[11px] text-orange-700 mt-0.5">
                        Vencem nos próximos 30 dias. Prepare a renovação comercial.
                      </div>
                    </div>
                  </div>
                )}

                {totalAlerts === 0 && (
                  <div className="py-6 text-center text-slate-500">
                    <CheckCircle2 size={24} className="mx-auto text-emerald-500 mb-1" />
                    <p className="text-xs font-medium text-slate-700">Tudo em dia!</p>
                    <p className="text-[11px] text-slate-400">Nenhuma pendência crítica no momento.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Role Switcher */}
        <div className="relative" ref={userMenuRef}>
          <button
            id="btn-user-role-selector"
            type="button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors"
          >
            <div className="relative">
              <img
                src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
              />
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                  currentUser.role === 'admin'
                    ? 'bg-purple-600'
                    : currentUser.role === 'collaborator'
                    ? 'bg-blue-600'
                    : 'bg-slate-500'
                }`}
              />
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[120px]">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-slate-500 font-medium">
                {currentUser.role === 'admin' && '👑 Administrador'}
                {currentUser.role === 'collaborator' && '💼 Colaborador'}
                {currentUser.role === 'viewer' && '👁️ Visualização'}
              </div>
            </div>
          </button>

          {showUserMenu && (
            <div
              id="dropdown-user-role-menu"
              className="absolute right-0 mt-2 w-64 rounded-xl bg-white p-2 shadow-xl border border-slate-200 z-50 text-slate-800 animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="px-2.5 py-1.5 border-b border-slate-100 mb-1">
                <div className="text-[10px] uppercase font-bold text-slate-400">Alternar Perfil / Permissão</div>
                <div className="text-xs text-slate-500">Teste as regras de acesso por usuário:</div>
              </div>

              <div className="space-y-1">
                {users.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => {
                      setCurrentUser(user);
                      setShowUserMenu(false);
                    }}
                    className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-xs transition-colors ${
                      currentUser.id === user.id
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <img
                      src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={user.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <div className="truncate flex-1">
                      <div className="truncate">{user.name}</div>
                      <div className="text-[10px] opacity-75">{user.roleLabel}</div>
                    </div>
                    {user.role === 'admin' && <Shield size={14} className="text-purple-600 shrink-0" />}
                    {user.role === 'collaborator' && <UserCheck size={14} className="text-blue-600 shrink-0" />}
                    {user.role === 'viewer' && <Eye size={14} className="text-slate-500 shrink-0" />}
                  </button>
                ))}
              </div>

              <div className="mt-2 pt-2 border-t border-slate-100 px-2.5 text-[11px] text-slate-400">
                {currentUser.role === 'admin' && 'Acesso total a cadastros, exclusões e configurações.'}
                {currentUser.role === 'collaborator' && 'Pode criar clientes, contatos, tarefas e follow-ups.'}
                {currentUser.role === 'viewer' && 'Modo somente leitura para consultas e auditoria.'}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
