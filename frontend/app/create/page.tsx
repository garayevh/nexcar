'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [form, setForm] = useState({
    car_brand: '', car_model: '', year: '', price: '',
    mileage: '', color: '', city: 'Bakı', description: '', engine_volume: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    setPhotos(prev => {
      const combined = [...prev, ...newFiles].slice(0, 5);
      setPreviews(combined.map(f => URL.createObjectURL(f)));
      return combined;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const token = localStorage.getItem('nexcar_token');
    if (!token) { router.push('/login'); return; }

    try {
      // 1. Создаём объявление
      const res = await fetch('http://98.88.80.199:8000/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          car_brand: form.car_brand, car_model: form.car_model,
          year: parseInt(form.year), price: parseFloat(form.price),
          mileage: parseInt(form.mileage), color: form.color, city: form.city,
          description: form.description,
          engine_volume: form.engine_volume ? parseFloat(form.engine_volume) : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail));
      }

      const listing = await res.json();

      // 2. Загружаем фото
      for (const photo of photos) {
        const fd = new FormData();
        fd.append('file', photo);
        await fetch(`http://98.88.80.199:8000/api/listings/${listing.id}/photos`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: fd,
        });
      }

      router.push(`/listing/${listing.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-[#0a0a0a] border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#e8ff47] transition";

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="mb-10">
          <a href="/" className="text-2xl font-black tracking-tight">Nex<span className="text-[#e8ff47]">car</span>.az</a>
          <h1 className="text-3xl font-bold mt-6">Elan yerləşdir</h1>
          <p className="text-gray-500 mt-1">Avtomobilinizi satışa çıxarın</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Foto */}
          <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-lg">Şəkillər</h2>
            <label className="block w-full border-2 border-dashed border-gray-700 rounded-xl p-8 text-center cursor-pointer hover:border-[#e8ff47] transition">
              <input type="file" accept="image/*" multiple onChange={handlePhotos} className="hidden" />
              <div className="text-gray-400">
                <div className="text-3xl mb-2">📷</div>
                <div>Şəkil əlavə edin (max 5)</div>
                <div className="text-sm text-gray-600 mt-1">JPG, PNG — klikləyin və ya sürükləyin</div>
              </div>
            </label>
            {previews.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {previews.map((p, i) => (
                  <div key={i} className="w-24 h-24 rounded-xl overflow-hidden border border-gray-700 flex-shrink-0">
                    <img src={p} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Avtomobil */}
          <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-lg">Avtomobil məlumatları</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Marka *</label>
                <input name="car_brand" value={form.car_brand} onChange={handleChange} placeholder="BMW, Toyota..." className={inputClass} required />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Model *</label>
                <input name="car_model" value={form.car_model} onChange={handleChange} placeholder="5 Series, Camry..." className={inputClass} required />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">İl *</label>
                <input name="year" value={form.year} onChange={handleChange} type="number" placeholder="2020" min="1990" max="2026" className={inputClass} required />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Qiymət (₼) *</label>
                <input name="price" value={form.price} onChange={handleChange} type="number" placeholder="25000" className={inputClass} required />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Yürüş (km) *</label>
                <input name="mileage" value={form.mileage} onChange={handleChange} type="number" placeholder="50000" className={inputClass} required />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Rəng</label>
                <input name="color" value={form.color} onChange={handleChange} placeholder="Ağ, Qara..." className={inputClass} />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Motor (L)</label>
                <input name="engine_volume" value={form.engine_volume} onChange={handleChange} type="number" step="0.1" placeholder="2.0" className={inputClass} />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Şəhər *</label>
                <select name="city" value={form.city} onChange={handleChange} className={inputClass} required>
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
              <textarea name="description" value={form.description} onChange={handleChange} placeholder="Avtomobil haqqında əlavə məlumat..." rows={4} className={inputClass} />
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
