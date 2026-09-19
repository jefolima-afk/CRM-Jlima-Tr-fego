import React from 'react';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  PhoneCall,
  Kanban,
  CalendarCheck,
  CalendarDays,
  Calendar,
  CheckSquare,
  Clock,
  FolderKanban,
  FileText,
  ShieldCheck,
  DollarSign,
  FolderOpen,
  BarChart3,
  Settings,
  ChevronDown,
  Sparkles,
  Building2,
} from 'lucide-react';
import { useCrm } from '../context/CrmContext';

interface SidebarProps {
  currentView: string;
  subView?: string;
  onNavigate: (view: string, sub?: string) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  subView,
  onNavigate,
  isOpen,
  onCloseMobile,
}) => {
  const { stats } = useCrm();

  const handleNav = (view: string, sub?: string) => {
    onNavigate(view, sub);
    onCloseMobile();
  };

  const isCrmActive = ['leads', 'clientes', 'contatos', 'pipeline'].includes(currentView);
  const isPlanningActive = ['planejamento_hoje', 'semana', 'calendario', 'tarefas'].includes(currentView);

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          id="sidebar-mobile-backdrop"
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        id="crm-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Logo & Title */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-800 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
            <Building2 size={20} />
          </div>
          <div>
            <div className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
              CRM Pro
              <span className="text-[10px] px-1.5 py-0.2 bg-blue-500/20 text-blue-400 font-semibold rounded border border-blue-500/30">
                B2B
              </span>
            </div>
            <div className="text-[11px] text-slate-400">Gestão Comercial & Clientes</div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-700">
          {/* Dashboard */}
          <button
            id="nav-dashboard"
            type="button"
            onClick={() => handleNav('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'dashboard'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>

          {/* CRM Group */}
          <div className="pt-2">
            <div className="px-3 pb-1 text-[11px] font-bold tracking-wider uppercase text-slate-400">CRM</div>
            <div className="space-y-0.5">
              <button
                id="nav-leads"
                type="button"
                onClick={() => handleNav('leads')}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  currentView === 'leads'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <UserCheck size={18} />
                  <span>Leads</span>
                </div>
                {stats.leadsNewCount > 0 && (
                  <span className="text-xs bg-blue-500/30 text-blue-300 px-1.5 py-0.5 rounded-full font-semibold">
                    {stats.leadsNewCount}
                  </span>
                )}
              </button>

              <button
                id="nav-clientes"
                type="button"
                onClick={() => handleNav('clientes')}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  currentView === 'clientes'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users size={18} />
                  <span>Clientes</span>
                </div>
                <span className="text-xs bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-full">
                  {stats.activeClientsCount}
                </span>
              </button>

              <button
                id="nav-contatos"
                type="button"
                onClick={() => handleNav('contatos')}
                className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  currentView === 'contatos'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <PhoneCall size={18} />
                <span>Contatos</span>
              </button>

              <button
                id="nav-pipeline"
                type="button"
                onClick={() => handleNav('pipeline')}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  currentView === 'pipeline'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Kanban size={18} />
                  <span>Pipeline</span>
                </div>
                <span className="text-[11px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-mono">
                  Kanban
                </span>
              </button>
            </div>
          </div>

          {/* Planejamento Group */}
          <div className="pt-2">
            <div className="px-3 pb-1 text-[11px] font-bold tracking-wider uppercase text-slate-400">
              Planejamento
            </div>
            <div className="space-y-0.5">
              <button
                id="nav-planejamento-hoje"
                type="button"
                onClick={() => handleNav('planejamento_hoje')}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  currentView === 'planejamento_hoje'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CalendarCheck size={18} />
                  <span>Hoje</span>
                </div>
                {stats.tasksTodayCount > 0 && (
                  <span className="text-xs bg-amber-500/30 text-amber-300 px-1.5 py-0.5 rounded-full font-semibold">
                    {stats.tasksTodayCount}
                  </span>
                )}
              </button>

              <button
                id="nav-minha-semana"
                type="button"
                onClick={() => handleNav('semana')}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  currentView === 'semana'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CalendarDays size={18} />
                  <span>Minha Semana</span>
                </div>
                <span className="text-xs bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-full">
                  {stats.tasksWeekCount}
                </span>
              </button>

              <button
                id="nav-calendario"
                type="button"
                onClick={() => handleNav('calendario')}
                className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  currentView === 'calendario'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Calendar size={18} />
                <span>Calendário</span>
              </button>

              <button
                id="nav-tarefas"
                type="button"
                onClick={() => handleNav('tarefas')}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  currentView === 'tarefas'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CheckSquare size={18} />
                  <span>Tarefas</span>
                </div>
                {stats.tasksOverdueCount > 0 && (
                  <span className="text-xs bg-red-500/30 text-red-300 px-1.5 py-0.5 rounded-full font-semibold">
                    {stats.tasksOverdueCount} atrasadas
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Follow-ups */}
          <div className="pt-2">
            <button
              id="nav-followups"
              type="button"
              onClick={() => handleNav('followups')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'followups'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Clock size={18} />
                <span>Follow-ups</span>
              </div>
              {stats.followUpsOverdueCount > 0 ? (
                <span className="text-xs bg-rose-500 text-white px-2 py-0.5 rounded-full font-bold animate-pulse">
                  {stats.followUpsOverdueCount}
                </span>
              ) : stats.followUpsTodayCount > 0 ? (
                <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full font-bold">
                  {stats.followUpsTodayCount}
                </span>
              ) : null}
            </button>
          </div>

          {/* Projetos */}
          <button
            id="nav-projetos"
            type="button"
            onClick={() => handleNav('projetos')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'projetos'
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <FolderKanban size={18} />
            <span>Projetos</span>
          </button>

          {/* Propostas */}
          <button
            id="nav-propostas"
            type="button"
            onClick={() => handleNav('propostas')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'propostas'
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <FileText size={18} />
              <span>Propostas</span>
            </div>
            {stats.proposalsPendingCount > 0 && (
              <span className="text-xs bg-pink-500/30 text-pink-300 px-1.5 py-0.5 rounded-full">
                {stats.proposalsPendingCount}
              </span>
            )}
          </button>

          {/* Contratos */}
          <button
            id="nav-contratos"
            type="button"
            onClick={() => handleNav('contratos')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'contratos'
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <ShieldCheck size={18} />
              <span>Contratos</span>
            </div>
            {stats.contractsExpiringCount > 0 && (
              <span className="text-xs bg-orange-500 text-white px-1.5 py-0.5 rounded-full font-bold">
                {stats.contractsExpiringCount} exp.
              </span>
            )}
          </button>

          {/* Financeiro */}
          <button
            id="nav-financeiro"
            type="button"
            onClick={() => handleNav('financeiro')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'financeiro'
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <DollarSign size={18} />
            <span>Financeiro</span>
          </button>

          {/* Arquivos */}
          <button
            id="nav-arquivos"
            type="button"
            onClick={() => handleNav('arquivos')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'arquivos'
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <FolderOpen size={18} />
            <span>Central de Arquivos</span>
          </button>

          {/* Relatórios */}
          <button
            id="nav-relatorios"
            type="button"
            onClick={() => handleNav('relatorios')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'relatorios'
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <BarChart3 size={18} />
            <span>Relatórios</span>
          </button>

          {/* Configurações */}
          <button
            id="nav-configuracoes"
            type="button"
            onClick={() => handleNav('configuracoes')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'configuracoes'
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Settings size={18} />
            <span>Configurações</span>
          </button>
        </nav>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>CRM Pro v2.4</span>
          <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Online
          </span>
        </div>
      </aside>
    </>
  );
};
