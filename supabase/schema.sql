-- Table principale des plantes
create table plants (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  latin_name text not null,
  family text,
  description text,
  care_level text check (care_level in ('facile', 'intermédiaire', 'expert')),
  -- Entretien
  watering text check (watering in ('rare', 'modéré', 'régulier', 'fréquent')),
  watering_notes text,
  light text check (light in ('ombre', 'mi-ombre', 'lumière indirecte', 'plein soleil')),
  humidity int check (humidity between 0 and 100),
  temperature_min int,
  temperature_max int,
  soil text,
  fertilizer text,
  repotting text,
  -- Caractéristiques
  origin text,
  height_min int,
  height_max int,
  toxicity text check (toxicity in ('non toxique', 'légèrement toxique', 'toxique', 'très toxique')),
  toxicity_details text,
  -- Médias
  thumbnail text,
  images text[] default '{}',
  -- Métadonnées
  tags text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Activer la lecture publique (pas besoin de compte pour consulter les fiches)
alter table plants enable row level security;
create policy "Lecture publique" on plants for select using (true);

-- Insérer les 4 plantes de démo
insert into plants (slug, name, latin_name, family, description, care_level, watering, watering_notes, light, humidity, temperature_min, temperature_max, soil, fertilizer, repotting, origin, height_min, height_max, toxicity, toxicity_details, tags) values
(
  'monstera-deliciosa', 'Monstera', 'Monstera deliciosa', 'Aracées',
  'Le Monstera deliciosa, aussi appelé « plante gruyère » pour ses feuilles perforées caractéristiques, est l''une des plantes d''intérieur les plus populaires. Originaire des forêts tropicales d''Amérique centrale, il peut atteindre plusieurs mètres de haut en conditions idéales.',
  'facile', 'modéré', 'Arroser quand les 2-3 premiers centimètres de terre sont secs. Réduire en hiver.',
  'lumière indirecte', 60, 15, 30,
  'Terreau universel bien drainant, mélangé à de la perlite',
  'Engrais liquide toutes les 2 semaines de mars à septembre',
  'Tous les 2 ans au printemps dans un pot légèrement plus grand',
  'Amérique centrale (Mexique, Panama)', 50, 300,
  'toxique', 'Toxique pour les chats et les chiens. Irritant pour la peau.',
  array['tropical', 'intérieur', 'grandes feuilles', 'dépolluante']
),
(
  'pothos', 'Pothos', 'Epipremnum aureum', 'Aracées',
  'Le Pothos est une plante grimpante ou retombante très résistante, idéale pour les débutants. Ses feuilles cordiformes vert vif marbrées de jaune ou de blanc en font une plante décorative très appréciée.',
  'facile', 'modéré', 'Arroser quand la terre est sèche sur 2-3 cm. Tolère bien l''oubli d''arrosage.',
  'mi-ombre', 50, 10, 30,
  'Terreau universel',
  'Engrais liquide une fois par mois en période de croissance',
  'Tous les 2-3 ans',
  'Polynésie', 30, 200,
  'toxique', 'Toxique pour les animaux domestiques si ingéré.',
  array['retombant', 'intérieur', 'débutant', 'dépolluante']
),
(
  'ficus-lyrata', 'Ficus Lyrata', 'Ficus lyrata', 'Moracées',
  'Le Ficus lyrata, ou « figuier à feuilles de violon », est une plante tendance aux grandes feuilles ondulées ressemblant à une caisse de violon. Il apporte une touche tropicale et architecturale à tout intérieur.',
  'intermédiaire', 'modéré', 'Arroser quand le premier centimètre de terre est sec. Ne pas laisser les racines dans l''eau.',
  'lumière indirecte', 55, 16, 28,
  'Terreau bien drainant avec perlite',
  'Engrais équilibré toutes les 2 semaines au printemps et en été',
  'Tous les 2 ans quand les racines sortent du pot',
  'Afrique de l''Ouest', 50, 250,
  'légèrement toxique', 'La sève peut irriter la peau. Légèrement toxique pour les animaux.',
  array['tropical', 'tendance', 'grandes feuilles', 'intérieur']
),
(
  'aloe-vera', 'Aloe Vera', 'Aloe barbadensis miller', 'Asphodelacées',
  'L''Aloe vera est une plante succulente aux feuilles charnues remplies d''un gel aux multiples vertus. Très facile à cultiver, elle demande peu d''arrosage et supporte bien les oublis.',
  'facile', 'rare', 'Arroser abondamment puis attendre que la terre soit complètement sèche. Environ une fois toutes les 2-3 semaines.',
  'plein soleil', 30, 10, 35,
  'Terreau pour cactées et succulentes, très drainant',
  'Engrais pour cactées une fois par mois en été',
  'Tous les 2-3 ans ou quand la plante devient trop grande',
  'Afrique du Nord, Péninsule arabique', 20, 80,
  'légèrement toxique', 'Le gel est bénéfique pour l''humain mais toxique pour les chats et les chiens.',
  array['succulente', 'médicinale', 'soleil', 'débutant']
);
