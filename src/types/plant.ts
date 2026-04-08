export type CareLevel = "facile" | "intermédiaire" | "expert";
export type LightLevel = "ombre" | "mi-ombre" | "lumière indirecte" | "plein soleil";
export type WateringFrequency = "rare" | "modéré" | "régulier" | "fréquent";

export interface Plant {
  id: string;
  slug: string;
  name: string;
  latin_name: string;
  family: string;
  description: string;
  care_level: CareLevel;
  // Entretien
  watering: WateringFrequency;
  watering_notes: string;
  light: LightLevel;
  humidity: number; // 0-100%
  temperature_min: number;
  temperature_max: number;
  soil: string;
  fertilizer: string;
  repotting: string;
  // Caractéristiques
  origin: string;
  height_min: number; // cm
  height_max: number; // cm
  toxicity: "non toxique" | "légèrement toxique" | "toxique" | "très toxique";
  toxicity_details: string;
  // Médias
  images: string[];
  thumbnail: string;
  // Métadonnées
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface UserPlant {
  id: string;
  user_id: string;
  plant_id: string;
  plant?: Plant;
  nickname: string;
  acquired_date: string;
  location: string;
  notes: string;
  photos: string[];
  created_at: string;
}

export interface CareLog {
  id: string;
  user_plant_id: string;
  date: string;
  type: "arrosage" | "engrais" | "rempotage" | "taille" | "autre";
  notes: string;
  photo?: string;
}

export interface Reminder {
  id: string;
  user_plant_id: string;
  type: "arrosage" | "engrais" | "rempotage";
  next_date: string;
  frequency_days: number;
  active: boolean;
}

// Pour les résultats d'identification
export interface IdentificationResult {
  plant: Plant | null;
  score: number; // 0-1
  common_names: string[];
  latin_name: string;
}
