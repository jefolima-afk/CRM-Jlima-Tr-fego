/**
 * Regras Obrigatórias do WhatsApp (Seção 4 do CRM):
 * - Remover espaços, parênteses, hífens e caracteres não numéricos.
 * - Adicionar o código do Brasil +55 quando ele não estiver presente.
 * - Evitar duplicar o código 55.
 * - Armazenar o número normalizado.
 * - Exibir o número de forma amigável na interface.
 * - Validar se o número possui quantidade plausível de dígitos.
 * - Gerar dinamicamente o link no padrão: https://wa.me/NUMERO (sem texto pré-preenchido).
 */

export interface WhatsAppValidationResult {
  isValid: boolean;
  normalized: string;
  formatted: string;
  errorMessage?: string;
  link: string;
}

/**
 * Normaliza qualquer número de telefone brasileiro para o formato internacional numérico puro (ex: 5554999999999)
 */
export function normalizeWhatsAppNumber(raw: string | undefined | null): string {
  if (!raw) return '';

  // 1. Remove todos os caracteres não numéricos
  let digits = raw.replace(/\D/g, '');

  if (!digits) return '';

  // 2. Se começa com 0 (ex: 054999999999), remove o 0 inicial de DDD
  if (digits.startsWith('0')) {
    digits = digits.substring(1);
  }

  // 3. Verifica se já possui o código do país 55
  // No Brasil: DDD (2 dígitos) + Telefone (8 ou 9 dígitos) = 10 ou 11 dígitos.
  // Com o 55: 12 ou 13 dígitos.
  if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) {
    return digits;
  }

  // Se tem 10 ou 11 dígitos (DDD + número), adiciona o 55
  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }

  // Se o usuário digitou mais dígitos e começa com 55 (ex: prefixos ou variações)
  if (digits.startsWith('55') && digits.length > 11) {
    return digits;
  }

  // Caso padrão: adiciona 55 se tiver ao menos DDD + telefone
  if (digits.length >= 8 && digits.length <= 11) {
    return `55${digits}`;
  }

  return digits;
}

/**
 * Valida se o número possui quantidade plausível de dígitos para o WhatsApp no Brasil
 */
export function validateWhatsAppNumber(raw: string | undefined | null): WhatsAppValidationResult {
  const normalized = normalizeWhatsAppNumber(raw);

  if (!normalized) {
    return {
      isValid: false,
      normalized: '',
      formatted: '',
      errorMessage: 'Número não informado',
      link: '',
    };
  }

  // Número brasileiro normalizado deve ter 12 dígitos (fixo com DDD: 55 + 2 + 8)
  // ou 13 dígitos (celular com DDD: 55 + 2 + 9)
  const isValidLength = normalized.length === 12 || normalized.length === 13;

  if (!isValidLength) {
    return {
      isValid: false,
      normalized,
      formatted: formatWhatsAppDisplay(normalized),
      errorMessage: `Número com tamanho incomum (${normalized.length} dígitos). Esperado 10 ou 11 dígitos (com DDD).`,
      link: `https://wa.me/${normalized}`,
    };
  }

  return {
    isValid: true,
    normalized,
    formatted: formatWhatsAppDisplay(normalized),
    link: `https://wa.me/${normalized}`,
  };
}

/**
 * Exibe o número de forma amigável na interface (ex: +55 (54) 99999-9999 ou +55 (11) 3333-4444)
 */
export function formatWhatsAppDisplay(normalized: string | undefined | null): string {
  if (!normalized) return '';
  const digits = normalized.replace(/\D/g, '');

  if (digits.length === 13 && digits.startsWith('55')) {
    const ddd = digits.substring(2, 4);
    const part1 = digits.substring(4, 9);
    const part2 = digits.substring(9, 13);
    return `+55 (${ddd}) ${part1}-${part2}`;
  }

  if (digits.length === 12 && digits.startsWith('55')) {
    const ddd = digits.substring(2, 4);
    const part1 = digits.substring(4, 8);
    const part2 = digits.substring(8, 12);
    return `+55 (${ddd}) ${part1}-${part2}`;
  }

  if (digits.length === 11) {
    const ddd = digits.substring(0, 2);
    const part1 = digits.substring(2, 7);
    const part2 = digits.substring(7, 11);
    return `(${ddd}) ${part1}-${part2}`;
  }

  if (digits.length === 10) {
    const ddd = digits.substring(0, 2);
    const part1 = digits.substring(2, 6);
    const part2 = digits.substring(6, 10);
    return `(${ddd}) ${part1}-${part2}`;
  }

  return normalized;
}

/**
 * Gera o link direto no formato estrito: https://wa.me/NUMERO sem texto pré-preenchido
 */
export function getWhatsAppLink(rawOrNormalized: string | undefined | null): string {
  const normalized = normalizeWhatsAppNumber(rawOrNormalized);
  if (!normalized) return '';
  return `https://wa.me/${normalized}`;
}
