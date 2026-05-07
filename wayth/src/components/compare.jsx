import React, { useEffect, useState } from "react";
import { GitCompare, Search, X, Sparkles, ExternalLink, Loader2, Heart, AlertCircle } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const SchemeSelector = ({ value, onChange, exclude, schemes = [] }) => {
  const [query, setQuery] = useState("");
  const [open,  setOpen]  = useState(false);

  const results = schemes.filter(
    (s) => s.id !== exclude && s.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative">
      <div className="flex items-center gap-2 bg-white border border-amber-200 rounded-xl px-3 py-2.5">
        <Search size={14} className="text-amber-400 shrink-0" />
        <input
          type="text"
          value={value ? value.name : query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); onChange(null); }}
          onFocus={() => setOpen(true)}
          placeholder="Search scheme..."
          className="flex-1 text-sm bg-transparent outline-none text-[#3B2F2F] placeholder-amber-300"
        />
        {value && (
          <button onClick={() => { onChange(null); setQuery(""); }}>
            <X size={14} className="text-gray-400 hover:text-red-400" />
          </button>
        )}
      </div>

      {open && !value && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-amber-100 rounded-xl shadow-lg z-20 max-h-52 overflow-y-auto">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-gray-400">No schemes found</p>
          ) : (
            results.map((s) => (
              <button
                key={s.id}
                onClick={() => { onChange(s); setOpen(false); setQuery(""); }}
                className="w-full text-left px-4 py-3 hover:bg-amber-50 border-b border-amber-50 last:border-0 transition-colors"
              >
                <div className="font-medium text-sm text-[#3B2F2F]">{s.name}</div>
                <div className="text-xs text-amber-600/70">{s.category}</div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

const Compare = () => {
  const [schemeList,       setSchemeList]       = useState([]);
  const [schemeA,          setSchemeA]          = useState(null);
  const [schemeB,          setSchemeB]          = useState(null);
  const [comparison,       setComparison]       = useState(null);
  const [loading,          setLoading]          = useState(false);
  const [error,            setError]            = useState(null);
  const [savedIds,         setSavedIds]         = useState([]);
  const [popup,            setPopup]            = useState("");
  const [schemesLoading,   setSchemesLoading]   = useState(true);

  useEffect(() => { fetchSchemeList(); fetchSavedPolicies(); }, []);

  const showPopup = (msg) => { setPopup(msg); setTimeout(() => setPopup(""), 2500); };

  const fetchSchemeList = async () => {
    try {
      setSchemesLoading(true);
      const res  = await fetch(`${API_BASE_URL}/schemes`);
      const data = await res.json();
      setSchemeList(
        (Array.isArray(data) ? data : []).map((s, i) => ({
          id:       s.id ?? i,
          name:     s.scheme_name ?? s.name ?? "Unnamed",
          category: (s.schemecategory ?? s.category ?? "General").split(",")[0].trim(),
        }))
      );
    } catch (err) {
      console.error("Failed to load schemes:", err);
    } finally {
      setSchemesLoading(false);
    }
  };

  const fetchSavedPolicies = async () => {
    try {
      const res  = await fetch(`${API_BASE_URL}/saved-policies`);
      const data = await res.json();
      setSavedIds((Array.isArray(data) ? data : []).map((item) => String(item.scheme_id ?? item.id ?? "")));
    } catch (err) {
      console.error("Saved policies error:", err);
    }
  };

  const toggleSavePolicy = async (scheme) => {
    const schemeId       = String(scheme.id);
    const isAlreadySaved = savedIds.includes(schemeId);
    try {
      if (isAlreadySaved) {
        const res = await fetch(`${API_BASE_URL}/saved-policies/${schemeId}`, { method: "DELETE" });
        if (res.ok) { setSavedIds((p) => p.filter((id) => id !== schemeId)); showPopup("Policy removed"); }
        return;
      }
      const res = await fetch(`${API_BASE_URL}/saved-policies`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(scheme),
      });
      if (res.ok) { setSavedIds((p) => [...p, schemeId]); showPopup("Policy saved!"); }
      else showPopup("Could not save policy");
    } catch { showPopup("Something went wrong"); }
  };

  const fetchComparison = async () => {
    if (!schemeA || !schemeB) return;
    try {
      setLoading(true); setError(null); setComparison(null);
      const res  = await fetch(`${API_BASE_URL}/api/compare`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ schemeA: schemeA.name, schemeB: schemeB.name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to compare schemes");
      setComparison(data);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF6EC] text-[#3B2F2F] px-4 py-10 font-['Outfit',sans-serif]">

      {popup && (
        <div className="fixed top-5 right-5 z-[999] bg-emerald-500 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium">
          {popup}
        </div>
      )}

      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-2xl bg-amber-500 flex items-center justify-center">
              <GitCompare className="text-white" size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#3B2F2F]">AI Scheme Comparison</h1>
              <p className="text-sm text-amber-700/60">Compare government schemes using Groq AI</p>
            </div>
          </div>
        </div>

        {/* Selectors */}
        <div className="grid md:grid-cols-2 gap-5 mb-6">
          <div>
            <label className="text-xs uppercase tracking-wider text-amber-700/60 font-semibold mb-2 block">
              Scheme A
            </label>
            {schemesLoading ? (
              <div className="flex items-center gap-2 bg-white border border-amber-200 rounded-xl px-3 py-2.5">
                <Loader2 size={14} className="animate-spin text-amber-400" />
                <span className="text-sm text-amber-300">Loading schemes...</span>
              </div>
            ) : (
              <SchemeSelector value={schemeA} onChange={setSchemeA} exclude={schemeB?.id} schemes={schemeList} />
            )}
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-amber-700/60 font-semibold mb-2 block">
              Scheme B
            </label>
            {schemesLoading ? (
              <div className="flex items-center gap-2 bg-white border border-amber-200 rounded-xl px-3 py-2.5">
                <Loader2 size={14} className="animate-spin text-amber-400" />
                <span className="text-sm text-amber-300">Loading schemes...</span>
              </div>
            ) : (
              <SchemeSelector value={schemeB} onChange={setSchemeB} exclude={schemeA?.id} schemes={schemeList} />
            )}
          </div>
        </div>

        {/* Compare Button */}
        <div className="flex justify-center mb-10">
          <button
            onClick={fetchComparison}
            disabled={!schemeA || !schemeB || loading}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><Loader2 size={18} className="animate-spin" /> Comparing...</>
            ) : (
              <><Sparkles size={18} /> Compare with AI</>
            )}
          </button>
        </div>

        {/* Empty state */}
        {!comparison && !loading && !error && (
          <div className="text-center py-24">
            <GitCompare size={52} strokeWidth={1} className="mx-auto mb-4 text-amber-300" />
            <p className="text-sm text-amber-700/40">Select two schemes above and compare them using AI</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-500 rounded-2xl p-5 text-sm">
            <AlertCircle size={18} className="shrink-0" />
            {error}
          </div>
        )}

        {/* Results */}
        {comparison && (
          <div className="space-y-6">

            {/* Summary */}
            <div className="bg-white rounded-3xl border border-amber-100 p-6">
              <h2 className="text-lg font-semibold mb-3 text-[#3B2F2F]">AI Summary</h2>
              <p className="text-sm leading-relaxed text-amber-900/70 whitespace-pre-line">{comparison.summary}</p>
            </div>

            {/* Save cards */}
            <div className="grid md:grid-cols-2 gap-5">
              {[comparison.schemeA, comparison.schemeB].map((scheme) => (
                <div key={scheme.id} className="bg-white rounded-2xl border border-amber-100 p-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-amber-700/50 font-semibold mb-1">Save Policy</p>
                    <h3 className="font-semibold text-sm text-[#3B2F2F]">{scheme.name}</h3>
                    <p className="text-xs text-amber-600/70 mt-0.5">{scheme.category}</p>
                  </div>
                  <button
                    onClick={() => toggleSavePolicy(scheme)}
                    className="p-2 rounded-full hover:bg-red-50 transition-colors shrink-0"
                  >
                    <Heart
                      size={22}
                      className={savedIds.includes(String(scheme.id)) ? "fill-red-500 text-red-500" : "text-gray-300 hover:text-red-400"}
                    />
                  </button>
                </div>
              ))}
            </div>

            {/* Comparison Table */}
            <div className="bg-white rounded-3xl border border-amber-100 overflow-hidden">

              {/* Table header */}
              <div className="grid grid-cols-3 bg-amber-50 border-b border-amber-100">
                <div className="px-5 py-4 text-xs uppercase tracking-wider text-amber-700/60 font-semibold">Feature</div>
                <div className="px-5 py-4 border-l border-amber-100 font-semibold text-sm text-[#3B2F2F]">{comparison.schemeA.name}</div>
                <div className="px-5 py-4 border-l border-amber-100 font-semibold text-sm text-[#3B2F2F]">{comparison.schemeB.name}</div>
              </div>

              {/* Rows */}
              {comparison.comparison.map((item, index) => (
                <div key={index} className={`grid grid-cols-3 border-b border-amber-50 last:border-0 ${index % 2 === 0 ? "bg-white" : "bg-amber-50/30"}`}>
                  <div className="px-5 py-4 text-xs uppercase tracking-wider text-amber-700/60 font-semibold">{item.field}</div>
                  <div className="px-5 py-4 border-l border-amber-100 text-sm text-gray-700">{item.schemeA}</div>
                  <div className="px-5 py-4 border-l border-amber-100 text-sm text-gray-700">{item.schemeB}</div>
                </div>
              ))}

              {/* Footer links */}
              <div className="grid grid-cols-3 bg-amber-50 border-t border-amber-100">
                <div className="px-5 py-4" />
                <div className="px-5 py-4 border-l border-amber-100">
                  {comparison.schemeA.link && (
                    <a href={comparison.schemeA.link} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-600 hover:text-red-500">
                      Official Site <ExternalLink size={13} />
                    </a>
                  )}
                </div>
                <div className="px-5 py-4 border-l border-amber-100">
                  {comparison.schemeB.link && (
                    <a href={comparison.schemeB.link} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-600 hover:text-red-500">
                      Official Site <ExternalLink size={13} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-amber-700/30 mt-12">
          Powered by Groq AI (llama-3.1-8b-instant) · Policy Navigator
        </p>
      </div>
    </div>
  );
};

export default Compare;