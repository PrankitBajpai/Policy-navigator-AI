import React, { useEffect, useState } from "react";
import {
  LayoutGrid,
  Search,
  ExternalLink,
  Tag,
  MapPin,
  Building2,
  Loader2,
  AlertCircle,
  X,
  Heart,
  Sparkles,
  ChevronRight,
} from "lucide-react";

const API_BASE_URL = "http://127.0.0.1:8000";

// ─── Category labels → exact tokens in schemecategory field ──────────────────
// The CSV uses these exact strings (some have commas inside the name itself).
// Matching works by checking if the raw schemecategory string CONTAINS the token.
const CATEGORY_MAP = {
  "All":          null,
  "Agriculture":  "Agriculture,Rural & Environment",
  "Education":    "Education & Learning",
  "Health":       "Health & Wellness",
  "Housing":      "Housing & Shelter",
  "Business":     "Business & Entrepreneurship",
  "Employment":   "Skills & Employment",
  "Women":        "Women and Child",
  "Banking":      "Banking,Financial Services and Insurance",
  "Social":       "Social welfare & Empowerment",
  "Sports":       "Sports & Culture",
  "Science/IT":   "Science, IT & Communications",
  "Transport":    "Transport & Infrastructure",
  "Utility":      "Utility & Sanitation",
};

const categories = Object.keys(CATEGORY_MAP);

// ─── Level filter options ─────────────────────────────────────────────────────
// The CSV only has level = "Central" | "State". No individual state names.
// So the dropdown filters by scheme level, not by specific state.
const levelOptions = ["All Schemes", "Central Schemes", "State Schemes"];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const norm = (v) => String(v ?? "").toLowerCase().trim();

const matchesCategory = (scheme, selectedLabel) => {
  if (selectedLabel === "All") return true;
  const token = CATEGORY_MAP[selectedLabel];
  if (!token) return true;
  // The field in your API response — check both possible field names
  const raw = String(
    scheme.schemecategory ?? scheme.category ?? ""
  );
  return raw.includes(token);
};

const matchesLevel = (scheme, selectedLevel) => {
  if (selectedLevel === "All Schemes") return true;
  // The field in your API response — check both possible field names
  const raw = norm(scheme.level ?? scheme.state ?? "");
  if (selectedLevel === "Central Schemes") return raw === "central";
  if (selectedLevel === "State Schemes")   return raw === "state";
  return true;
};
// ─────────────────────────────────────────────────────────────────────────────

// ─── AI Detail Modal ──────────────────────────────────────────────────────────
const DetailModal = ({ scheme, onClose }) => {
  const [aiContent, setAiContent] = useState("");
  const [aiLoading, setAiLoading] = useState(true);
  const [aiError, setAiError] = useState("");

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setAiLoading(true);
        setAiError("");

        const name       = scheme.scheme_name ?? scheme.name ?? "This scheme";
        const category   = scheme.schemecategory ?? scheme.category ?? "General";
        const level      = scheme.level ?? scheme.state ?? "Central";
        const benefits   = scheme.benefits ?? scheme.benefit ?? "Not specified";
        const eligibility = scheme.eligibility ?? "Not specified";
        const application = scheme.application ?? "Not specified";
        const documents   = scheme.documents ?? "Not specified";

        const prompt = `You are a helpful Indian government scheme advisor helping a common citizen understand a government scheme.

Scheme Name: ${name}
Category: ${category}
Level: ${level}
Benefits: ${benefits}
Eligibility: ${eligibility}
How to Apply: ${application}
Documents Required: ${documents}

Write a clear, friendly explanation covering:
1. **What is this scheme?** – Simple 2-3 line summary
2. **Who can apply?** – Eligibility in plain language
3. **What will you get?** – Benefits explained clearly
4. **How to apply?** – Step-by-step process
5. **Documents needed** – Key documents list
6. **Tips & things to watch out for** – Practical advice

Keep the tone simple and helpful. Use bullet points where appropriate.`;

        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1000,
            messages: [{ role: "user", content: prompt }],
          }),
        });

        const data = await response.json();
        const text = data.content
          .filter((b) => b.type === "text")
          .map((b) => b.text)
          .join("");
        setAiContent(text);
      } catch (err) {
        console.error(err);
        setAiError("Failed to load details. Please try again.");
      } finally {
        setAiLoading(false);
      }
    };

    fetchDetail();
  }, [scheme]);

  const renderContent = (text) => {
    return text.split("\n").map((line, i) => {
      if (!line.trim()) return <div key={i} className="h-2" />;

      const parts = line.split(/\*\*(.*?)\*\*/g);
      const rendered = parts.map((part, j) =>
        j % 2 === 1 ? (
          <strong key={j} className="font-semibold text-[#3B2F2F]">{part}</strong>
        ) : part
      );

      if (line.trim().startsWith("- ") || line.trim().startsWith("• ")) {
        return (
          <div key={i} className="flex gap-2 text-sm text-gray-700 leading-relaxed">
            <span className="text-amber-500 mt-0.5 shrink-0">•</span>
            <span>{rendered}</span>
          </div>
        );
      }
      if (/^\d+\./.test(line.trim())) {
        return (
          <div key={i} className="flex gap-2 text-sm text-gray-700 leading-relaxed">
            <span className="text-amber-600 font-semibold shrink-0">
              {line.trim().match(/^\d+\./)[0]}
            </span>
            <span>{rendered}</span>
          </div>
        );
      }
      return (
        <p key={i} className="text-sm text-gray-700 leading-relaxed">{rendered}</p>
      );
    });
  };

  const name     = scheme.scheme_name ?? scheme.name ?? "Scheme";
  const category = scheme.schemecategory ?? scheme.category ?? "General";
  const level    = scheme.level ?? scheme.state ?? "Central";
  const link     = scheme.link ?? scheme.url ?? null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-amber-100 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-100">
                  {category.split(",")[0].trim()}
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                  norm(level) === "central"
                    ? "bg-blue-50 text-blue-600 border-blue-100"
                    : "bg-green-50 text-green-600 border-green-100"
                }`}>
                  {level}
                </span>
              </div>
              <h2 className="text-base font-bold text-[#3B2F2F] leading-snug">{name}</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-red-500 transition-colors shrink-0 mt-1"
            >
              <X size={20} />
            </button>
          </div>
          {link && (
            <a
              href={link}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800"
            >
              Official Website <ExternalLink size={11} />
            </a>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {aiLoading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 size={32} className="animate-spin text-amber-500" />
              <p className="text-sm text-amber-700/60">Generating detailed explanation…</p>
            </div>
          )}
          {aiError && !aiLoading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <AlertCircle size={32} className="text-red-400" />
              <p className="text-sm text-red-500">{aiError}</p>
            </div>
          )}
          {!aiLoading && !aiError && aiContent && (
            <div className="space-y-1.5">{renderContent(aiContent)}</div>
          )}
        </div>
      </div>
    </div>
  );
};
// ─────────────────────────────────────────────────────────────────────────────

const Browse = () => {
  const [schemes, setSchemes]         = useState([]);
  const [filtered, setFiltered]       = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeLevel, setActiveLevel] = useState("All Schemes");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [savedIds, setSavedIds]       = useState([]);
  const [popup, setPopup]             = useState("");
  const [recommendMode, setRecommendMode]     = useState(false);
  const [recommendLoading, setRecommendLoading] = useState(false);
  const [isPersonalized, setIsPersonalized]   = useState(false);
  const [detailScheme, setDetailScheme]       = useState(null);

  const [profile, setProfile] = useState({
    age: "", gender: "", state: "", category: "",
    occupation: "", income: "", caste: "", background: "",
  });

  useEffect(() => { fetchSchemes(); fetchSavedPolicies(); }, []);

  const showPopup = (msg) => {
    setPopup(msg);
    setTimeout(() => setPopup(""), 2500);
  };

  const fetchSchemes = async () => {
    try {
      setLoading(true);
      setError("");
      const res  = await fetch(`${API_BASE_URL}/schemes`);
      const data = await res.json();
      setSchemes(data);
      setIsPersonalized(false);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch government schemes.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedPolicies = async () => {
    try {
      const res  = await fetch(`${API_BASE_URL}/saved-policies`);
      const data = await res.json();
      setSavedIds(data.map((item) => String(item.scheme_id)));
    } catch (err) {
      console.error("Failed to fetch saved policies:", err);
    }
  };

  const savePolicy = async (scheme) => {
    const schemeId     = String(scheme.id);
    const isAlreadySaved = savedIds.includes(schemeId);
    try {
      if (isAlreadySaved) {
        const res  = await fetch(`${API_BASE_URL}/saved-policies/${schemeId}`, { method: "DELETE" });
        const data = await res.json();
        if (res.ok && data.success !== false) {
          setSavedIds((prev) => prev.filter((id) => id !== schemeId));
          showPopup("Policy removed from saved");
        } else {
          showPopup(data.message || "Failed to remove policy");
        }
        return;
      }
      const res  = await fetch(`${API_BASE_URL}/saved-policies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scheme),
      });
      const data = await res.json();
      if (res.ok && data.success !== false) {
        setSavedIds((prev) => [...prev, schemeId]);
        showPopup("Policy is saved ❤️");
      } else {
        showPopup(data.message || "Policy already saved");
      }
    } catch (err) {
      console.error(err);
      showPopup("Something went wrong");
    }
  };

  // ─── Filter — runs whenever schemes, category, level, or search changes ────
  useEffect(() => {
    const q = norm(searchQuery);
    const result = schemes.filter((s) => {
      if (!matchesCategory(s, activeCategory)) return false;
      if (!matchesLevel(s, activeLevel))       return false;
      if (q) {
        const haystack = [
          s.scheme_name, s.name, s.benefits, s.benefit,
          s.eligibility, s.schemecategory, s.category,
          s.level, s.state, s.tags,
        ].map((v) => norm(v)).join(" ");
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
    setFiltered(result);
  }, [schemes, activeCategory, activeLevel, searchQuery]);
  // ─────────────────────────────────────────────────────────────────────────────

  const getPersonalRecommendations = async () => {
    try {
      setRecommendLoading(true);
      setError("");
      const res  = await fetch(`${API_BASE_URL}/schemes/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age:        profile.age ? Number(profile.age) : null,
          gender:     profile.gender,
          state:      profile.state,
          category:   profile.category,
          occupation: profile.occupation,
          income:     profile.income,
          caste:      profile.caste,
          background: profile.background,
        }),
      });
      const data = await res.json();
      setSchemes(data);
      setRecommendMode(false);
      setIsPersonalized(true);
      setActiveCategory("All");
      setActiveLevel("All Schemes");
      setSearchQuery("");
      showPopup("Personal recommendations loaded ✨");
    } catch (err) {
      console.error(err);
      showPopup("Failed to get recommendations");
    } finally {
      setRecommendLoading(false);
    }
  };

  const clearFilters    = () => { setActiveCategory("All"); setActiveLevel("All Schemes"); setSearchQuery(""); };
  const resetAllPolicies = () => { clearFilters(); fetchSchemes(); showPopup("Showing all policies"); };

  // ─── Derive display values from a scheme object (handles both field name styles)
  const displayName     = (s) => s.scheme_name ?? s.name ?? "Unnamed Scheme";
  const displayCategory = (s) => {
    const raw = s.schemecategory ?? s.category ?? "";
    // Show only the first category token for the badge
    return raw.split(",")[0].trim() || "General";
  };
  const displayLevel    = (s) => s.level ?? s.state ?? "Central";
  const displayBenefit  = (s) => s.benefits ?? s.benefit ?? "Not specified";
  const displayElig     = (s) => s.eligibility ?? "Not specified";
  const displayDeadline = (s) => s.deadline ?? "Not specified";
  const displayOnline   = (s) => s.online ?? false;
  const displayLink     = (s) => s.link ?? s.url ?? null;

  return (
    <div className="min-h-screen bg-[#FDF6EC] text-[#3B2F2F] px-4 py-10 font-['Outfit',sans-serif]">
      {popup && (
        <div className="fixed top-5 right-5 z-[999] bg-emerald-500 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium">
          {popup}
        </div>
      )}

      {detailScheme && (
        <DetailModal scheme={detailScheme} onClose={() => setDetailScheme(null)} />
      )}

      <div className="max-w-7xl mx-auto">

        {/* ── Header ── */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
              <LayoutGrid className="text-white" size={20} />
            </div>
            <h1 className="text-2xl font-semibold">Browse Government Schemes</h1>
          </div>
          <p className="text-sm text-amber-700/60">
            {isPersonalized ? "Personalized results · " : ""}
            {filtered.length} scheme{filtered.length !== 1 ? "s" : ""} found
          </p>
        </div>

        {/* ── Search ── */}
        <div className="relative mb-5">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" />
          <input
            type="text"
            placeholder="Search schemes, eligibility, benefits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-amber-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        {/* ── Action buttons ── */}
        <div className="mb-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => setRecommendMode(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-all"
          >
            <Sparkles size={16} /> Get Policies For You
          </button>
          <button
            onClick={resetAllPolicies}
            className="px-5 py-2.5 rounded-xl bg-white text-amber-700 border border-amber-200 text-sm font-medium hover:bg-amber-50 transition-all"
          >
            Show All Policies
          </button>
        </div>

        {/* ── Filters ── */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">

          {/* Category chips — hidden in personalized mode */}
          {!isPersonalized && (
            <div className="flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-700/50 mb-2">
                Category
              </p>
              <div className="flex gap-2 flex-wrap">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                      activeCategory === cat
                        ? "bg-amber-500 text-white border-amber-600"
                        : "bg-white text-amber-700 border-amber-200 hover:bg-amber-50"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Level filter — always visible */}
          <div className={isPersonalized ? "w-full lg:w-72" : "lg:w-56"}>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-700/50 mb-2 flex items-center gap-1">
              <MapPin size={10} /> Scheme Level
            </p>
            <select
              value={activeLevel}
              onChange={(e) => setActiveLevel(e.target.value)}
              className="w-full px-3 py-3 rounded-xl border border-amber-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              {levelOptions.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── States ── */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 size={40} className="animate-spin text-amber-500" />
            <p className="text-sm text-amber-700/60">Loading schemes...</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <AlertCircle size={40} className="text-red-400" />
            <p className="text-sm text-red-500">{error}</p>
            <button onClick={fetchSchemes} className="text-xs text-amber-600 hover:underline">Try Again</button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-24">
            <LayoutGrid size={48} strokeWidth={1} className="mx-auto mb-3 text-amber-300" />
            <p className="text-sm text-amber-700/40">No schemes found.</p>
            <button onClick={clearFilters} className="mt-3 text-xs text-amber-600 hover:underline">
              Clear Filters
            </button>
          </div>
        )}

        {/* ── Cards ── */}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((scheme, idx) => {
              const id       = String(scheme.id ?? scheme.slug ?? idx);
              const isSaved  = savedIds.includes(id);
              const lvl      = displayLevel(scheme);
              const isCenter = norm(lvl) === "central";

              return (
                <div
                  key={id}
                  className="bg-white rounded-2xl border border-amber-100 hover:border-amber-300 hover:shadow-lg transition-all p-5 flex flex-col gap-3"
                >
                  {/* Top row */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-100">
                      <Tag size={9} />
                      {displayCategory(scheme)}
                    </span>
                    <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      isCenter
                        ? "bg-blue-50 text-blue-600 border-blue-100"
                        : "bg-green-50 text-green-600 border-green-100"
                    }`}>
                      <MapPin size={9} />
                      {lvl}
                    </span>
                    <button
                      onClick={() => savePolicy({ ...scheme, id })}
                      className="ml-auto p-2 rounded-full hover:bg-red-50 transition-colors"
                      title="Save Policy"
                    >
                      <Heart
                        size={18}
                        className={isSaved ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-500"}
                      />
                    </button>
                  </div>

                  {/* Name */}
                  <h3 className="text-sm font-semibold leading-snug">{displayName(scheme)}</h3>

                  {/* Details */}
                  <div className="space-y-2 text-xs text-gray-600 border-t border-amber-50 pt-3">
                    <p>
                      <span className="font-semibold text-[#3B2F2F]">Benefit: </span>
                      <span className="line-clamp-2">{displayBenefit(scheme)}</span>
                    </p>
                    <p>
                      <span className="font-semibold text-[#3B2F2F]">Eligibility: </span>
                      <span className="line-clamp-2">{displayElig(scheme)}</span>
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-amber-50">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      displayOnline(scheme)
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                        : "bg-gray-50 text-gray-400 border border-gray-100"
                    }`}>
                      {displayOnline(scheme) ? "✓ Apply Online" : "Offline Only"}
                    </span>

                    <div className="flex items-center gap-3">
                      {displayLink(scheme) && (
                        <a
                          href={displayLink(scheme)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          Website <ExternalLink size={11} />
                        </a>
                      )}
                      <button
                        onClick={() => setDetailScheme(scheme)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 hover:text-amber-800 transition-colors"
                      >
                        View Detail <ChevronRight size={11} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Recommend Modal ── */}
        {recommendMode && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
              <button onClick={() => setRecommendMode(false)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">
                <X size={20} />
              </button>
              <h2 className="text-xl font-bold mb-2">Personal Recommendation</h2>
              <p className="text-sm text-amber-700/60 mb-5">Enter your details to find suitable schemes.</p>

              <div className="grid md:grid-cols-2 gap-4">
                <input type="number" placeholder="Age" value={profile.age}
                  onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                  className="px-4 py-3 rounded-xl border border-amber-200 text-sm" />

                <select value={profile.gender} onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                  className="px-4 py-3 rounded-xl border border-amber-200 text-sm">
                  <option value="">Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>

                <input type="text" placeholder="State e.g. Maharashtra, Delhi" value={profile.state}
                  onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                  className="px-4 py-3 rounded-xl border border-amber-200 text-sm" />

                <select value={profile.category} onChange={(e) => setProfile({ ...profile, category: e.target.value })}
                  className="px-4 py-3 rounded-xl border border-amber-200 text-sm">
                  <option value="">Interested Category</option>
                  {categories.slice(1).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                <input type="text" placeholder="Occupation e.g. student, farmer" value={profile.occupation}
                  onChange={(e) => setProfile({ ...profile, occupation: e.target.value })}
                  className="px-4 py-3 rounded-xl border border-amber-200 text-sm" />

                <input type="text" placeholder="Income e.g. low income, BPL" value={profile.income}
                  onChange={(e) => setProfile({ ...profile, income: e.target.value })}
                  className="px-4 py-3 rounded-xl border border-amber-200 text-sm" />

                <input type="text" placeholder="Caste/category e.g. SC, ST, OBC" value={profile.caste}
                  onChange={(e) => setProfile({ ...profile, caste: e.target.value })}
                  className="px-4 py-3 rounded-xl border border-amber-200 text-sm" />

                <input type="text" placeholder="Background e.g. rural, startup, disabled" value={profile.background}
                  onChange={(e) => setProfile({ ...profile, background: e.target.value })}
                  className="px-4 py-3 rounded-xl border border-amber-200 text-sm" />
              </div>

              <button
                onClick={getPersonalRecommendations}
                disabled={recommendLoading}
                className="mt-6 w-full py-3 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600 disabled:opacity-50"
              >
                {recommendLoading ? "Finding policies..." : "Recommend Policies"}
              </button>
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

export default Browse;