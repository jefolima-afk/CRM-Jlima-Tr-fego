import React, { useState } from 'react';
import { ShieldCheck, Plus, Search, Building2, Calendar, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { formatBRL, formatDate, isDateOverdue, getTodayString } from '../utils/formatters';

interface ContractsViewProps {
  onSelectClient: (clientId: string, tab?: string) => void;
}

export const ContractsView: React.FC<ContractsViewProps> = ({ onSelectClient }) => {
  const { contracts, clients, addContract, updateContract, canEdit } = useCrm();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Contract Form
  const [clientId, setClientId] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [value, setValue] = useState(0);
  const [startDate, setStartDate] = useState(getTodayString());
  const [endDate, setEndDate] = useState('');
  const [renewal, setRenewal] = useState('Automática anual');

  const filteredContracts = contracts.filter((c) => {
    const client = clients.find((cl) => cl.id === c.clientId);
    const q = searchTerm.toLowerCase();
    return (
      !searchTerm ||
      c.serviceName.toLowerCase().includes(q) ||
      (client && client.corporateName.toLowerCase().includes(q))
    );
  });

  const handleCreateContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !serviceName.trim() || !endDate) return;

    addContract({
      clientId,
      serviceName: serviceName.trim(),
      value: Number(value) || 0,
      startDate,
      endDate,
      status: 'active',
      renewal,
    });

    setIsModalOpen(false);
    setServiceName('');
    setValue(0);
    setEndDate('');
  };

  return (
    <div id="view-contracts" className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Gestão de Contratos</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Controle vigências, valores contratuais e alertas automáticos de renovação.
          </p>
        </div>
        {canEdit && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
          >
            <Plus size={16} />
            <span>Novo Contrato</span>
          </button>
        )}
      </div>

      {/* Search */}
      <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar contrato por cliente ou serviço..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-blue-600"
          />
        </div>
      </div>

      {/* Contracts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredContracts.map((ctr) => {
          const client = clients.find((c) => c.id === ctr.clientId);
          const isExpiring = (() => {
            const today = new Date();
            const end = new Date(ctr.endDate);
            const diffDays = (end.getTime() - today.getTime()) / (1000 * 3600 * 24);
            return diffDays <= 45 && diffDays >= 0;
          })();

          return (
            <div
              key={ctr.id}
              className={`bg-white rounded-xl border p-5 shadow-2xs transition-all flex flex-col justify-between space-y-3 ${
                isExpiring ? 'border-orange-300 bg-orange-50/20' : 'border-slate-200 hover:border-blue-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 leading-snug">
                      {ctr.serviceName}
                    </h3>
                    {client && (
                      <button
                        type="button"
                        onClick={() => onSelectClient(client.id, 'contratos')}
                        className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1.5 mt-1"
                      >
                        <Building2 size={13} /> {client.corporateName}
                      </button>
                    )}
                  </div>

                  <span
                    className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                      ctr.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {ctr.status === 'active' ? 'Vigente' : 'Encerrado'}
                  </span>
                </div>

                {isExpiring && (
                  <div className="mt-2.5 p-2 rounded-lg bg-orange-100/80 border border-orange-300 text-orange-900 text-xs font-semibold flex items-center gap-1.5">
                    <AlertTriangle size={14} className="shrink-0" />
                    Contrato próximo do vencimento! Preparar renovação.
                  </div>
                )}

                <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Valor Contratual:</span>
                    <strong className="text-sm font-mono text-emerald-700">{formatBRL(ctr.value)}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Início:</span>
                    <span className="font-mono">{formatDate(ctr.startDate)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Vencimento:</span>
                    <strong className="font-mono text-slate-900">{formatDate(ctr.endDate)}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Cláusula de Renovação:</span>
                    <span>{ctr.renewal}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => onSelectClient(ctr.clientId, 'contratos')}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  Abrir ficha do contrato
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Novo Contato */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="font-bold text-base text-slate-900 mb-3">Cadastrar Novo Contrato</h3>
            <form onSubmit={handleCreateContract} className="space-y-3 text-xs">
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
                <label className="block font-semibold mb-1">Serviço Contratado *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Contrato Anual de Suporte e Desenvolvimento"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Valor Contratado (R$) *</label>
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
                  <label className="block font-semibold mb-1">Data de Início</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Data Término *</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Renovação</label>
                <input
                  type="text"
                  placeholder="Ex: Renovação automática a cada 12 meses"
                  value={renewal}
                  onChange={(e) => setRenewal(e.target.value)}
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
                  Salvar Contrato
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
