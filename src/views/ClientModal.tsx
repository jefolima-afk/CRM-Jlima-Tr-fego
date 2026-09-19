import React, { useState, useEffect } from 'react';
import { X, Building2, Briefcase, Compass, AlertCircle } from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { Client, ClientStatus, PipelineStageId } from '../types';
import { validateWhatsAppNumber } from '../utils/whatsapp';
import { getTodayString } from '../utils/formatters';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientToEdit?: Client | null;
  onSaved?: (clientId: string) => void;
}

export const ClientModal: React.FC<ClientModalProps> = ({
  isOpen,
  onClose,
  clientToEdit,
  onSaved,
}) => {
  const { users, currentUser, services, pipelineStages, addClient, updateClient } = useCrm();
  const [activeTab, setActiveTab] = useState<'cadastral' | 'comercial' | 'estrategico'>('cadastral');

  // Form states - Cadastral
  const [corporateName, setCorporateName] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [segment, setSegment] = useState('');
  const [assignedUserId, setAssignedUserId] = useState(currentUser.id);
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [generalNotes, setGeneralNotes] = useState('');

  // Form states - Comercial
  const [leadSource, setLeadSource] = useState('Indicação');
  const [firstContactDate, setFirstContactDate] = useState(getTodayString());
  const [commercialResponsibleUserId, setCommercialResponsibleUserId] = useState(currentUser.id);
  const [status, setStatus] = useState<ClientStatus>('lead');
  const [pipelineStage, setPipelineStage] = useState<PipelineStageId>('lead');
  const [interestedService, setInterestedService] = useState('');
  const [potentialValue, setPotentialValue] = useState<number>(0);
  const [contractedValue, setContractedValue] = useState<number>(0);
  const [startDate, setStartDate] = useState('');
  const [renewalDate, setRenewalDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [recurrence, setRecurrence] = useState('Mensal');
  const [commercialNotes, setCommercialNotes] = useState('');

  // Form states - Estratégico
  const [niche, setNiche] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [persona, setPersona] = useState('');
  const [productsServices, setProductsServices] = useState('');
  const [differentials, setDifferentials] = useState('');
  const [positioning, setPositioning] = useState('');
  const [competitors, setCompetitors] = useState('');
  const [objectives, setObjectives] = useState('');
  const [channelsUsed, setChannelsUsed] = useState('');
  const [currentStrategies, setCurrentStrategies] = useState('');
  const [strategicNotes, setStrategicNotes] = useState('');

  // Populate form if editing
  useEffect(() => {
    if (clientToEdit) {
      setCorporateName(clientToEdit.corporateName || '');
      setTradeName(clientToEdit.tradeName || '');
      setCpfCnpj(clientToEdit.cpfCnpj || '');
      setSegment(clientToEdit.segment || '');
      setAssignedUserId(clientToEdit.assignedUserId || currentUser.id);
      setPhone(clientToEdit.phone || '');
      setWhatsapp(clientToEdit.whatsapp || '');
      setEmail(clientToEdit.email || '');
      setWebsite(clientToEdit.website || '');
      setInstagram(clientToEdit.instagram || '');
      setFacebook(clientToEdit.facebook || '');
      setLinkedin(clientToEdit.linkedin || '');
      setAddress(clientToEdit.address || '');
      setCity(clientToEdit.city || '');
      setState(clientToEdit.state || '');
      setGeneralNotes(clientToEdit.generalNotes || '');

      setLeadSource(clientToEdit.leadSource || 'Indicação');
      setFirstContactDate(clientToEdit.firstContactDate || getTodayString());
      setCommercialResponsibleUserId(clientToEdit.commercialResponsibleUserId || currentUser.id);
      setStatus(clientToEdit.status || 'lead');
      setPipelineStage(clientToEdit.pipelineStage || 'lead');
      setInterestedService(clientToEdit.interestedService || '');
      setPotentialValue(clientToEdit.potentialValue || 0);
      setContractedValue(clientToEdit.contractedValue || 0);
      setStartDate(clientToEdit.startDate || '');
      setRenewalDate(clientToEdit.renewalDate || '');
      setPaymentMethod(clientToEdit.paymentMethod || '');
      setRecurrence(clientToEdit.recurrence || 'Mensal');
      setCommercialNotes(clientToEdit.commercialNotes || '');

      setNiche(clientToEdit.niche || '');
      setTargetAudience(clientToEdit.targetAudience || '');
      setPersona(clientToEdit.persona || '');
      setProductsServices(clientToEdit.productsServices || '');
      setDifferentials(clientToEdit.differentials || '');
      setPositioning(clientToEdit.positioning || '');
      setCompetitors(clientToEdit.competitors || '');
      setObjectives(clientToEdit.objectives || '');
      setChannelsUsed(clientToEdit.channelsUsed || '');
      setCurrentStrategies(clientToEdit.currentStrategies || '');
      setStrategicNotes(clientToEdit.strategicNotes || '');
    } else {
      // Reset
      setCorporateName('');
      setTradeName('');
      setCpfCnpj('');
      setSegment('');
      setAssignedUserId(currentUser.id);
      setPhone('');
      setWhatsapp('');
      setEmail('');
      setWebsite('');
      setInstagram('');
      setFacebook('');
      setLinkedin('');
      setAddress('');
      setCity('');
      setState('');
      setGeneralNotes('');
      setStatus('lead');
      setPipelineStage('lead');
      setPotentialValue(0);
      setContractedValue(0);
      setFirstContactDate(getTodayString());
    }
  }, [clientToEdit, currentUser.id, isOpen]);

  if (!isOpen) return null;

  const whatsappValidation = validateWhatsAppNumber(whatsapp);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!corporateName.trim()) {
      setActiveTab('cadastral');
      return;
    }

    const payload = {
      corporateName: corporateName.trim(),
      tradeName: tradeName.trim() || undefined,
      cpfCnpj: cpfCnpj.trim() || undefined,
      segment: segment.trim() || undefined,
      assignedUserId,
      phone: phone.trim() || undefined,
      whatsapp: whatsapp.trim(),
      email: email.trim() || undefined,
      website: website.trim() || undefined,
      instagram: instagram.trim() || undefined,
      facebook: facebook.trim() || undefined,
      linkedin: linkedin.trim() || undefined,
      address: address.trim() || undefined,
      city: city.trim() || undefined,
      state: state.trim() || undefined,
      generalNotes: generalNotes.trim() || undefined,

      leadSource,
      firstContactDate,
      commercialResponsibleUserId,
      status,
      pipelineStage,
      interestedService: interestedService || undefined,
      potentialValue: Number(potentialValue) || 0,
      contractedValue: Number(contractedValue) || 0,
      startDate: startDate || undefined,
      renewalDate: renewalDate || undefined,
      paymentMethod: paymentMethod || undefined,
      recurrence,
      commercialNotes: commercialNotes.trim() || undefined,

      niche: niche.trim() || undefined,
      targetAudience: targetAudience.trim() || undefined,
      persona: persona.trim() || undefined,
      productsServices: productsServices.trim() || undefined,
      differentials: differentials.trim() || undefined,
      positioning: positioning.trim() || undefined,
      competitors: competitors.trim() || undefined,
      objectives: objectives.trim() || undefined,
      channelsUsed: channelsUsed.trim() || undefined,
      currentStrategies: currentStrategies.trim() || undefined,
      strategicNotes: strategicNotes.trim() || undefined,
    };

    if (clientToEdit) {
      updateClient(clientToEdit.id, payload);
      if (onSaved) onSaved(clientToEdit.id);
    } else {
      const created = addClient(payload);
      if (onSaved) onSaved(created.id);
    }

    onClose();
  };

  return (
    <div
      id="modal-client-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="modal-client-card"
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {clientToEdit ? 'Editar Cadastro do Cliente' : 'Novo Cadastro de Cliente / Lead'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Preencha os dados cadastrais, comerciais e estratégicos para relacionamento completo.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-white px-6 pt-2 gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('cadastral')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'cadastral'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Building2 size={15} />
            1. Dados Cadastrais
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('comercial')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'comercial'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Briefcase size={15} />
            2. Dados Comerciais
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('estrategico')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'estrategico'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Compass size={15} />
            3. Dados Estratégicos
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* TAB 1: DADOS CADASTRAIS */}
          {activeTab === 'cadastral' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nome / Razão Social <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Alfa Distribuidora de Medicamentos Ltda"
                    value={corporateName}
                    onChange={(e) => setCorporateName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nome Fantasia</label>
                  <input
                    type="text"
                    placeholder="Ex: Alfa Distribuidora"
                    value={tradeName}
                    onChange={(e) => setTradeName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">CPF / CNPJ</label>
                  <input
                    type="text"
                    placeholder="00.000.000/0001-00"
                    value={cpfCnpj}
                    onChange={(e) => setCpfCnpj(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Segmento / Nicho</label>
                  <input
                    type="text"
                    placeholder="Ex: Farmacêutico, TI, Varejo"
                    value={segment}
                    onChange={(e) => setSegment(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Responsável Interno</label>
                  <select
                    value={assignedUserId}
                    onChange={(e) => setAssignedUserId(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600 bg-white"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.roleLabel})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Contatos e WhatsApp Inteligente */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Comunicação & WhatsApp Inteligente
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      WhatsApp <span className="text-emerald-700 text-[10px] font-bold">(Obrigatório Regra Normalização)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: (54) 99999-9999 ou 54999999999"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-emerald-600 bg-white"
                    />
                    {whatsapp && (
                      <div className="mt-1 text-[11px] flex items-center gap-1">
                        {whatsappValidation.isValid ? (
                          <span className="text-emerald-700 font-mono">
                            ✓ Normalizado: {whatsappValidation.formatted} ({whatsappValidation.normalized})
                          </span>
                        ) : (
                          <span className="text-amber-700 flex items-center gap-1">
                            <AlertCircle size={12} />
                            {whatsappValidation.errorMessage}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Telefone Fixo / Comercial</label>
                    <input
                      type="text"
                      placeholder="(11) 3333-4444"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">E-mail Principal</label>
                    <input
                      type="email"
                      placeholder="financeiro@empresa.com.br"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Site Institucional</label>
                    <input
                      type="url"
                      placeholder="https://empresa.com.br"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Redes Sociais */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Instagram</label>
                  <input
                    type="text"
                    placeholder="@perfil"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">LinkedIn</label>
                  <input
                    type="text"
                    placeholder="linkedin.com/company/..."
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Facebook</label>
                  <input
                    type="text"
                    placeholder="facebook.com/..."
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600"
                  />
                </div>
              </div>

              {/* Localização */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Endereço Completo</label>
                  <input
                    type="text"
                    placeholder="Rua, Número, Bairro, Complemento"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Cidade</label>
                    <input
                      type="text"
                      placeholder="São Paulo"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">UF</label>
                    <input
                      type="text"
                      maxLength={2}
                      placeholder="SP"
                      value={state}
                      onChange={(e) => setState(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600 uppercase"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Observações Gerais</label>
                <textarea
                  rows={2}
                  placeholder="Anotações internas sobre o cliente..."
                  value={generalNotes}
                  onChange={(e) => setGeneralNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600"
                />
              </div>
            </div>
          )}

          {/* TAB 2: DADOS COMERCIAIS */}
          {activeTab === 'comercial' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status do Relacionamento</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ClientStatus)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600 bg-white"
                  >
                    <option value="lead">Lead (Prospecto)</option>
                    <option value="in_negotiation">Em Negociação</option>
                    <option value="active">Cliente Ativo</option>
                    <option value="inactive">Cliente Inativo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Etapa no Pipeline Kanban</label>
                  <select
                    value={pipelineStage}
                    onChange={(e) => setPipelineStage(e.target.value as PipelineStageId)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600 bg-white"
                  >
                    {pipelineStages.map((stg) => (
                      <option key={stg.id} value={stg.id}>
                        {stg.order}. {stg.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Origem do Lead</label>
                  <input
                    type="text"
                    placeholder="Ex: Google Ads, Indicação, Instagram"
                    value={leadSource}
                    onChange={(e) => setLeadSource(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Data 1º Contato</label>
                  <input
                    type="date"
                    value={firstContactDate}
                    onChange={(e) => setFirstContactDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Responsável Comercial</label>
                  <select
                    value={commercialResponsibleUserId}
                    onChange={(e) => setCommercialResponsibleUserId(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600 bg-white"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Serviço de Interesse</label>
                  <select
                    value={interestedService}
                    onChange={(e) => setInterestedService(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600 bg-white"
                  >
                    <option value="">Selecione o serviço...</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Valores e Contrato */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Valores e Condições Contratuais
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Valor Potencial (R$)</label>
                    <input
                      type="number"
                      step="100"
                      min="0"
                      placeholder="0,00"
                      value={potentialValue || ''}
                      onChange={(e) => setPotentialValue(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Valor Contratado (R$)</label>
                    <input
                      type="number"
                      step="100"
                      min="0"
                      placeholder="0,00"
                      value={contractedValue || ''}
                      onChange={(e) => setContractedValue(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Data Início</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Data Renovação</label>
                    <input
                      type="date"
                      value={renewalDate}
                      onChange={(e) => setRenewalDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Forma de Pagamento</label>
                    <input
                      type="text"
                      placeholder="Pix, Boleto, Cartão"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Recorrência</label>
                    <select
                      value={recurrence}
                      onChange={(e) => setRecurrence(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600 bg-white"
                    >
                      <option value="Pontual">Pontual / Único</option>
                      <option value="Mensal">Mensal</option>
                      <option value="Trimestral">Trimestral</option>
                      <option value="Semestral">Semestral</option>
                      <option value="Anual">Anual</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Observações Comerciais</label>
                <textarea
                  rows={2}
                  placeholder="Condições especiais, negociação, histórico de desconto..."
                  value={commercialNotes}
                  onChange={(e) => setCommercialNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600"
                />
              </div>
            </div>
          )}

          {/* TAB 3: DADOS ESTRATÉGICOS */}
          {activeTab === 'estrategico' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nicho Específico</label>
                  <input
                    type="text"
                    placeholder="Ex: Clínicas odontológicas de alto padrão"
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Público-Alvo</label>
                  <input
                    type="text"
                    placeholder="Ex: Homens e mulheres de 35 a 60 anos classe A/B"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Persona</label>
                  <textarea
                    rows={2}
                    placeholder="Descrição da persona de compra do cliente..."
                    value={persona}
                    onChange={(e) => setPersona(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Produtos / Serviços do Cliente</label>
                  <textarea
                    rows={2}
                    placeholder="O que o cliente vende e entrega no mercado..."
                    value={productsServices}
                    onChange={(e) => setProductsServices(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Diferenciais Competitivos</label>
                  <input
                    type="text"
                    placeholder="Ex: Entrega em 24h, tecnologia patenteada"
                    value={differentials}
                    onChange={(e) => setDifferentials(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Posicionamento de Mercado</label>
                  <input
                    type="text"
                    placeholder="Ex: Líder premium no segmento regional"
                    value={positioning}
                    onChange={(e) => setPositioning(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Principais Concorrentes</label>
                  <input
                    type="text"
                    placeholder="Ex: Empresa X, Concorrente Y"
                    value={competitors}
                    onChange={(e) => setCompetitors(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Objetivos Principais</label>
                  <input
                    type="text"
                    placeholder="Ex: Aumentar leads qualificados em 50%"
                    value={objectives}
                    onChange={(e) => setObjectives(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Canais Utilizados</label>
                  <input
                    type="text"
                    placeholder="Ex: WhatsApp, Google, Instagram, Feiras"
                    value={channelsUsed}
                    onChange={(e) => setChannelsUsed(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Estratégias Atuais</label>
                  <input
                    type="text"
                    placeholder="Ex: Anúncios institucionais e prospecção ativa"
                    value={currentStrategies}
                    onChange={(e) => setCurrentStrategies(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Observações Estratégicas</label>
                <textarea
                  rows={2}
                  placeholder="Outros direcionamentos de branding, marketing ou vendas..."
                  value={strategicNotes}
                  onChange={(e) => setStrategicNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600"
                />
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between shrink-0">
            <div className="text-xs text-slate-500">
              Campos marcados com <span className="text-red-500">*</span> são de preenchimento obrigatório.
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
              >
                {clientToEdit ? 'Salvar Alterações' : 'Concluir Cadastro'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
