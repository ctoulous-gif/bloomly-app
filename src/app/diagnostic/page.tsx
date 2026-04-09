"use client";

import { useState, useRef } from "react";
import { Camera, Upload, Loader2, CheckCircle, AlertTriangle, AlertCircle, Leaf, ChevronRight, RotateCcw } from "lucide-react";

type DiagnosticResult = {
  healthy: boolean;
  symptoms: string[];
  diagnosis: string;
  severity: "bonne santé" | "faible" | "modéré" | "grave";
  actions: { action: string; detail: string }[];
  prevention: string;
};

const severityConfig = {
  "bonne santé": {
    label: "Bonne santé",
    icon: CheckCircle,
    color: "text-green-600",
    bg: "bg-green-50 border-green-200",
    badge: "bg-green-100 text-green-700",
  },
  faible: {
    label: "Problème léger",
    icon: AlertTriangle,
    color: "text-yellow-600",
    bg: "bg-yellow-50 border-yellow-200",
    badge: "bg-yellow-100 text-yellow-700",
  },
  modéré: {
    label: "Problème modéré",
    icon: AlertTriangle,
    color: "text-orange-600",
    bg: "bg-orange-50 border-orange-200",
    badge: "bg-orange-100 text-orange-700",
  },
  grave: {
    label: "Problème grave",
    icon: AlertCircle,
    color: "text-red-600",
    bg: "bg-red-50 border-red-200",
    badge: "bg-red-100 text-red-700",
  },
};

export default function DiagnosticPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  function handleFile(f: File) {
    setFile(f);
    setResult(null);
    setError("");
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("image/")) handleFile(f);
  }

  async function handleAnalyze() {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/diagnostic", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur inconnue");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'analyse");
    }
    setLoading(false);
  }

  function reset() {
    setPreview(null);
    setFile(null);
    setResult(null);
    setError("");
  }

  const severity = result ? severityConfig[result.severity] : null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Diagnostic plante</h1>
        <p className="text-gray-500 mt-1">Prenez une photo de votre plante pour obtenir un diagnostic et des conseils de soin</p>
      </div>

      {!result ? (
        <div className="space-y-5">
          {/* Zone de dépôt / aperçu */}
          {!preview ? (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-gray-300 rounded-2xl p-10 flex flex-col items-center justify-center gap-4 hover:border-green-400 hover:bg-green-50/30 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
                <Leaf className="w-8 h-8 text-green-400" />
              </div>
              <div className="text-center">
                <p className="font-medium text-gray-700">Déposez une photo ici</p>
                <p className="text-sm text-gray-400 mt-1">ou cliquez pour choisir un fichier</p>
              </div>
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Choisir un fichier
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click(); }}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  <Camera className="w-4 h-4" />
                  Prendre une photo
                </button>
              </div>
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden border border-gray-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Plante à analyser" className="w-full max-h-80 object-cover" />
              <button
                onClick={reset}
                className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors shadow"
              >
                <RotateCcw className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          )}

          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {preview && (
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3.5 rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyse en cours...
                </>
              ) : (
                <>
                  <Leaf className="w-5 h-5" />
                  Analyser la plante
                </>
              )}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {/* Photo + statut */}
          <div className={`rounded-2xl border-2 overflow-hidden ${severity!.bg}`}>
            <div className="flex items-center gap-3 p-4">
              {(() => { const Icon = severity!.icon; return <Icon className={`w-6 h-6 ${severity!.color}`} />; })()}
              <div className="flex-1">
                <p className={`font-semibold ${severity!.color}`}>{severity!.label}</p>
                <p className="text-sm text-gray-600 mt-0.5">{result.diagnosis}</p>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${severity!.badge}`}>
                {result.severity}
              </span>
            </div>
            {preview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Plante analysée" className="w-full max-h-48 object-cover border-t border-current/10" />
            )}
          </div>

          {/* Symptômes */}
          {!result.healthy && result.symptoms.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-900 mb-3">Symptômes détectés</h2>
              <ul className="space-y-2">
                {result.symptoms.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          {result.actions.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-900 mb-4">
                {result.healthy ? "Conseils d'entretien" : "Marche à suivre"}
              </h2>
              <div className="space-y-4">
                {result.actions.map((a, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{a.action}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{a.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prévention */}
          {result.prevention && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex gap-3">
              <ChevronRight className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800">Pour éviter ce problème</p>
                <p className="text-sm text-green-700 mt-0.5">{result.prevention}</p>
              </div>
            </div>
          )}

          {/* Nouvelle analyse */}
          <button
            onClick={reset}
            className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Analyser une autre plante
          </button>
        </div>
      )}
    </div>
  );
}
