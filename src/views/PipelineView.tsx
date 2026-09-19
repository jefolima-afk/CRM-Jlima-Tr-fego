import React, { useState } from 'react';
import {
  Kanban,
  Plus,
  ArrowRight,
  Clock,
  User,
  DollarSign,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Filter,
} from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { PipelineStageId, Client } from '../types';
import { formatBRL, formatDate } from '../utils/formatters';
import { WhatsAppButton } from '../components/WhatsAppButton';

interface PipelineViewProps {
  onSelectClient: (clientId: string, tab?: string) => void;
  onOpenQuickCreate: (type?: string) => void;
}

export const PipelineView: React.FC<PipelineViewProps> = ({
  onSelectClient,
  onOpenQuickCreate,
}) => {
  const { clients, pipelineStages, users, followUps, updateClient, canEdit } = useCrm();
  const [responsibleFilter, setResponsibleFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Drag and drop state
  const [draggedClientId, setDraggedClientId] = useState<string | null>(null);

  // Filter clients
  const filteredClients = clients.filter((c) => {
    if (responsibleFilter !== 'all' && c.assignedUserId !== responsibleFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = c.corporateName.toLowerCase().includes(q) || (c.tradeName && c.tradeName.toLowerCase().includes(q));
      if (!matchName) return false;
    }
    return true;
  });

  const handleDragStart = (e: React.DragEvent, clientId: string) => {
    setDraggedClientId(clientId);
    e.dataTransfer.setData('text/plain', clientId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStageId: PipelineStageId) => {
    e.preventDefault();
    const clientId = e.dataTransfer.getData('text/plain') || draggedClientId;
    if (clientId) {
      updateClient(clientId, { pipelineStage: targetStageId });
    }
    setDraggedClientId(null);
  };

  return (
    <div id="view-pipeline" className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Pipeline Comercial</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Acompanhe a evolução de leads em cada etapa do funil de vendas (arraste ou mova entre as colunas).
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <button
              id="btn-pipeline-new-lead"
              type="button"
              onClick={() => onOpenQuickCreate('client')}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
            >
              <Plus size={16} />
              <span>Novo Lead / Oportunidade</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Filtrar por nome do cliente ou lead..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-blue-600 w-64 bg-white"
          />
          <select
            value={responsibleFilter}
            onChange={(e) => setResponsibleFilter(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-blue-600 bg-white"
          >
            <option value="all">Todos os Responsáveis</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-2">
          <span>Dica: <strong>Arraste os cards</strong> para avançar no funil</span>
        </div>
      </div>

      {/* Kanban Board Container (Horizontally Scrollable) */}
      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 items-start min-h-[calc(100vh-280px)] scrollbar-thin">
        {pipelineStages.map((stage, stageIndex) => {
          const stageClients = filteredClients.filter((c) => c.pipelineStage === stage.id);
          const stageTotalValue = stageClients.reduce(
            (sum, c) => sum + (c.potentialValue || c.contractedValue || 0),
            0
          );

          return (
            <div
              key={stage.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
              className="w-72 shrink-0 bg-slate-100/80 rounded-xl border border-slate-200 flex flex-col max-h-[calc(100vh-290px)]"
            >
              {/* Stage Header */}
              <div className="p-3 border-b border-slate-200/80 bg-slate-50 rounded-t-xl shrink-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: stage.color }}
                    />
                    <h3 className="text-xs font-bold text-slate-900 tracking-tight">
                      {stage.name}
                    </h3>
                  </div>
                  <span className="text-xs bg-white text-slate-700 px-2 py-0.5 rounded-full border border-slate-200 font-bold">
                    {stageClients.length}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-500 font-semibold">
                  {formatBRL(stageTotalValue)}
                </div>
              </div>

              {/* Stage Cards List */}
              <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 scrollbar-thin">
                {stageClients.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs italic border border-dashed border-slate-300 rounded-lg bg-white/40">
                    Nenhum lead nesta etapa
                  </div>
                ) : (
                  stageClients.map((client) => {
                    const user = users.find((u) => u.id === client.assignedUserId);
                    const nextFollowUp = followUps.find(
                      (f) => f.clientId === client.id && f.status === 'pending'
                    );

                    return (
                      <div
                        key={client.id}
                        draggable={canEdit}
                        onDragStart={(e) => handleDragStart(e, client.id)}
                        onClick={() => onSelectClient(client.id)}
                        className="p-3 rounded-xl bg-white border border-slate-200 hover:border-blue-400 shadow-2xs hover:shadow-xs transition-all cursor-pointer group space-y-2.5"
                      >
                        {/* Title & value */}
                        <div>
                          <div className="font-bold text-xs text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                            {client.corporateName}
                          </div>
                          {client.tradeName && (
                            <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                              {client.tradeName}
                            </div>
                          )}
                          <div className="text-xs font-mono font-bold text-emerald-700 mt-1.5">
                            {client.contractedValue
                              ? `${formatBRL(client.contractedValue)} /mês`
                              : client.potentialValue
                              ? formatBRL(client.potentialValue)
                              : 'R$ 0,00'}
                          </div>
                        </div>

                        {/* Responsible and date */}
                        <div className="text-[11px] text-slate-500 space-y-1 pt-1 border-t border-slate-100">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1 text-slate-600">
                              <User size={12} className="text-slate-400" />
                              {user?.name || 'Equipe'}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {formatDate(client.firstContactDate)}
                            </span>
                          </div>

                          {/* Next follow up info */}
                          {nextFollowUp && (
                            <div className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded flex items-center gap-1 truncate">
                              <Clock size={10} className="shrink-0" />
                              <span className="truncate">
                                Follow-up: {formatDate(nextFollowUp.date)}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* WhatsApp Button + Move Stage Controls */}
                        <div
                          className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <WhatsAppButton number={client.whatsapp} variant="compact" />

                          {canEdit && (
                            <div className="flex items-center gap-0.5">
                              {stageIndex > 0 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateClient(client.id, {
                                      pipelineStage: pipelineStages[stageIndex - 1].id,
                                    })
                                  }
                                  className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                                  title={`Voltar para ${pipelineStages[stageIndex - 1].name}`}
                                >
                                  <ChevronLeft size={14} />
                                </button>
                              )}
                              {stageIndex < pipelineStages.length - 1 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateClient(client.id, {
                                      pipelineStage: pipelineStages[stageIndex + 1].id,
                                    })
                                  }
                                  className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded"
                                  title={`Avançar para ${pipelineStages[stageIndex + 1].name}`}
                                >
                                  <ChevronRight size={14} />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
