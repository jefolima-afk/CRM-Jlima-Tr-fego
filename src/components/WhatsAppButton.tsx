import React from 'react';
import { MessageSquare, ExternalLink, AlertCircle } from 'lucide-react';
import { validateWhatsAppNumber, formatWhatsAppDisplay } from '../utils/whatsapp';

interface WhatsAppButtonProps {
  number?: string | null;
  className?: string;
  variant?: 'primary' | 'secondary' | 'compact' | 'icon';
  label?: string;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  number,
  className = '',
  variant = 'primary',
  label = '💬 Abrir WhatsApp',
}) => {
  const result = validateWhatsAppNumber(number);

  if (!number || !result.normalized) {
    return (
      <span className="inline-flex items-center text-xs text-slate-400 gap-1 italic">
        <AlertCircle size={13} />
        Sem WhatsApp
      </span>
    );
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (result.isValid && result.link) {
      window.open(result.link, '_blank', 'noopener,noreferrer');
    }
  };

  if (variant === 'icon') {
    return (
      <button
        id="btn-open-whatsapp-icon"
        type="button"
        onClick={handleClick}
        title={`Abrir WhatsApp: ${result.formatted} (${result.link})`}
        className={`p-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all shadow-xs border border-emerald-200 hover:border-emerald-600 ${className}`}
      >
        <MessageSquare size={16} />
      </button>
    );
  }

  if (variant === 'compact') {
    return (
      <button
        id="btn-open-whatsapp-compact"
        type="button"
        onClick={handleClick}
        title={`Link dinâmico: ${result.link}`}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all ${className}`}
      >
        <MessageSquare size={13} />
        <span>WhatsApp</span>
        <ExternalLink size={11} className="opacity-70" />
      </button>
    );
  }

  if (variant === 'secondary') {
    return (
      <button
        id="btn-open-whatsapp-secondary"
        type="button"
        onClick={handleClick}
        title={`Abrir WhatsApp no link: ${result.link}`}
        className={`inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors ${className}`}
      >
        <MessageSquare size={16} className="text-emerald-600" />
        <span>{label}</span>
      </button>
    );
  }

  return (
    <button
      id="btn-open-whatsapp-primary"
      type="button"
      onClick={handleClick}
      title={`Abrir WhatsApp Web / Desktop (${result.link})`}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow transition-all ${className}`}
    >
      <MessageSquare size={16} />
      <span>{label}</span>
      <ExternalLink size={14} className="opacity-80" />
    </button>
  );
};
