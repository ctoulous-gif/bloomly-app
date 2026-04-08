import Link from "next/link";
import { Droplets, Sun, Leaf } from "lucide-react";
import { Plant } from "@/types/plant";

const careLevelColor = {
  facile: "bg-green-100 text-green-700",
  intermédiaire: "bg-yellow-100 text-yellow-700",
  expert: "bg-red-100 text-red-700",
};

const lightIcon: Record<Plant["light"], string> = {
  ombre: "🌑",
  "mi-ombre": "🌤",
  "lumière indirecte": "☁️",
  "plein soleil": "☀️",
};

export default function PlantCard({ plant }: { plant: Plant }) {
  return (
    <Link
      href={`/plants/${plant.slug}`}
      className="group block bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-green-300 transition-all duration-200"
    >
      {/* Image */}
      <div className="h-44 bg-green-50 flex items-center justify-center overflow-hidden">
        {plant.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={plant.thumbnail}
            alt={plant.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <Leaf className="w-16 h-16 text-green-300" />
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
            {plant.name}
          </h3>
          <span
            className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${careLevelColor[plant.care_level]}`}
          >
            {plant.care_level}
          </span>
        </div>
        <p className="text-xs text-gray-400 italic mb-3">{plant.latin_name}</p>

        {/* Quick info */}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Droplets className="w-3.5 h-3.5 text-blue-400" />
            {plant.watering}
          </span>
          <span>{lightIcon[plant.light]}</span>
          <span>
            {plant.temperature_min}–{plant.temperature_max}°C
          </span>
        </div>
      </div>
    </Link>
  );
}
