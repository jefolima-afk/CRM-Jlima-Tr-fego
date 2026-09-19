import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Calendar,
  AlertCircle,
  Clock,
  Trash2,
  CheckCircle2,
  Building2,
  ListTodo,
} from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { Task, TaskPriority } from '../types';
import { formatDate, isDateOverdue, isDateToday, getTodayString } from '../utils/formatters';

interface TasksViewProps {
  onSelectClient: (clientId: string) => void;
  defaultFilter?: 'all' | 'today' | 'overdue' | 'week' | 'completed';
}

export const TasksView: React.FC<TasksViewProps> = ({
  onSelectClient,
  defaultFilter = 'all',
}) => {
  const { tasks, clients, users, currentUser, addTask, toggleTaskStatus, deleteTask, canEdit } = useCrm();

  const [activeTab, setActiveTab] = useState<'all' | 'today' | 'overdue' | 'week' | 'completed'>(defaultFilter);
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // New task form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newClientId, setNewClientId] = useState('');
  const [newCategory, setNewCategory] = useState('Comercial');
  const [newDate, setNewDate] = useState(getTodayString());
  const [newTime, setNewTime] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');
  const [newDescription, setNewDescription] = useState('');

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    // Search
    if (searchTerm && !t.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    // Priority
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    // Client
    if (clientFilter !== 'all' && t.clientId !== clientFilter) return false;

    // Tabs
    if (activeTab === 'today') {
      return isDateToday(t.date) && t.status !== 'completed';
    }
    if (activeTab === 'overdue') {
      return isDateOverdue(t.date) && t.status !== 'completed';
    }
    if (activeTab === 'completed') {
      return t.status === 'completed';
    }
    if (activeTab === 'week') {
      const today = new Date();
      const taskDate = new Date(t.date);
      const diffDays = (taskDate.getTime() - today.getTime()) / (1000 * 3600 * 24);
      return diffDays >= -1 && diffDays <= 7 && t.status !== 'completed';
    }

    return true;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addTask({
      title: newTitle.trim(),
      clientId: newClientId || undefined,
      category: newCategory,
      responsibleUserId: currentUser.id,
      date: newDate,
      time: newTime || undefined,
      priority: newPriority,
      status: 'todo',
      description: newDescription.trim() || undefined,
      checklist: [],
    });

    setIsModalOpen(false);
    setNewTitle('');
    setNewDescription('');
    setNewClientId('');
  };

  return (
    <div id="view-tasks" className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Gestão de Tarefas</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Organize suas pendências diárias, checklists, prioridades e compromissos operacionais.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <button
              id="btn-add-task"
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
            >
              <Plus size={16} />
              <span>Nova Tarefa</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'all', label: 'Todas as Tarefas' },
          { id: 'today', label: 'Hoje' },
          { id: 'overdue', label: 'Atrasadas' },
          { id: 'week', label: 'Esta Semana' },
          { id: 'completed', label: 'Concluídas' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por título da tarefa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-blue-600"
          />
        </div>

        <div>
          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-blue-600 bg-white"
          >
            <option value="all">Todos os Clientes</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.corporateName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-blue-600 bg-white"
          >
            <option value="all">Todas as Prioridades</option>
            <option value="high">Alta Prioridade</option>
            <option value="medium">Média Prioridade</option>
            <option value="low">Baixa Prioridade</option>
          </select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs divide-y divide-slate-100 overflow-hidden">
        {filteredTasks.length === 0 ? (
          <div className="py-14 text-center text-slate-400 text-xs">
            <CheckCircle2 size={36} className="mx-auto text-slate-300 mb-2" />
            <div className="font-semibold text-slate-700 text-xs">Nenhuma tarefa cadastrada</div>
            <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs mx-auto">
              Mantenha sua rotina comercial e operacional organizada criando tarefas com prazos e checklists.
            </p>
            {canEdit && (
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
              >
                <Plus size={14} /> Criar Primeira Tarefa
              </button>
            )}
          </div>
        ) : (
          filteredTasks.map((t) => {
            const client = clients.find((c) => c.id === t.clientId);
            const user = users.find((u) => u.id === t.responsibleUserId);
            const isDone = t.status === 'completed';
            const isOverdue = isDateOverdue(t.date) && !isDone;

            return (
              <div
                key={t.id}
                className={`p-4 transition-colors flex items-start gap-3 hover:bg-slate-50/80 ${
                  isDone ? 'bg-slate-50/50 opacity-60' : ''
                }`}
              >
                <input
                  type="checkbox"
                  checked={isDone}
                  onChange={() => toggleTaskStatus(t.id)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-sm font-semibold text-slate-900 leading-snug ${
                        isDone ? 'line-through text-slate-400' : ''
                      }`}
                    >
                      {t.title}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                        t.priority === 'high'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : t.priority === 'medium'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {t.priority === 'high' ? 'Alta' : t.priority === 'medium' ? 'Média' : 'Baixa'}
                    </span>
                    {isOverdue && (
                      <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded flex items-center gap-1">
                        <AlertCircle size={11} /> Atrasada
                      </span>
                    )}
                  </div>

                  {t.description && (
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{t.description}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-2 font-mono">
                    <span className="flex items-center gap-1 text-slate-600">
                      <Calendar size={12} className="text-slate-400" />
                      {formatDate(t.date)} {t.time ? `às ${t.time}` : ''}
                    </span>

                    {client && (
                      <button
                        type="button"
                        onClick={() => onSelectClient(client.id)}
                        className="text-blue-600 hover:underline flex items-center gap-1 font-sans"
                      >
                        <Building2 size={12} /> {client.corporateName}
                      </button>
                    )}

                    <span className="text-slate-400 font-sans">
                      Responsável: <strong>{user?.name || 'Geral'}</strong>
                    </span>
                  </div>
                </div>

                {canEdit && (
                  <button
                    type="button"
                    onClick={() => deleteTask(t.id)}
                    className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                    title="Excluir tarefa"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal Nova Tarefa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="font-bold text-base text-slate-900 mb-3">Nova Tarefa</h3>
            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Título da Tarefa *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Realizar reunião de alinhamento com diretoria"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Cliente Vinculado</label>
                <select
                  value={newClientId}
                  onChange={(e) => setNewClientId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-blue-600 bg-white"
                >
                  <option value="">Sem cliente (Geral / Interno)</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.corporateName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Data Prevista *</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Horário</label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Prioridade</label>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high'] as TaskPriority[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewPriority(p)}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                        newPriority === p
                          ? p === 'high'
                            ? 'bg-red-50 text-red-700 border-red-300'
                            : p === 'medium'
                            ? 'bg-amber-50 text-amber-700 border-amber-300'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : 'text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {p === 'high' ? 'Alta' : p === 'medium' ? 'Média' : 'Baixa'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Descrição / Instruções</label>
                <textarea
                  rows={3}
                  placeholder="Informações adicionais para execução da tarefa..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-blue-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
                >
                  Criar Tarefa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
