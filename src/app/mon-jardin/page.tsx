import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Leaf, Droplets, Calendar } from "lucide-react";

export default async function MonJardinPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: userPlants } = await supabase
    .from("user_plants")
    .select(`*, plant:plants(name, latin_name, thumbnail, watering)`)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Récupérer le dernier arrosage pour chaque plante
  const { data: lastLogs } = await supabase
    .from("care_logs")
    .select("user_plant_id, date, type")
    .eq("type", "arrosage")
    .in("user_plant_id", (userPlants ?? []).map((p) => p.id))
    .order("date", { ascending: false });

  function getLastWatering(plantId: string) {
    const log = lastLogs?.find((l) => l.user_plant_id === plantId);
    if (!log) return null;
    const days = Math.floor((Date.now() - new Date(log.date).getTime()) / 86400000);
    if (days === 0) return "Aujourd'hui";
    if (days === 1) return "Hier";
    return `Il y a ${days} jours`;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mon Jardin</h1>
          <p className="text-gray-500 mt-1">
            {userPlants?.length ?? 0} plante{(userPlants?.length ?? 0) > 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/mon-jardin/ajouter"
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter une plante
        </Link>
      </div>

      {!userPlants?.length ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-gray-300">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Leaf className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="font-semibold text-gray-700 mb-2">Ton jardin est vide</h2>
          <p className="text-sm text-gray-400 mb-6">Ajoute ta première plante pour commencer à suivre son entretien</p>
          <Link
            href="/mon-jardin/ajouter"
            className="inline-flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ajouter une plante
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {userPlants.map((up) => (
            <Link
              key={up.id}
              href={`/mon-jardin/${up.id}`}
              className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-green-300 transition-all"
            >
              {/* Image */}
              <div className="h-40 bg-green-50 flex items-center justify-center overflow-hidden">
                {up.photo || up.plant?.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={up.photo || up.plant?.thumbnail}
                    alt={up.nickname}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <Leaf className="w-12 h-12 text-green-300" />
                )}
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
                  {up.nickname}
                </h3>
                {up.plant && (
                  <p className="text-xs text-gray-400 italic mb-3">{up.plant.latin_name}</p>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500">
                  {up.location && (
                    <span className="bg-gray-100 px-2 py-1 rounded-full">{up.location}</span>
                  )}
                  {getLastWatering(up.id) ? (
                    <span className="flex items-center gap-1 text-blue-500">
                      <Droplets className="w-3 h-3" />
                      {getLastWatering(up.id)}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-orange-400">
                      <Droplets className="w-3 h-3" />
                      Jamais arrosé
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
