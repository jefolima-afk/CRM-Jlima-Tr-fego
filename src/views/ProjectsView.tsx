import React, { useState } from 'react';
import { FolderKanban, Plus, Building2, Calendar, CheckCircle2, Search, Trash2 } from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { ProjectStatus } from '../types';
import { formatDate, getTodayString } from '../utils/formatters';

interface ProjectsViewProps {
  onSelectClient: (clientId: string, tab?: string) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({ onSelectClient }) => {
  const { projects, clients, currentUser, addProject, updateProject, deleteProject, canEdit } = useCrm();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Project Form
  const [name, setName] = useState('');
  const [clientId, setClientId] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState(getTodayString());
  const [status, setStatus] = useState<ProjectStatus>('planning');

  const filteredProjects = projects.filter((p) => {
    const client = clients.find((c) => c.id === p.clientId);
    const q = searchTerm.toLowerCase();
    return (
      !searchTerm ||
      p.name.toLowerCase().includes(q) ||
      (client && client.corporateName.toLowerCase().includes(q))
    );
  });

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !clientId) return;

    addProject({
      clientId,
      name: name.trim(),
      description: description.trim(),
      responsibleUserId: currentUser.id,
      deadline: deadline || getTodayString(),
      status,
    });

    setIsModalOpen(false);
    setName('');
    setDescription('');
    setClientId('');
  };

  return (
    <div id="view-projects" className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Gestão de Projetos</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Acompanhe a entrega, fases e prazos de projetos contratados pelos clientes.
          </p>
        </div>
        {canEdit && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
          >
            <Plus size={16} />
            <span>Novo Projeto</span>
          </button>
        )}
      </div>

      {/* Search */}
      <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome do projeto ou cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-blue-600"
          />
        </div>
      </div>

      {/* Projects List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProjects.map((prj) => {
          const client = clients.find((c) => c.id === prj.clientId);
          return (
            <div
              key={prj.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:border-blue-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 leading-snug">{prj.name}</h3>
                    {client && (
                      <button
                        type="button"
                        onClick={() => onSelectClient(client.id, 'projetos')}
                        className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1.5 mt-1"
                      >
                        <Building2 size={13} /> {client.corporateName}
                      </button>
                    )}
                  </div>
                  <span
                    className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                      prj.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : prj.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {prj.status === 'completed'
                      ? 'Concluído'
                      : prj.status === 'in_progress'
                      ? 'Em Andamento'
                      : 'Planejamento'}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{prj.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1 font-mono">
                  <Calendar size={13} /> Prazo: {formatDate(prj.deadline)}
                </span>

                {canEdit && (
                  <button
                    type="button"
                    onClick={() => deleteProject(prj.id)}
                    className="text-slate-400 hover:text-red-600 p-1"
                    title="Excluir projeto"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Novo Projeto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="font-bold text-base text-slate-900 mb-3">Novo Projeto</h3>
            <form onSubmit={handleCreateProject} className="space-y-3 text-xs">
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
                <label className="block font-semibold mb-1">Nome do Projeto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Reestruturação Comercial e Treinamento"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Descrição do Escopo</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Prazo de Entrega</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="planning">Planejamento</option>
                    <option value="in_progress">Em Andamento</option>
                    <option value="completed">Concluído</option>
                  </select>
                </div>
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
                  Salvar Projeto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
