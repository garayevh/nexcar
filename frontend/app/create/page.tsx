'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    car_brand: '',
    car_model: '',
    year: '',
    price: '',
    mileage: '',
    color: '',
    city: 'Bakı',
    description: '',
    engine_volume: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const token = localStorage.getItem('nexcar_token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch('http://98.88.80.199:8000/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          car_brand: form.car_brand,
          car_model: form.car_model,
          year: parseInt(form.year),
          price: parseFloat(form.price),
          mileage: parseInt(form.mileage),
          color: form.color,
          city: form.city,
          description: form.description,
          engine_volume: form.engine_volume ? parseFloat(form.engine_volume) : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        const msg = data.detail ? (typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail)) : 'Xəta baş verdi';
        throw new Error(msg);
      }

      const listing = await res.json();
      router.push(`/listing/${listing.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-[#111] border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#e8ff47] transition";

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white px-4 py-12">
      <div className="max-w-2xl mx-auto">

        <div className="mb-10">
          <a href="/" className="text-2xl font-black tracking-tight">
            Nex<span className="text-[#e8ff47]">car</span>.az
          </a>
          <h1 className="text-3xl font-bold mt-6">Elan yerləşdir</h1>
          <p className="text-gray-500 mt-1">Avtomobilinizi satışa çıxarın</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-lg">Avtomobil məlumatları</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Marka *</label>
                <input name="car_brand" value={form.car_brand} onChange={handleChange}
                  placeholder="BMW, Toyota..." className={inputClass} required />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Model *</label>
                <input name="car_model" value={form.car_model} onChange={handleChange}
                  placeholder="5 Series, Camry..." className={inputClass} required />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">İl *</label>
                <input name="year" value={form.year} onChange={handleChange}
                  type="number" placeholder="2020" min="1990" max="2026"
                  className={inputClass} required />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Qiymət (₼) *</label>
                <input name="price" value={form.price} onChange={handleChange}
                  type="number" placeholder="25000"
                  className={inputClass} required />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Yürüş (km) *</label>
                <input name="mileage" value={form.mileage} onChange={handleChange}
                  type="number" placeholder="50000"
                  className={inputClass} required />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Rəng</label>
                <input name="color" value={form.color} onChange={handleChange}
                  placeholder="Ağ, Qara..." className={inputClass} />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Motor (L)</label>
                <input name="engine_volume" value={form.engine_volume} onChange={handleChange}
                  type="number" step="0.1" placeholder="2.0"
                  className={inputClass} />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Şəhər *</label>
                <select name="city" value={form.city} onChange={handleChange}
                  className={inputClass} required>
                  <option value="Bakı">Bakı</option>
                  <option value="Gəncə">Gəncə</option>
                  <option value="Sumqayıt">Sumqayıt</option>
                  <option value="Mingəçevir">Mingəçevir</option>
                  <option value="Naxçıvan">Naxçıvan</option>
                  <option value="Lənkəran">Lənkəran</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">Təsvir</label>
              <textarea name="description" value={form.description} onChange={handleChange}
                placeholder="Avtomobil haqqında əlavə məlumat..."
                rows={4} className={inputClass} />
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-[#e8ff47] text-black font-bold py-4 rounded-xl hover:opacity-90 transition text-lg disabled:opacity-50">
            {loading ? 'Göndərilir...' : 'Elanı yerləşdir →'}
          </button>
        </form>
      </div>
    </main>
  );
}
