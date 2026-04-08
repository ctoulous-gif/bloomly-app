import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Droplets, Sprout, Scissors, Plus, Leaf, MapPin, StickyNote } from "lucide-react";
import AddCareLogButton from "./AddCareLogButton";

type Props = { params: Promise<{ id: string }> };

const careTypeConfig = {
  arrosage: { label: "Arrosage", icon: Droplets, color: "text-blue-500 bg-blue-50" },
  engrais: { label: "Engrais", icon: Sprout, color: "text-green-500 bg-green-50" },
  rempotage: { label: "Rempotage", icon: Leaf, color: "text-orange-500 bg-orange-50" },
  taille: { label: "Taille", icon: Scissors, color: "text-purple-500 bg-purple-50" },
  autre: { label: "Autre", icon: Plus, color: "text-gray-500 bg-gray-50" },
};

export default async function UserPlantPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: up } = await supabase
    .from("user_plants")
    .select(`*, plant:plants(*)`)
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!up) notFound();

  const { data: logs } = await supabase
    .from("care_logs")
    .select("*")
    .eq("user_plant_id", id)
    .order("date", { ascending: false });

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Link href="/mon-jardin" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-600 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Mon Jardin
      </Link>

      {/* En-tête */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6">
        <div className="h-48 bg-green-50 flex items-center justify-center overflow-hidden">
          {up.photo || up.plant?.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={up.photo || up.plant?.thumbnail} alt={up.nickname} className="w-full h-full object-cover" />
          ) : (
            <Leaf className="w-20 h-20 text-green-300" />
          )}
        </div>
        <div className="p-5">
          <h1 className="text-2xl font-bold text-gray-900">{up.nickname}</h1>
          {up.plant && (
            <Link href={`/plants/${up.plant.slug}`} className="text-sm text-green-600 italic hover:underline">
              {up.plant.latin_name}
            </Link>
          )}
          <div className="flex flex-wrap gap-3 mt-3">
            {up.location && (
              <span className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                <MapPin className="w-3 h-3" /> {up.location}
              </span>
            )}
            {up.acquired_date && (
              <span className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                Acquise le {new Date(up.acquired_date).toLocaleDateString("fr-FR")}
              </span>
            )}
          </div>
          {up.notes && (
            <div className="flex items-start gap-2 mt-3 text-sm text-gray-500">
              <StickyNote className="w-4 h-4 mt-0.5 shrink-0" />
              <p>{up.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <AddCareLogButton userPlantId={id} type="arrosage" label="Arroser" color="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100" icon="💧" />
        <AddCareLogButton userPlantId={id} type="engrais" label="Engrais" color="bg-green-50 text-green-700 border-green-200 hover:bg-green-100" icon="🌱" />
      </div>

      {/* Journal */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Journal de soin</h2>
          <AddCareLogButton userPlantId={id} type="autre" label="+ Ajouter" color="bg-green-600 text-white hover:bg-green-700" icon="" isCompact />
        </div>

        {!logs?.length ? (
          <p className="text-sm text-gray-400 text-center py-8">Aucun soin enregistré pour l&apos;instant</p>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => {
              const config = careTypeConfig[log.type as keyof typeof careTypeConfig];
              const Icon = config.icon;
              return (
                <div key={log.id} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${config.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{config.label}</p>
                    {log.notes && <p className="text-xs text-gray-500">{log.notes}</p>}
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(log.date)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Fiche de la plante */}
      {up.plant && (
        <Link
          href={`/plants/${up.plant.slug}`}
          className="mt-4 flex items-center justify-center gap-2 w-full py-3 border border-green-200 text-green-700 rounded-xl text-sm font-medium hover:bg-green-50 transition-colors"
        >
          <Leaf className="w-4 h-4" />
          Voir la fiche complète de {up.plant.name}
        </Link>
      )}
    </div>
  );
}
