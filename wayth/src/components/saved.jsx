import React, { useEffect, useState } from "react";
import { Bookmark, Trash2, ExternalLink, Clock, Search, BookmarkX, Heart, Loader2, X } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const Saved = () => {
  const [searchQuery,    setSearchQuery]    = useState("");
  const [savedPolicies,  setSavedPolicies]  = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [popup,          setPopup]          = useState("");
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [aiDetails,      setAiDetails]      = useState("");
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => { fetchSavedPolicies(); }, []);

  const showPopup = (msg) => { setPopup(msg); setTimeout(() => setPopup(""), 2000); };

  const fetchSavedPolicies = async () => {
    try {
      setLoading(true);
      const res  = await fetch(`${API_BASE_URL}/saved-policies`);
      const data = await res.json();
      setSavedPolicies(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      showPopup("Failed to load saved policies");
    } finally {
      setLoading(false);
    }
  };

  const removePolicy = async (schemeId) => {
    try {
      const res  = await fetch(`${API_BASE_URL}/saved-policies/${schemeId}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success !== false) {
        setSavedPolicies((prev) => prev.filter((p) => String(p.scheme_id) !== String(schemeId)));
        showPopup("Policy removed");
      } else {
        showPopup(data.message || "Failed to remove");
      }
    } catch (err) {
      showPopup("Something went wrong");
    }
  };

  const getPolicyDetails = async (policy) => {
    try {
      setSelectedPolicy(policy);
      setDetailsLoading(true);
      setAiDetails("");

      const res = await fetch(`${API_BASE_URL}/api/scheme-detail`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheme: {
            id:          policy.scheme_id,
            name:        policy.name,
            category:    policy.category,
            ministry:    policy.ministry,
            benefit:     policy.benefit,
            eligibility: policy.eligibility,
            deadline:    policy.deadline,
            link:        policy.link,
            online:      Boolean(policy.online),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed");
      setAiDetails(data.reply || "No details available.");
    } catch (err) {
      console.error(err);
      setAiDetails("Unable to fetch AI explanation. Make sure your backend is running.");
    } finally {
      setDetailsLoading(false);
    }
  };

  const renderAiContent = (text) =>
    text.split("\n").map((line, i) => {
      if (!line.trim()) return <div key={i} className="h-2" />;
      const parts    = line.split(/\*\*(.*?)\*\*/g);
      const rendered = parts.map((p, j) =>
        j % 2 === 1
          ? <strong key={j} className="font-semibold text-[#3B2F2F]">{p}</strong>
          : p
      );
      if (line.trim().startsWith("- ") || line.trim().startsWith("• "))
        return (
          <div key={i} className="flex gap-2 text-sm text-gray-700 leading-relaxed">
            <span className="text-amber-500 mt-0.5 shrink-0">•</span>
            <span>{rendered}</span>
          </div>
        );
      if (/^\d+\./.test(line.trim()))
        return (
          <div key={i} className="flex gap-2 text-sm text-gray-700 leading-relaxed">
            <span className="text-amber-600 font-semibold shrink-0">{line.trim().match(/^\d+\./)[0]}</span>
            <span>{rendered}</span>
          </div>
        );
      return <p key={i} className="text-sm text-gray-700 leading-relaxed">{rendered}</p>;
    });

  const filtered = savedPolicies.filter(
    (p) =>
      searchQuery === "" ||
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.benefit?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.eligibility?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FDF6EC] text-[#3B2F2F] flex flex-col items-center px-4 py-10 font-['Outfit',sans-serif]">

      {popup && (
        <div className="fixed top-5 right-5 z-[999] bg-emerald-500 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium">
          {popup}
        </div>
      )}

      <div className="w-full max-w-3xl">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
              <Bookmark className="text-white" size={20} />
            </div>
            <h1 className="text-2xl font-semibold text-[#3B2F2F]">Saved Policies</h1>
          </div>
          <p className="text-sm text-amber-700/60">
            {savedPolicies.length} {savedPolicies.length === 1 ? "policy" : "policies"} saved
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved policies..."
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-amber-200 bg-white text-[#3B2F2F] placeholder-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 size={40} className="animate-spin text-amber-500" />
            <p className="text-sm text-amber-700/40">Loading saved policies...</p>
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <BookmarkX size={40} strokeWidth={1.5} className="text-amber-300" />
            <p className="text-sm text-amber-700/40">No saved policies found.</p>
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-xs text-amber-600 hover:underline">
                Clear search
              </button>
            )}
          </div>
        )}

        {/* Cards */}
        {!loading && filtered.length > 0 && (
          <div className="space-y-4">
            {filtered.map((policy) => (
              <div key={policy.id} className="bg-white p-6 rounded-2xl border border-amber-100 hover:border-amber-300 hover:shadow-md transition-all group">

                <div className="flex justify-between items-start mb-3">
                  <span className="flex items-center gap-1 text-[11px] text-amber-700/50">
                    <Clock size={12} /> Saved
                  </span>
                  <div className="flex items-center gap-3">
                    <button onClick={() => removePolicy(policy.scheme_id)} title="Unsave">
                      <Heart size={18} className="fill-red-500 text-red-500 hover:scale-110 transition-transform" />
                    </button>
                    <button onClick={() => removePolicy(policy.scheme_id)} title="Remove" className="text-amber-200 hover:text-red-400 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-semibold text-[#3B2F2F] mb-2 group-hover:text-amber-600 transition-colors">
                  {policy.name}
                </h3>

                <p className="text-sm text-amber-900/50 leading-relaxed mb-4 line-clamp-2">
                  {policy.benefit || policy.eligibility || "No summary available."}
                </p>

                <div className="flex items-center gap-4 flex-wrap">
                  <button
                    onClick={() => getPolicyDetails(policy)}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-600 hover:text-amber-800 transition-colors"
                  >
                    View AI Details
                    <ExternalLink size={13} />
                  </button>
                  {policy.link && (
                    <a href={policy.link} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                      Official Site
                      <ExternalLink size={13} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {savedPolicies.length > 0 && (
          <p className="text-center text-xs text-amber-700/30 mt-10">
            Powered by Policy Navigator AI
          </p>
        )}
      </div>

      {/* AI Detail Modal */}
      {selectedPolicy && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh]">

            {/* Modal Header */}
            <div className="p-6 pb-4 border-b border-amber-100 shrink-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-[#3B2F2F]">{selectedPolicy.name}</h2>
                  <p className="text-sm text-amber-700/60 mt-0.5">AI-Powered Policy Explanation</p>
                </div>
                <button onClick={() => setSelectedPolicy(null)} className="text-gray-400 hover:text-red-500 transition-colors shrink-0">
                  <X size={20} />
                </button>
              </div>
              {selectedPolicy.link && (
                <a href={selectedPolicy.link} target="_blank" rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800">
                  Official Government Website <ExternalLink size={11} />
                </a>
              )}
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {detailsLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <Loader2 size={36} className="animate-spin text-amber-500" />
                  <p className="text-sm text-amber-700/60">Generating AI explanation...</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {renderAiContent(aiDetails)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Saved;