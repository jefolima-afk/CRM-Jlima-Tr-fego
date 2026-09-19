import React, { useState } from 'react';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  Building2,
  ArrowRight,
  AlertCircle,
  KeyRound,
} from 'lucide-react';
import { useCrm } from '../context/CrmContext';

export const LoginView: React.FC = () => {
  const { login } = useCrm();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim()) {
      setErrorMessage('Por favor, informe o usuário ou e-mail.');
      return;
    }

    if (!password.trim()) {
      setErrorMessage('Por favor, informe a senha de acesso.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const result = login(username, password);
      setIsLoading(false);
      if (!result.success) {
        setErrorMessage(result.error || 'Usuário ou senha inválidos.');
      }
    }, 200);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Subtle architectural background accents */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Brand Bar */}
      <header className="relative z-10 px-6 py-6 max-w-6xl w-full mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
            <Building2 size={22} />
          </div>
          <div>
            <div className="font-bold text-base text-white tracking-tight flex items-center gap-2">
              CRM Pro <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">v2.0</span>
            </div>
            <div className="text-xs text-slate-400">Gestão Comercial & Clientes</div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
          <ShieldCheck size={14} className="text-emerald-400" />
          <span>Ambiente Seguro</span>
        </div>
      </header>

      {/* Center Login Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-slate-800/90 backdrop-blur-md rounded-2xl border border-slate-700/80 shadow-2xl p-6 sm:p-8 space-y-6">
            
            {/* Header / Intro */}
            <div className="space-y-1 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 mb-2">
                <KeyRound size={22} />
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">Acesso ao Sistema</h1>
              <p className="text-xs text-slate-400">
                Insira suas credenciais para acessar o painel de controle.
              </p>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div
                id="login-error-alert"
                className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200"
              >
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-400" />
                <div className="flex-1 leading-relaxed">{errorMessage}</div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Username field */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-300">
                  Usuário ou E-mail
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User size={16} />
                  </div>
                  <input
                    id="login-input-username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Digite seu usuário ou e-mail"
                    autoComplete="username"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder:text-slate-500 text-xs focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-300">
                  Senha de Acesso
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input
                    id="login-input-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder:text-slate-500 text-xs focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                    title={showPassword ? 'Ocultar senha' : 'Ver senha'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember Me checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-400 hover:text-slate-300">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded-sm border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span>Permanecer conectado</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                id="btn-submit-login"
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer mt-2"
              >
                {isLoading ? (
                  <span>Acessando...</span>
                ) : (
                  <>
                    <span>Entrar</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-4 text-center text-xs text-slate-500">
        CRM Pro • Sistema de Gestão Comercial e Clientes • Acesso restrito e monitorado
      </footer>
    </div>
  );
};
