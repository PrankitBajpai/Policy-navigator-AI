import React, { useEffect, useState } from "react";
import {
  GitCompare,
  Search,
  X,
  Sparkles,
  ExternalLink,
  Loader2,
  Heart,
} from "lucide-react";

const API_BASE_URL = "http://127.0.0.1:8000";

const allSchemes = [
  {
    id: 1,
    name: "PM Kisan Samman Nidhi",
    category: "Agriculture",
  },
  {
    id: 2,
    name: "PM Awas Yojana",
    category: "Housing",
  },
  {
    id: 3,
    name: "Ayushman Bharat PM-JAY",
    category: "Health",
  },
  {
    id: 4,
    name: "Startup India Seed Fund",
    category: "Business",
  },
  {
    id: 5,
    name: "Post-Matric Scholarship",
    category: "Education",
  },
  {
    id: 6,
    name: "MGNREGA",
    category: "Employment",
  },
];

const SchemeSelector = ({ value, onChange, exclude }) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const results = allSchemes.filter(
    (s) =>
      s.id !== exclude &&
      s.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative">
      <div className="flex items-center gap-2 bg-white border border-amber-200 rounded-xl px-3 py-2">
        <Search size={14} className="text-amber-400 shrink-0" />

        <input
          type="text"
          value={value ? value.name : query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            onChange(null);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search scheme..."
          className="flex-1 text-sm bg-transparent outline-none text-[#3B2F2F]"
        />

        {value && (
          <button
            onClick={() => {
              onChange(null);
              setQuery("");
            }}
          >
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
                onClick={() => {
                  onChange(s);
                  setOpen(false);
                  setQuery("");
                }}
                className="w-full text-left px-4 py-3 hover:bg-amber-50 border-b border-amber-50 last:border-0"
              >
                <div className="font-medium text-sm">{s.name}</div>

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
  const [schemeA, setSchemeA] = useState(null);
  const [schemeB, setSchemeB] = useState(null);

  const [comparison, setComparison] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [savedIds, setSavedIds] = useState([]);
  const [popup, setPopup] = useState("");

  useEffect(() => {
    fetchSavedPolicies();
  }, []);

  const showPopup = (message) => {
    setPopup(message);
    setTimeout(() => setPopup(""), 2000);
  };

  const fetchSavedPolicies = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/saved-policies`);
      const data = await response.json();

      const ids = data.map((item) => String(item.scheme_id));
      setSavedIds(ids);
    } catch (error) {
      console.error("Failed to fetch saved policies:", error);
    }
  };

  const toggleSavePolicy = async (scheme) => {
    const schemeId = String(scheme.id);
    const isAlreadySaved = savedIds.includes(schemeId);

    try {
      if (isAlreadySaved) {
        const response = await fetch(`${API_BASE_URL}/saved-policies/${schemeId}`, {
          method: "DELETE",
        });

        const data = await response.json();

        if (response.ok && data.success !== false) {
          setSavedIds((prev) => prev.filter((id) => id !== schemeId));
          showPopup("Policy removed from saved");
        } else {
          showPopup(data.message || "Failed to remove policy");
        }

        return;
      }

      const response = await fetch(`${API_BASE_URL}/saved-policies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(scheme),
      });

      const data = await response.json();

      if (response.ok && data.success !== false) {
        setSavedIds((prev) => [...prev, schemeId]);
        showPopup("Policy is saved ❤️");
      } else {
        showPopup(data.message || "Policy already saved");
      }
    } catch (error) {
      console.error(error);
      showPopup("Something went wrong");
    }
  };

  const fetchComparison = async () => {
    if (!schemeA || !schemeB) return;

    try {
      setLoading(true);
      setError(null);
      setComparison(null);

      const response = await fetch(`${API_BASE_URL}/compare`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          schemeA: schemeA.name,
          schemeB: schemeB.name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to compare schemes");
      }

      setComparison(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const normalizeScheme = (scheme, fallback) => {
    return {
      id: scheme?.id || fallback?.id,
      name: scheme?.name || fallback?.name,
      category: scheme?.category || fallback?.category || "General",
      state: scheme?.state || "Central (All India)",
      ministry: scheme?.ministry || "Government of India",
      benefit: scheme?.benefit || "",
      eligibility: scheme?.eligibility || "",
      deadline: scheme?.deadline || "",
      link: scheme?.link || "",
      online: scheme?.online ?? true,
    };
  };

  const comparedSchemeA = comparison
    ? normalizeScheme(comparison.schemeA, schemeA)
    : null;

  const comparedSchemeB = comparison
    ? normalizeScheme(comparison.schemeB, schemeB)
    : null;

  return (
    <div className="min-h-screen bg-[#FDF6EC] text-[#3B2F2F] px-4 py-10 font-['Outfit',sans-serif]">
      {popup && (
        <div className="fixed top-5 right-5 z-[999] bg-emerald-500 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium">
          {popup}
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500 flex items-center justify-center shadow-md">
              <GitCompare className="text-white" size={22} />
            </div>

            <div>
              <h1 className="text-3xl font-bold">AI Scheme Comparison</h1>

              <p className="text-sm text-amber-700/60">
                Compare government schemes using AI
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5 mb-6">
          <div>
            <label className="text-xs uppercase tracking-wider text-amber-700/60 font-semibold mb-2 block">
              Scheme A
            </label>

            <SchemeSelector
              value={schemeA}
              onChange={setSchemeA}
              exclude={schemeB?.id}
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-amber-700/60 font-semibold mb-2 block">
              Scheme B
            </label>

            <SchemeSelector
              value={schemeB}
              onChange={setSchemeB}
              exclude={schemeA?.id}
            />
          </div>
        </div>

        <div className="flex justify-center mb-10">
          <button
            onClick={fetchComparison}
            disabled={!schemeA || !schemeB || loading}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Comparing...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Compare with AI
              </>
            )}
          </button>
        </div>

        {!comparison && !loading && !error && (
          <div className="text-center py-24">
            <GitCompare
              size={52}
              strokeWidth={1}
              className="mx-auto mb-4 text-amber-300"
            />

            <p className="text-sm text-amber-700/40">
              Select two schemes and compare them using AI
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-500 rounded-2xl p-5 text-sm text-center">
            {error}
          </div>
        )}

        {comparison && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-amber-100 p-6">
              <h2 className="text-xl font-semibold mb-4">
                AI Comparison Summary
              </h2>

              <p className="text-sm leading-relaxed text-amber-900/70 whitespace-pre-line">
                {comparison.summary}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {[comparedSchemeA, comparedSchemeB].map((scheme) => (
                <div
                  key={scheme.id}
                  className="bg-white rounded-3xl border border-amber-100 p-5 flex items-start justify-between gap-4"
                >
                  <div>
                    <p className="text-xs uppercase tracking-wider text-amber-700/60 font-semibold mb-1">
                      Save Policy
                    </p>

                    <h3 className="font-semibold text-sm">{scheme.name}</h3>

                    <p className="text-xs text-amber-600/70 mt-1">
                      {scheme.category}
                    </p>
                  </div>

                  <button
                    onClick={() => toggleSavePolicy(scheme)}
                    className="p-2 rounded-full hover:bg-red-50 transition-colors"
                    title="Save or remove policy"
                  >
                    <Heart
                      size={22}
                      className={
                        savedIds.includes(String(scheme.id))
                          ? "fill-red-500 text-red-500"
                          : "text-gray-400 hover:text-red-500"
                      }
                    />
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-3xl border border-amber-100 overflow-hidden">
              <div className="grid grid-cols-3 bg-amber-50 border-b border-amber-100">
                <div className="px-5 py-4 text-xs uppercase tracking-wider text-amber-700/60 font-semibold">
                  Feature
                </div>

                <div className="px-5 py-4 border-l border-amber-100">
                  <div className="font-semibold text-sm">
                    {comparison.schemeA.name}
                  </div>
                </div>

                <div className="px-5 py-4 border-l border-amber-100">
                  <div className="font-semibold text-sm">
                    {comparison.schemeB.name}
                  </div>
                </div>
              </div>

              {comparison.comparison.map((item, index) => (
                <div
                  key={index}
                  className={`grid grid-cols-3 border-b border-amber-50 ${
                    index % 2 === 0 ? "bg-white" : "bg-amber-50/30"
                  }`}
                >
                  <div className="px-5 py-4 text-xs uppercase tracking-wider text-amber-700/60 font-semibold">
                    {item.field}
                  </div>

                  <div className="px-5 py-4 border-l border-amber-100 text-sm">
                    {item.schemeA}
                  </div>

                  <div className="px-5 py-4 border-l border-amber-100 text-sm">
                    {item.schemeB}
                  </div>
                </div>
              ))}

              <div className="grid grid-cols-3 bg-amber-50">
                <div />

                <div className="px-5 py-4 border-l border-amber-100">
                  {comparison.schemeA.link && (
                    <a
                      href={comparison.schemeA.link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-medium text-amber-600 hover:text-red-500"
                    >
                      View Official Scheme
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>

                <div className="px-5 py-4 border-l border-amber-100">
                  {comparison.schemeB.link && (
                    <a
                      href={comparison.schemeB.link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-medium text-amber-600 hover:text-red-500"
                    >
                      View Official Scheme
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-amber-700/30 mt-12">
          Powered by Groq AI · Policy Navigator AI
        </p>
      </div>
    </div>
  );
};

export default Compare;