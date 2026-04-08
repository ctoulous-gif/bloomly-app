"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Search, Leaf, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import type { Plant } from "@/types/plant";

export default function AjouterPlantePage() {
  const router = useRouter();
  const supabase = createClient();

  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Plant[]>([]);
  const [selected, setSelected] = useState<Plant | null>(null);
  const [nickname, setNickname] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  async function handleSearch(q: string) {
    setSearch(q);
    if (q.length < 2) { setResults([]); return; }
    setSearching(true);
    const { data } = await supabase
      .from("plants")
      .select("*")
      .or(`name.ilike.%${q}%,latin_name.ilike.%${q}%`)
      .limit(5);
    setResults((data as Plant[]) ?? []);
    setSearching(false);
  }

  function selectPlant(plant: Plant) {
    setSelected(plant);
    setNickname(plant.name);
    setResults([]);
    setSearch("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { data, error } = await supabase.from("user_plants").insert({
      user_id: user.id,
      plant_id: selected?.id ?? null,
      nickname,
      location,
      notes,
    }).select().single();

    if (!error && data) {
      router.push(`/mon-jardin/${data.id}`);
    }
    setLoading(false);
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <Link href="/mon-jardin" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-600 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Mon Jardin
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-8">Ajouter une plante</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Recherche plante */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Quelle plante ? <span className="text-gray-400 font-normal">(optionnel)</span>
          </label>

          {selected ? (
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-3">
              {selected.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={selected.thumbnail} alt={selected.name} className="w-10 h-10 rounded-lg object-cover" />
              ) : (
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-green-500" />
                </div>
              )}
              <div className="flex-1">
                <p className="font-medium text-green-900 text-sm">{selected.name}</p>
                <p className="text-xs text-green-600 italic">{selected.latin_name}</p>
              </div>
              <button type="button" onClick={() => setSelected(null)} className="text-xs text-gray-400 hover:text-gray-600">Changer</button>
            </div>
          ) : (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher dans le catalogue..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />}
              {results.length > 0 && (
                <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
                  {results.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => selectPlant(p)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 text-left"
                    >
                      {p.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.thumbnail} alt={p.name} className="w-8 h-8 rounded-lg object-cover" />
                      ) : (
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <Leaf className="w-4 h-4 text-green-500" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-800">{p.name}</p>
                        <p className="text-xs text-gray-400 italic">{p.latin_name}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Surnom */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Donne-lui un prénom <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            placeholder="ex: Monstera du salon"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            required
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Emplacement */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Emplacement</label>
          <input
            type="text"
            placeholder="ex: Salon, Chambre, Balcon..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
          <textarea
            placeholder="Quelque chose à noter sur cette plante..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !nickname}
          className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ajouter à mon jardin"}
        </button>
      </form>
    </div>
  );
}
