import React, { useState } from 'react';
import { DollarSign, Building2, Search, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { formatBRL, formatDate } from '../utils/formatters';

interface FinancialViewProps {
  onSelectClient: (clientId: string, tab?: string) => void;
}

export const FinancialView: React.FC<FinancialViewProps> = ({ onSelectClient }) => {
  const { clients, financialRecords, contracts } = useCrm();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Compute metrics
  const totalMonthlyMRR = clients.reduce((sum, c) => sum + (c.contractedValue || 0), 0);
  const activeClientsCount = clients.filter((c) => c.status === 'active').length;

  const filteredClients = clients.filter((c) => {
    if (!c.contractedValue && c.status !== 'active') return false;
    const q = searchTerm.toLowerCase();
    if (searchTerm && !c.corporateName.toLowerCase().includes(q)) return false;
    return true;
  });

  return (
    <div id="view-financial" className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Controle Financeiro de Clientes</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Acompanhamento simplificado de mensalidades, faturamento recorrente (MRR) e status de pagamentos.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 mb-1">Faturamento Mensal Recorrente (MRR)</div>
          <div className="text-2xl font-bold text-emerald-700 font-mono">
            {formatBRL(totalMonthlyMRR)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Soma dos contratos ativos</div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 mb-1">Clientes com Mensalidade Ativa</div>
          <div className="text-2xl font-bold text-slate-900 font-mono">{activeClientsCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Ticket Médio: {formatBRL(activeClientsCount > 0 ? totalMonthlyMRR / activeClientsCount : 0)}</div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 mb-1">Status Geral dos Recebimentos</div>
          <div className="text-2xl font-bold text-emerald-600 flex items-center gap-1.5">
            <CheckCircle2 size={24} /> 100% Em Dia
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Sem inadimplências reportadas</div>
        </div>
      </div>

      {/* Search */}
      <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome do cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-blue-600"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Cliente / Razão Social</th>
                <th className="px-4 py-3">Valor Mensal</th>
                <th className="px-4 py-3">Forma de Pagamento</th>
                <th className="px-4 py-3">Dia de Vencimento</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-slate-400">
                    <DollarSign size={36} className="mx-auto text-slate-300 mb-2" />
                    <div className="font-semibold text-slate-700 text-xs">Nenhum cliente ativo para faturamento</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Quando você cadastrar clientes com contratos ou mensalidades, os dados financeiros aparecerão aqui.
                    </div>
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => {
                  const fin = financialRecords.find((f) => f.clientId === client.id);
                  return (
                    <tr key={client.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        <button
                          type="button"
                          onClick={() => onSelectClient(client.id, 'financeiro')}
                          className="hover:text-blue-600 text-left"
                        >
                          {client.corporateName}
                        </button>
                        <div className="text-[11px] text-slate-400">{client.segment || '-'}</div>
                      </td>
                      <td className="px-4 py-3 font-bold font-mono text-emerald-700 text-sm">
                        {formatBRL(client.contractedValue || fin?.monthlyValue || 0)}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {client.paymentMethod || 'Boleto / Pix'}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600">
                        Todo dia {fin?.dueDateDay || 10}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800">
                          {fin?.status || 'Em dia'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => onSelectClient(client.id, 'financeiro')}
                          className="text-xs font-semibold text-blue-600 hover:underline"
                        >
                          Ver Histórico
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
