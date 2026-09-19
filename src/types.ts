export type UserRole = 'admin' | 'collaborator' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  password?: string;
  role: UserRole;
  avatar?: string;
  roleLabel: string;
}

export type ClientStatus = 'lead' | 'in_negotiation' | 'active' | 'inactive';

export type PipelineStageId =
  | 'lead'
  | 'first_contact'
  | 'qualification'
  | 'meeting'
  | 'proposal_sent'
  | 'negotiation'
  | 'won'
  | 'onboarding'
  | 'active_client'
  | 'closed';

export interface Client {
  id: string;
  // Dados cadastrais
  corporateName: string; // Nome / Razão Social
  tradeName?: string; // Nome fantasia
  cpfCnpj?: string;
  segment?: string; // Segmento/nicho
  assignedUserId: string; // Responsável
  phone?: string;
  whatsapp: string; // WhatsApp inteligente
  whatsappNormalized: string;
  email?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  address?: string;
  city?: string;
  state?: string;
  generalNotes?: string;

  // Dados comerciais
  leadSource?: string; // Origem do lead
  firstContactDate?: string;
  commercialResponsibleUserId?: string;
  status: ClientStatus;
  pipelineStage: PipelineStageId;
  interestedService?: string;
  potentialValue?: number;
  contractedValue?: number;
  startDate?: string;
  renewalDate?: string;
  paymentMethod?: string;
  recurrence?: string;
  commercialNotes?: string;

  // Dados estratégicos
  niche?: string;
  targetAudience?: string;
  persona?: string;
  productsServices?: string;
  differentials?: string;
  positioning?: string;
  competitors?: string;
  objectives?: string;
  channelsUsed?: string;
  currentStrategies?: string;
  strategicNotes?: string;

  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  clientId: string;
  name: string;
  role?: string;
  phone?: string;
  whatsapp?: string;
  whatsappNormalized?: string;
  email?: string;
  linkedin?: string;
  notes?: string;
  isPrimary: boolean;
  createdAt: string;
}

export type FileCategory =
  | 'Documentos'
  | 'Contratos'
  | 'Briefings'
  | 'Propostas'
  | 'Criativos'
  | 'Imagens'
  | 'Vídeos'
  | 'Logos'
  | 'Relatórios'
  | 'Apresentações'
  | 'Outros';

export interface FileItem {
  id: string;
  clientId: string;
  projectId?: string;
  name: string;
  category: FileCategory;
  description?: string;
  uploadDate: string;
  uploadedByUserId: string;
  fileSize: string;
  fileType: string;
  fileDataUrl?: string; // Base64 data for real preview and download
}

export type InteractionType =
  | 'WhatsApp'
  | 'Ligação'
  | 'E-mail'
  | 'Reunião'
  | 'Instagram'
  | 'Presencial'
  | 'Outro';

export interface Interaction {
  id: string;
  clientId: string;
  contactId?: string;
  date: string;
  time: string;
  type: InteractionType;
  responsibleUserId: string;
  description: string;
  nextAction?: string;
  attachments?: string[];
  createdAt: string;
}

export type FollowUpStatus = 'pending' | 'completed' | 'rescheduled' | 'cancelled';
export type FollowUpChannel = 'WhatsApp' | 'Ligação' | 'E-mail' | 'Reunião' | 'Presencial' | 'Outro';

export interface FollowUp {
  id: string;
  clientId: string;
  contactId?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  reason: string;
  channel: FollowUpChannel;
  responsibleUserId: string;
  status: FollowUpStatus;
  notes?: string;
  result?: string;
  nextAction?: string;
  createdAt: string;
}

export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'waiting_client' | 'cancelled';

export interface TaskChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface Task {
  id: string;
  title: string;
  clientId?: string;
  projectId?: string;
  category: string;
  responsibleUserId: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  priority: TaskPriority;
  status: TaskStatus;
  description?: string;
  checklist: TaskChecklistItem[];
  attachments?: string[];
  recurrence?: string;
  createdAt: string;
  completedAt?: string;
}

export type ProjectStatus = 'planning' | 'in_progress' | 'paused' | 'completed' | 'cancelled';

export interface Project {
  id: string;
  name: string;
  clientId: string;
  description: string;
  responsibleUserId: string;
  status: ProjectStatus;
  deadline: string;
  notes?: string;
  createdAt: string;
}

export type ProposalStatus =
  | 'draft'
  | 'sent'
  | 'viewed'
  | 'negotiating'
  | 'approved'
  | 'rejected'
  | 'expired';

export interface Proposal {
  id: string;
  clientId: string;
  serviceId?: string;
  serviceName: string;
  value: number;
  sentDate: string;
  validUntil: string;
  status: ProposalStatus;
  proposalUrlOrFile?: string;
  notes?: string;
  createdAt: string;
}

export type ContractStatus = 'active' | 'pending_signature' | 'expiring_soon' | 'renewed' | 'cancelled';

export interface Contract {
  id: string;
  clientId: string;
  serviceId?: string;
  serviceName: string;
  startDate: string;
  endDate: string;
  renewal: string; // 'Automática', 'Manual', 'Semestral', 'Anual'
  value: number;
  status: ContractStatus;
  fileUrl?: string;
  notes?: string;
  createdAt: string;
}

export type FinancialStatus = 'em_dia' | 'pendente' | 'atrasado';

export interface FinancialRecord {
  id: string;
  clientId: string;
  contractedValue: number;
  monthlyValue: number;
  dueDateDay: number; // Ex: 10
  paymentMethod: string;
  status: FinancialStatus;
  lastPaymentDate?: string;
  nextPaymentDate?: string;
  notes?: string;
  createdAt: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  defaultPrice: number;
  isRecurring: boolean;
  status: 'active' | 'inactive';
}

export interface PipelineStageConfig {
  id: PipelineStageId;
  name: string;
  color: string;
  order: number;
}

export interface TimelineEvent {
  id: string;
  clientId: string;
  timestamp: string;
  dateFormatted: string;
  type: 'interaction' | 'task' | 'followup' | 'file' | 'status_change' | 'proposal' | 'contract';
  title: string;
  description: string;
  userLabel: string;
  iconType: string;
}
