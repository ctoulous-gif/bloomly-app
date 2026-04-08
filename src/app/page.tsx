import Link from "next/link";
import { Search, Camera, BookOpen, Droplets, ArrowRight } from "lucide-react";
import PlantCard from "@/components/PlantCard";
import { getAllPlants } from "@/lib/plants";

export default async function HomePage() {
  const plants = await getAllPlants();
  const featuredPlants = plants.slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-green-700 to-green-600 text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
            Identifiez et prenez soin de vos plantes
          </h1>
          <p className="text-green-100 text-lg mb-8">
            Fiches détaillées, identification par photo et guide d&apos;entretien personnalisé —
            tout ce qu&apos;il vous faut pour faire prospérer vos plantes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/identify"
              className="inline-flex items-center justify-center gap-2 bg-white text-green-700 font-semibold px-6 py-3 rounded-xl hover:bg-green-50 transition-colors"
            >
              <Camera className="w-5 h-5" />
              Identifier une plante
            </Link>
            <Link
              href="/plants"
              className="inline-flex items-center justify-center gap-2 bg-green-800 text-white font-semibold px-6 py-3 rounded-xl hover:bg-green-900 transition-colors"
            >
              <Search className="w-5 h-5" />
              Parcourir le catalogue
            </Link>
          </div>
        </div>
      </section>

      {/* Fonctionnalités */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">
            Tout ce dont vous avez besoin
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <FeatureCard
              icon={<BookOpen className="w-6 h-6 text-green-600" />}
              title="Fiches complètes"
              description="Arrosage, lumière, température, toxicité — toutes les infos pour chaque plante."
            />
            <FeatureCard
              icon={<Camera className="w-6 h-6 text-green-600" />}
              title="Identification par photo"
              description="Prenez une photo, obtenez instantanément l'espèce et sa fiche de culture."
            />
            <FeatureCard
              icon={<Droplets className="w-6 h-6 text-green-600" />}
              title="Guide d'entretien"
              description="Rappels d'arrosage, journal de soin et diagnostic de vos plantes malades."
            />
          </div>
        </div>
      </section>

      {/* Plantes en vedette */}
      <section className="py-8 px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Plantes populaires</h2>
            <Link
              href="/plants"
              className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700 font-medium"
            >
              Voir tout <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredPlants.map((plant) => (
              <PlantCard key={plant.id} plant={plant} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
}
