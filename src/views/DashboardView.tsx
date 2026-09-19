import React from 'react';
import {
  Users,
  UserPlus,
  Clock,
  AlertTriangle,
  CheckSquare,
  Calendar,
  FileText,
  ShieldAlert,
  ArrowUpRight,
  Kanban,
  CheckCircle2,
  PhoneCall,
  MessageSquare,
  Plus,
  TrendingUp,
} from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { formatBRL, formatDate, isDateOverdue, isDateToday } from '../utils/formatters';
import { WhatsAppButton } from '../components/WhatsAppButton';

interface DashboardViewProps {
  onNavigate: (view: string, sub?: string) => void;
  onSelectClient: (clientId: string, tab?: string) => void;
  onOpenQuickCreate: (type?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onSelectClient,
  onOpenQuickCreate,
}) => {
  const { stats, followUps, tasks, clients, pipelineStages, toggleTaskStatus, updateFollowUp } = useCrm();

  // Filter real lists for quick access blocks
  const overdueFollowUps = followUps.filter((f) => isDateOverdue(f.date, f.time) && f.status === 'pending');
  const todayFollowUps = followUps.filter((f) => isDateToday(f.date) && f.status === 'pending');
  const todayTasks = tasks.filter((t) => isDateToday(t.date));

  // Upcoming meetings & commitments
  const upcomingMeetings = followUps
    .filter((f) => f.channel === 'Reunião' && f.status === 'pending')
    .slice(0, 4);

  // Group clients by pipeline stage for the summary
  const pipelineSummary = pipelineStages.map((stage) => {
    const stageClients = clients.filter((c) => c.pipelineStage === stage.id);
    const stageValue = stageClients.reduce((sum, c) => sum + (c.potentialValue || 0), 0);
    return {
      ...stage,
      count: stageClients.length,
      value: stageValue,
    };
  });

  return (
    <div id="view-dashboard" className="space-y-6">
      {/* Header with greeting and fast action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Painel de Controle Comercial</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Visão geral em tempo real dos seus clientes, leads, tarefas operacionais e pipeline de vendas.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            id="btn-dash-new-client"
            type="button"
            onClick={() => onOpenQuickCreate('client')}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
          >
            <Plus size={16} />
            <span>Novo Cliente / Lead</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Cards Grid (Section 2) */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Leads Novos */}
        <div
          onClick={() => onNavigate('leads')}
          className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-blue-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">Leads Novos</span>
            <UserPlus size={16} className="text-blue-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.leadsNewCount}</div>
          <div className="text-[11px] text-blue-600 font-medium mt-1 flex items-center gap-0.5">
            Ver funil <ArrowUpRight size={12} />
          </div>
        </div>

        {/* Leads em Negociação */}
        <div
          onClick={() => onNavigate('pipeline')}
          className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-indigo-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">Em Negociação</span>
            <TrendingUp size={16} className="text-indigo-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.leadsInNegotiationCount}</div>
          <div className="text-[11px] text-indigo-600 font-medium mt-1 flex items-center gap-0.5">
            Pipeline <ArrowUpRight size={12} />
          </div>
        </div>

        {/* Clientes Ativos */}
        <div
          onClick={() => onNavigate('clientes')}
          className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">Clientes Ativos</span>
            <Users size={16} className="text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.activeClientsCount}</div>
          <div className="text-[11px] text-slate-400 font-medium mt-1">
            {stats.inactiveClientsCount} inativos
          </div>
        </div>

        {/* Follow-ups Hoje / Atrasados */}
        <div
          onClick={() => onNavigate('followups')}
          className={`p-4 rounded-xl border shadow-2xs hover:shadow-xs transition-all cursor-pointer group ${
            stats.followUpsOverdueCount > 0
              ? 'bg-rose-50/50 border-rose-200 hover:border-rose-400'
              : 'bg-white border-slate-200/80 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700">Follow-ups</span>
            {stats.followUpsOverdueCount > 0 ? (
              <AlertTriangle size={16} className="text-rose-600 animate-pulse" />
            ) : (
              <Clock size={16} className="text-amber-600" />
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{stats.followUpsTodayCount}</span>
            <span className="text-xs text-slate-500">hoje</span>
          </div>
          {stats.followUpsOverdueCount > 0 ? (
            <div className="text-[11px] text-rose-700 font-bold mt-1">
              ⚠️ {stats.followUpsOverdueCount} atrasado(s)!
            </div>
          ) : (
            <div className="text-[11px] text-slate-400 mt-1">Em dia</div>
          )}
        </div>

        {/* Tarefas Hoje / Atrasadas */}
        <div
          onClick={() => onNavigate('tarefas')}
          className={`p-4 rounded-xl border shadow-2xs hover:shadow-xs transition-all cursor-pointer group ${
            stats.tasksOverdueCount > 0
              ? 'bg-red-50/40 border-red-200 hover:border-red-400'
              : 'bg-white border-slate-200/80 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700">Tarefas de Hoje</span>
            <CheckSquare size={16} className="text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{stats.tasksTodayCount}</span>
            <span className="text-xs text-slate-500">pendentes</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {stats.tasksWeekCount} na semana •{' '}
            <span className={stats.tasksOverdueCount > 0 ? 'text-red-600 font-semibold' : ''}>
              {stats.tasksOverdueCount} atras.
            </span>
          </div>
        </div>

        {/* Propostas & Contratos */}
        <div
          onClick={() => onNavigate('propostas')}
          className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-pink-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">Propostas</span>
            <FileText size={16} className="text-pink-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.proposalsPendingCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            {stats.contractsExpiringCount > 0 ? (
              <span className="text-orange-600 font-semibold">
                ⚠️ {stats.contractsExpiringCount} contrato exp.
              </span>
            ) : (
              'Aguardando aceite'
            )}
          </div>
        </div>
      </div>

      {/* Quick Access Blocks (Section 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Follow-ups Atrasados e de Hoje */}
        <div className="space-y-6">
          {/* Follow-ups Atrasados (Destacados!) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <AlertTriangle size={17} className="text-rose-600" />
                Follow-ups Atrasados
                {overdueFollowUps.length > 0 && (
                  <span className="bg-rose-100 text-rose-800 text-xs px-2 py-0.5 rounded-full font-bold">
                    {overdueFollowUps.length}
                  </span>
                )}
              </h3>
              <button
                type="button"
                onClick={() => onNavigate('followups', 'atrasados')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                Ver todos
              </button>
            </div>

            {overdueFollowUps.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs">
                <CheckCircle2 size={24} className="mx-auto text-emerald-500 mb-1" />
                Nenhum follow-up atrasado no momento!
              </div>
            ) : (
              <div className="space-y-3">
                {overdueFollowUps.map((flw) => {
                  const client = clients.find((c) => c.id === flw.clientId);
                  return (
                    <div
                      key={flw.id}
                      className="p-3 rounded-lg border border-rose-200 bg-rose-50/40 hover:bg-rose-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <button
                            type="button"
                            onClick={() => onSelectClient(flw.clientId, 'followups')}
                            className="font-semibold text-xs text-slate-900 hover:text-blue-600 text-left"
                          >
                            {client?.corporateName}
                          </button>
                          <div className="text-xs text-rose-800 font-medium mt-0.5">{flw.reason}</div>
                          <div className="text-[11px] text-rose-600/90 mt-1 flex items-center gap-1.5 font-mono">
                            <span>Venceu em {formatDate(flw.date)} às {flw.time}</span>
                            <span>• {flw.channel}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-rose-200/60 flex items-center justify-between gap-2">
                        {client?.whatsapp ? (
                          <WhatsAppButton number={client.whatsapp} variant="compact" />
                        ) : (
                          <span className="text-[10px] text-slate-400">Sem WhatsApp</span>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            updateFollowUp(flw.id, {
                              status: 'completed',
                              result: 'Concluído pelo painel inicial',
                            })
                          }
                          className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-md transition-colors"
                        >
                          Concluir
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Follow-ups de Hoje */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Clock size={17} className="text-amber-600" />
                Follow-ups de Hoje
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                  {todayFollowUps.length}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => onNavigate('followups', 'hoje')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                Ver todos
              </button>
            </div>

            {todayFollowUps.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs">
                Nenhum follow-up programado para hoje.
              </div>
            ) : (
              <div className="space-y-2.5">
                {todayFollowUps.map((flw) => {
                  const client = clients.find((c) => c.id === flw.clientId);
                  return (
                    <div
                      key={flw.id}
                      className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white transition-all flex items-start justify-between gap-2"
                    >
                      <div>
                        <button
                          type="button"
                          onClick={() => onSelectClient(flw.clientId, 'followups')}
                          className="font-semibold text-xs text-slate-900 hover:text-blue-600 text-left"
                        >
                          {client?.corporateName}
                        </button>
                        <div className="text-xs text-slate-700 mt-0.5">{flw.reason}</div>
                        <div className="text-[11px] text-slate-500 mt-1 font-mono">
                          Horário: {flw.time} • Canal: {flw.channel}
                        </div>
                      </div>
                      {client?.whatsapp && <WhatsAppButton number={client.whatsapp} variant="icon" />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Center Col: Tarefas de Hoje (com checkboxes funcionais) */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <CheckSquare size={17} className="text-blue-600" />
                Tarefas de Hoje
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                  {todayTasks.length}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => onNavigate('tarefas')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                Gerenciar
              </button>
            </div>

            {todayTasks.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                <CheckCircle2 size={24} className="mx-auto text-slate-300 mb-1" />
                Nenhuma tarefa agendada para hoje.
              </div>
            ) : (
              <div className="space-y-2">
                {todayTasks.map((task) => {
                  const client = clients.find((c) => c.id === task.clientId);
                  const isDone = task.status === 'completed';
                  return (
                    <div
                      key={task.id}
                      className={`p-3 rounded-lg border transition-all flex items-start gap-3 ${
                        isDone
                          ? 'bg-slate-50/70 border-slate-200 opacity-65'
                          : 'bg-white border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isDone}
                        onChange={() => toggleTaskStatus(task.id)}
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <div
                          className={`text-xs font-semibold text-slate-900 leading-tight ${
                            isDone ? 'line-through text-slate-400' : ''
                          }`}
                        >
                          {task.title}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                          {client ? `Cliente: ${client.corporateName}` : 'Geral'}
                          {task.time && ` • às ${task.time}`}
                        </div>
                        {task.checklist && task.checklist.length > 0 && (
                          <div className="text-[10px] text-slate-400 mt-1">
                            Checklist: {task.checklist.filter((i) => i.done).length}/{task.checklist.length} itens
                          </div>
                        )}
                      </div>
                      <span
                        className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded shrink-0 ${
                          task.priority === 'high'
                            ? 'bg-red-50 text-red-700'
                            : task.priority === 'medium'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Próximos Compromissos & Reuniões */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Calendar size={17} className="text-purple-600" />
                Próximos Compromissos & Reuniões
              </h3>
              <button
                type="button"
                onClick={() => onNavigate('calendario')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                Calendário
              </button>
            </div>

            {upcomingMeetings.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs">
                Nenhuma reunião pendente na fila.
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingMeetings.map((m) => {
                  const client = clients.find((c) => c.id === m.clientId);
                  return (
                    <div
                      key={m.id}
                      className="p-2.5 rounded-lg border border-purple-100 bg-purple-50/30 flex items-center justify-between gap-2"
                    >
                      <div>
                        <div className="text-xs font-semibold text-slate-900">{m.reason}</div>
                        <div className="text-[11px] text-purple-700 mt-0.5">
                          {client?.corporateName} • {formatDate(m.date)} às {m.time}
                        </div>
                      </div>
                      {client?.whatsapp && <WhatsAppButton number={client.whatsapp} variant="icon" />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Pipeline Comercial Resumo */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Kanban size={17} className="text-indigo-600" />
                  Pipeline Comercial
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Valor total em negociação: {formatBRL(stats.totalPipelineValue)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('pipeline')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                Abrir Kanban
              </button>
            </div>

            <div className="space-y-2.5 mt-4">
              {pipelineSummary.slice(0, 7).map((stage) => {
                const percentage =
                  clients.length > 0 ? Math.round((stage.count / clients.length) * 100) : 0;
                return (
                  <div
                    key={stage.id}
                    onClick={() => onNavigate('pipeline')}
                    className="p-2.5 rounded-lg hover:bg-slate-50 border border-slate-100 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: stage.color }}
                        />
                        {stage.name}
                      </span>
                      <span className="font-mono text-slate-500">
                        {stage.count} ({formatBRL(stage.value)})
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.max(percentage, stage.count > 0 ? 8 : 0)}%`,
                          backgroundColor: stage.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
