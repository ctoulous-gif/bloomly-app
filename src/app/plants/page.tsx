import { getAllPlants } from "@/lib/plants";
import PlantsClient from "./PlantsClient";

export default async function PlantsPage() {
  const plants = await getAllPlants();
  return <PlantsClient plants={plants} />;
}
