import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search,
  X,
  Building2,
  User,
  CheckSquare,
  Clock,
  FolderKanban,
  FileText,
  File,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { formatBRL, formatDate } from '../utils/formatters';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectClient: (clientId: string, tab?: string) => void;
  onNavigate: (view: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectClient,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { clients, contacts, projects, tasks, followUps, files, proposals, contracts } = useCrm();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;

    const matchedClients = clients.filter(
      (c) =>
        c.corporateName.toLowerCase().includes(q) ||
        (c.tradeName && c.tradeName.toLowerCase().includes(q)) ||
        (c.city && c.city.toLowerCase().includes(q)) ||
        (c.segment && c.segment.toLowerCase().includes(q)) ||
        (c.cpfCnpj && c.cpfCnpj.includes(q))
    );

    const matchedContacts = contacts.filter(
      (cnt) =>
        cnt.name.toLowerCase().includes(q) ||
        (cnt.email && cnt.email.toLowerCase().includes(q)) ||
        (cnt.role && cnt.role.toLowerCase().includes(q))
    );

    const matchedProjects = projects.filter(
      (p) => p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q))
    );

    const matchedTasks = tasks.filter(
      (t) => t.title.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q))
    );

    const matchedFollowUps = followUps.filter(
      (f) => f.reason.toLowerCase().includes(q) || (f.notes && f.notes.toLowerCase().includes(q))
    );

    const matchedFiles = files.filter(
      (fil) => fil.name.toLowerCase().includes(q) || (fil.description && fil.description.toLowerCase().includes(q))
    );

    const matchedProposals = proposals.filter(
      (prp) => prp.serviceName.toLowerCase().includes(q) || (prp.notes && prp.notes.toLowerCase().includes(q))
    );

    const matchedContracts = contracts.filter(
      (ctr) => ctr.serviceName.toLowerCase().includes(q) || (ctr.notes && ctr.notes.toLowerCase().includes(q))
    );

    const totalCount =
      matchedClients.length +
      matchedContacts.length +
      matchedProjects.length +
      matchedTasks.length +
      matchedFollowUps.length +
      matchedFiles.length +
      matchedProposals.length +
      matchedContracts.length;

    return {
      clients: matchedClients,
      contacts: matchedContacts,
      projects: matchedProjects,
      tasks: matchedTasks,
      followUps: matchedFollowUps,
      files: matchedFiles,
      proposals: matchedProposals,
      contracts: matchedContracts,
      totalCount,
    };
  }, [query, clients, contacts, projects, tasks, followUps, files, proposals, contracts]);

  if (!isOpen) return null;

  return (
    <div
      id="modal-global-search-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center pt-16 px-4"
      onClick={onClose}
    >
      <div
        id="modal-global-search-content"
        className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 bg-slate-50/70">
          <Search size={20} className="text-slate-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Pesquisar por cliente, contato, projeto, tarefa, follow-up, arquivo, proposta ou contrato..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-slate-800 placeholder-slate-400 text-sm focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md mr-1"
            >
              <X size={16} />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-200 rounded-md border border-slate-200"
          >
            ESC
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[68vh] overflow-y-auto p-3 space-y-4">
          {!query && (
            <div className="py-12 text-center text-slate-500">
              <Search size={36} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-medium">Busca Global Integrada do CRM</p>
              <p className="text-xs text-slate-400 mt-1">
                Digite para buscar simultaneamente em Clientes, Contatos, Tarefas, Projetos, Arquivos e Propostas.
              </p>
            </div>
          )}

          {query && results && results.totalCount === 0 && (
            <div className="py-12 text-center text-slate-500">
              <p className="text-sm font-medium text-slate-700">Nenhum resultado encontrado para "{query}"</p>
              <p className="text-xs text-slate-400 mt-1">Tente pesquisar por outro termo ou nome da empresa.</p>
            </div>
          )}

          {query && results && results.totalCount > 0 && (
            <div className="space-y-4">
              {/* Clientes */}
              {results.clients.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 mb-1.5 flex items-center gap-1.5">
                    <Building2 size={14} className="text-blue-600" />
                    Clientes & Leads ({results.clients.length})
                  </h4>
                  <div className="space-y-1">
                    {results.clients.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          onSelectClient(c.id, 'informacoes');
                          onClose();
                        }}
                        className="w-full text-left p-2.5 rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-between group"
                      >
                        <div>
                          <div className="font-semibold text-sm text-slate-800 group-hover:text-blue-600">
                            {c.corporateName}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                            {c.tradeName && <span>{c.tradeName} • </span>}
                            <span>{c.segment || 'Geral'}</span>
                            {c.city && <span>• {c.city}/{c.state}</span>}
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-slate-400 group-hover:text-blue-600" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Contatos */}
              {results.contacts.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 mb-1.5 flex items-center gap-1.5">
                    <User size={14} className="text-purple-600" />
                    Contatos ({results.contacts.length})
                  </h4>
                  <div className="space-y-1">
                    {results.contacts.map((cnt) => {
                      const client = clients.find((c) => c.id === cnt.clientId);
                      return (
                        <button
                          key={cnt.id}
                          type="button"
                          onClick={() => {
                            onSelectClient(cnt.clientId, 'contatos');
                            onClose();
                          }}
                          className="w-full text-left p-2.5 rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-between group"
                        >
                          <div>
                            <div className="font-semibold text-sm text-slate-800 group-hover:text-purple-600">
                              {cnt.name}
                            </div>
                            <div className="text-xs text-slate-500">
                              {cnt.role ? `${cnt.role} • ` : ''} Cliente: {client?.corporateName || 'N/A'}
                            </div>
                          </div>
                          <ChevronRight size={16} className="text-slate-400 group-hover:text-purple-600" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tarefas */}
              {results.tasks.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 mb-1.5 flex items-center gap-1.5">
                    <CheckSquare size={14} className="text-emerald-600" />
                    Tarefas ({results.tasks.length})
                  </h4>
                  <div className="space-y-1">
                    {results.tasks.map((t) => {
                      const client = clients.find((c) => c.id === t.clientId);
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => {
                            if (t.clientId) {
                              onSelectClient(t.clientId, 'tarefas');
                            } else {
                              onNavigate('tarefas');
                            }
                            onClose();
                          }}
                          className="w-full text-left p-2.5 rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-between group"
                        >
                          <div>
                            <div className="font-semibold text-sm text-slate-800 group-hover:text-emerald-600">
                              {t.title}
                            </div>
                            <div className="text-xs text-slate-500">
                              {formatDate(t.date)} • {client ? `Cliente: ${client.corporateName}` : 'Geral'}
                            </div>
                          </div>
                          <ChevronRight size={16} className="text-slate-400 group-hover:text-emerald-600" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Follow-ups */}
              {results.followUps.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 mb-1.5 flex items-center gap-1.5">
                    <Clock size={14} className="text-amber-600" />
                    Follow-ups ({results.followUps.length})
                  </h4>
                  <div className="space-y-1">
                    {results.followUps.map((f) => {
                      const client = clients.find((c) => c.id === f.clientId);
                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => {
                            onSelectClient(f.clientId, 'followups');
                            onClose();
                          }}
                          className="w-full text-left p-2.5 rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-between group"
                        >
                          <div>
                            <div className="font-semibold text-sm text-slate-800 group-hover:text-amber-600">
                              {f.reason}
                            </div>
                            <div className="text-xs text-slate-500">
                              {formatDate(f.date)} às {f.time} • Cliente: {client?.corporateName}
                            </div>
                          </div>
                          <ChevronRight size={16} className="text-slate-400 group-hover:text-amber-600" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Projetos */}
              {results.projects.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 mb-1.5 flex items-center gap-1.5">
                    <FolderKanban size={14} className="text-indigo-600" />
                    Projetos ({results.projects.length})
                  </h4>
                  <div className="space-y-1">
                    {results.projects.map((p) => {
                      const client = clients.find((c) => c.id === p.clientId);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            onSelectClient(p.clientId, 'projetos');
                            onClose();
                          }}
                          className="w-full text-left p-2.5 rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-between group"
                        >
                          <div>
                            <div className="font-semibold text-sm text-slate-800 group-hover:text-indigo-600">
                              {p.name}
                            </div>
                            <div className="text-xs text-slate-500">
                              Prazo: {formatDate(p.deadline)} • Cliente: {client?.corporateName}
                            </div>
                          </div>
                          <ChevronRight size={16} className="text-slate-400 group-hover:text-indigo-600" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Arquivos */}
              {results.files.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 mb-1.5 flex items-center gap-1.5">
                    <File size={14} className="text-cyan-600" />
                    Arquivos ({results.files.length})
                  </h4>
                  <div className="space-y-1">
                    {results.files.map((fil) => {
                      const client = clients.find((c) => c.id === fil.clientId);
                      return (
                        <button
                          key={fil.id}
                          type="button"
                          onClick={() => {
                            onSelectClient(fil.clientId, 'arquivos');
                            onClose();
                          }}
                          className="w-full text-left p-2.5 rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-between group"
                        >
                          <div>
                            <div className="font-semibold text-sm text-slate-800 group-hover:text-cyan-600">
                              {fil.name}
                            </div>
                            <div className="text-xs text-slate-500">
                              {fil.category} • {fil.fileSize} • Cliente: {client?.corporateName}
                            </div>
                          </div>
                          <ChevronRight size={16} className="text-slate-400 group-hover:text-cyan-600" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Propostas */}
              {results.proposals.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 mb-1.5 flex items-center gap-1.5">
                    <FileText size={14} className="text-pink-600" />
                    Propostas ({results.proposals.length})
                  </h4>
                  <div className="space-y-1">
                    {results.proposals.map((prp) => {
                      const client = clients.find((c) => c.id === prp.clientId);
                      return (
                        <button
                          key={prp.id}
                          type="button"
                          onClick={() => {
                            onSelectClient(prp.clientId, 'propostas');
                            onClose();
                          }}
                          className="w-full text-left p-2.5 rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-between group"
                        >
                          <div>
                            <div className="font-semibold text-sm text-slate-800 group-hover:text-pink-600">
                              {prp.serviceName} ({formatBRL(prp.value)})
                            </div>
                            <div className="text-xs text-slate-500">
                              Status: {prp.status} • Cliente: {client?.corporateName}
                            </div>
                          </div>
                          <ChevronRight size={16} className="text-slate-400 group-hover:text-pink-600" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Contratos */}
              {results.contracts.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 mb-1.5 flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-emerald-600" />
                    Contratos ({results.contracts.length})
                  </h4>
                  <div className="space-y-1">
                    {results.contracts.map((ctr) => {
                      const client = clients.find((c) => c.id === ctr.clientId);
                      return (
                        <button
                          key={ctr.id}
                          type="button"
                          onClick={() => {
                            onSelectClient(ctr.clientId, 'contratos');
                            onClose();
                          }}
                          className="w-full text-left p-2.5 rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-between group"
                        >
                          <div>
                            <div className="font-semibold text-sm text-slate-800 group-hover:text-emerald-600">
                              {ctr.serviceName} ({formatBRL(ctr.value)})
                            </div>
                            <div className="text-xs text-slate-500">
                              Vencimento: {formatDate(ctr.endDate)} • Cliente: {client?.corporateName}
                            </div>
                          </div>
                          <ChevronRight size={16} className="text-slate-400 group-hover:text-emerald-600" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
