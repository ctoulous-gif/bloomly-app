"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
  userPlantId: string;
  type: string;
  label: string;
  color: string;
  icon: string;
  isCompact?: boolean;
};

export default function AddCareLogButton({ userPlantId, type, label, color, icon, isCompact }: Props) {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [notes, setNotes] = useState("");
  const router = useRouter();
  const supabase = createClient();

  async function handleQuickLog() {
    if (type === "autre" || isCompact) {
      setShowModal(true);
      return;
    }
    setLoading(true);
    await supabase.from("care_logs").insert({
      user_plant_id: userPlantId,
      type,
      date: new Date().toISOString(),
      notes: "",
    });
    setLoading(false);
    router.refresh();
  }

  async function handleModalSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await supabase.from("care_logs").insert({
      user_plant_id: userPlantId,
      type,
      date: new Date().toISOString(),
      notes,
    });
    setLoading(false);
    setShowModal(false);
    setNotes("");
    router.refresh();
  }

  return (
    <>
      <button
        onClick={handleQuickLog}
        disabled={loading}
        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border font-medium text-sm transition-colors disabled:opacity-50 ${isCompact ? "px-4 py-2 text-xs rounded-lg border-transparent" : "w-full"} ${color}`}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            {icon && <span>{icon}</span>}
            {label}
          </>
        )}
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Ajouter un soin</h3>
            <form onSubmit={handleModalSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Type de soin</label>
                <select
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  defaultValue={type}
                  onChange={(e) => {
                    // type is controlled by parent, so we use a local state approach
                    (e.target as HTMLSelectElement).dataset.selectedType = e.target.value;
                  }}
                  name="careType"
                >
                  <option value="arrosage">💧 Arrosage</option>
                  <option value="engrais">🌱 Engrais</option>
                  <option value="rempotage">🪴 Rempotage</option>
                  <option value="taille">✂️ Taille</option>
                  <option value="autre">➕ Autre</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes <span className="text-gray-400 font-normal">(optionnel)</span></label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ajoute une note..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setNotes(""); }}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
