'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.phone, form.password);
      router.push('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <a href="/" className="text-3xl font-black tracking-tight">
            Nex<span className="text-[#e8ff47]">car</span>.az
          </a>
          <p className="text-gray-400 text-sm mt-2">Hesabiniza daxil olun</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-8 flex flex-col gap-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-gray-400">Telefon nomresi</label>
            <input
              type="text"
              required
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              placeholder="+994 50 000 00 00"
              className="bg-[#0a0a0a] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#e8ff47] transition"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-gray-400">Sifre</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              className="bg-[#0a0a0a] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#e8ff47] transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-[#e8ff47] text-black font-bold py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50 mt-2"
          >
            {loading ? 'Gozleyin...' : 'Daxil ol'}
          </button>

          <p className="text-center text-sm text-gray-500">
            Hesabiniz yoxdur?{' '}
            <a href="/register" className="text-[#e8ff47] hover:underline">Qeydiyyat</a>
          </p>
        </form>
      </div>
    </main>
  );
}
