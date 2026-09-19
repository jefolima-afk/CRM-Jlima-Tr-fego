import React, { useState } from 'react';
import { PhoneCall, Search, Plus, Building2, Mail, Phone, Trash2, Edit2 } from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { WhatsAppButton } from '../components/WhatsAppButton';

interface ContactsViewProps {
  onSelectClient: (clientId: string) => void;
}

export const ContactsView: React.FC<ContactsViewProps> = ({ onSelectClient }) => {
  const { contacts, clients, addContact, deleteContact, canEdit } = useCrm();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Contact Form
  const [name, setName] = useState('');
  const [clientId, setClientId] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);

  const filteredContacts = contacts.filter((cnt) => {
    const client = clients.find((c) => c.id === cnt.clientId);
    const q = searchTerm.toLowerCase();
    return (
      !searchTerm ||
      cnt.name.toLowerCase().includes(q) ||
      (cnt.role && cnt.role.toLowerCase().includes(q)) ||
      (client && client.corporateName.toLowerCase().includes(q))
    );
  });

  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !clientId) return;

    addContact({
      clientId,
      name: name.trim(),
      role: role.trim() || undefined,
      phone: phone.trim() || undefined,
      whatsapp: whatsapp.trim() || undefined,
      email: email.trim() || undefined,
      isPrimary,
    });

    setIsModalOpen(false);
    setName('');
    setRole('');
    setPhone('');
    setWhatsapp('');
    setEmail('');
    setIsPrimary(false);
  };

  return (
    <div id="view-contacts" className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Catálogo de Contatos</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Pessoas de contato, tomadores de decisão e interlocutores em cada empresa.
          </p>
        </div>
        {canEdit && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
          >
            <Plus size={16} />
            <span>Novo Contato</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome do contato, cargo ou empresa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-blue-600"
          />
        </div>
      </div>

      {/* Grid of Contacts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContacts.map((cnt) => {
          const client = clients.find((c) => c.id === cnt.clientId);
          return (
            <div
              key={cnt.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:border-blue-300 transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                      {cnt.name}
                      {cnt.isPrimary && (
                        <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                          Principal
                        </span>
                      )}
                    </h3>
                    <div className="text-xs text-slate-500 mt-0.5">{cnt.role || 'Sem cargo definido'}</div>
                  </div>

                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => deleteContact(cnt.id)}
                      className="text-slate-400 hover:text-red-600 p-1"
                      title="Excluir contato"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                {client && (
                  <button
                    type="button"
                    onClick={() => onSelectClient(client.id)}
                    className="mt-2 text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1.5"
                  >
                    <Building2 size={13} /> {client.corporateName}
                  </button>
                )}

                <div className="mt-3 space-y-1 text-xs text-slate-600">
                  {cnt.email && (
                    <div className="flex items-center gap-1.5">
                      <Mail size={13} className="text-slate-400" />
                      <span className="truncate">{cnt.email}</span>
                    </div>
                  )}
                  {cnt.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone size={13} className="text-slate-400" />
                      <span>{cnt.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action */}
              <div className="pt-3 border-t border-slate-100">
                <WhatsAppButton number={cnt.whatsapp || cnt.phone} variant="compact" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Novo Contato */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="font-bold text-base text-slate-900 mb-3">Novo Contato</h3>
            <form onSubmit={handleCreateContact} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Empresa / Cliente *</label>
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
                <label className="block font-semibold mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Cargo / Função</label>
                <input
                  type="text"
                  placeholder="Ex: Diretor Comercial, Gerente de TI"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">WhatsApp</label>
                  <input
                    type="text"
                    placeholder="54999999999"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Telefone Fixo</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="chk-primary-contact"
                  checked={isPrimary}
                  onChange={(e) => setIsPrimary(e.target.checked)}
                />
                <label htmlFor="chk-primary-contact">Contato principal da empresa</label>
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
                  Salvar Contato
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
