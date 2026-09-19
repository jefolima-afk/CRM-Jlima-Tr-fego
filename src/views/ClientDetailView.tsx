import React, { useState } from 'react';
import {
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  MapPin,
  Globe,
  Instagram,
  Linkedin,
  Facebook,
  Calendar,
  DollarSign,
  Clock,
  Briefcase,
  Users,
  CheckSquare,
  MessageSquare,
  FileText,
  ShieldCheck,
  FolderOpen,
  Compass,
  History,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Eye,
  Download,
} from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { formatBRL, formatDate, formatDateTime, maskCpfCnpj } from '../utils/formatters';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { ClientModal } from './ClientModal';
import { FileCategory, InteractionType, FollowUpChannel, TaskPriority } from '../types';

interface ClientDetailViewProps {
  clientId: string;
  initialTab?: string;
  onBack: () => void;
}

export const ClientDetailView: React.FC<ClientDetailViewProps> = ({
  clientId,
  initialTab = 'informacoes',
  onBack,
}) => {
  const {
    getClientById,
    getClientContacts,
    getClientFiles,
    getClientInteractions,
    getClientTimeline,
    tasks,
    followUps,
    projects,
    proposals,
    contracts,
    financialRecords,
    users,
    currentUser,
    canEdit,
    addContact,
    deleteContact,
    updateContact,
    addTask,
    toggleTaskStatus,
    deleteTask,
    addFollowUp,
    updateFollowUp,
    deleteFollowUp,
    addInteraction,
    addProject,
    addProposal,
    addContract,
    addFinancialRecord,
    addFile,
    deleteFile,
  } = useCrm();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Sub-modal states for adding related items inside the client profile
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isAddFollowUpOpen, setIsAddFollowUpOpen] = useState(false);
  const [isAddInteractionOpen, setIsAddInteractionOpen] = useState(false);
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [isAddProposalOpen, setIsAddProposalOpen] = useState(false);
  const [isAddContractOpen, setIsAddContractOpen] = useState(false);
  const [isAddFileOpen, setIsAddFileOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<any>(null);

  // Form states for adding items
  const [contactName, setContactName] = useState('');
  const [contactRole, setContactRole] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactWhatsapp, setContactWhatsapp] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactIsPrimary, setContactIsPrimary] = useState(false);

  const [taskTitle, setTaskTitle] = useState('');
  const [taskDate, setTaskDate] = useState(new Date().toISOString().split('T')[0]);
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('medium');
  const [taskDesc, setTaskDesc] = useState('');

  const [flwDate, setFlwDate] = useState(new Date().toISOString().split('T')[0]);
  const [flwTime, setFlwTime] = useState('14:00');
  const [flwReason, setFlwReason] = useState('');
  const [flwChannel, setFlwChannel] = useState<FollowUpChannel>('WhatsApp');

  const [intType, setIntType] = useState<InteractionType>('WhatsApp');
  const [intDesc, setIntDesc] = useState('');
  const [intNext, setIntNext] = useState('');

  const [fileName, setFileName] = useState('');
  const [fileCat, setFileCat] = useState<FileCategory>('Documentos');
  const [fileDesc, setFileDesc] = useState('');
  const [fileUploadData, setFileUploadData] = useState<{ name: string; size: string; type: string; base64?: string } | null>(null);

  const client = getClientById(clientId);

  if (!client) {
    return (
      <div className="py-16 text-center bg-white rounded-xl border border-slate-200">
        <h2 className="text-base font-bold text-slate-800">Cliente não encontrado</h2>
        <button
          type="button"
          onClick={onBack}
          className="mt-3 inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline font-semibold"
        >
          <ArrowLeft size={14} /> Voltar para lista de clientes
        </button>
      </div>
    );
  }

  const clientContacts = getClientContacts(client.id);
  const clientFiles = getClientFiles(client.id);
  const clientInteractions = getClientInteractions(client.id);
  const clientTasks = tasks.filter((t) => t.clientId === client.id);
  const clientFollowUps = followUps.filter((f) => f.clientId === client.id);
  const clientProjects = projects.filter((p) => p.clientId === client.id);
  const clientProposals = proposals.filter((p) => p.clientId === client.id);
  const clientContracts = contracts.filter((c) => c.clientId === client.id);
  const clientFinancial = financialRecords.find((f) => f.clientId === client.id);
  const timeline = getClientTimeline(client.id);

  const responsibleUser = users.find((u) => u.id === client.assignedUserId);

  // File Upload Handler (reads real file to dataURL for preview & download)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      const sizeKb = Math.round(file.size / 1024);
      const sizeStr = file.size > 1024 * 1024 ? `${sizeMb} MB` : `${sizeKb} KB`;

      setFileName(file.name);
      setFileUploadData({
        name: file.name,
        size: sizeStr,
        type: file.type || 'application/octet-stream',
        base64: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const submitNewFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName) return;

    addFile({
      clientId: client.id,
      name: fileName,
      category: fileCat,
      description: fileDesc || undefined,
      uploadedByUserId: currentUser.id,
      fileSize: fileUploadData?.size || '150 KB',
      fileType: fileUploadData?.type || 'application/pdf',
      fileDataUrl: fileUploadData?.base64,
    });

    setIsAddFileOpen(false);
    setFileName('');
    setFileDesc('');
    setFileUploadData(null);
  };

  return (
    <div id="view-client-detail" className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
        {/* Navigation row */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 px-3 py-1.5 rounded-lg transition-colors"
          >
            <ArrowLeft size={14} /> Voltar à lista
          </button>

          <div className="flex items-center gap-2">
            {canEdit && (
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-lg shadow-2xs transition-colors"
              >
                <Edit2 size={13} /> Editar Ficha
              </button>
            )}
          </div>
        </div>

        {/* Client Profile Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-xl shrink-0 shadow-xs">
              <Building2 size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                  {client.corporateName}
                </h1>
                <span
                  className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                    client.status === 'active'
                      ? 'bg-emerald-100 text-emerald-800'
                      : client.status === 'in_negotiation'
                      ? 'bg-indigo-100 text-indigo-800'
                      : client.status === 'lead'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {client.status === 'active'
                    ? 'Cliente Ativo'
                    : client.status === 'in_negotiation'
                    ? 'Em Negociação'
                    : client.status === 'lead'
                    ? 'Lead'
                    : 'Inativo'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500 mt-1.5">
                {client.tradeName && <span className="font-medium text-slate-700">{client.tradeName}</span>}
                {client.cpfCnpj && <span>• CNPJ: {maskCpfCnpj(client.cpfCnpj)}</span>}
                {client.segment && <span>• {client.segment}</span>}
                {client.city && <span>• {client.city}/{client.state}</span>}
                <span>• Responsável: <strong>{responsibleUser?.name || 'Equipe'}</strong></span>
              </div>
            </div>
          </div>

          {/* Section 4 Mandatory WhatsApp Action Button */}
          <div className="shrink-0 flex items-center gap-3">
            <WhatsAppButton number={client.whatsapp} label="💬 Abrir WhatsApp" />
          </div>
        </div>
      </div>

      {/* The 11 Ordered Tabs (Section 5) + Timeline */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Tab navigation bar */}
        <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-50/70 px-2 scrollbar-none">
          {[
            { id: 'informacoes', label: 'Informações', icon: Building2 },
            { id: 'contatos', label: `Contatos (${clientContacts.length})`, icon: Users },
            { id: 'projetos', label: `Projetos (${clientProjects.length})`, icon: Briefcase },
            { id: 'tarefas', label: `Tarefas (${clientTasks.length})`, icon: CheckSquare },
            { id: 'interacoes', label: `Interações (${clientInteractions.length})`, icon: MessageSquare },
            { id: 'followups', label: `Follow-ups (${clientFollowUps.length})`, icon: Clock },
            { id: 'arquivos', label: `Arquivos (${clientFiles.length})`, icon: FolderOpen },
            { id: 'propostas', label: `Propostas (${clientProposals.length})`, icon: FileText },
            { id: 'contratos', label: `Contratos (${clientContracts.length})`, icon: ShieldCheck },
            { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
            { id: 'estrategia', label: 'Estratégia', icon: Compass },
            { id: 'timeline', label: `Linha do Tempo (${timeline.length})`, icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${
                  isActive
                    ? 'border-blue-600 text-blue-600 bg-white shadow-2xs'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="p-6">
          {/* 1. ABA INFORMAÇÕES */}
          {activeTab === 'informacoes' && (
            <div className="space-y-6 animate-in fade-in duration-100">
              {/* Resumo Cadastral */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Building2 size={14} /> Dados Cadastrais
                  </h3>
                  <div className="space-y-2 text-xs text-slate-700">
                    <div><span className="text-slate-400">Razão Social:</span> <strong className="text-slate-900">{client.corporateName}</strong></div>
                    <div><span className="text-slate-400">Nome Fantasia:</span> {client.tradeName || '-'}</div>
                    <div><span className="text-slate-400">CNPJ / CPF:</span> {maskCpfCnpj(client.cpfCnpj) || '-'}</div>
                    <div><span className="text-slate-400">Segmento:</span> {client.segment || '-'}</div>
                    <div><span className="text-slate-400">Telefone:</span> {client.phone || '-'}</div>
                    <div><span className="text-slate-400">WhatsApp:</span> <strong className="text-emerald-700 font-mono">{client.whatsapp}</strong></div>
                    <div><span className="text-slate-400">E-mail:</span> {client.email || '-'}</div>
                    <div><span className="text-slate-400">Site:</span> {client.website ? <a href={client.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{client.website}</a> : '-'}</div>
                    <div><span className="text-slate-400">Endereço:</span> {client.address ? `${client.address}, ${client.city}/${client.state}` : '-'}</div>
                  </div>
                </div>

                {/* Resumo Comercial */}
                <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Briefcase size={14} /> Dados Comerciais
                  </h3>
                  <div className="space-y-2 text-xs text-slate-700">
                    <div><span className="text-slate-400">Origem do Lead:</span> {client.leadSource || '-'}</div>
                    <div><span className="text-slate-400">1º Contato:</span> {formatDate(client.firstContactDate)}</div>
                    <div><span className="text-slate-400">Etapa do Funil:</span> <span className="font-semibold text-indigo-700 uppercase">{client.pipelineStage}</span></div>
                    <div><span className="text-slate-400">Serviço de Interesse:</span> {client.interestedService || '-'}</div>
                    <div><span className="text-slate-400">Valor Potencial:</span> <strong className="text-slate-900">{formatBRL(client.potentialValue)}</strong></div>
                    <div><span className="text-slate-400">Valor Contratado:</span> <strong className="text-emerald-700">{formatBRL(client.contractedValue)}</strong></div>
                    <div><span className="text-slate-400">Data de Início:</span> {formatDate(client.startDate)}</div>
                    <div><span className="text-slate-400">Data de Renovação:</span> {formatDate(client.renewalDate)}</div>
                    <div><span className="text-slate-400">Forma Pagamento:</span> {client.paymentMethod || '-'} ({client.recurrence || 'Mensal'})</div>
                  </div>
                </div>

                {/* Resumo Estratégico */}
                <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Compass size={14} /> Posicionamento
                  </h3>
                  <div className="space-y-2 text-xs text-slate-700">
                    <div><span className="text-slate-400">Nicho:</span> {client.niche || '-'}</div>
                    <div><span className="text-slate-400">Público-alvo:</span> {client.targetAudience || '-'}</div>
                    <div><span className="text-slate-400">Diferenciais:</span> {client.differentials || '-'}</div>
                    <div><span className="text-slate-400">Posicionamento:</span> {client.positioning || '-'}</div>
                    <div><span className="text-slate-400">Concorrentes:</span> {client.competitors || '-'}</div>
                    <div><span className="text-slate-400">Canais:</span> {client.channelsUsed || '-'}</div>
                  </div>
                </div>
              </div>

              {client.generalNotes && (
                <div className="p-4 rounded-xl bg-blue-50/40 border border-blue-200/60 text-xs text-slate-700">
                  <span className="font-bold text-blue-900 block mb-1">Observações Gerais:</span>
                  <p>{client.generalNotes}</p>
                </div>
              )}
            </div>
          )}

          {/* 2. ABA CONTATOS (Section 6) */}
          {activeTab === 'contatos' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Contatos Vinculados</h3>
                  <p className="text-xs text-slate-500">Múltiplos contatos com controle de contato principal e link inteligente de WhatsApp.</p>
                </div>
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => setIsAddContactOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus size={14} /> Adicionar Contato
                  </button>
                )}
              </div>

              {clientContacts.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Nenhum contato cadastrado ainda para este cliente.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {clientContacts.map((cnt) => (
                    <div
                      key={cnt.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-all shadow-2xs space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                            {cnt.name}
                            {cnt.isPrimary && (
                              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-100 text-blue-800">
                                Principal
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500">{cnt.role || 'Sem cargo informado'}</div>
                        </div>

                        {canEdit && (
                          <button
                            type="button"
                            onClick={() => deleteContact(cnt.id)}
                            className="text-slate-400 hover:text-red-600 p-1"
                            title="Remover contato"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>

                      <div className="space-y-1 text-xs text-slate-600 pt-1">
                        {cnt.email && (
                          <div className="flex items-center gap-1.5">
                            <Mail size={13} className="text-slate-400" />
                            <span>{cnt.email}</span>
                          </div>
                        )}
                        {cnt.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone size={13} className="text-slate-400" />
                            <span>{cnt.phone}</span>
                          </div>
                        )}
                      </div>

                      {/* WhatsApp do Contato (Regra Seção 6) */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <WhatsAppButton number={cnt.whatsapp || cnt.phone} variant="compact" />
                        {!cnt.isPrimary && canEdit && (
                          <button
                            type="button"
                            onClick={() => updateContact(cnt.id, { isPrimary: true })}
                            className="text-[11px] text-blue-600 hover:underline font-medium"
                          >
                            Definir como Principal
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. ABA PROJETOS (Section 12) */}
          {activeTab === 'projetos' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Projetos do Cliente</h3>
                  <p className="text-xs text-slate-500">Acompanhamento de prazos, escopos e status.</p>
                </div>
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => setIsAddProjectOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus size={14} /> Novo Projeto
                  </button>
                )}
              </div>

              {clientProjects.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Nenhum projeto registrado para este cliente.
                </div>
              ) : (
                <div className="space-y-3">
                  {clientProjects.map((prj) => (
                    <div
                      key={prj.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-all shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="font-bold text-sm text-slate-900">{prj.name}</div>
                        <p className="text-xs text-slate-500 mt-1 max-w-xl">{prj.description}</p>
                        <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-3">
                          <span>Prazo final: <strong>{formatDate(prj.deadline)}</strong></span>
                          <span>• Status: <strong className="uppercase text-slate-700">{prj.status}</strong></span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4. ABA TAREFAS (Section 11) */}
          {activeTab === 'tarefas' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Tarefas Vinculadas</h3>
                  <p className="text-xs text-slate-500">Atividades e pendências operacionais deste cliente.</p>
                </div>
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => setIsAddTaskOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus size={14} /> Nova Tarefa
                  </button>
                )}
              </div>

              {clientTasks.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Nenhuma tarefa vinculada no momento.
                </div>
              ) : (
                <div className="space-y-2">
                  {clientTasks.map((t) => {
                    const isDone = t.status === 'completed';
                    return (
                      <div
                        key={t.id}
                        className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                          isDone ? 'bg-slate-50 opacity-70 border-slate-200' : 'bg-white border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isDone}
                          onChange={() => toggleTaskStatus(t.id)}
                          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <div className="flex-1 min-w-0">
                          <div className={`text-xs font-bold text-slate-900 ${isDone ? 'line-through text-slate-400' : ''}`}>
                            {t.title}
                          </div>
                          {t.description && <p className="text-xs text-slate-500 mt-0.5">{t.description}</p>}
                          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                            <span>Data: {formatDate(t.date)}</span>
                            <span>• Categoria: {t.category}</span>
                            <span>• Prioridade: <strong className="uppercase">{t.priority}</strong></span>
                          </div>
                        </div>

                        {canEdit && (
                          <button
                            type="button"
                            onClick={() => deleteTask(t.id)}
                            className="text-slate-400 hover:text-red-600 p-1"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 5. ABA INTERAÇÕES (Section 9) */}
          {activeTab === 'interacoes' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Histórico de Interações</h3>
                  <p className="text-xs text-slate-500">Registros de conversas no WhatsApp, ligações, reuniões e e-mails.</p>
                </div>
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => setIsAddInteractionOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus size={14} /> Registrar Interação
                  </button>
                )}
              </div>

              {clientInteractions.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Nenhuma interação registrada ainda.
                </div>
              ) : (
                <div className="space-y-3">
                  {clientInteractions.map((int) => {
                    const user = users.find((u) => u.id === int.responsibleUserId);
                    return (
                      <div key={int.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 font-bold rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                              {int.type}
                            </span>
                            <span className="text-slate-500 font-mono">{formatDate(int.date)} às {int.time}</span>
                          </div>
                          <span className="text-slate-500">Por: <strong>{user?.name || 'Equipe'}</strong></span>
                        </div>
                        <p className="text-xs text-slate-800 pt-1 leading-relaxed">{int.description}</p>
                        {int.nextAction && (
                          <div className="pt-2 text-xs text-blue-700 font-medium flex items-center gap-1">
                            <span>➔ Próxima ação:</span> {int.nextAction}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 6. ABA FOLLOW-UPS (Section 10) */}
          {activeTab === 'followups' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Acompanhamentos & Follow-ups</h3>
                  <p className="text-xs text-slate-500">Compromissos de retorno comercial e pós-venda.</p>
                </div>
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => setIsAddFollowUpOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus size={14} /> Novo Follow-up
                  </button>
                )}
              </div>

              {clientFollowUps.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Nenhum follow-up cadastrado para este cliente.
                </div>
              ) : (
                <div className="space-y-3">
                  {clientFollowUps.map((flw) => (
                    <div
                      key={flw.id}
                      className={`p-4 rounded-xl border transition-all ${
                        flw.status === 'completed'
                          ? 'bg-slate-50 border-slate-200'
                          : 'bg-white border-slate-200 hover:border-amber-400'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-bold text-xs text-slate-900">{flw.reason}</div>
                          <div className="text-[11px] text-slate-500 mt-1 font-mono">
                            Data: {formatDate(flw.date)} às {flw.time} • Canal: {flw.channel}
                          </div>
                          {flw.result && (
                            <div className="text-xs text-emerald-800 bg-emerald-50 p-2 rounded-lg mt-2">
                              <strong>Resultado:</strong> {flw.result}
                            </div>
                          )}
                        </div>

                        {canEdit && flw.status === 'pending' && (
                          <button
                            type="button"
                            onClick={() =>
                              updateFollowUp(flw.id, {
                                status: 'completed',
                                result: 'Concluído pelo usuário na ficha do cliente.',
                              })
                            }
                            className="px-3 py-1 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            Marcar Concluído
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 7. ABA ARQUIVOS (Section 7) */}
          {activeTab === 'arquivos' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Central de Arquivos do Cliente</h3>
                  <p className="text-xs text-slate-500">Documentos, briefings, contratos e criativos categorizados.</p>
                </div>
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => setIsAddFileOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Upload size={14} /> Fazer Upload de Arquivo
                  </button>
                )}
              </div>

              {clientFiles.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Nenhum arquivo anexado a este cliente.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {clientFiles.map((f) => (
                    <div
                      key={f.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-all shadow-2xs space-y-2 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                            {f.category}
                          </span>
                          <span className="text-slate-400">{f.fileSize}</span>
                        </div>
                        <div className="font-bold text-xs text-slate-900 truncate" title={f.name}>
                          {f.name}
                        </div>
                        {f.description && <p className="text-[11px] text-slate-500 mt-1">{f.description}</p>}
                        <div className="text-[10px] text-slate-400 mt-2">
                          Upload: {formatDate(f.uploadDate)}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        {f.fileDataUrl ? (
                          <a
                            href={f.fileDataUrl}
                            download={f.name}
                            className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
                          >
                            <Download size={13} /> Baixar
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400">Armazenado</span>
                        )}

                        {canEdit && (
                          <button
                            type="button"
                            onClick={() => deleteFile(f.id)}
                            className="text-slate-400 hover:text-red-600 p-1"
                            title="Excluir arquivo"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 8. ABA PROPOSTAS (Section 13) */}
          {activeTab === 'propostas' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Propostas Comerciais</h3>
                  <p className="text-xs text-slate-500">Orçamentos e propostas emitidas para este cliente.</p>
                </div>
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => setIsAddProposalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus size={14} /> Nova Proposta
                  </button>
                )}
              </div>

              {clientProposals.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Nenhuma proposta gerada para este cliente.
                </div>
              ) : (
                <div className="space-y-3">
                  {clientProposals.map((prp) => (
                    <div
                      key={prp.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                    >
                      <div>
                        <div className="font-bold text-sm text-slate-900">{prp.serviceName}</div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Enviada em {formatDate(prp.sentDate)} • Validade: {formatDate(prp.validUntil)}
                        </div>
                        {prp.notes && <p className="text-xs text-slate-600 mt-1">{prp.notes}</p>}
                      </div>
                      <div className="text-right">
                        <div className="text-base font-bold text-slate-900 font-mono">
                          {formatBRL(prp.value)}
                        </div>
                        <span className="inline-block mt-1 px-2 py-0.5 text-xs font-bold uppercase rounded-md bg-blue-50 text-blue-700">
                          {prp.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 9. ABA CONTRATOS (Section 14) */}
          {activeTab === 'contratos' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Contratos Vigentes</h3>
                  <p className="text-xs text-slate-500">Prazos, renovações e alerta automático de contratos expirando.</p>
                </div>
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => setIsAddContractOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus size={14} /> Novo Contrato
                  </button>
                )}
              </div>

              {clientContracts.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Nenhum contrato ativo registrado.
                </div>
              ) : (
                <div className="space-y-3">
                  {clientContracts.map((ctr) => (
                    <div
                      key={ctr.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                    >
                      <div>
                        <div className="font-bold text-sm text-slate-900">{ctr.serviceName}</div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Vigência: {formatDate(ctr.startDate)} até <strong>{formatDate(ctr.endDate)}</strong>
                        </div>
                        <div className="text-xs text-slate-600 mt-1">Renovação: {ctr.renewal}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-base font-bold text-emerald-700 font-mono">
                          {formatBRL(ctr.value)}
                        </div>
                        <span className="inline-block mt-1 px-2 py-0.5 text-xs font-bold uppercase rounded-md bg-emerald-50 text-emerald-700">
                          {ctr.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 10. ABA FINANCEIRO (Section 15) */}
          {activeTab === 'financeiro' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <h3 className="text-sm font-bold text-slate-900">Acompanhamento Financeiro Básico</h3>
              <p className="text-xs text-slate-500">Controle simples de recorrência, dia de vencimento e histórico de pagamentos.</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-semibold text-slate-500">Valor Mensal Recorrente</span>
                  <div className="text-xl font-bold text-slate-900 mt-1">
                    {formatBRL(clientFinancial?.monthlyValue || client.contractedValue || 0)}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-semibold text-slate-500">Dia de Vencimento</span>
                  <div className="text-xl font-bold text-slate-900 mt-1">
                    Dia {clientFinancial?.dueDateDay || 10} de cada mês
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-semibold text-slate-500">Status Financeiro</span>
                  <div className="mt-1">
                    <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-emerald-100 text-emerald-800">
                      {clientFinancial?.status || 'Em dia'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 11. ABA ESTRATÉGIA (Section 3 Strategic Data) */}
          {activeTab === 'estrategia' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <h3 className="text-sm font-bold text-slate-900">Planejamento Estratégico & Posicionamento</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-xs font-bold text-slate-500 uppercase">Persona de Compra</span>
                  <p className="text-xs text-slate-800 leading-relaxed">{client.persona || 'Não informada'}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-xs font-bold text-slate-500 uppercase">Produtos / Serviços</span>
                  <p className="text-xs text-slate-800 leading-relaxed">{client.productsServices || 'Não informados'}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-xs font-bold text-slate-500 uppercase">Diferenciais de Mercado</span>
                  <p className="text-xs text-slate-800 leading-relaxed">{client.differentials || 'Não informados'}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-xs font-bold text-slate-500 uppercase">Concorrentes Diretos</span>
                  <p className="text-xs text-slate-800 leading-relaxed">{client.competitors || 'Não informados'}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-xs font-bold text-slate-500 uppercase">Objetivos Principais</span>
                  <p className="text-xs text-slate-800 leading-relaxed">{client.objectives || 'Não informados'}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-xs font-bold text-slate-500 uppercase">Estratégias Atuais</span>
                  <p className="text-xs text-slate-800 leading-relaxed">{client.currentStrategies || 'Não informadas'}</p>
                </div>
              </div>
            </div>
          )}

          {/* 12. LINHA DO TEMPO CRONOLÓGICA (Section 5) */}
          {activeTab === 'timeline' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Linha do Tempo Cronológica Completa</h3>
                <p className="text-xs text-slate-500">
                  Histórico unificado mostrando interações, tarefas concluídas, follow-ups e arquivos deste cliente.
                </p>
              </div>

              {timeline.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Nenhum evento registrado ainda na linha do tempo.
                </div>
              ) : (
                <div className="relative pl-6 border-l-2 border-slate-200 space-y-6 my-4">
                  {timeline.map((event) => (
                    <div key={event.id} className="relative group">
                      {/* Timeline dot */}
                      <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-blue-600 ring-4 ring-white shadow-xs" />

                      <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 hover:bg-white hover:border-blue-300 transition-all">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-bold text-slate-900">{event.title}</span>
                          <span className="text-slate-400 font-mono">{event.dateFormatted}</span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed">{event.description}</p>
                        <div className="text-[10px] text-slate-400 mt-2">
                          Responsável: <strong>{event.userLabel}</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Client Modal */}
      <ClientModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        clientToEdit={client}
      />

      {/* Submodal: Adicionar Contato */}
      {isAddContactOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="font-bold text-sm text-slate-900 mb-3">Novo Contato para {client.corporateName}</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addContact({
                  clientId: client.id,
                  name: contactName,
                  role: contactRole,
                  phone: contactPhone,
                  whatsapp: contactWhatsapp,
                  email: contactEmail,
                  isPrimary: contactIsPrimary,
                });
                setIsAddContactOpen(false);
                setContactName('');
                setContactRole('');
                setContactPhone('');
                setContactWhatsapp('');
                setContactEmail('');
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-semibold mb-1">Nome do Contato *</label>
                <input
                  required
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Cargo / Função</label>
                <input
                  type="text"
                  value={contactRole}
                  onChange={(e) => setContactRole(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">WhatsApp</label>
                  <input
                    type="text"
                    placeholder="54999999999"
                    value={contactWhatsapp}
                    onChange={(e) => setContactWhatsapp(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Telefone Fixo</label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">E-mail</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="chk-primary"
                  checked={contactIsPrimary}
                  onChange={(e) => setContactIsPrimary(e.target.checked)}
                />
                <label htmlFor="chk-primary">Definir como contato principal deste cliente</label>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddContactOpen(false)}
                  className="px-3 py-1.5 rounded-lg border text-slate-600"
                >
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-semibold">
                  Salvar Contato
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submodal: Upload de Arquivo Real (Section 7) */}
      {isAddFileOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="font-bold text-sm text-slate-900 mb-3">Anexar Arquivo para {client.corporateName}</h3>
            <form onSubmit={submitNewFile} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Selecione o Arquivo *</label>
                <input
                  type="file"
                  required
                  onChange={handleFileUpload}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Nome de Exibição *</label>
                <input
                  required
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Categoria</label>
                <select
                  value={fileCat}
                  onChange={(e) => setFileCat(e.target.value as FileCategory)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  {[
                    'Documentos',
                    'Contratos',
                    'Briefings',
                    'Propostas',
                    'Criativos',
                    'Imagens',
                    'Vídeos',
                    'Logos',
                    'Relatórios',
                    'Apresentações',
                    'Outros',
                  ].map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Descrição</label>
                <textarea
                  rows={2}
                  value={fileDesc}
                  onChange={(e) => setFileDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddFileOpen(false)}
                  className="px-3 py-1.5 rounded-lg border text-slate-600"
                >
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-semibold">
                  Salvar Arquivo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submodal: Registrar Interação */}
      {isAddInteractionOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="font-bold text-sm text-slate-900 mb-3">Registrar Interação com {client.corporateName}</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addInteraction({
                  clientId: client.id,
                  date: new Date().toISOString().split('T')[0],
                  time: new Date().toTimeString().substring(0, 5),
                  type: intType,
                  responsibleUserId: currentUser.id,
                  description: intDesc,
                  nextAction: intNext || undefined,
                });
                setIsAddInteractionOpen(false);
                setIntDesc('');
                setIntNext('');
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-semibold mb-1">Tipo de Interação</label>
                <select
                  value={intType}
                  onChange={(e) => setIntType(e.target.value as InteractionType)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
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
                <label className="block font-semibold mb-1">O que foi conversado? *</label>
                <textarea
                  required
                  rows={3}
                  value={intDesc}
                  onChange={(e) => setIntDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Próxima Ação</label>
                <input
                  type="text"
                  placeholder="Ex: Enviar minuta revisada"
                  value={intNext}
                  onChange={(e) => setIntNext(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddInteractionOpen(false)}
                  className="px-3 py-1.5 rounded-lg border text-slate-600"
                >
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-semibold">
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submodal: Nova Tarefa */}
      {isAddTaskOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="font-bold text-sm text-slate-900 mb-3">Nova Tarefa para {client.corporateName}</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addTask({
                  title: taskTitle,
                  clientId: client.id,
                  category: 'Comercial / Operacional',
                  responsibleUserId: currentUser.id,
                  date: taskDate,
                  priority: taskPriority,
                  status: 'todo',
                  description: taskDesc || undefined,
                  checklist: [],
                });
                setIsAddTaskOpen(false);
                setTaskTitle('');
                setTaskDesc('');
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-semibold mb-1">Título da Tarefa *</label>
                <input
                  required
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Data</label>
                  <input
                    type="date"
                    value={taskDate}
                    onChange={(e) => setTaskDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Prioridade</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">Descrição</label>
                <textarea
                  rows={2}
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddTaskOpen(false)}
                  className="px-3 py-1.5 rounded-lg border text-slate-600"
                >
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-semibold">
                  Salvar Tarefa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submodal: Novo Follow-up */}
      {isAddFollowUpOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="font-bold text-sm text-slate-900 mb-3">Agendar Follow-up para {client.corporateName}</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addFollowUp({
                  clientId: client.id,
                  date: flwDate,
                  time: flwTime,
                  reason: flwReason,
                  channel: flwChannel,
                  responsibleUserId: currentUser.id,
                  status: 'pending',
                });
                setIsAddFollowUpOpen(false);
                setFlwReason('');
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-semibold mb-1">Motivo do Follow-up *</label>
                <input
                  required
                  type="text"
                  placeholder="Ex: Confirmar recebimento da minuta"
                  value={flwReason}
                  onChange={(e) => setFlwReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Data</label>
                  <input
                    type="date"
                    value={flwDate}
                    onChange={(e) => setFlwDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Horário</label>
                  <input
                    type="time"
                    value={flwTime}
                    onChange={(e) => setFlwTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Canal</label>
                  <select
                    value={flwChannel}
                    onChange={(e) => setFlwChannel(e.target.value as FollowUpChannel)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Ligação">Ligação</option>
                    <option value="E-mail">E-mail</option>
                    <option value="Reunião">Reunião</option>
                    <option value="Presencial">Presencial</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddFollowUpOpen(false)}
                  className="px-3 py-1.5 rounded-lg border text-slate-600"
                >
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-semibold">
                  Agendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
