import {
  User,
  Client,
  Contact,
  Task,
  FollowUp,
  Interaction,
  Project,
  Proposal,
  Contract,
  FinancialRecord,
  FileItem,
  ServiceItem,
  PipelineStageConfig,
} from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user-1',
    name: 'Jeverson Lima',
    username: 'admin',
    email: 'jefo.lima@gmail.com',
    password: 'admin',
    role: 'admin',
    roleLabel: 'Administrador',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  },
];

export const PIPELINE_STAGES: PipelineStageConfig[] = [
  { id: 'lead', name: 'Lead', color: '#64748B', order: 1 },
  { id: 'first_contact', name: 'Primeiro Contato', color: '#0EA5E9', order: 2 },
  { id: 'qualification', name: 'Qualificação', color: '#6366F1', order: 3 },
  { id: 'meeting', name: 'Reunião / Diagnóstico', color: '#8B5CF6', order: 4 },
  { id: 'proposal_sent', name: 'Proposta Enviada', color: '#EC4899', order: 5 },
  { id: 'negotiation', name: 'Negociação', color: '#F59E0B', order: 6 },
  { id: 'won', name: 'Fechado Ganho', color: '#10B981', order: 7 },
  { id: 'onboarding', name: 'Onboarding', color: '#06B6D4', order: 8 },
  { id: 'active_client', name: 'Cliente Ativo', color: '#059669', order: 9 },
  { id: 'closed', name: 'Encerrado', color: '#94A3B8', order: 10 },
];

export const INITIAL_SERVICES: ServiceItem[] = [
  {
    id: 'srv-1',
    name: 'Gestão de Tráfego Pago & Performance',
    description: 'Campanhas de Google Ads e Meta Ads com relatórios de ROI e aquisição de clientes.',
    defaultPrice: 3000,
    isRecurring: true,
    status: 'active',
  },
  {
    id: 'srv-2',
    name: 'Consultoria Estratégica de Vendas',
    description: 'Estruturação de processos comerciais, script de vendas e CRM.',
    defaultPrice: 4500,
    isRecurring: true,
    status: 'active',
  },
  {
    id: 'srv-3',
    name: 'Automação de WhatsApp e CRM',
    description: 'Implantação de funis automáticos de atendimento e qualificação de leads.',
    defaultPrice: 2500,
    isRecurring: true,
    status: 'active',
  },
];

// Base limpa e vazia para inclusão real de dados pelo usuário
export const INITIAL_CLIENTS: Client[] = [];
export const INITIAL_CONTACTS: Contact[] = [];
export const INITIAL_FOLLOW_UPS: FollowUp[] = [];
export const INITIAL_TASKS: Task[] = [];
export const INITIAL_INTERACTIONS: Interaction[] = [];
export const INITIAL_PROJECTS: Project[] = [];
export const INITIAL_PROPOSALS: Proposal[] = [];
export const INITIAL_CONTRACTS: Contract[] = [];
export const INITIAL_FINANCIAL: FinancialRecord[] = [];
export const INITIAL_FILES: FileItem[] = [];
