'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Car, MapPin, Gauge, Calendar, Phone, ArrowLeft, Zap } from 'lucide-react';
import { useAuth } from '../../../lib/auth-context';

export default function ListingPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPhone, setShowPhone] = useState(false);

  useEffect(() => {
    fetch(`http://98.88.80.199:8000/api/listings/${id}`)
      .then(r => r.json())
      .then(data => { setListing(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const priceRatingUI = (rating: string) => {
    if (rating === 'great_deal') return { text: 'Elverisli qiymet', color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/30', icon: '🔥' };
    if (rating === 'overpriced') return { text: 'Baha qiymetlendirilib', color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/30', icon: '⚠️' };
    if (rating === 'fair') return { text: 'Edaletli qiymet', color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/30', icon: '✓' };
    return null;
  };

  if (loading) return (
    <main className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
      <div className="text-gray-400">Yuklenilir...</div>
    </main>
  );

  if (!listing || listing.detail) return (
    <main className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-400 mb-4">Elan tapilmadi</p>
        <button onClick={() => router.push('/')} className="text-[#e8ff47] hover:underline">Ana sehifeye don</button>
      </div>
    </main>
  );

  const rating = priceRatingUI(listing.price_rating);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">

      {/* NAV */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-800">
        <a href="/" className="text-2xl font-black tracking-tight">
          Nex<span className="text-[#e8ff47]">car</span>.az
        </a>
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition">
          <ArrowLeft size={16} />
          Geri
        </button>
      </nav>

      <div className="max-w-5xl mx-auto px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT - Photo + Details */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Photo */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl h-72 flex items-center justify-center">
              <Car size={80} className="text-gray-600" />
            </div>

            {/* Title */}
            <div>
              <h1 className="text-3xl font-black mb-2">
                {listing.brand} {listing.model} {listing.year}
              </h1>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <MapPin size={14} />
                {listing.city}
                <span className="mx-2">·</span>
                <span>{listing.view_count} baxis</span>
              </div>
            </div>

            {/* Specs */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Calendar, label: 'Il', value: listing.year },
                { icon: Gauge, label: 'Yurus', value: `${listing.mileage?.toLocaleString()} km` },
                { icon: Car, label: 'Reng', value: listing.color || 'Gosterilmeyib' },
                { icon: Zap, label: 'Motor', value: listing.engine_volume ? `${listing.engine_volume}L` : 'Gosterilmeyib' },
              ].map((spec, i) => (
                <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-3">
                  <spec.icon size={18} className="text-[#e8ff47]" />
                  <div>
                    <div className="text-xs text-gray-500">{spec.label}</div>
                    <div className="font-semibold text-sm">{spec.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Description */}
            {listing.description && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h3 className="font-bold mb-3">Acıqlama</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{listing.description}</p>
              </div>
            )}
          </div>

          {/* RIGHT - Price + Contact */}
          <div className="flex flex-col gap-4">

            {/* Price */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="text-4xl font-black text-[#e8ff47] mb-1">
                {listing.price?.toLocaleString()} ₼
              </div>

              {/* AI Price Rating */}
              {rating && (
                <div className={`mt-3 border rounded-xl px-4 py-3 ${rating.bg}`}>
                  <div className={`font-semibold text-sm ${rating.color}`}>
                    {rating.icon} {rating.text}
                  </div>
                  {listing.suggested_price_min && (
                    <div className="text-xs text-gray-400 mt-1">
                      Bazar qiymeti: {listing.suggested_price_min?.toLocaleString()} — {listing.suggested_price_max?.toLocaleString()} ₼
                    </div>
                  )}
                </div>
              )}

              {/* AI badge */}
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                <span className="w-1.5 h-1.5 bg-[#e8ff47] rounded-full"></span>
                Nexcar AI tehlili
              </div>
            </div>

            {/* Seller */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="font-bold mb-4">Satici</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-lg font-black text-[#e8ff47]">
                  {listing.seller_name?.[0]}
                </div>
                <div>
                  <div className="font-semibold">{listing.seller_name}</div>
                  <div className="text-xs text-gray-400">Satici</div>
                </div>
              </div>

              <button
                onClick={() => setShowPhone(!showPhone)}
                className="w-full bg-[#e8ff47] text-black font-bold py-3 rounded-xl hover:opacity-90 transition flex items-center justify-center gap-2"
              >
                <Phone size={16} />
                {showPhone ? listing.seller_phone : 'Nomreyi goster'}
              </button>
            </div>

            {/* Expires */}
            <div className="text-xs text-gray-600 text-center">
              Elan {new Date(listing.expires_at).toLocaleDateString('az-AZ')} tarixinde biter
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
