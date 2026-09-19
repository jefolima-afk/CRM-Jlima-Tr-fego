import React, { useState } from 'react';
import { FileText, Plus, Search, Building2, Calendar, DollarSign, Check, XCircle } from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { ProposalStatus } from '../types';
import { formatBRL, formatDate, getTodayString } from '../utils/formatters';

interface ProposalsViewProps {
  onSelectClient: (clientId: string, tab?: string) => void;
}

export const ProposalsView: React.FC<ProposalsViewProps> = ({ onSelectClient }) => {
  const { proposals, clients, addProposal, updateProposal, canEdit } = useCrm();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Proposal Form
  const [clientId, setClientId] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [value, setValue] = useState(0);
  const [sentDate, setSentDate] = useState(getTodayString());
  const [validUntil, setValidUntil] = useState(getTodayString());
  const [notes, setNotes] = useState('');

  const filteredProposals = proposals.filter((p) => {
    const client = clients.find((c) => c.id === p.clientId);
    const q = searchTerm.toLowerCase();

    if (
      searchTerm &&
      !p.serviceName.toLowerCase().includes(q) &&
      (!client || !client.corporateName.toLowerCase().includes(q))
    ) {
      return false;
    }

    if (statusFilter !== 'all' && p.status !== statusFilter) return false;

    return true;
  });

  const handleCreateProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !serviceName.trim()) return;

    addProposal({
      clientId,
      serviceName: serviceName.trim(),
      value: Number(value) || 0,
      sentDate,
      validUntil: validUntil || getTodayString(),
      status: 'sent',
      notes: notes.trim() || undefined,
    });

    setIsModalOpen(false);
    setServiceName('');
    setValue(0);
    setNotes('');
  };

  return (
    <div id="view-proposals" className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Propostas Comerciais</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Acompanhe orçamentos enviados, valores em negociação e taxas de aprovação.
          </p>
        </div>
        {canEdit && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
          >
            <Plus size={16} />
            <span>Nova Proposta</span>
          </button>
        )}
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por serviço ou cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-blue-600"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-blue-600 bg-white"
          >
            <option value="all">Todos os Status</option>
            <option value="draft">Em Elaboração</option>
            <option value="sent">Enviada</option>
            <option value="approved">Aprovada</option>
            <option value="rejected">Rejeitada</option>
          </select>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Cliente / Empresa</th>
                <th className="px-4 py-3">Serviço / Escopo</th>
                <th className="px-4 py-3">Valor da Proposta</th>
                <th className="px-4 py-3">Enviada / Validade</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredProposals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-slate-400">
                    <FileText size={36} className="mx-auto text-slate-300 mb-2" />
                    <div className="font-semibold text-slate-700 text-xs">Nenhuma proposta encontrada</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Crie propostas e orçamentos comerciais para enviar aos seus clientes e leads.
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProposals.map((prp) => {
                const client = clients.find((c) => c.id === prp.clientId);
                return (
                  <tr key={prp.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {client ? (
                        <button
                          type="button"
                          onClick={() => onSelectClient(client.id, 'propostas')}
                          className="hover:text-blue-600 text-left"
                        >
                          {client.corporateName}
                        </button>
                      ) : (
                        'Geral'
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">{prp.serviceName}</div>
                      {prp.notes && <div className="text-[11px] text-slate-500 mt-0.5">{prp.notes}</div>}
                    </td>
                    <td className="px-4 py-3 font-bold font-mono text-slate-900">
                      {formatBRL(prp.value)}
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-mono">
                      <div>Enviada: {formatDate(prp.sentDate)}</div>
                      {prp.validUntil && <div>Validade: {formatDate(prp.validUntil)}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md ${
                          prp.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : prp.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {prp.status === 'approved'
                          ? 'Aprovada'
                          : prp.status === 'rejected'
                          ? 'Rejeitada'
                          : prp.status === 'sent'
                          ? 'Enviada'
                          : 'Rascunho'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {canEdit && prp.status === 'sent' && (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => updateProposal(prp.id, { status: 'approved' })}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded"
                            title="Aprovar proposta"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => updateProposal(prp.id, { status: 'rejected' })}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                            title="Rejeitar proposta"
                          >
                            <XCircle size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nova Proposta */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="font-bold text-base text-slate-900 mb-3">Nova Proposta Comercial</h3>
            <form onSubmit={handleCreateProposal} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Cliente *</label>
                <select
                  required
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
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
                <label className="block font-semibold mb-1">Serviço / Escopo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Consultoria de Gestão e Processos"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Valor da Proposta (R$) *</label>
                <input
                  type="number"
                  step="100"
                  required
                  value={value || ''}
                  onChange={(e) => setValue(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Data de Envio</label>
                  <input
                    type="date"
                    value={sentDate}
                    onChange={(e) => setSentDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Validade</label>
                  <input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Observações da Proposta</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg">
                  Criar Proposta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
