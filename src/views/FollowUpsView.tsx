import React, { useState } from 'react';
import {
  Clock,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Building2,
  Search,
  Filter,
  User,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { FollowUp, FollowUpChannel } from '../types';
import { formatDate, isDateOverdue, isDateToday, getTodayString } from '../utils/formatters';
import { WhatsAppButton } from '../components/WhatsAppButton';

interface FollowUpsViewProps {
  onSelectClient: (clientId: string, tab?: string) => void;
  defaultSubView?: string;
  onOpenQuickCreate: (type?: string) => void;
}

export const FollowUpsView: React.FC<FollowUpsViewProps> = ({
  onSelectClient,
  defaultSubView = 'todos',
  onOpenQuickCreate,
}) => {
  const { followUps, clients, users, currentUser, updateFollowUp, addFollowUp, canEdit } = useCrm();

  const [filterTab, setFilterTab] = useState<string>(
    defaultSubView === 'atrasados' ? 'overdue' : defaultSubView === 'hoje' ? 'today' : 'all'
  );
  const [responsibleFilter, setResponsibleFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Complete / Reschedule Modal State
  const [completingFollowUp, setCompletingFollowUp] = useState<FollowUp | null>(null);
  const [completionResult, setCompletionResult] = useState('');
  const [reschedulingFollowUp, setReschedulingFollowUp] = useState<FollowUp | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState(getTodayString());
  const [rescheduleTime, setRescheduleTime] = useState('14:00');

  // Filter follow-ups
  const filteredFollowUps = followUps.filter((flw) => {
    const client = clients.find((c) => c.id === flw.clientId);

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchReason = flw.reason.toLowerCase().includes(q);
      const matchClient = client?.corporateName.toLowerCase().includes(q);
      if (!matchReason && !matchClient) return false;
    }

    if (responsibleFilter !== 'all' && flw.responsibleUserId !== responsibleFilter) return false;

    if (filterTab === 'overdue') {
      return isDateOverdue(flw.date, flw.time) && flw.status === 'pending';
    }
    if (filterTab === 'today') {
      return isDateToday(flw.date) && flw.status === 'pending';
    }
    if (filterTab === 'upcoming') {
      const today = getTodayString();
      return flw.date > today && flw.status === 'pending';
    }
    if (filterTab === 'completed') {
      return flw.status === 'completed';
    }

    return true;
  });

  const handleCompleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingFollowUp) return;

    updateFollowUp(completingFollowUp.id, {
      status: 'completed',
      result: completionResult.trim() || 'Follow-up concluído com sucesso.',
    });

    setCompletingFollowUp(null);
    setCompletionResult('');
  };

  const handleRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedulingFollowUp) return;

    updateFollowUp(reschedulingFollowUp.id, {
      status: 'rescheduled',
      date: rescheduleDate,
      time: rescheduleTime,
      notes: reschedulingFollowUp.notes
        ? `${reschedulingFollowUp.notes} (Reagendado)`
        : 'Reagendado',
    });

    setReschedulingFollowUp(null);
  };

  return (
    <div id="view-followups" className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Módulo de Follow-ups</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Acompanhe compromissos de contato, retorno comercial e reuniões sem deixar nenhum cliente sem resposta.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <button
              id="btn-add-followup"
              type="button"
              onClick={() => onOpenQuickCreate('followup')}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
            >
              <Plus size={16} />
              <span>Agendar Follow-up</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'all', label: 'Todos os Follow-ups' },
          { id: 'overdue', label: '⚠️ Atrasados' },
          { id: 'today', label: 'Hoje' },
          { id: 'upcoming', label: 'Próximos' },
          { id: 'completed', label: 'Concluídos' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilterTab(tab.id)}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              filterTab === tab.id
                ? tab.id === 'overdue'
                  ? 'bg-rose-600 text-white font-bold'
                  : 'bg-blue-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search and Responsible filter */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por motivo ou nome do cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-blue-600"
          />
        </div>

        <div>
          <select
            value={responsibleFilter}
            onChange={(e) => setResponsibleFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-blue-600 bg-white"
          >
            <option value="all">Todos os Responsáveis</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Follow-ups List */}
      <div className="space-y-3">
        {filteredFollowUps.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
            <CheckCircle2 size={32} className="mx-auto text-slate-300 mb-2" />
            Nenhum follow-up encontrado para o filtro selecionado.
          </div>
        ) : (
          filteredFollowUps.map((flw) => {
            const client = clients.find((c) => c.id === flw.clientId);
            const user = users.find((u) => u.id === flw.responsibleUserId);
            const isOverdue = isDateOverdue(flw.date, flw.time) && flw.status === 'pending';
            const isDone = flw.status === 'completed';

            return (
              <div
                key={flw.id}
                className={`p-4 rounded-xl border transition-all bg-white shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isOverdue
                    ? 'border-rose-300 bg-rose-50/30'
                    : isDone
                    ? 'border-slate-200 bg-slate-50/60 opacity-75'
                    : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {client && (
                      <button
                        type="button"
                        onClick={() => onSelectClient(client.id, 'followups')}
                        className="font-bold text-sm text-slate-900 hover:text-blue-600 transition-colors"
                      >
                        {client.corporateName}
                      </button>
                    )}

                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                      {flw.channel}
                    </span>

                    {isOverdue && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-100 text-rose-800 flex items-center gap-1 animate-pulse">
                        <AlertTriangle size={11} /> Vencido
                      </span>
                    )}

                    {isDone && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">
                        Concluído
                      </span>
                    )}
                  </div>

                  <div className="text-xs font-semibold text-slate-800">{flw.reason}</div>

                  {flw.result && (
                    <div className="text-xs text-emerald-900 bg-emerald-50/80 p-2 rounded-lg mt-1 border border-emerald-200">
                      <strong>Resultado registrado:</strong> {flw.result}
                    </div>
                  )}

                  <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-3 pt-1 font-mono">
                    <span className="text-slate-600">
                      📅 {formatDate(flw.date)} às {flw.time}
                    </span>
                    <span>• Responsável: <strong>{user?.name || 'Equipe'}</strong></span>
                    {flw.notes && <span>• {flw.notes}</span>}
                  </div>
                </div>

                {/* Right Side Actions: WhatsApp + Concluir + Reagendar */}
                <div className="shrink-0 flex items-center gap-2 self-start md:self-center">
                  {client?.whatsapp && <WhatsAppButton number={client.whatsapp} variant="compact" />}

                  {!isDone && canEdit && (
                    <>
                      <button
                        type="button"
                        onClick={() => setCompletingFollowUp(flw)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs"
                      >
                        Concluir
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setReschedulingFollowUp(flw);
                          setRescheduleDate(flw.date);
                          setRescheduleTime(flw.time);
                        }}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700"
                        title="Reagendar follow-up"
                      >
                        <RotateCcw size={13} className="inline mr-1" /> Reagendar
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Concluir Follow-up */}
      {completingFollowUp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="font-bold text-base text-slate-900 mb-1">Concluir Follow-up</h3>
            <p className="text-xs text-slate-500 mb-3">
              Registre o resumo do retorno obtido com o cliente.
            </p>
            <form onSubmit={handleCompleteSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">O que foi acordado / resultado? *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Ex: Cliente solicitou alteração na proposta comercial para pagamento em 2x..."
                  value={completionResult}
                  onChange={(e) => setCompletionResult(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-blue-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCompletingFollowUp(null)}
                  className="px-3 py-1.5 rounded-lg border text-slate-600"
                >
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold">
                  Salvar Conclusão
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Reagendar Follow-up */}
      {reschedulingFollowUp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="font-bold text-base text-slate-900 mb-1">Reagendar Follow-up</h3>
            <p className="text-xs text-slate-500 mb-3">
              Defina a nova data e horário para contato.
            </p>
            <form onSubmit={handleRescheduleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Nova Data</label>
                  <input
                    type="date"
                    required
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Novo Horário</label>
                  <input
                    type="time"
                    required
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReschedulingFollowUp(null)}
                  className="px-3 py-1.5 rounded-lg border text-slate-600"
                >
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-semibold">
                  Atualizar Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
