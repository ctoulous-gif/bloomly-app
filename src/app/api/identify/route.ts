import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("image") as File | null;

  if (!file) {
    return NextResponse.json({ error: "Image manquante" }, { status: 400 });
  }

  // Envoyer à PlantNet
  const plantNetForm = new FormData();
  plantNetForm.append("images", file);
  plantNetForm.append("organs", "auto");

  const res = await fetch(
    `https://my-api.plantnet.org/v2/identify/all?api-key=${process.env.PLANTNET_API_KEY}&lang=fr&nb-results=3`,
    { method: "POST", body: plantNetForm }
  );

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: `PlantNet error: ${err}` }, { status: 502 });
  }

  const plantNetData = await res.json();
  const topResult = plantNetData.results?.[0];

  if (!topResult) {
    return NextResponse.json({ error: "Aucune plante détectée" }, { status: 404 });
  }

  const latinName = topResult.species?.scientificNameWithoutAuthor;
  const score = topResult.score;
  const commonNames = topResult.species?.commonNames ?? [];

  // Chercher la plante dans notre DB
  const supabase = createAdminClient();
  const { data: plant } = await supabase
    .from("plants")
    .select("*")
    .ilike("latin_name", `${latinName.split(" ").slice(0, 2).join(" ")}%`)
    .single();

  return NextResponse.json({
    latin_name: latinName,
    common_names: commonNames,
    score,
    plant: plant ?? null,
    all_results: plantNetData.results?.slice(0, 3).map((r: {
      score: number;
      species: { scientificNameWithoutAuthor: string; commonNames: string[] };
    }) => ({
      score: r.score,
      latin_name: r.species?.scientificNameWithoutAuthor,
      common_names: r.species?.commonNames ?? [],
    })),
  });
}
