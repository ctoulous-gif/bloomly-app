import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

async function fetchWikipediaImage(latinName: string, commonName?: string): Promise<string | null> {
  const candidates = [
    latinName,
    commonName?.toLowerCase(),
    latinName.split(" ").slice(0, 2).join(" "),
    latinName.split(" ")[0],
  ].filter(Boolean) as string[];

  for (const name of candidates) {
    try {
      const title = name.replace(/ /g, "_");
      const res = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
        { headers: { "User-Agent": "Bloomly/1.0 (plant encyclopedia app)" } }
      );
      if (!res.ok) continue;
      const data = await res.json();
      const image = data.thumbnail?.source ?? data.originalimage?.source ?? null;
      if (image) return image;
    } catch {
      continue;
    }
  }
  return null;
}

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const force = searchParams.get("force") === "true";

  const supabase = createAdminClient();

  const { data: plants, error } = await supabase
    .from("plants")
    .select("id, name, latin_name, thumbnail");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const results: { name: string; image: string | null; updated: boolean }[] = [];

  for (const plant of plants ?? []) {
    // Sauter si déjà une image (sauf si force=true)
    if (plant.thumbnail && !force) {
      results.push({ name: plant.name, image: plant.thumbnail, updated: false });
      continue;
    }

    const image = await fetchWikipediaImage(plant.latin_name, plant.name);

    if (image) {
      await supabase
        .from("plants")
        .update({ thumbnail: image })
        .eq("id", plant.id);
    }

    results.push({ name: plant.name, image, updated: !!image });
    await new Promise((r) => setTimeout(r, 300));
  }

  return NextResponse.json({ results });
}
