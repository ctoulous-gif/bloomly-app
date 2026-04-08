"use client";

import { useState, useRef } from "react";
import { Camera, Upload, Leaf, Loader2, ArrowRight, X, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Plant } from "@/types/plant";

type Status = "idle" | "loading" | "result" | "error";

interface IdentifyResult {
  latin_name: string;
  common_names: string[];
  score: number;
  plant: Plant | null;
  all_results: { score: number; latin_name: string; common_names: string[] }[];
}

export default function IdentifyPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<IdentifyResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(f: File) {
    if (!f.type.startsWith("image/")) return;
    setPreview(URL.createObjectURL(f));
    setFile(f);
    setStatus("idle");
    setResult(null);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  async function identify() {
    if (!file) return;
    setStatus("loading");
    setErrorMsg("");

    try {
      const form = new FormData();
      form.append("image", file);

      const res = await fetch("/api/identify", { method: "POST", body: form });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error ?? "Erreur lors de l'identification");
        setStatus("error");
        return;
      }

      setResult(data);
      setStatus("result");
    } catch {
      setErrorMsg("Erreur réseau, réessaie.");
      setStatus("error");
    }
  }

  function reset() {
    setPreview(null);
    setFile(null);
    setResult(null);
    setStatus("idle");
    setErrorMsg("");
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Identifier une plante</h1>
      <p className="text-gray-500 mb-8">
        Prenez ou importez une photo de votre plante pour obtenir son espèce et sa fiche d&apos;entretien.
      </p>

      {!preview ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-green-400 hover:bg-green-50/30 transition-colors cursor-pointer"
          onClick={() => fileRef.current?.click()}
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Camera className="w-8 h-8 text-green-600" />
          </div>
          <p className="font-semibold text-gray-700 mb-1">Déposez une photo ici</p>
          <p className="text-sm text-gray-400 mb-4">ou cliquez pour choisir un fichier</p>
          <button className="inline-flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors">
            <Upload className="w-4 h-4" />
            Importer une photo
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Aperçu" className="w-full h-72 object-cover" />
            <button
              onClick={reset}
              className="absolute top-3 right-3 p-1.5 bg-white rounded-full shadow hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          <div className="p-6">
            {status === "idle" && (
              <button
                onClick={identify}
                className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
              >
                <Leaf className="w-5 h-5" />
                Identifier cette plante
              </button>
            )}

            {status === "loading" && (
              <div className="flex flex-col items-center gap-3 py-4">
                <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
                <p className="text-sm text-gray-500">Analyse en cours…</p>
              </div>
            )}

            {status === "error" && (
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3 bg-red-50 text-red-700 rounded-xl p-4 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  {errorMsg}
                </div>
                <button onClick={reset} className="w-full py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">
                  Réessayer
                </button>
              </div>
            )}

            {status === "result" && result && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-lg text-gray-900">Résultat</h2>
                  <span className="text-sm bg-green-50 text-green-700 px-3 py-1 rounded-full font-medium">
                    {Math.round(result.score * 100)}% de confiance
                  </span>
                </div>

                {/* Plante identifiée */}
                <div className="bg-green-50 rounded-xl p-4 mb-4">
                  <p className="font-bold text-green-900 text-lg">
                    {result.plant?.name ?? result.common_names[0] ?? result.latin_name}
                  </p>
                  <p className="text-green-700 italic text-sm">{result.latin_name}</p>
                  {result.common_names.length > 0 && (
                    <p className="text-green-800 text-xs mt-1">{result.common_names.join(", ")}</p>
                  )}
                </div>

                {/* Autres résultats */}
                {result.all_results.length > 1 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-400 uppercase font-medium mb-2">Autres possibilités</p>
                    <div className="space-y-1.5">
                      {result.all_results.slice(1).map((r, i) => (
                        <div key={i} className="flex justify-between text-sm bg-gray-50 rounded-lg px-3 py-2">
                          <span className="text-gray-700 italic">{r.latin_name}</span>
                          <span className="text-gray-400">{Math.round(r.score * 100)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  {result.plant ? (
                    <Link
                      href={`/plants/${result.plant.slug}`}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors"
                    >
                      Voir la fiche complète <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <div className="flex-1 bg-gray-50 text-gray-500 py-2.5 rounded-xl text-sm text-center">
                      Plante non encore dans notre catalogue
                    </div>
                  )}
                  <button
                    onClick={reset}
                    className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    Nouvelle photo
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
        <p className="font-semibold mb-1">Comment obtenir les meilleurs résultats ?</p>
        <ul className="space-y-1 text-blue-600 text-xs list-disc list-inside">
          <li>Photographiez les feuilles, fleurs ou fruits clairement</li>
          <li>Bonne lumière, fond neutre si possible</li>
          <li>Évitez les photos floues ou trop sombres</li>
        </ul>
      </div>
    </div>
  );
}
