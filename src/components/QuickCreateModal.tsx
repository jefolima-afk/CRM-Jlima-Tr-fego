import React, { useState } from 'react';
import { X, Building2, CheckSquare, Clock, MessageSquare, Plus } from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { getTodayString } from '../utils/formatters';
import { normalizeWhatsAppNumber } from '../utils/whatsapp';
import { InteractionType, FollowUpChannel, TaskPriority, ClientStatus, PipelineStageId } from '../types';

interface QuickCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: 'client' | 'task' | 'followup' | 'interaction';
  onClientCreated?: (clientId: string) => void;
}

export const QuickCreateModal: React.FC<QuickCreateModalProps> = ({
  isOpen,
  onClose,
  initialType = 'client',
  onClientCreated,
}) => {
  const [activeTab, setActiveTab] = useState<'client' | 'task' | 'followup' | 'interaction'>(initialType);
  const { clients, users, currentUser, addClient, addTask, addFollowUp, addInteraction, services } = useCrm();

  // Client form
  const [corporateName, setCorporateName] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [segment, setSegment] = useState('');
  const [assignedUserId, setAssignedUserId] = useState(currentUser.id);
  const [status, setStatus] = useState<ClientStatus>('lead');
  const [pipelineStage, setPipelineStage] = useState<PipelineStageId>('lead');
  const [potentialValue, setPotentialValue] = useState<number>(0);

  // Task form
  const [taskTitle, setTaskTitle] = useState('');
  const [taskClientId, setTaskClientId] = useState('');
  const [taskDate, setTaskDate] = useState(getTodayString());
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('medium');
  const [taskDescription, setTaskDescription] = useState('');

  // Follow-up form
  const [flwClientId, setFlwClientId] = useState('');
  const [flwDate, setFlwDate] = useState(getTodayString());
  const [flwTime, setFlwTime] = useState('14:00');
  const [flwReason, setFlwReason] = useState('');
  const [flwChannel, setFlwChannel] = useState<FollowUpChannel>('WhatsApp');

  // Interaction form
  const [intClientId, setIntClientId] = useState('');
  const [intType, setIntType] = useState<InteractionType>('WhatsApp');
  const [intDescription, setIntDescription] = useState('');
  const [intNextAction, setIntNextAction] = useState('');

  if (!isOpen) return null;

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!corporateName.trim()) return;

    const created = addClient({
      corporateName: corporateName.trim(),
      tradeName: tradeName.trim() || undefined,
      whatsapp: whatsapp.trim(),
      email: email.trim() || undefined,
      segment: segment.trim() || undefined,
      assignedUserId: assignedUserId || currentUser.id,
      status,
      pipelineStage,
      potentialValue: Number(potentialValue) || 0,
      firstContactDate: getTodayString(),
    });

    if (onClientCreated) onClientCreated(created.id);
    onClose();
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    addTask({
      title: taskTitle.trim(),
      clientId: taskClientId || undefined,
      category: 'Geral',
      responsibleUserId: currentUser.id,
      date: taskDate,
      priority: taskPriority,
      status: 'todo',
      description: taskDescription.trim() || undefined,
      checklist: [],
    });
    onClose();
  };

  const handleCreateFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flwClientId || !flwReason.trim()) return;

    addFollowUp({
      clientId: flwClientId,
      date: flwDate,
      time: flwTime,
      reason: flwReason.trim(),
      channel: flwChannel,
      responsibleUserId: currentUser.id,
      status: 'pending',
    });
    onClose();
  };

  const handleCreateInteraction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!intClientId || !intDescription.trim()) return;

    addInteraction({
      clientId: intClientId,
      date: getTodayString(),
      time: new Date().toTimeString().substring(0, 5),
      type: intType,
      responsibleUserId: currentUser.id,
      description: intDescription.trim(),
      nextAction: intNextAction.trim() || undefined,
    });
    onClose();
  };

  return (
    <div
      id="modal-quick-create-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="modal-quick-create-card"
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with tabs */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('client')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                activeTab === 'client' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 size={14} />
              Cliente / Lead
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('task')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                activeTab === 'task' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckSquare size={14} />
              Tarefa
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('followup')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                activeTab === 'followup' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock size={14} />
              Follow-up
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('interaction')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                activeTab === 'interaction' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquare size={14} />
              Interação
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Form */}
        <div className="p-6">
          {/* Tab 1: Cliente / Lead */}
          {activeTab === 'client' && (
            <form onSubmit={handleCreateClient} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome / Razão Social <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: InovaTech Soluções Ltda"
                  value={corporateName}
                  onChange={(e) => setCorporateName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nome Fantasia</label>
                  <input
                    type="text"
                    placeholder="Ex: InovaTech"
                    value={tradeName}
                    onChange={(e) => setTradeName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    WhatsApp <span className="text-emerald-600 text-[10px] font-normal">(Inteligente)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="(54) 99999-9999 ou 54999999999"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">E-mail</label>
                  <input
                    type="email"
                    placeholder="contato@empresa.com.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Segmento / Nicho</label>
                  <input
                    type="text"
                    placeholder="Ex: Tecnologia, Indústria, Saúde"
                    value={segment}
                    onChange={(e) => setSegment(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tipo / Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ClientStatus)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600 bg-white"
                  >
                    <option value="lead">Lead Novo</option>
                    <option value="in_negotiation">Em Negociação</option>
                    <option value="active">Cliente Ativo</option>
                    <option value="inactive">Inativo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Etapa do Funil</label>
                  <select
                    value={pipelineStage}
                    onChange={(e) => setPipelineStage(e.target.value as PipelineStageId)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600 bg-white"
                  >
                    <option value="lead">Lead</option>
                    <option value="first_contact">Primeiro Contato</option>
                    <option value="qualification">Qualificação</option>
                    <option value="meeting">Reunião / Diagnóstico</option>
                    <option value="proposal_sent">Proposta Enviada</option>
                    <option value="negotiation">Negociação</option>
                    <option value="won">Fechado Ganho</option>
                    <option value="active_client">Cliente Ativo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Valor Potencial (R$)</label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    placeholder="0"
                    value={potentialValue || ''}
                    onChange={(e) => setPotentialValue(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
                >
                  Cadastrar Cliente
                </button>
              </div>
            </form>
          )}

          {/* Tab 2: Tarefa */}
          {activeTab === 'task' && (
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Título da Tarefa <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Enviar proposta comercial revisada"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cliente Vinculado</label>
                  <select
                    value={taskClientId}
                    onChange={(e) => setTaskClientId(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600 bg-white"
                  >
                    <option value="">Sem cliente (Geral)</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.corporateName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Data Prevista</label>
                  <input
                    type="date"
                    value={taskDate}
                    onChange={(e) => setTaskDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Prioridade</label>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high'] as TaskPriority[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setTaskPriority(p)}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                        taskPriority === p
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Descrição / Detalhes</label>
                <textarea
                  rows={3}
                  placeholder="Instruções ou informações adicionais..."
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
                >
                  Criar Tarefa
                </button>
              </div>
            </form>
          )}

          {/* Tab 3: Follow-up */}
          {activeTab === 'followup' && (
            <form onSubmit={handleCreateFollowUp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cliente / Lead <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={flwClientId}
                  onChange={(e) => setFlwClientId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600 bg-white"
                >
                  <option value="">Selecione o cliente...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.corporateName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Data</label>
                  <input
                    type="date"
                    value={flwDate}
                    onChange={(e) => setFlwDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Horário</label>
                  <input
                    type="time"
                    value={flwTime}
                    onChange={(e) => setFlwTime(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Canal</label>
                  <select
                    value={flwChannel}
                    onChange={(e) => setFlwChannel(e.target.value as FollowUpChannel)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600 bg-white"
                  >
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Ligação">Ligação</option>
                    <option value="E-mail">E-mail</option>
                    <option value="Reunião">Reunião</option>
                    <option value="Presencial">Presencial</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Motivo / Objetivo do Follow-up <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Cobrar resposta sobre proposta de consultoria"
                  value={flwReason}
                  onChange={(e) => setFlwReason(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
                >
                  Agendar Follow-up
                </button>
              </div>
            </form>
          )}

          {/* Tab 4: Interação */}
          {activeTab === 'interaction' && (
            <form onSubmit={handleCreateInteraction} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cliente <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={intClientId}
                  onChange={(e) => setIntClientId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600 bg-white"
                >
                  <option value="">Selecione o cliente...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.corporateName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tipo de Interação</label>
                <select
                  value={intType}
                  onChange={(e) => setIntType(e.target.value as InteractionType)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600 bg-white"
                >
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Ligação">Ligação</option>
                  <option value="E-mail">E-mail</option>
                  <option value="Reunião">Reunião</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Presencial">Presencial</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  O que foi conversado? <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Resumo objetivo do contato realizado..."
                  value={intDescription}
                  onChange={(e) => setIntDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Próxima Ação Definida</label>
                <input
                  type="text"
                  placeholder="Ex: Enviar contrato na sexta-feira às 10h"
                  value={intNextAction}
                  onChange={(e) => setIntNextAction(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
                >
                  Salvar no Histórico
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
