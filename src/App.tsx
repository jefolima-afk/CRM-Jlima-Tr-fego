import React, { useState } from 'react';
import {
  Menu,
  X,
  Plus,
  Bell,
  Search,
  CheckCircle2,
  Calendar,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';
import { CrmProvider, useCrm } from './context/CrmContext';
import { Sidebar } from './components/Sidebar';
import { QuickCreateModal } from './components/QuickCreateModal';
import { ClientModal } from './views/ClientModal';

// Views
import { DashboardView } from './views/DashboardView';
import { ClientsView } from './views/ClientsView';
import { ClientDetailView } from './views/ClientDetailView';
import { PipelineView } from './views/PipelineView';
import { TasksView } from './views/TasksView';
import { WeeklyPlannerView } from './views/WeeklyPlannerView';
import { FollowUpsView } from './views/FollowUpsView';
import { ContactsView } from './views/ContactsView';
import { ProjectsView } from './views/ProjectsView';
import { ProposalsView } from './views/ProposalsView';
import { ContractsView } from './views/ContractsView';
import { FinancialView } from './views/FinancialView';
import { FilesView } from './views/FilesView';
import { ReportsView } from './views/ReportsView';
import { SettingsView } from './views/SettingsView';

const CrmApp: React.FC = () => {
  const { currentUser, users, setCurrentUser, stats, clients, canEdit } = useCrm();

  // Navigation state
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [currentSubView, setCurrentSubView] = useState<string | undefined>(undefined);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [clientDetailInitialTab, setClientDetailInitialTab] = useState<string | undefined>(undefined);

  // Mobile sidebar drawer
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Quick modals
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [quickCreateType, setQuickCreateType] = useState<'client' | 'task' | 'followup' | 'interaction'>('client');
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);

  // Global search modal
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [globalQuery, setGlobalQuery] = useState('');

  // Handle client selection
  const handleSelectClient = (clientId: string, initialTab?: string) => {
    setSelectedClientId(clientId);
    setClientDetailInitialTab(initialTab);
    setGlobalSearchOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackFromClient = () => {
    setSelectedClientId(null);
    setClientDetailInitialTab(undefined);
  };

  const handleNavigate = (view: string, subView?: string) => {
    setSelectedClientId(null);
    setCurrentView(view);
    setCurrentSubView(subView);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenQuickCreate = (type: string = 'client') => {
    if (type === 'client-full') {
      setEditingClientId(null);
      setClientModalOpen(true);
    } else {
      setQuickCreateType(type as any);
      setQuickCreateOpen(true);
    }
  };

  // Global search results
  const searchResults = globalQuery.trim()
    ? clients.filter((c) => {
        const q = globalQuery.toLowerCase();
        return (
          c.corporateName.toLowerCase().includes(q) ||
          (c.tradeName && c.tradeName.toLowerCase().includes(q)) ||
          (c.whatsapp && c.whatsapp.includes(q)) ||
          (c.city && c.city.toLowerCase().includes(q))
        );
      })
    : [];

  return (
    <div id="crm-app-container" className="min-h-screen bg-slate-50 flex flex-col antialiased">
      {/* Top Application Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-2xs lg:pl-64">
        <div className="flex items-center justify-between px-4 lg:px-6 h-14">
          {/* Left: Mobile Toggle + Title/Breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              aria-label="Abrir menu lateral"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <div className="flex items-center gap-2">
              <span className="font-extrabold text-blue-600 text-lg tracking-tight flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                CRM PRO
              </span>
              <span className="hidden sm:inline text-xs text-slate-300">|</span>
              <span className="hidden sm:inline text-xs font-semibold text-slate-500 capitalize">
                {selectedClientId ? 'Ficha do Cliente' : currentView.replace('-', ' ')}
              </span>
            </div>
          </div>

          {/* Center: Global Quick Search Button */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
            <button
              type="button"
              onClick={() => setGlobalSearchOpen(true)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-slate-400 bg-slate-100 hover:bg-slate-200/70 rounded-lg border border-slate-200 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Search size={14} />
                <span>Buscar clientes, contatos ou empresas...</span>
              </div>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white border border-slate-300 rounded text-slate-500">
                Buscar
              </kbd>
            </button>
          </div>

          {/* Right: Quick Action + Alerts + User Switcher */}
          <div className="flex items-center gap-2.5">
            {/* Quick Create Button */}
            {canEdit && (
              <button
                type="button"
                onClick={() => handleOpenQuickCreate('client')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-2xs transition-colors"
              >
                <Plus size={14} />
                <span>Criar</span>
              </button>
            )}

            {/* Notification Badge: Follow-ups reminder */}
            <button
              type="button"
              onClick={() => handleNavigate('followups', 'atrasados')}
              className="relative p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
              title={`${stats.followUpsOverdueCount} follow-ups atrasados`}
            >
              <Bell size={18} />
              {stats.followUpsOverdueCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white animate-ping" />
              )}
            </button>

            {/* User Switcher (for fast testing of RBAC permissions) */}
            <div className="flex items-center gap-2 border-l border-slate-200 pl-2.5">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-slate-800 leading-none">{currentUser.name}</div>
                <div className="text-[10px] font-semibold text-blue-600 mt-0.5">{currentUser.roleLabel || currentUser.role}</div>
              </div>

              <select
                value={currentUser.id}
                onChange={(e) => {
                  const u = users.find((usr) => usr.id === e.target.value);
                  if (u) setCurrentUser(u);
                }}
                className="text-xs border border-slate-300 rounded-lg py-1 px-1.5 bg-white text-slate-700 focus:outline-blue-600 cursor-pointer"
                title="Mudar usuário logado (Administrador, Colaborador, Visualização)"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({(u.roleLabel || u.role).substring(0, 8)}...)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <Sidebar
          currentView={currentView}
          subView={currentSubView}
          onNavigate={handleNavigate}
          isOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 lg:ml-64">
          <div className="max-w-7xl mx-auto">
            {/* If a client is selected, render the full Client Detail View */}
            {selectedClientId ? (
              <ClientDetailView
                clientId={selectedClientId}
                initialTab={clientDetailInitialTab}
                onBack={handleBackFromClient}
              />
            ) : (
              /* View Router */
              <>
                {currentView === 'dashboard' && (
                  <DashboardView
                    onNavigate={handleNavigate}
                    onSelectClient={handleSelectClient}
                    onOpenQuickCreate={handleOpenQuickCreate}
                  />
                )}

                {currentView === 'clientes' && (
                  <ClientsView
                    onSelectClient={handleSelectClient}
                    defaultStatusFilter={
                      currentSubView === 'ativos'
                        ? 'active'
                        : currentSubView === 'leads'
                        ? 'lead'
                        : currentSubView === 'inativos'
                        ? 'inactive'
                        : 'all'
                    }
                  />
                )}

                {currentView === 'pipeline' && (
                  <PipelineView
                    onSelectClient={handleSelectClient}
                    onOpenQuickCreate={handleOpenQuickCreate}
                  />
                )}

                {currentView === 'planejamento' && (
                  <WeeklyPlannerView
                    onSelectClient={handleSelectClient}
                    onOpenQuickCreate={handleOpenQuickCreate}
                    viewMode={currentSubView === 'hoje' ? 'today' : 'week'}
                  />
                )}

                {currentView === 'tarefas' && (
                  <TasksView
                    onSelectClient={handleSelectClient}
                    defaultFilter={
                      currentSubView === 'hoje'
                        ? 'today'
                        : currentSubView === 'atrasadas'
                        ? 'overdue'
                        : currentSubView === 'semana'
                        ? 'week'
                        : currentSubView === 'concluidas'
                        ? 'completed'
                        : 'all'
                    }
                  />
                )}

                {currentView === 'followups' && (
                  <FollowUpsView
                    onSelectClient={handleSelectClient}
                    defaultSubView={currentSubView}
                    onOpenQuickCreate={handleOpenQuickCreate}
                  />
                )}

                {currentView === 'contatos' && (
                  <ContactsView onSelectClient={handleSelectClient} />
                )}

                {currentView === 'projetos' && (
                  <ProjectsView onSelectClient={handleSelectClient} />
                )}

                {currentView === 'propostas' && (
                  <ProposalsView onSelectClient={handleSelectClient} />
                )}

                {currentView === 'contratos' && (
                  <ContractsView onSelectClient={handleSelectClient} />
                )}

                {currentView === 'financeiro' && (
                  <FinancialView onSelectClient={handleSelectClient} />
                )}

                {currentView === 'arquivos' && (
                  <FilesView onSelectClient={handleSelectClient} />
                )}

                {currentView === 'relatorios' && <ReportsView />}

                {currentView === 'configuracoes' && <SettingsView />}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Global Quick Create Modal */}
      <QuickCreateModal
        isOpen={quickCreateOpen}
        onClose={() => setQuickCreateOpen(false)}
        initialType={quickCreateType}
        onClientCreated={(clientId) => handleSelectClient(clientId)}
      />

      {/* Full Client Creation / Edit Modal */}
      <ClientModal
        isOpen={clientModalOpen}
        onClose={() => {
          setClientModalOpen(false);
          setEditingClientId(null);
        }}
        clientToEdit={clients.find((c) => c.id === editingClientId)}
        onSaved={(clientId) => {
          setClientModalOpen(false);
          setEditingClientId(null);
          handleSelectClient(clientId);
        }}
      />

      {/* Global Search Dialog Modal */}
      {globalSearchOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center pt-16 p-4"
          onClick={() => setGlobalSearchOpen(false)}
        >
          <div
            className="bg-white rounded-2xl p-4 max-w-lg w-full shadow-2xl border border-slate-200 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                autoFocus
                placeholder="Digite o nome da empresa, contato ou cidade..."
                value={globalQuery}
                onChange={(e) => setGlobalQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-blue-600"
              />
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
              {searchResults.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  {globalQuery.trim()
                    ? 'Nenhum cliente ou lead encontrado com este termo.'
                    : 'Digite acima para buscar em todo o CRM.'}
                </div>
              ) : (
                searchResults.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelectClient(c.id)}
                    className="w-full text-left p-2.5 hover:bg-slate-50 rounded-lg flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-900">{c.corporateName}</div>
                      <div className="text-[11px] text-slate-500">{c.tradeName || c.segment || c.city}</div>
                    </div>
                    <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      Ver Ficha
                    </span>
                  </button>
                ))
              )}
            </div>

            <div className="text-right pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setGlobalSearchOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-lg"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <CrmProvider>
      <CrmApp />
    </CrmProvider>
  );
}
