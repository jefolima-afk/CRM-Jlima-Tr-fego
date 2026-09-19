import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
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
  TimelineEvent,
  FileCategory,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_CLIENTS,
  INITIAL_CONTACTS,
  INITIAL_FOLLOW_UPS,
  INITIAL_TASKS,
  INITIAL_INTERACTIONS,
  INITIAL_PROJECTS,
  INITIAL_PROPOSALS,
  INITIAL_CONTRACTS,
  INITIAL_FINANCIAL,
  INITIAL_FILES,
  INITIAL_SERVICES,
  PIPELINE_STAGES,
} from '../data/seedData';
import { isDateToday, isDateOverdue, isDateThisWeek, daysUntil, formatDate, formatDateTime } from '../utils/formatters';
import { normalizeWhatsAppNumber } from '../utils/whatsapp';

interface CrmContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  users: User[];
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (user: User) => void;
  canEdit: boolean;
  isAdmin: boolean;
  isViewer: boolean;

  // Clients
  clients: Client[];
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'whatsappNormalized'>) => Client;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  getClientById: (id?: string) => Client | undefined;

  // Contacts
  contacts: Contact[];
  addContact: (contact: Omit<Contact, 'id' | 'createdAt' | 'whatsappNormalized'>) => void;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
  getClientContacts: (clientId: string) => Contact[];

  // Tasks
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  toggleTaskStatus: (id: string) => void;
  toggleChecklistItem: (taskId: string, itemId: string) => void;
  deleteTask: (id: string) => void;

  // Follow-ups
  followUps: FollowUp[];
  addFollowUp: (followUp: Omit<FollowUp, 'id' | 'createdAt'>) => void;
  updateFollowUp: (id: string, updates: Partial<FollowUp>) => void;
  deleteFollowUp: (id: string) => void;

  // Interactions
  interactions: Interaction[];
  addInteraction: (interaction: Omit<Interaction, 'id' | 'createdAt'>) => void;
  getClientInteractions: (clientId: string) => Interaction[];

  // Projects
  projects: Project[];
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  // Proposals
  proposals: Proposal[];
  addProposal: (proposal: Omit<Proposal, 'id' | 'createdAt'>) => void;
  updateProposal: (id: string, updates: Partial<Proposal>) => void;
  deleteProposal: (id: string) => void;

  // Contracts
  contracts: Contract[];
  addContract: (contract: Omit<Contract, 'id' | 'createdAt'>) => void;
  updateContract: (id: string, updates: Partial<Contract>) => void;
  deleteContract: (id: string) => void;

  // Financial Records
  financialRecords: FinancialRecord[];
  addFinancialRecord: (record: Omit<FinancialRecord, 'id' | 'createdAt'>) => void;
  updateFinancialRecord: (id: string, updates: Partial<FinancialRecord>) => void;

  // Files
  files: FileItem[];
  addFile: (file: Omit<FileItem, 'id' | 'uploadDate'>) => void;
  deleteFile: (id: string) => void;
  getClientFiles: (clientId: string) => FileItem[];

  // Services
  services: ServiceItem[];
  addService: (service: Omit<ServiceItem, 'id'>) => void;
  updateService: (id: string, updates: Partial<ServiceItem>) => void;
  deleteService: (id: string) => void;

  // Pipeline configuration
  pipelineStages: PipelineStageConfig[];
  updatePipelineStages: (stages: PipelineStageConfig[]) => void;

  // Utilities & Helpers
  getClientTimeline: (clientId: string) => TimelineEvent[];
  resetDemoData: () => void;
  exportDataJson: () => void;
  importDataJson: (jsonString: string) => boolean;

  // Computed KPIs
  stats: {
    leadsNewCount: number;
    leadsInNegotiationCount: number;
    activeClientsCount: number;
    inactiveClientsCount: number;
    followUpsTodayCount: number;
    followUpsOverdueCount: number;
    tasksTodayCount: number;
    tasksWeekCount: number;
    tasksOverdueCount: number;
    proposalsPendingCount: number;
    contractsExpiringCount: number;
    totalPipelineValue: number;
  };
}

const STORAGE_KEY = 'crm_pro_database_v1';

const CrmContext = createContext<CrmContextType | undefined>(undefined);

export const CrmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from localStorage or seed data
  const loadState = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading CRM database from localStorage', e);
    }
    return {
      users: INITIAL_USERS,
      clients: INITIAL_CLIENTS,
      contacts: INITIAL_CONTACTS,
      followUps: INITIAL_FOLLOW_UPS,
      tasks: INITIAL_TASKS,
      interactions: INITIAL_INTERACTIONS,
      projects: INITIAL_PROJECTS,
      proposals: INITIAL_PROPOSALS,
      contracts: INITIAL_CONTRACTS,
      financialRecords: INITIAL_FINANCIAL,
      files: INITIAL_FILES,
      services: INITIAL_SERVICES,
      pipelineStages: PIPELINE_STAGES,
    };
  };

  const initial = loadState();

  const [users, setUsers] = useState<User[]>(initial.users || INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(initial.users?.[0] || INITIAL_USERS[0]);
  const [clients, setClients] = useState<Client[]>(initial.clients || INITIAL_CLIENTS);
  const [contacts, setContacts] = useState<Contact[]>(initial.contacts || INITIAL_CONTACTS);
  const [followUps, setFollowUps] = useState<FollowUp[]>(initial.followUps || INITIAL_FOLLOW_UPS);
  const [tasks, setTasks] = useState<Task[]>(initial.tasks || INITIAL_TASKS);
  const [interactions, setInteractions] = useState<Interaction[]>(initial.interactions || INITIAL_INTERACTIONS);
  const [projects, setProjects] = useState<Project[]>(initial.projects || INITIAL_PROJECTS);
  const [proposals, setProposals] = useState<Proposal[]>(initial.proposals || INITIAL_PROPOSALS);
  const [contracts, setContracts] = useState<Contract[]>(initial.contracts || INITIAL_CONTRACTS);
  const [financialRecords, setFinancialRecords] = useState<FinancialRecord[]>(initial.financialRecords || INITIAL_FINANCIAL);
  const [files, setFiles] = useState<FileItem[]>(initial.files || INITIAL_FILES);
  const [services, setServices] = useState<ServiceItem[]>(initial.services || INITIAL_SERVICES);
  const [pipelineStages, setPipelineStages] = useState<PipelineStageConfig[]>(initial.pipelineStages || PIPELINE_STAGES);

  // Sync to localStorage
  useEffect(() => {
    try {
      const db = {
        users,
        clients,
        contacts,
        followUps,
        tasks,
        interactions,
        projects,
        proposals,
        contracts,
        financialRecords,
        files,
        services,
        pipelineStages,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch (e) {
      console.warn('Could not save database state to localStorage (possibly quota limit with files)', e);
    }
  }, [
    users,
    clients,
    contacts,
    followUps,
    tasks,
    interactions,
    projects,
    proposals,
    contracts,
    financialRecords,
    files,
    services,
    pipelineStages,
  ]);

  const canEdit = currentUser.role === 'admin' || currentUser.role === 'collaborator';
  const isAdmin = currentUser.role === 'admin';
  const isViewer = currentUser.role === 'viewer';

  // --- Clients CRUD ---
  const addClient = (data: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'whatsappNormalized'>): Client => {
    const nowIso = new Date().toISOString();
    const newClient: Client = {
      ...data,
      id: `cli-${Date.now()}`,
      whatsappNormalized: normalizeWhatsAppNumber(data.whatsapp),
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    setClients((prev) => [newClient, ...prev]);

    // Record interaction / log
    const initialInteraction: Interaction = {
      id: `int-${Date.now()}`,
      clientId: newClient.id,
      date: newClient.firstContactDate || new Date().toISOString().split('T')[0],
      time: '09:00',
      type: 'Outro',
      responsibleUserId: currentUser.id,
      description: `Cadastro inicial do cliente/lead criado no sistema pelo usuário ${currentUser.name}.`,
      createdAt: nowIso,
    };
    setInteractions((prev) => [initialInteraction, ...prev]);

    return newClient;
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const updatedWhatsapp = updates.whatsapp !== undefined ? updates.whatsapp : c.whatsapp;
          return {
            ...c,
            ...updates,
            whatsappNormalized: normalizeWhatsAppNumber(updatedWhatsapp),
            updatedAt: new Date().toISOString(),
          };
        }
        return c;
      })
    );
  };

  const deleteClient = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
    // Cascade cleanup
    setContacts((prev) => prev.filter((cnt) => cnt.clientId !== id));
    setTasks((prev) => prev.filter((t) => t.clientId !== id));
    setFollowUps((prev) => prev.filter((f) => f.clientId !== id));
    setInteractions((prev) => prev.filter((i) => i.clientId !== id));
    setProjects((prev) => prev.filter((p) => p.clientId !== id));
    setProposals((prev) => prev.filter((p) => p.clientId !== id));
    setContracts((prev) => prev.filter((ctr) => ctr.clientId !== id));
    setFiles((prev) => prev.filter((fil) => fil.clientId !== id));
  };

  const getClientById = (id?: string) => {
    if (!id) return undefined;
    return clients.find((c) => c.id === id);
  };

  // --- Contacts CRUD ---
  const addContact = (data: Omit<Contact, 'id' | 'createdAt' | 'whatsappNormalized'>) => {
    const newContact: Contact = {
      ...data,
      id: `cnt-${Date.now()}`,
      whatsappNormalized: normalizeWhatsAppNumber(data.whatsapp || data.phone),
      createdAt: new Date().toISOString(),
    };
    setContacts((prev) => {
      // If marked as primary, unmark others for the same client
      if (newContact.isPrimary) {
        return [newContact, ...prev.map((c) => (c.clientId === data.clientId ? { ...c, isPrimary: false } : c))];
      }
      return [newContact, ...prev];
    });
  };

  const updateContact = (id: string, updates: Partial<Contact>) => {
    setContacts((prev) => {
      const existing = prev.find((c) => c.id === id);
      const clientId = existing?.clientId;
      return prev.map((c) => {
        if (c.id === id) {
          const updatedWhatsapp = updates.whatsapp !== undefined ? updates.whatsapp : c.whatsapp;
          return {
            ...c,
            ...updates,
            whatsappNormalized: normalizeWhatsAppNumber(updatedWhatsapp || updates.phone || c.phone),
          };
        }
        if (updates.isPrimary && clientId && c.clientId === clientId) {
          return { ...c, isPrimary: false };
        }
        return c;
      });
    });
  };

  const deleteContact = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  const getClientContacts = (clientId: string) => {
    return contacts.filter((c) => c.clientId === clientId);
  };

  // --- Tasks CRUD ---
  const addTask = (data: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...data,
      id: `tsk-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const completedAt =
            updates.status === 'completed' && t.status !== 'completed'
              ? new Date().toISOString()
              : updates.status !== undefined && updates.status !== 'completed'
              ? undefined
              : t.completedAt;
          return { ...t, ...updates, completedAt };
        }
        return t;
      })
    );
  };

  const toggleTaskStatus = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const isDone = t.status === 'completed';
          return {
            ...t,
            status: isDone ? 'todo' : 'completed',
            completedAt: isDone ? undefined : new Date().toISOString(),
          };
        }
        return t;
      })
    );
  };

  const toggleChecklistItem = (taskId: string, itemId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            checklist: t.checklist.map((item) =>
              item.id === itemId ? { ...item, done: !item.done } : item
            ),
          };
        }
        return t;
      })
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // --- FollowUps CRUD ---
  const addFollowUp = (data: Omit<FollowUp, 'id' | 'createdAt'>) => {
    const newFollowUp: FollowUp = {
      ...data,
      id: `flw-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setFollowUps((prev) => [newFollowUp, ...prev]);
  };

  const updateFollowUp = (id: string, updates: Partial<FollowUp>) => {
    setFollowUps((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          return { ...f, ...updates };
        }
        return f;
      })
    );
  };

  const deleteFollowUp = (id: string) => {
    setFollowUps((prev) => prev.filter((f) => f.id !== id));
  };

  // --- Interactions CRUD ---
  const addInteraction = (data: Omit<Interaction, 'id' | 'createdAt'>) => {
    const newInteraction: Interaction = {
      ...data,
      id: `int-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setInteractions((prev) => [newInteraction, ...prev]);

    // If next action is specified, we can optionally prompt or update client
    updateClient(data.clientId, {
      updatedAt: new Date().toISOString(),
    });
  };

  const getClientInteractions = (clientId: string) => {
    return interactions
      .filter((i) => i.clientId === clientId)
      .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  };

  // --- Projects CRUD ---
  const addProject = (data: Omit<Project, 'id' | 'createdAt'>) => {
    const newProject: Project = {
      ...data,
      id: `prj-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setProjects((prev) => [newProject, ...prev]);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  // --- Proposals CRUD ---
  const addProposal = (data: Omit<Proposal, 'id' | 'createdAt'>) => {
    const newProposal: Proposal = {
      ...data,
      id: `prp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setProposals((prev) => [newProposal, ...prev]);
  };

  const updateProposal = (id: string, updates: Partial<Proposal>) => {
    setProposals((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const deleteProposal = (id: string) => {
    setProposals((prev) => prev.filter((p) => p.id !== id));
  };

  // --- Contracts CRUD ---
  const addContract = (data: Omit<Contract, 'id' | 'createdAt'>) => {
    const newContract: Contract = {
      ...data,
      id: `ctr-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setContracts((prev) => [newContract, ...prev]);
  };

  const updateContract = (id: string, updates: Partial<Contract>) => {
    setContracts((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const deleteContract = (id: string) => {
    setContracts((prev) => prev.filter((c) => c.id !== id));
  };

  // --- Financial Records CRUD ---
  const addFinancialRecord = (data: Omit<FinancialRecord, 'id' | 'createdAt'>) => {
    const newRecord: FinancialRecord = {
      ...data,
      id: `fin-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setFinancialRecords((prev) => [newRecord, ...prev]);
  };

  const updateFinancialRecord = (id: string, updates: Partial<FinancialRecord>) => {
    setFinancialRecords((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  // --- Files CRUD ---
  const addFile = (data: Omit<FileItem, 'id' | 'uploadDate'>) => {
    const today = new Date().toISOString().split('T')[0];
    const newFile: FileItem = {
      ...data,
      id: `fil-${Date.now()}`,
      uploadDate: today,
    };
    setFiles((prev) => [newFile, ...prev]);
  };

  const deleteFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const getClientFiles = (clientId: string) => {
    return files.filter((f) => f.clientId === clientId);
  };

  // --- Services CRUD ---
  const addService = (data: Omit<ServiceItem, 'id'>) => {
    const newService: ServiceItem = {
      ...data,
      id: `srv-${Date.now()}`,
    };
    setServices((prev) => [...prev, newService]);
  };

  const updateService = (id: string, updates: Partial<ServiceItem>) => {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const deleteService = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  // --- Users & Settings ---
  const addUser = (data: Omit<User, 'id'>) => {
    const newUser: User = {
      ...data,
      id: `user-${Date.now()}`,
    };
    setUsers((prev) => [...prev, newUser]);
  };

  const updateUser = (user: User) => {
    setUsers((prev) => prev.map((u) => (u.id === user.id ? user : u)));
    if (currentUser.id === user.id) {
      setCurrentUser(user);
    }
  };

  const updatePipelineStages = (stages: PipelineStageConfig[]) => {
    setPipelineStages(stages);
  };

  // --- Reset & Export/Import ---
  const resetDemoData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    setClients(INITIAL_CLIENTS);
    setContacts(INITIAL_CONTACTS);
    setFollowUps(INITIAL_FOLLOW_UPS);
    setTasks(INITIAL_TASKS);
    setInteractions(INITIAL_INTERACTIONS);
    setProjects(INITIAL_PROJECTS);
    setProposals(INITIAL_PROPOSALS);
    setContracts(INITIAL_CONTRACTS);
    setFinancialRecords(INITIAL_FINANCIAL);
    setFiles(INITIAL_FILES);
    setServices(INITIAL_SERVICES);
    setPipelineStages(PIPELINE_STAGES);
  };

  const exportDataJson = () => {
    const data = {
      users,
      clients,
      contacts,
      followUps,
      tasks,
      interactions,
      projects,
      proposals,
      contracts,
      financialRecords,
      files,
      services,
      pipelineStages,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crm_pro_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importDataJson = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.clients && parsed.tasks) {
        if (parsed.users) setUsers(parsed.users);
        if (parsed.clients) setClients(parsed.clients);
        if (parsed.contacts) setContacts(parsed.contacts);
        if (parsed.followUps) setFollowUps(parsed.followUps);
        if (parsed.tasks) setTasks(parsed.tasks);
        if (parsed.interactions) setInteractions(parsed.interactions);
        if (parsed.projects) setProjects(parsed.projects);
        if (parsed.proposals) setProposals(parsed.proposals);
        if (parsed.contracts) setContracts(parsed.contracts);
        if (parsed.financialRecords) setFinancialRecords(parsed.financialRecords);
        if (parsed.files) setFiles(parsed.files);
        if (parsed.services) setServices(parsed.services);
        return true;
      }
    } catch (e) {
      console.error('Import failed', e);
    }
    return false;
  };

  // --- Client Complete Timeline Generator ---
  const getClientTimeline = (clientId: string): TimelineEvent[] => {
    const events: TimelineEvent[] = [];

    // 1. Interactions
    interactions
      .filter((i) => i.clientId === clientId)
      .forEach((i) => {
        const user = users.find((u) => u.id === i.responsibleUserId)?.name || 'Equipe';
        events.push({
          id: `tl-int-${i.id}`,
          clientId,
          timestamp: `${i.date}T${i.time || '00:00'}:00`,
          dateFormatted: formatDateTime(i.date, i.time),
          type: 'interaction',
          title: `Interação (${i.type})`,
          description: i.description + (i.nextAction ? ` • Próxima ação: ${i.nextAction}` : ''),
          userLabel: user,
          iconType: i.type.toLowerCase(),
        });
      });

    // 2. Completed Tasks
    tasks
      .filter((t) => t.clientId === clientId && t.status === 'completed')
      .forEach((t) => {
        const user = users.find((u) => u.id === t.responsibleUserId)?.name || 'Equipe';
        events.push({
          id: `tl-tsk-${t.id}`,
          clientId,
          timestamp: t.completedAt || `${t.date}T${t.time || '18:00'}:00`,
          dateFormatted: formatDateTime(t.date, t.time),
          type: 'task',
          title: `Tarefa Concluída: ${t.title}`,
          description: t.description || 'Tarefa realizada com sucesso.',
          userLabel: user,
          iconType: 'check-circle',
        });
      });

    // 3. Follow-ups
    followUps
      .filter((f) => f.clientId === clientId)
      .forEach((f) => {
        const user = users.find((u) => u.id === f.responsibleUserId)?.name || 'Equipe';
        events.push({
          id: `tl-flw-${f.id}`,
          clientId,
          timestamp: `${f.date}T${f.time || '12:00'}:00`,
          dateFormatted: formatDateTime(f.date, f.time),
          type: 'followup',
          title: `Follow-up [${f.status.toUpperCase()}]: ${f.reason}`,
          description: f.notes || f.result || `Canal: ${f.channel}`,
          userLabel: user,
          iconType: 'calendar',
        });
      });

    // 4. Files Added
    files
      .filter((fil) => fil.clientId === clientId)
      .forEach((fil) => {
        const user = users.find((u) => u.id === fil.uploadedByUserId)?.name || 'Equipe';
        events.push({
          id: `tl-fil-${fil.id}`,
          clientId,
          timestamp: `${fil.uploadDate}T12:00:00`,
          dateFormatted: formatDate(fil.uploadDate),
          type: 'file',
          title: `Arquivo Adicionado: ${fil.name}`,
          description: `Categoria: ${fil.category} • Tamanho: ${fil.fileSize}`,
          userLabel: user,
          iconType: 'paperclip',
        });
      });

    // 5. Proposals
    proposals
      .filter((p) => p.clientId === clientId)
      .forEach((p) => {
        events.push({
          id: `tl-prp-${p.id}`,
          clientId,
          timestamp: `${p.sentDate}T09:00:00`,
          dateFormatted: formatDate(p.sentDate),
          type: 'proposal',
          title: `Proposta [${p.status.toUpperCase()}]: ${p.serviceName}`,
          description: `Valor: R$ ${p.value.toLocaleString('pt-BR')} • Válida até: ${formatDate(p.validUntil)}`,
          userLabel: 'Comercial',
          iconType: 'file-text',
        });
      });

    // 6. Contracts
    contracts
      .filter((c) => c.clientId === clientId)
      .forEach((c) => {
        events.push({
          id: `tl-ctr-${c.id}`,
          clientId,
          timestamp: `${c.startDate}T08:00:00`,
          dateFormatted: formatDate(c.startDate),
          type: 'contract',
          title: `Contrato Ativo: ${c.serviceName}`,
          description: `Valor: R$ ${c.value.toLocaleString('pt-BR')} • Renovação: ${c.renewal} • Término: ${formatDate(c.endDate)}`,
          userLabel: 'Jurídico/Comercial',
          iconType: 'shield-check',
        });
      });

    // Sort descending by timestamp
    return events.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  };

  // --- Real Computed Metrics ---
  const stats = useMemo(() => {
    const leadsNew = clients.filter(
      (c) => c.status === 'lead' || c.pipelineStage === 'lead' || c.pipelineStage === 'first_contact'
    ).length;

    const leadsInNeg = clients.filter(
      (c) =>
        c.status === 'in_negotiation' ||
        c.pipelineStage === 'qualification' ||
        c.pipelineStage === 'meeting' ||
        c.pipelineStage === 'proposal_sent' ||
        c.pipelineStage === 'negotiation'
    ).length;

    const activeClients = clients.filter((c) => c.status === 'active').length;
    const inactiveClients = clients.filter((c) => c.status === 'inactive').length;

    const followUpsToday = followUps.filter((f) => isDateToday(f.date) && f.status === 'pending').length;
    const followUpsOverdue = followUps.filter((f) => isDateOverdue(f.date, f.time) && f.status === 'pending').length;

    const tasksToday = tasks.filter((t) => isDateToday(t.date) && t.status !== 'completed' && t.status !== 'cancelled').length;
    const tasksWeek = tasks.filter((t) => isDateThisWeek(t.date) && t.status !== 'completed' && t.status !== 'cancelled').length;
    const tasksOverdue = tasks.filter((t) => isDateOverdue(t.date, t.time) && t.status !== 'completed' && t.status !== 'cancelled').length;

    const proposalsPending = proposals.filter(
      (p) => p.status === 'sent' || p.status === 'viewed' || p.status === 'negotiating'
    ).length;

    const contractsExpiring = contracts.filter((c) => {
      if (c.status === 'cancelled') return false;
      const days = daysUntil(c.endDate);
      return days >= 0 && days <= 30;
    }).length;

    const totalPipelineValue = clients.reduce((acc, c) => acc + (c.potentialValue || 0), 0);

    return {
      leadsNewCount: leadsNew,
      leadsInNegotiationCount: leadsInNeg,
      activeClientsCount: activeClients,
      inactiveClientsCount: inactiveClients,
      followUpsTodayCount: followUpsToday,
      followUpsOverdueCount: followUpsOverdue,
      tasksTodayCount: tasksToday,
      tasksWeekCount: tasksWeek,
      tasksOverdueCount: tasksOverdue,
      proposalsPendingCount: proposalsPending,
      contractsExpiringCount: contractsExpiring,
      totalPipelineValue,
    };
  }, [clients, followUps, tasks, proposals, contracts]);

  return (
    <CrmContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        users,
        addUser,
        updateUser,
        canEdit,
        isAdmin,
        isViewer,
        clients,
        addClient,
        updateClient,
        deleteClient,
        getClientById,
        contacts,
        addContact,
        updateContact,
        deleteContact,
        getClientContacts,
        tasks,
        addTask,
        updateTask,
        toggleTaskStatus,
        toggleChecklistItem,
        deleteTask,
        followUps,
        addFollowUp,
        updateFollowUp,
        deleteFollowUp,
        interactions,
        addInteraction,
        getClientInteractions,
        projects,
        addProject,
        updateProject,
        deleteProject,
        proposals,
        addProposal,
        updateProposal,
        deleteProposal,
        contracts,
        addContract,
        updateContract,
        deleteContract,
        financialRecords,
        addFinancialRecord,
        updateFinancialRecord,
        files,
        addFile,
        deleteFile,
        getClientFiles,
        services,
        addService,
        updateService,
        deleteService,
        pipelineStages,
        updatePipelineStages,
        getClientTimeline,
        resetDemoData,
        exportDataJson,
        importDataJson,
        stats,
      }}
    >
      {children}
    </CrmContext.Provider>
  );
};

export function useCrm() {
  const context = useContext(CrmContext);
  if (!context) {
    throw new Error('useCrm must be used within a CrmProvider');
  }
  return context;
}
