import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type AnalysisResult = any; // match your real type if you have it

export default function GuestAnalysis() {
  const [data, setData] = useState<AnalysisResult | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const raw = sessionStorage.getItem("guestAnalysis");
    if (!raw) return;
    try { setData(JSON.parse(raw)); } catch { /* ignore */ }
  }, []);

  if (!data) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">No analysis found</h1>
        <p className="mt-2 text-sm opacity-80">
          Run an analysis first, or{" "}
          <button className="underline" onClick={() => navigate("/")}>go back</button>.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Analysis (Guest)</h1>
        <a className="underline" href="/auth">Create a free account to save this</a>
      </header>

      {/* Render the same KPI cards/tables you show on /analysis/:id, but using `data` */}
      <pre className="bg-neutral-950/40 p-4 rounded-xl overflow-auto text-xs">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
