import React, { useState } from 'react';
import {
  FolderOpen,
  Upload,
  Search,
  Download,
  Trash2,
  Building2,
  FileText,
  Image,
  File,
  Eye,
  X,
} from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { FileCategory } from '../types';
import { formatDate } from '../utils/formatters';

interface FilesViewProps {
  onSelectClient: (clientId: string, tab?: string) => void;
}

export const FilesView: React.FC<FilesViewProps> = ({ onSelectClient }) => {
  const { files, clients, users, currentUser, addFile, deleteFile, canEdit } = useCrm();

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<any>(null);

  // Upload Form State
  const [clientId, setClientId] = useState('');
  const [fileName, setFileName] = useState('');
  const [category, setCategory] = useState<FileCategory>('Documentos');
  const [description, setDescription] = useState('');
  const [uploadData, setUploadData] = useState<{ name: string; size: string; type: string; base64?: string } | null>(null);

  const categories: FileCategory[] = [
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
  ];

  const filteredFiles = files.filter((f) => {
    const client = clients.find((c) => c.id === f.clientId);
    const q = searchTerm.toLowerCase();

    if (
      searchTerm &&
      !f.name.toLowerCase().includes(q) &&
      (!client || !client.corporateName.toLowerCase().includes(q))
    ) {
      return false;
    }

    if (categoryFilter !== 'all' && f.category !== categoryFilter) return false;

    return true;
  });

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      const sizeKb = Math.round(file.size / 1024);
      const sizeStr = file.size > 1024 * 1024 ? `${sizeMb} MB` : `${sizeKb} KB`;

      setFileName(file.name);
      setUploadData({
        name: file.name,
        size: sizeStr,
        type: file.type || 'application/octet-stream',
        base64: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim() || !clientId) return;

    addFile({
      clientId,
      name: fileName.trim(),
      category,
      description: description.trim() || undefined,
      uploadedByUserId: currentUser.id,
      fileSize: uploadData?.size || '250 KB',
      fileType: uploadData?.type || 'application/pdf',
      fileDataUrl: uploadData?.base64,
    });

    setIsUploadModalOpen(false);
    setFileName('');
    setDescription('');
    setClientId('');
    setUploadData(null);
  };

  return (
    <div id="view-files" className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Central de Arquivos</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Documentos, contratos, briefings, propostas e criativos organizados por cliente e categoria.
          </p>
        </div>
        {canEdit && (
          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
          >
            <Upload size={16} />
            <span>Fazer Upload</span>
          </button>
        )}
      </div>

      {/* Category Pills & Search */}
      <div className="space-y-3">
        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar arquivo por nome ou cliente vinculado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-blue-600"
            />
          </div>
        </div>

        {/* Categories horizontally scrollable */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            type="button"
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap ${
              categoryFilter === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Todas as Categorias ({files.length})
          </button>
          {categories.map((cat) => {
            const count = files.filter((f) => f.category === cat).length;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap flex items-center gap-1 ${
                  categoryFilter === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>{cat}</span>
                <span className="text-[10px] opacity-70">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Files */}
      {filteredFiles.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-xl border border-slate-200 p-8">
          <FolderOpen size={40} className="mx-auto text-slate-300 mb-2" />
          <h3 className="font-semibold text-slate-800 text-sm">Nenhum arquivo armazenado</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Faça upload de contratos, briefings, propostas e comprovantes vinculados aos clientes.
          </p>
          {canEdit && (
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
            >
              <Upload size={15} /> Enviar Primeiro Arquivo
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredFiles.map((file) => {
            const client = clients.find((c) => c.id === file.clientId);
            const uploader = users.find((u) => u.id === file.uploadedByUserId);

            return (
              <div
                key={file.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:border-blue-300 transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-2">
                    <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {file.category}
                    </span>
                    <span className="text-slate-400 font-mono">{file.fileSize}</span>
                  </div>

                  <div className="font-bold text-xs text-slate-900 line-clamp-2" title={file.name}>
                    {file.name}
                  </div>

                  {file.description && (
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{file.description}</p>
                  )}

                  {client && (
                    <button
                      type="button"
                      onClick={() => onSelectClient(client.id, 'arquivos')}
                      className="mt-2 text-[11px] font-semibold text-blue-600 hover:underline flex items-center gap-1 truncate"
                    >
                      <Building2 size={11} /> {client.corporateName}
                    </button>
                  )}

                  <div className="text-[10px] text-slate-400 mt-2 font-mono">
                    Upload por {uploader?.name || 'Equipe'} em {formatDate(file.uploadDate)}
                  </div>
                </div>

                {/* Actions: Preview, Download, Delete */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {file.fileDataUrl && file.fileType.startsWith('image/') && (
                      <button
                        type="button"
                        onClick={() => setPreviewFile(file)}
                        className="text-xs font-semibold text-slate-600 hover:text-blue-600 inline-flex items-center gap-1"
                      >
                        <Eye size={13} /> Ver
                      </button>
                    )}

                    {file.fileDataUrl ? (
                      <a
                        href={file.fileDataUrl}
                        download={file.name}
                        className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
                      >
                        <Download size={13} /> Baixar
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400">Armazenado</span>
                    )}
                  </div>

                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => deleteFile(file.id)}
                      className="text-slate-400 hover:text-red-600 p-1"
                      title="Excluir arquivo"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="font-bold text-base text-slate-900 mb-3">Upload de Arquivo</h3>
            <form onSubmit={handleUploadSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Cliente Vinculado *</label>
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
                <label className="block font-semibold mb-1">Selecione o Arquivo *</label>
                <input
                  type="file"
                  required
                  onChange={handleFileInput}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Nome do Arquivo</label>
                <input
                  type="text"
                  required
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Categoria</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as FileCategory)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Descrição / Finalidade</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg">
                  Confirmar Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewFile && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewFile(null)}
        >
          <div className="max-w-2xl w-full bg-white rounded-2xl p-4 shadow-2xl space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-bold text-sm text-slate-900">{previewFile.name}</span>
              <button
                type="button"
                onClick={() => setPreviewFile(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex items-center justify-center max-h-[70vh] overflow-hidden rounded-xl bg-slate-100">
              <img
                src={previewFile.fileDataUrl}
                alt={previewFile.name}
                className="max-h-[65vh] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
