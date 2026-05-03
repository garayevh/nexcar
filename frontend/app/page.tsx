'use client';
import { useState, useEffect } from 'react';
import { Search, Car, TrendingUp, Shield, Zap } from 'lucide-react';

export default function Home() {
  const [listings, setListings] = useState([]);
  const [search, setSearch] = useState({ brand: '', price_max: '' });

  useEffect(() => {
    fetch('http://3.87.125.167:8000/api/listings')
      .then(r => r.json())
      .then(data => setListings(data))
      .catch(() => {});
  }, []);

  const priceLabel = (rating: string) => {
    if (rating === 'fair') return { text: 'Справедливая цена ✓', color: 'text-green-400' };
    if (rating === 'overpriced') return { text: 'Переоценено ⚠️', color: 'text-red-400' };
    if (rating === 'great_deal') return { text: 'Выгодно! 🔥', color: 'text-yellow-400' };
    return { text: '', color: '' };
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">

      {/* NAV */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-800">
        <div className="text-2xl font-black tracking-tight">
          Nex<span className="text-[#e8ff47]">car</span>.az
        </div>
        <div className="flex gap-6 text-sm text-gray-400">
          <a href="#" className="hover:text-white transition">Avtomobillər</a>
          <a href="#" className="hover:text-white transition">Satmaq</a>
          <a href="#" className="hover:text-white transition">Haqqımızda</a>
        </div>
        <button className="bg-[#e8ff47] text-black px-5 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition">
          Elan yerləşdir
        </button>
      </nav>

      {/* HERO */}
      <section className="px-8 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-full px-4 py-2 text-sm text-gray-400 mb-8">
          <span className="w-2 h-2 bg-[#e8ff47] rounded-full animate-pulse"></span>
          AI ilə işləyən avtomobil platforması
        </div>
        <h1 className="text-6xl font-black leading-none tracking-tight mb-6">
          Növbəti<br />
          <span className="text-[#e8ff47]">maşınınızı</span><br />
          tapın
        </h1>
        <p className="text-gray-400 text-lg max-w-lg mx-auto mb-10">
          Nexcar.az — AI texnologiyası ilə Azərbaycanda avtomobil alqı-satqısının ən ağıllı yolu
        </p>

        {/* SEARCH */}
        <div className="flex gap-3 max-w-2xl mx-auto">
          <input
            type="text"
            placeholder="Marka (BMW, Toyota...)"
            value={search.brand}
            onChange={e => setSearch({...search, brand: e.target.value})}
            className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#e8ff47]"
          />
          <input
            type="number"
            placeholder="Maks qiymət ₼"
            value={search.price_max}
            onChange={e => setSearch({...search, price_max: e.target.value})}
            className="w-40 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#e8ff47]"
          />
          <button className="bg-[#e8ff47] text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition">
            <Search size={18} />
            Axtar
          </button>
        </div>
      </section>

      {/* STATS */}
      <section className="flex border-t border-b border-gray-800 mx-8 mb-16">
        {[
          { num: '12,400+', label: 'Aktiv elan' },
          { num: '3,200+', label: 'Satıcı' },
          { num: 'AI', label: 'Qiymət analizi' },
          { num: '30 gün', label: 'Avtomatik deaktiv' },
        ].map((s, i) => (
          <div key={i} className="flex-1 py-6 text-center border-r border-gray-800 last:border-r-0">
            <div className="text-2xl font-black text-[#e8ff47]">{s.num}</div>
            <div className="text-sm text-gray-400 mt-1">{s.label}</div>
          </div>
        ))}
      </section>

      {/* LISTINGS */}
      <section className="px-8 mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Son elanlar</h2>
          <span className="text-sm text-gray-400 cursor-pointer hover:text-white">Hamısına bax →</span>
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <Car size={48} className="mx-auto mb-4 opacity-30" />
            <p>Hələ elan yoxdur</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {listings.map((l: any) => {
              const pr = priceLabel(l.price_rating);
              return (
                <div key={l.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-600 transition cursor-pointer">
                  <div className="h-36 bg-gray-800 flex items-center justify-center">
                    <Car size={48} className="text-gray-600" />
                  </div>
                  <div className="p-4">
                    <div className="font-bold text-base mb-1">{l.brand} {l.model}</div>
                    <div className="text-sm text-gray-400 mb-3">{l.year} · {l.mileage.toLocaleString()} km · {l.city}</div>
                    <div className="text-xl font-black text-[#e8ff47]">{l.price.toLocaleString()} ₼</div>
                    {pr.text && <div className={`text-xs mt-1 ${pr.color}`}>{pr.text}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* AI BANNER */}
      <section className="mx-8 mb-16 bg-gray-900 border border-gray-800 rounded-2xl p-8 flex items-center justify-between gap-8">
        <div>
          <h2 className="text-2xl font-black mb-2">✦ <span className="text-[#e8ff47]">AI</span> qiymət analizi</h2>
          <p className="text-gray-400 max-w-md">Nexcar-ın süni intellekti bazardakı bütün qiymətləri analiz edir və sizə ən yaxşı təklifi tapır.</p>
        </div>
        <div className="flex flex-col gap-3 min-w-48">
          {['Bazar qiymətini müəyyən edir', 'Oxşar avtomobilləri müqayisə edir', 'Ən yaxşı vaxtı tövsiyə edir'].map((f, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-gray-400">
              <span className="w-1.5 h-1.5 bg-[#e8ff47] rounded-full"></span>
              {f}
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-800 px-8 py-6 flex items-center justify-between text-sm text-gray-500">
        <div className="font-black text-white">Nex<span className="text-[#e8ff47]">car</span>.az</div>
        <div>© 2025 Nexcar.az</div>
        <div>Bakı, Azərbaycan</div>
      </footer>
    </main>
  );
}
