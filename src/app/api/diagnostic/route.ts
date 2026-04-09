import { generateText, Output } from "ai";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

const DiagnosticSchema = z.object({
  healthy: z.boolean().describe("true si la plante semble en bonne santé"),
  symptoms: z.array(z.string()).describe("Symptômes visibles sur la photo"),
  diagnosis: z.string().describe("Diagnostic principal : qu'est-ce qui ne va pas"),
  severity: z.enum(["bonne santé", "faible", "modéré", "grave"]).describe("Sévérité du problème"),
  actions: z.array(
    z.object({
      action: z.string().describe("Action à effectuer"),
      detail: z.string().describe("Explication détaillée de l'action"),
    })
  ).describe("Liste des actions à effectuer, dans l'ordre"),
  prevention: z.string().describe("Conseil pour éviter ce problème à l'avenir"),
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File;
    if (!file) {
      return NextResponse.json({ error: "Aucune image fournie" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");

    const { output } = await generateText({
      model: "anthropic/claude-sonnet-4",
      output: Output.object({ schema: DiagnosticSchema }),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              image: base64,
            },
            {
              type: "text",
              text: `Tu es un expert en botanique et en soin des plantes d'intérieur et d'extérieur.
Analyse cette photo de plante et fournis un diagnostic de son état de santé en français.

Instructions :
- Observe attentivement les feuilles, tiges, couleurs, texture, et toute anomalie visible
- Si la plante est en bonne santé, indique-le avec "healthy: true" et "severity: bonne santé"
- Si tu détectes des problèmes, identifie les symptômes précis (ex: feuilles qui jaunissent, se plient, taches brunes, moisissures, etc.)
- Donne un diagnostic clair et des actions concrètes, pratiques et ordonnées
- Réponds toujours en français
- Sois précis et bienveillant dans tes conseils`,
            },
          ],
        },
      ],
    });

    return NextResponse.json(output);
  } catch (err) {
    console.error("Diagnostic error:", err);
    return NextResponse.json({ error: "Erreur lors de l'analyse" }, { status: 500 });
  }
}
