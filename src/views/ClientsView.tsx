import React, { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Building2,
  Phone,
  Mail,
  MapPin,
  Tag,
  ExternalLink,
  ChevronRight,
  MoreVertical,
  Edit2,
  Trash2,
  DollarSign,
  Briefcase,
  LayoutGrid,
  List,
} from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { Client, ClientStatus } from '../types';
import { formatBRL, formatDate, maskCpfCnpj } from '../utils/formatters';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { ClientModal } from './ClientModal';

interface ClientsViewProps {
  onSelectClient: (clientId: string, tab?: string) => void;
  defaultStatusFilter?: ClientStatus | 'all';
  viewTitle?: string;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  onSelectClient,
  defaultStatusFilter = 'all',
  viewTitle = 'Gestão de Clientes & Leads',
}) => {
  const { clients, users, services, deleteClient, canEdit, isAdmin } = useCrm();

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(defaultStatusFilter);
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [responsibleFilter, setResponsibleFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);

  // Extract unique cities for filter dropdown
  const uniqueCities = useMemo(() => {
    const set = new Set<string>();
    clients.forEach((c) => {
      if (c.city) set.add(c.city);
    });
    return Array.from(set).sort();
  }, [clients]);

  // Filtered clients list
  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      // Search term
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        c.corporateName.toLowerCase().includes(searchLower) ||
        (c.tradeName && c.tradeName.toLowerCase().includes(searchLower)) ||
        (c.cpfCnpj && c.cpfCnpj.includes(searchTerm)) ||
        (c.city && c.city.toLowerCase().includes(searchLower)) ||
        (c.segment && c.segment.toLowerCase().includes(searchLower));

      if (!matchesSearch) return false;

      // Status
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;

      // Service
      if (serviceFilter !== 'all' && c.interestedService !== serviceFilter) return false;

      // City
      if (cityFilter !== 'all' && c.city !== cityFilter) return false;

      // Responsible
      if (responsibleFilter !== 'all' && c.assignedUserId !== responsibleFilter) return false;

      return true;
    });
  }, [clients, searchTerm, statusFilter, serviceFilter, cityFilter, responsibleFilter]);

  const handleDelete = (e: React.MouseEvent, client: Client) => {
    e.stopPropagation();
    if (!isAdmin) {
      alert('Apenas administradores podem excluir clientes do sistema.');
      return;
    }
    if (confirm(`Tem certeza que deseja excluir o cliente "${client.corporateName}"? Todos os contatos, tarefas e arquivos vinculados também serão removidos.`)) {
      deleteClient(client.id);
    }
  };

  const handleEdit = (e: React.MouseEvent, client: Client) => {
    e.stopPropagation();
    setClientToEdit(client);
    setIsModalOpen(true);
  };

  const getStatusBadge = (status: ClientStatus) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">Ativo</span>;
      case 'lead':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Lead</span>;
      case 'in_negotiation':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">Em Negociação</span>;
      case 'inactive':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-600">Inativo</span>;
    }
  };

  return (
    <div id="view-clients" className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{viewTitle}</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Gerencie carteira de clientes, leads qualificados, dados estratégicos e históricos comerciais.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <button
              id="btn-add-client"
              type="button"
              onClick={() => {
                setClientToEdit(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
            >
              <Plus size={16} />
              <span>Novo Cliente</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Text search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por razão social, nome fantasia, CNPJ, segmento ou cidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600 bg-white"
            />
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-1 bg-slate-50 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md ${
                viewMode === 'table' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Visualização em Lista / Tabela"
            >
              <List size={16} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md ${
                viewMode === 'grid' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Visualização em Cards"
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>

        {/* Modular dropdown filters (Section 18) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100 text-xs">
          {/* Filter: Status */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-blue-600"
            >
              <option value="all">Todos os Status</option>
              <option value="active">Clientes Ativos</option>
              <option value="in_negotiation">Em Negociação</option>
              <option value="lead">Leads Novos</option>
              <option value="inactive">Inativos</option>
            </select>
          </div>

          {/* Filter: Serviço */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Serviço de Interesse</label>
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-blue-600"
            >
              <option value="all">Todos os Serviços</option>
              {services.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter: Cidade */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Cidade</label>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-blue-600"
            >
              <option value="all">Todas as Cidades</option>
              {uniqueCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Filter: Responsável */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Responsável</label>
            <select
              value={responsibleFilter}
              onChange={(e) => setResponsibleFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-blue-600"
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
      </div>

      {/* Results Count & Quick Status */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>Exibindo <strong>{filteredClients.length}</strong> clientes/leads encontrados</span>
        {(statusFilter !== 'all' || serviceFilter !== 'all' || cityFilter !== 'all' || responsibleFilter !== 'all' || searchTerm) && (
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setServiceFilter('all');
              setCityFilter('all');
              setResponsibleFilter('all');
            }}
            className="text-blue-600 hover:underline font-semibold"
          >
            Limpar Filtros
          </button>
        )}
      </div>

      {/* Empty State */}
      {filteredClients.length === 0 && (
        <div className="py-16 text-center bg-white rounded-xl border border-slate-200 p-8">
          <Building2 size={40} className="mx-auto text-slate-300 mb-2" />
          <h3 className="font-semibold text-slate-800 text-sm">Nenhum cliente ou lead cadastrado</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Sua base está limpa e pronta para receber seus clientes e leads comerciais.
          </p>
          {canEdit && (
            <button
              type="button"
              onClick={() => {
                setClientToEdit(null);
                setIsModalOpen(true);
              }}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
            >
              <Plus size={15} /> Cadastrar Primeiro Cliente
            </button>
          )}
        </div>
      )}

      {/* TABLE VIEW */}
      {viewMode === 'table' && filteredClients.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Cliente / Empresa</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">WhatsApp</th>
                  <th className="px-4 py-3">Segmento & Cidade</th>
                  <th className="px-4 py-3">Serviço / Valor</th>
                  <th className="px-4 py-3">Responsável</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClients.map((client) => {
                  const responsible = users.find((u) => u.id === client.assignedUserId);
                  return (
                    <tr
                      key={client.id}
                      onClick={() => onSelectClient(client.id)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {client.corporateName}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                          {client.tradeName && <span>{client.tradeName}</span>}
                          {client.cpfCnpj && <span>• {maskCpfCnpj(client.cpfCnpj)}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {getStatusBadge(client.status)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <WhatsAppButton number={client.whatsapp} variant="compact" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs font-medium text-slate-800">{client.segment || '-'}</div>
                        <div className="text-[11px] text-slate-400">
                          {client.city ? `${client.city}/${client.state || ''}` : '-'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs font-medium text-slate-800">
                          {client.interestedService || '-'}
                        </div>
                        <div className="text-[11px] font-mono text-emerald-700 font-semibold">
                          {client.contractedValue
                            ? `${formatBRL(client.contractedValue)} /mês`
                            : client.potentialValue
                            ? `Potencial: ${formatBRL(client.potentialValue)}`
                            : '-'}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-xs text-slate-700">{responsible?.name || 'Geral'}</div>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          {canEdit && (
                            <button
                              type="button"
                              onClick={(e) => handleEdit(e, client)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors"
                              title="Editar cliente"
                            >
                              <Edit2 size={15} />
                            </button>
                          )}
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={(e) => handleDelete(e, client)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              title="Excluir cliente"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onSelectClient(client.id)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors"
                            title="Abrir ficha individual"
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* GRID VIEW */}
      {viewMode === 'grid' && filteredClients.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => {
            const responsible = users.find((u) => u.id === client.assignedUserId);
            return (
              <div
                key={client.id}
                onClick={() => onSelectClient(client.id)}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:shadow-xs hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    {getStatusBadge(client.status)}
                    <span className="text-[11px] text-slate-400 font-medium">
                      {responsible?.name}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                    {client.corporateName}
                  </h3>
                  {client.tradeName && (
                    <div className="text-xs text-slate-500 mt-0.5">{client.tradeName}</div>
                  )}

                  <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                    {client.segment && (
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Tag size={13} className="text-slate-400 shrink-0" />
                        <span className="truncate">{client.segment}</span>
                      </div>
                    )}
                    {client.city && (
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <MapPin size={13} className="text-slate-400 shrink-0" />
                        <span>{client.city}/{client.state || ''}</span>
                      </div>
                    )}
                    {client.interestedService && (
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Briefcase size={13} className="text-slate-400 shrink-0" />
                        <span className="truncate">{client.interestedService}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                  <WhatsAppButton number={client.whatsapp} variant="compact" />
                  <div className="text-right">
                    <div className="text-xs font-bold text-emerald-700 font-mono">
                      {client.contractedValue
                        ? formatBRL(client.contractedValue)
                        : client.potentialValue
                        ? formatBRL(client.potentialValue)
                        : 'Sob consulta'}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {client.contractedValue ? 'Contratado' : 'Potencial'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for Create/Edit */}
      <ClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        clientToEdit={clientToEdit}
        onSaved={(clientId) => onSelectClient(clientId)}
      />
    </div>
  );
};
