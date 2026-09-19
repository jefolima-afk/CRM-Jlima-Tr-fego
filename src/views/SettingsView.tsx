import React, { useState } from 'react';
import {
  Settings,
  Users,
  Shield,
  Briefcase,
  Database,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  Plus,
  Trash2,
} from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { User, UserRole } from '../types';

export const SettingsView: React.FC = () => {
  const {
    users,
    currentUser,
    setCurrentUser,
    updateUser,
    services,
    addService,
    deleteService,
    resetDemoData,
    exportDataJson,
    importDataJson,
    isAdmin,
    canEdit,
  } = useCrm();

  const [newServiceName, setNewServiceName] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);

  // Restore JSON
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        const success = importDataJson(json);
        if (success) {
          setImportSuccess(true);
          setTimeout(() => setImportSuccess(false), 3000);
        } else {
          alert('Arquivo JSON de backup inválido.');
        }
      } catch (err) {
        alert('Arquivo JSON de backup inválido.');
      }
    };
    reader.readAsText(file);
  };

  const handleAddServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim()) return;
    addService({
      name: newServiceName.trim(),
      description: 'Serviço adicionado via configurações',
      defaultPrice: 0,
      isRecurring: true,
      status: 'active',
    });
    setNewServiceName('');
  };

  const handleResetSeed = () => {
    if (window.confirm('Tem certeza que deseja restaurar os dados de exemplo padrão?')) {
      resetDemoData();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    }
  };

  const handleRoleChange = (targetUser: User, newRole: UserRole) => {
    const roleLabels: Record<UserRole, string> = {
      admin: 'Administrador',
      collaborator: 'Colaborador',
      viewer: 'Visualização',
    };
    updateUser({
      ...targetUser,
      role: newRole,
      roleLabel: roleLabels[newRole],
    });
  };

  return (
    <div id="view-settings" className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Configurações do Sistema</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Gerenciamento de usuários, permissões de acesso, serviços cadastrados e backup do banco de dados.
        </p>
      </div>

      {/* Current User Session Status */}
      <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs text-blue-700 font-semibold uppercase tracking-wider">
            Sessão Ativa
          </span>
          <div className="font-bold text-slate-900 text-sm mt-0.5">
            Você está logado como: <span className="text-blue-700">{currentUser.name}</span> ({currentUser.email})
          </div>
          <div className="text-xs text-slate-600 mt-0.5">
            Nível de Permissão: <strong>{currentUser.roleLabel || currentUser.role}</strong>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {users.length > 1 ? (
            <>
              <span className="text-xs text-slate-500">Alternar usuário:</span>
              <select
                value={currentUser.id}
                onChange={(e) => {
                  const u = users.find((usr) => usr.id === e.target.value);
                  if (u) setCurrentUser(u);
                }}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.roleLabel || u.role})
                  </option>
                ))}
              </select>
            </>
          ) : (
            <span className="text-xs font-medium px-2.5 py-1 bg-purple-100 text-purple-800 rounded-lg border border-purple-200">
              Usuário único: <strong className="font-mono">admin</strong>
            </span>
          )}
        </div>
      </div>

      {/* Users & Roles Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900">Usuários & Níveis de Acesso (RBAC)</h3>
          </div>
          <span className="text-xs text-slate-400">
            {isAdmin ? 'Você pode alterar permissões' : 'Permissão somente leitura'}
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {users.map((u) => (
            <div key={u.id} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-700">
                  {u.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-xs text-slate-900">{u.name}</div>
                  <div className="text-[11px] text-slate-400">{u.email}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isAdmin ? (
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u, e.target.value as UserRole)}
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="admin">Administrador (Total)</option>
                    <option value="collaborator">Colaborador (Edição)</option>
                    <option value="viewer">Visualização (Leitura)</option>
                  </select>
                ) : (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                    {u.roleLabel || u.role}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Services List Configuration */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <Briefcase size={18} className="text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900">Catálogo de Serviços Oferecidos</h3>
          </div>
          <span className="text-xs text-slate-400">Utilizados em propostas, contratos e fichas</span>
        </div>

        {canEdit && (
          <form onSubmit={handleAddServiceSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="Nome do novo serviço (Ex: Marketing de Conteúdo, Assessoria Tributária)..."
              value={newServiceName}
              onChange={(e) => setNewServiceName(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-blue-600"
            />
            <button
              type="submit"
              className="px-3.5 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
            >
              <Plus size={14} /> Adicionar
            </button>
          </form>
        )}

        <div className="flex flex-wrap gap-2 pt-2">
          {services.map((srv) => (
            <span
              key={srv.id}
              className="px-3 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-medium flex items-center gap-2"
            >
              <span>{srv.name}</span>
              {canEdit && (
                <button
                  type="button"
                  onClick={() => deleteService(srv.id)}
                  className="text-slate-400 hover:text-red-600"
                  title="Remover serviço"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </span>
          ))}
        </div>
      </div>

      {/* Database Backup & Restore */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <Database size={18} className="text-purple-600" />
            <h3 className="font-bold text-sm text-slate-900">Backup & Restauração dos Dados</h3>
          </div>
          <span className="text-xs text-slate-400">Armazenamento Local Persistente</span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Os dados do CRM estão salvos localmente e persistem entre sessões. Você pode exportar uma cópia completa de segurança em JSON ou importar um arquivo prévio a qualquer momento.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={exportDataJson}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-900 text-white flex items-center gap-1.5 transition-colors"
          >
            <Download size={14} /> Baixar Backup JSON
          </button>

          <label className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 cursor-pointer transition-colors">
            <Upload size={14} /> Importar Arquivo de Backup
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={handleResetSeed}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-red-200 text-red-600 hover:bg-red-50 flex items-center gap-1.5 transition-colors ml-auto"
          >
            <RotateCcw size={14} /> Restaurar Base Inicial
          </button>
        </div>

        {resetSuccess && (
          <div className="text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 flex items-center gap-2">
            <CheckCircle2 size={15} /> Base inicial restaurada com sucesso!
          </div>
        )}

        {importSuccess && (
          <div className="text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 flex items-center gap-2">
            <CheckCircle2 size={15} /> Backup importado com sucesso!
          </div>
        )}
      </div>
    </div>
  );
};
