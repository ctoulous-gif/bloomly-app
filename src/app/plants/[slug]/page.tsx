import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Droplets,
  Sun,
  Thermometer,
  Wind,
  Leaf,
  AlertTriangle,
  ArrowLeft,
  Sprout,
  Flower2,
} from "lucide-react";
import { getAllPlants, getPlantBySlug } from "@/lib/plants";
import { Plant } from "@/types/plant";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const plants = await getAllPlants();
  return plants.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const plant = await getPlantBySlug(slug);
  if (!plant) return {};
  return {
    title: `${plant.name} — Bloomly`,
    description: plant.description?.slice(0, 160),
  };
}

export default async function PlantPage({ params }: Props) {
  const { slug } = await params;
  const plant = await getPlantBySlug(slug);
  if (!plant) notFound();

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Link
        href="/plants"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Retour au catalogue
      </Link>

      {/* En-tête */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6">
        <div className="h-56 bg-green-50 flex items-center justify-center">
          {plant.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={plant.thumbnail} alt={plant.name} className="w-full h-full object-cover" />
          ) : (
            <Leaf className="w-24 h-24 text-green-300" />
          )}
        </div>
        <div className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{plant.name}</h1>
              <p className="text-gray-400 italic">{plant.latin_name}</p>
            </div>
            <CareLevelBadge level={plant.care_level} />
          </div>
          <p className="text-gray-600 leading-relaxed mb-4">{plant.description}</p>
          <div className="flex flex-wrap gap-2">
            {plant.tags?.map((tag) => (
              <span key={tag} className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Infos rapides */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <InfoTile icon={<Droplets className="w-5 h-5 text-blue-500" />} label="Arrosage" value={plant.watering} bg="bg-blue-50" />
        <InfoTile icon={<Sun className="w-5 h-5 text-yellow-500" />} label="Lumière" value={plant.light} bg="bg-yellow-50" />
        <InfoTile icon={<Thermometer className="w-5 h-5 text-orange-500" />} label="Température" value={`${plant.temperature_min}–${plant.temperature_max}°C`} bg="bg-orange-50" />
        <InfoTile icon={<Wind className="w-5 h-5 text-cyan-500" />} label="Humidité" value={`${plant.humidity}%`} bg="bg-cyan-50" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Section title="Guide d'entretien" icon={<Sprout className="w-5 h-5 text-green-600" />}>
          <CareRow label="Arrosage" value={plant.watering_notes} />
          <CareRow label="Terreau" value={plant.soil} />
          <CareRow label="Engrais" value={plant.fertilizer} />
          <CareRow label="Rempotage" value={plant.repotting} />
        </Section>

        <Section title="Caractéristiques" icon={<Flower2 className="w-5 h-5 text-green-600" />}>
          <CareRow label="Famille" value={plant.family} />
          <CareRow label="Origine" value={plant.origin} />
          <CareRow label="Hauteur" value={`${plant.height_min}–${plant.height_max} cm`} />
          <div className="pt-3">
            <ToxicityBadge plant={plant} />
          </div>
        </Section>
      </div>
    </div>
  );
}

function CareLevelBadge({ level }: { level: Plant["care_level"] }) {
  const colors = {
    facile: "bg-green-100 text-green-700",
    intermédiaire: "bg-yellow-100 text-yellow-700",
    expert: "bg-red-100 text-red-700",
  };
  return <span className={`px-3 py-1 rounded-full text-sm font-semibold ${colors[level]}`}>{level}</span>;
}

function InfoTile({ icon, label, value, bg }: { icon: React.ReactNode; label: string; value: string; bg: string }) {
  return (
    <div className={`${bg} rounded-xl p-4`}>
      <div className="mb-2">{icon}</div>
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-gray-800 capitalize">{value}</p>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h2 className="flex items-center gap-2 font-semibold text-gray-900 mb-4">{icon}{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function CareRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm text-gray-700">{value}</p>
    </div>
  );
}

function ToxicityBadge({ plant }: { plant: Plant }) {
  const colors = {
    "non toxique": "bg-green-50 text-green-700 border-green-200",
    "légèrement toxique": "bg-yellow-50 text-yellow-700 border-yellow-200",
    toxique: "bg-orange-50 text-orange-700 border-orange-200",
    "très toxique": "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <div className={`rounded-xl border p-3 ${colors[plant.toxicity]}`}>
      <p className="flex items-center gap-1.5 text-sm font-semibold mb-1">
        <AlertTriangle className="w-4 h-4" />{plant.toxicity}
      </p>
      <p className="text-xs opacity-80">{plant.toxicity_details}</p>
    </div>
  );
}
