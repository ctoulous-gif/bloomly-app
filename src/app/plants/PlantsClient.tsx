"use client";

import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import PlantCard from "@/components/PlantCard";
import { Plant, CareLevel } from "@/types/plant";

const CARE_LEVELS: CareLevel[] = ["facile", "intermédiaire", "expert"];

export default function PlantsClient({ plants }: { plants: Plant[] }) {
  const [query, setQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<CareLevel | "tous">("tous");

  const filtered = plants.filter((plant) => {
    const matchQuery =
      query === "" ||
      plant.name.toLowerCase().includes(query.toLowerCase()) ||
      plant.latin_name.toLowerCase().includes(query.toLowerCase()) ||
      plant.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()));

    const matchLevel = selectedLevel === "tous" || plant.care_level === selectedLevel;

    return matchQuery && matchLevel;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Catalogue des plantes</h1>
      <p className="text-gray-500 mb-8">{plants.length} plantes disponibles</p>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une plante..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-gray-400 shrink-0" />
          <div className="flex gap-1">
            <button
              onClick={() => setSelectedLevel("tous")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedLevel === "tous"
                  ? "bg-green-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              Tous
            </button>
            {CARE_LEVELS.map((level) => (
              <button
                key={level}
                onClick={() => setSelectedLevel(level)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                  selectedLevel === level
                    ? "bg-green-600 text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg font-medium">Aucune plante trouvée</p>
          <p className="text-sm mt-1">Essayez un autre terme de recherche</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((plant) => (
            <PlantCard key={plant.id} plant={plant} />
          ))}
        </div>
      )}
    </div>
  );
}
