import React, { useState } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckSquare,
  Clock,
  Building2,
  Calendar,
} from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { formatDate, getTodayString } from '../utils/formatters';
import { WhatsAppButton } from '../components/WhatsAppButton';

interface WeeklyPlannerViewProps {
  onSelectClient: (clientId: string) => void;
  onOpenQuickCreate: (type?: string) => void;
  viewMode?: 'week' | 'today';
}

export const WeeklyPlannerView: React.FC<WeeklyPlannerViewProps> = ({
  onSelectClient,
  onOpenQuickCreate,
  viewMode = 'week',
}) => {
  const { tasks, followUps, clients, toggleTaskStatus, updateFollowUp, canEdit } = useCrm();

  // Reference date (defaults to today)
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

  // Calculate days of the current week (Monday to Friday or Saturday)
  const getWeekDays = () => {
    const now = new Date();
    // Add week offset
    now.setDate(now.getDate() + currentWeekOffset * 7);

    const day = now.getDay();
    // Calculate Monday
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));

    const days = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const dayNames = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
      days.push({
        name: dayNames[i],
        date: iso,
        formatted: `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`,
        isToday: iso === getTodayString(),
      });
    }
    return days;
  };

  const weekDays = getWeekDays();

  // If viewMode is 'today', filter to just today
  const displayedDays = viewMode === 'today' ? weekDays.filter((d) => d.isToday) : weekDays;

  return (
    <div id="view-weekly-planner" className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {viewMode === 'today' ? 'Planejamento de Hoje' : 'Planejamento Semanal (Minha Semana)'}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Organização diária das tarefas operacionais, follow-ups e compromissos comerciais.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {viewMode === 'week' && (
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1 shadow-2xs">
              <button
                type="button"
                onClick={() => setCurrentWeekOffset((prev) => prev - 1)}
                className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md"
                title="Semana anterior"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => setCurrentWeekOffset(0)}
                className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-md"
              >
                Semana Atual
              </button>
              <button
                type="button"
                onClick={() => setCurrentWeekOffset((prev) => prev + 1)}
                className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md"
                title="Próxima semana"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}

          {canEdit && (
            <button
              type="button"
              onClick={() => onOpenQuickCreate('task')}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
            >
              <Plus size={16} />
              <span>Agendar Tarefa</span>
            </button>
          )}
        </div>
      </div>

      {/* Week Columns Grid */}
      <div
        className={`grid gap-4 ${
          viewMode === 'today'
            ? 'grid-cols-1 max-w-2xl mx-auto'
            : 'grid-cols-1 md:grid-cols-3 lg:grid-cols-6'
        }`}
      >
        {displayedDays.map((day) => {
          const dayTasks = tasks.filter((t) => t.date === day.date);
          const dayFollowUps = followUps.filter((f) => f.date === day.date);

          return (
            <div
              key={day.date}
              className={`rounded-xl border flex flex-col min-h-[480px] bg-slate-50/70 transition-all ${
                day.isToday
                  ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/20'
                  : 'border-slate-200'
              }`}
            >
              {/* Day Header */}
              <div
                className={`p-3 border-b rounded-t-xl shrink-0 flex items-center justify-between ${
                  day.isToday ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-200'
                }`}
              >
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider">{day.name}</div>
                  <div className={`text-[11px] font-mono ${day.isToday ? 'text-blue-100' : 'text-slate-400'}`}>
                    {day.formatted}
                  </div>
                </div>

                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    day.isToday ? 'bg-white text-blue-700' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {dayTasks.length + dayFollowUps.length}
                </span>
              </div>

              {/* Day Items List */}
              <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                {/* Follow-ups Section */}
                {dayFollowUps.map((flw) => {
                  const client = clients.find((c) => c.id === flw.clientId);
                  const isDone = flw.status === 'completed';

                  return (
                    <div
                      key={flw.id}
                      className={`p-2.5 rounded-lg border text-xs shadow-2xs space-y-1.5 transition-all ${
                        isDone
                          ? 'bg-slate-100/70 border-slate-200 opacity-60'
                          : 'bg-white border-amber-200 hover:border-amber-400'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-bold text-amber-800">
                        <span className="flex items-center gap-1">
                          <Clock size={11} /> {flw.time || '14:00'}
                        </span>
                        <span>{flw.channel}</span>
                      </div>

                      <div className="font-semibold text-slate-900 leading-snug">{flw.reason}</div>

                      {client && (
                        <button
                          type="button"
                          onClick={() => onSelectClient(client.id)}
                          className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 truncate"
                        >
                          <Building2 size={11} /> {client.corporateName}
                        </button>
                      )}

                      {!isDone && client?.whatsapp && (
                        <div className="pt-1 flex items-center justify-between">
                          <WhatsAppButton number={client.whatsapp} variant="icon" />
                          <button
                            type="button"
                            onClick={() =>
                              updateFollowUp(flw.id, {
                                status: 'completed',
                                result: 'Concluído na visão Minha Semana',
                              })
                            }
                            className="text-[10px] text-emerald-700 font-semibold hover:underline"
                          >
                            Concluir
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Tasks Section */}
                {dayTasks.map((t) => {
                  const client = clients.find((c) => c.id === t.clientId);
                  const isDone = t.status === 'completed';

                  return (
                    <div
                      key={t.id}
                      className={`p-2.5 rounded-lg border text-xs shadow-2xs space-y-1.5 transition-all ${
                        isDone
                          ? 'bg-slate-100/70 border-slate-200 opacity-60'
                          : 'bg-white border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          checked={isDone}
                          onChange={() => toggleTaskStatus(t.id)}
                          className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-blue-600 cursor-pointer shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div
                            className={`font-semibold leading-snug ${
                              isDone ? 'line-through text-slate-400' : 'text-slate-900'
                            }`}
                          >
                            {t.title}
                          </div>
                          {client && (
                            <button
                              type="button"
                              onClick={() => onSelectClient(client.id)}
                              className="text-[11px] text-slate-500 hover:text-blue-600 truncate block mt-0.5"
                            >
                              {client.corporateName}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {dayTasks.length === 0 && dayFollowUps.length === 0 && (
                  <div className="py-8 text-center text-slate-400 text-[11px] italic">
                    Livre
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
