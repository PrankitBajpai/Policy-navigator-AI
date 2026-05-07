import React, { useEffect, useState } from "react";
import {
  LayoutGrid,
  Search,
  ExternalLink,
  Tag,
  Loader2,
  AlertCircle,
  X,
  Heart,
  Sparkles,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const norm = (v) => String(v ?? "").toLowerCase().trim();

const Browse = () => {
  const [schemes, setSchemes] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savedIds, setSavedIds] = useState([]);
  const [popup, setPopup] = useState("");
  const [recommendMode, setRecommendMode] = useState(false);
  const [recommendLoading, setRecommendLoading] = useState(false);
  const [isPersonalized, setIsPersonalized] = useState(false);

  const [profile, setProfile] = useState({
    age: "",
    gender: "",
    occupation: "",
    income: "",
    caste: "",
    background: "",
  });

  useEffect(() => {
    fetchSchemes();
    fetchSavedPolicies();
  }, []);

  const showPopup = (msg) => {
    setPopup(msg);
    setTimeout(() => setPopup(""), 2500);
  };

  const fetchSchemes = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_BASE_URL}/schemes`);
      if (!res.ok) throw new Error("Server error");

      const data = await res.json();
      setSchemes(Array.isArray(data) ? data : []);
      setIsPersonalized(false);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch schemes. Is your FastAPI backend running?");
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedPolicies = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/saved-policies`);
      const data = await res.json();

      setSavedIds(
        (Array.isArray(data) ? data : []).map((item) =>
          String(item.scheme_id ?? item.id ?? "")
        )
      );
    } catch (err) {
      console.error("Saved policies error:", err);
    }
  };

  const savePolicy = async (scheme) => {
    const schemeId = String(scheme.id ?? "");
    const isAlreadySaved = savedIds.includes(schemeId);

    try {
      if (isAlreadySaved) {
        const res = await fetch(`${API_BASE_URL}/saved-policies/${schemeId}`, {
          method: "DELETE",
        });

        if (res.ok) {
          setSavedIds((p) => p.filter((id) => id !== schemeId));
          showPopup("Removed from saved");
        } else {
          showPopup("Failed to remove");
        }

        return;
      }

      const res = await fetch(`${API_BASE_URL}/saved-policies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scheme),
      });

      if (res.ok) {
        setSavedIds((p) => [...p, schemeId]);
        showPopup("Policy saved!");
      } else {
        showPopup("Could not save policy");
      }
    } catch {
      showPopup("Something went wrong");
    }
  };

  useEffect(() => {
    const q = norm(searchQuery);

    const result = schemes.filter((s) => {
      if (!q) return true;

      const haystack = [
        s.scheme_name,
        s.name,
        s.benefits,
        s.benefit,
        s.eligibility,
        s.schemecategory,
        s.category,
        s.level,
        s.state,
        s.tags,
      ]
        .map((v) => norm(v))
        .join(" ");

      return haystack.includes(q);
    });

    setFiltered(result);
  }, [schemes, searchQuery]);

  const getRecommendations = async () => {
    try {
      setRecommendLoading(true);
      setError("");

      const res = await fetch(`${API_BASE_URL}/schemes/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age: profile.age ? Number(profile.age) : null,
          gender: profile.gender,
          occupation: profile.occupation,
          income: profile.income,
          caste: profile.caste,
          background: profile.background,
        }),
      });

      const data = await res.json();

      setSchemes(Array.isArray(data) ? data : []);
      setRecommendMode(false);
      setIsPersonalized(true);
      setSearchQuery("");
      showPopup("Personalized schemes loaded!");
    } catch (err) {
      console.error(err);
      showPopup("Failed to get recommendations");
    } finally {
      setRecommendLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const resetAllPolicies = () => {
    clearSearch();
    fetchSchemes();
    showPopup("Showing all schemes");
  };

  const displayName = (s) => s.scheme_name ?? s.name ?? "Unnamed Scheme";
  const displayCategory = (s) =>
    (s.schemecategory ?? s.category ?? "General").split(",")[0].trim();
  const displayBenefit = (s) => s.benefits ?? s.benefit ?? "Not specified";
  const displayElig = (s) => s.eligibility ?? "Not specified";
  const displayOnline = (s) => Boolean(s.online);
  const displayLink = (s) => s.link ?? s.url ?? null;

  return (
    <div className="min-h-screen bg-[#FDF6EC] text-[#3B2F2F] px-4 py-10 font-['Outfit',sans-serif]">
      {popup && (
        <div className="fixed top-5 right-5 z-[999] bg-emerald-500 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium animate-pulse">
          {popup}
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
              <LayoutGrid className="text-white" size={20} />
            </div>
            <h1 className="text-2xl font-semibold">Browse Government Schemes</h1>
          </div>

          <p className="text-sm text-amber-700/60">
            {isPersonalized ? "Personalized for you · " : ""}
            {loading
              ? "Loading..."
              : `${filtered.length} scheme${filtered.length !== 1 ? "s" : ""} found`}
          </p>
        </div>

        <div className="relative mb-5">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400"
          />

          <input
            type="text"
            placeholder="Search schemes, eligibility, benefits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-amber-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        <div className="mb-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => setRecommendMode(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-all"
          >
            <Sparkles size={16} /> Get Policies For You
          </button>

          {isPersonalized && (
            <button
              onClick={resetAllPolicies}
              className="px-5 py-2.5 rounded-xl bg-white text-amber-700 border border-amber-200 text-sm font-medium hover:bg-amber-50 transition-all"
            >
              Show All Schemes
            </button>
          )}
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 size={40} className="animate-spin text-amber-500" />
            <p className="text-sm text-amber-700/60">Loading schemes...</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <AlertCircle size={40} className="text-red-400" />
            <p className="text-sm text-red-500 text-center max-w-sm">{error}</p>
            <button
              onClick={fetchSchemes}
              className="text-xs text-amber-600 hover:underline"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-24">
            <LayoutGrid
              size={48}
              strokeWidth={1}
              className="mx-auto mb-3 text-amber-300"
            />
            <p className="text-sm text-amber-700/40 mb-3">No schemes found.</p>
            <button
              onClick={clearSearch}
              className="text-xs text-amber-600 hover:underline"
            >
              Clear Search
            </button>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((scheme, idx) => {
              const id = String(scheme.id ?? idx);
              const isSaved = savedIds.includes(id);

              return (
                <div
                  key={id}
                  className="bg-white rounded-2xl border border-amber-100 hover:border-amber-300 hover:shadow-lg transition-all p-5 flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-100">
                      <Tag size={9} />
                      {displayCategory(scheme)}
                    </span>

                    <button
                      onClick={() => savePolicy({ ...scheme, id })}
                      className="p-1.5 rounded-full hover:bg-red-50 transition-colors"
                      title={isSaved ? "Remove from saved" : "Save policy"}
                    >
                      <Heart
                        size={16}
                        className={
                          isSaved
                            ? "fill-red-500 text-red-500"
                            : "text-gray-300 hover:text-red-400"
                        }
                      />
                    </button>
                  </div>

                  <h3 className="text-sm font-semibold leading-snug text-[#3B2F2F]">
                    {displayName(scheme)}
                  </h3>

                  <div className="space-y-1.5 text-xs text-gray-600 border-t border-amber-50 pt-3">
                    <p>
                      <span className="font-semibold text-[#3B2F2F]">
                        Category:{" "}
                      </span>
                      <span>{displayCategory(scheme)}</span>
                    </p>

                    <p>
                      <span className="font-semibold text-[#3B2F2F]">
                        Benefit:{" "}
                      </span>
                      <span className="line-clamp-2">{displayBenefit(scheme)}</span>
                    </p>

                    <p>
                      <span className="font-semibold text-[#3B2F2F]">
                        Eligibility:{" "}
                      </span>
                      <span className="line-clamp-2">{displayElig(scheme)}</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-amber-50">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        displayOnline(scheme)
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                          : "bg-gray-50 text-gray-400 border-gray-100"
                      }`}
                    >
                      {displayOnline(scheme) ? "✓ Apply Online" : "Offline Only"}
                    </span>

                    {displayLink(scheme) && (
                      <a
                        href={displayLink(scheme)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Website <ExternalLink size={11} />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {recommendMode && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setRecommendMode(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
              >
                <X size={20} />
              </button>

              <h2 className="text-xl font-bold mb-1 text-[#3B2F2F]">
                Personalized Recommendation
              </h2>

              <p className="text-sm text-amber-700/60 mb-5">
                Fill in your details to find the right schemes.
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { key: "age", placeholder: "Age", type: "number" },
                  {
                    key: "occupation",
                    placeholder: "Occupation e.g. farmer",
                    type: "text",
                  },
                  {
                    key: "income",
                    placeholder: "Income e.g. BPL, low",
                    type: "text",
                  },
                  {
                    key: "caste",
                    placeholder: "Caste e.g. SC, ST, OBC",
                    type: "text",
                  },
                  {
                    key: "background",
                    placeholder: "e.g. rural, disabled",
                    type: "text",
                  },
                ].map(({ key, placeholder, type }) => (
                  <input
                    key={key}
                    type={type}
                    placeholder={placeholder}
                    value={profile[key]}
                    onChange={(e) =>
                      setProfile({ ...profile, [key]: e.target.value })
                    }
                    className="px-4 py-3 rounded-xl border border-amber-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                ))}

                <select
                  value={profile.gender}
                  onChange={(e) =>
                    setProfile({ ...profile, gender: e.target.value })
                  }
                  className="px-4 py-3 rounded-xl border border-amber-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <option value="">Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <button
                onClick={getRecommendations}
                disabled={recommendLoading}
                className="mt-6 w-full py-3 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600 disabled:opacity-50 transition-all"
              >
                {recommendLoading ? "Finding schemes..." : "Get My Schemes"}
              </button>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-amber-700/30 mt-12">
          Powered by Groq AI · Policy Navigator
        </p>
      </div>
    </div>
  );
};

export default Browse;