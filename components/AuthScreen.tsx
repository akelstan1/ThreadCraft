import React, { useState } from 'react';
import { signUp, signIn } from '../services/supabaseService';

interface AuthScreenProps {
  onAuth: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuth }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
        onAuth();
      } else {
        await signUp(email, password);
        setSuccess('Проверьте почту для подтверждения регистрации!');
      }
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('Invalid login credentials')) {
        setError('Неверный email или пароль');
      } else if (msg.includes('User already registered')) {
        setError('Этот email уже зарегистрирован');
      } else if (msg.includes('Password should be at least')) {
        setError('Пароль должен быть минимум 6 символов');
      } else {
        setError(msg || 'Произошла ошибка');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f8] flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-3">
            ThreadCraft
          </h1>
          <p className="text-slate-500">Генератор вирусных тредов для Threads</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-lg shadow-slate-200/50">
          <div className="flex mb-8 bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                isLogin ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Войти
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                !isLogin ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Регистрация
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Минимум 6 символов"
                required
                minLength={6}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3 animate-fade-in">
                {error}
              </div>
            )}

            {success && (
              <div className="text-green-600 text-sm bg-green-50 border border-green-200 rounded-lg p-3 animate-fade-in">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                loading || !email || !password
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'
              }`}
            >
              {loading ? 'Загрузка...' : isLogin ? 'Войти' : 'Создать аккаунт'}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-400 text-xs mt-6">
          Для работы потребуется свой Gemini API ключ
        </p>
      </div>
    </div>
  );
};
