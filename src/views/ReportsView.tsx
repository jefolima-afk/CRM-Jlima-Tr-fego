import React from 'react';
import { BarChart3, TrendingUp, Users, DollarSign, Award, Target, PieChart } from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { formatBRL } from '../utils/formatters';

export const ReportsView: React.FC = () => {
  const { clients, proposals, contracts, stats, pipelineStages } = useCrm();

  // Conversion rate calculations
  const totalClients = clients.length;
  const activeClients = clients.filter((c) => c.status === 'active').length;
  const wonRate = totalClients > 0 ? Math.round((activeClients / totalClients) * 100) : 0;

  // Lead sources breakdown
  const sourceCounts: { [key: string]: number } = {};
  clients.forEach((c) => {
    const src = c.leadSource || 'Outros';
    sourceCounts[src] = (sourceCounts[src] || 0) + 1;
  });

  // Services breakdown
  const serviceCounts: { [key: string]: { count: number; totalValue: number } } = {};
  clients.forEach((c) => {
    const srv = c.interestedService || 'Geral';
    if (!serviceCounts[srv]) {
      serviceCounts[srv] = { count: 0, totalValue: 0 };
    }
    serviceCounts[srv].count += 1;
    serviceCounts[srv].totalValue += c.contractedValue || c.potentialValue || 0;
  });

  return (
    <div id="view-reports" className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Relatórios & Indicadores</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Métricas consolidadas de conversão comercial, origens de leads e desempenho da carteira.
        </p>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">Taxa de Conversão</span>
            <TrendingUp size={18} className="text-emerald-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900">{wonRate}%</div>
          <div className="text-xs text-slate-400 mt-1">Leads convertidos em clientes ativos</div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">Pipeline Total</span>
            <DollarSign size={18} className="text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">
            {formatBRL(stats.totalPipelineValue)}
          </div>
          <div className="text-xs text-slate-400 mt-1">Oportunidades em aberto</div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">Faturamento Recorrente</span>
            <Award size={18} className="text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 font-mono">
            {formatBRL(clients.reduce((acc, c) => acc + (c.contractedValue || 0), 0))}
          </div>
          <div className="text-xs text-slate-400 mt-1">Soma dos contratos mensais</div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">Propostas Aprovadas</span>
            <Target size={18} className="text-pink-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900">
            {proposals.filter((p) => p.status === 'approved').length}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            De um total de {proposals.length} propostas
          </div>
        </div>
      </div>

      {/* Two Columns Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Origem dos Leads */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <PieChart size={16} className="text-blue-600" />
            Origem dos Leads e Clientes
          </h3>

          <div className="space-y-3">
            {Object.entries(sourceCounts).map(([source, count]) => {
              const pct = Math.round((count / totalClients) * 100);
              return (
                <div key={source} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{source}</span>
                    <span className="text-slate-500 font-mono">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Serviços mais demandados */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <BarChart3 size={16} className="text-emerald-600" />
            Serviços em Carteira & Valores
          </h3>

          <div className="space-y-3">
            {Object.entries(serviceCounts).map(([service, data]) => {
              return (
                <div
                  key={service}
                  className="p-3 rounded-lg border border-slate-100 bg-slate-50/60 flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-xs text-slate-900">{service}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {data.count} cliente(s) / proposta(s)
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold font-mono text-emerald-700">
                      {formatBRL(data.totalValue)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
