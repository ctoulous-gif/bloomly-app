import { createClient } from "@/lib/supabase/server";
import { Plant } from "@/types/plant";
import { DEMO_PLANTS } from "@/lib/demo-plants";

export { DEMO_PLANTS };

export async function getAllPlants(): Promise<Plant[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("plants")
      .select("*")
      .order("name");
    if (error) throw error;
    return data as Plant[];
  } catch {
    return DEMO_PLANTS;
  }
}

export async function getPlantBySlug(slug: string): Promise<Plant | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("plants")
      .select("*")
      .eq("slug", slug)
      .single();
    if (error) throw error;
    return data as Plant;
  } catch {
    return DEMO_PLANTS.find((p) => p.slug === slug) ?? null;
  }
}

export async function searchPlants(query: string): Promise<Plant[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("plants")
      .select("*")
      .or(`name.ilike.%${query}%,latin_name.ilike.%${query}%`)
      .order("name");
    if (error) throw error;
    return data as Plant[];
  } catch {
    return DEMO_PLANTS;
  }
}
