import React, { useState } from "react";
import { Bookmark, Trash2, ExternalLink, Tag, Clock, Search, BookmarkX } from "lucide-react";

const Saved = () => {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [savedPolicies, setSavedPolicies] = useState([
    { id: 1, title: "PM Kisan Samman Nidhi", summary: "Direct income support of Rs.6,000 per year to farmer families across India in three equal instalments.", category: "Agriculture", savedOn: "May 5, 2026", link: "#" },
    { id: 2, title: "Post-Matric Scholarship OBC", summary: "Financial assistance to OBC students studying at post-matriculation level to enable them to complete their education.", category: "Education", savedOn: "May 4, 2026", link: "#" },
    { id: 3, title: "Pradhan Mantri Awas Yojana", summary: "Affordable housing scheme providing financial assistance to economically weaker sections for construction of pucca houses.", category: "Housing", savedOn: "May 3, 2026", link: "#" },
    { id: 4, title: "Startup India Seed Fund", summary: "Financial assistance for proof of concept, prototype development and market entry for early-stage startups.", category: "Business", savedOn: "May 1, 2026", link: "#" },
  ]);

  const handleRemove = (id) => setSavedPolicies((prev) => prev.filter((p) => p.id !== id));

  const categories = ["All", "Agriculture", "Education", "Housing", "Business", "Energy"];

  const filtered = savedPolicies
    .filter((p) => filter === "all" || p.category.toLowerCase() === filter.toLowerCase())
    .filter((p) => searchQuery === "" || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.summary.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#FDF6EC] text-[#3B2F2F] flex flex-col items-center px-4 py-10 font-['Outfit',sans-serif]">
      <div className="w-full max-w-3xl">

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
              <Bookmark className="text-white" size={20} />
            </div>
            <h1 className="text-2xl font-semibold text-[#3B2F2F]">Saved Policies</h1>
          </div>
          <p className="text-sm text-amber-700/60">{savedPolicies.length} {savedPolicies.length === 1 ? "policy" : "policies"} saved</p>
        </div>

        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved policies..."
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-amber-200 bg-white text-[#3B2F2F] placeholder-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat.toLowerCase())}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap border ${filter === cat.toLowerCase() ? "bg-amber-500 text-white border-amber-600" : "bg-white text-amber-700 border-amber-200 hover:bg-amber-50"}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
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

        <div className="space-y-4">
          {filtered.map((policy) => (
            <div key={policy.id} className="bg-white p-6 rounded-2xl border border-amber-100 hover:border-amber-300 hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-100">
                    <Tag size={10} />
                    {policy.category}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-amber-700/50">
                    <Clock size={12} />
                    Saved {policy.savedOn}
                  </span>
                </div>
                <button onClick={() => handleRemove(policy.id)} className="text-amber-200 hover:text-red-400 transition-colors" title="Remove">
                  <Trash2 size={16} />
                </button>
              </div>

              <h3 className="text-base font-semibold text-[#3B2F2F] mb-2 group-hover:text-amber-600 transition-colors">
                {policy.title}
              </h3>

              <p className="text-sm text-amber-900/50 leading-relaxed mb-4">
                {policy.summary}
              </p>

              <a href={policy.link} className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-600 hover:text-red-500 transition-colors">
                View full policy
                <ExternalLink size={13} />
              </a>
            </div>
          ))}
        </div>

        {savedPolicies.length > 0 && (
          <p className="text-center text-xs text-amber-700/30 mt-10">
            Powered by Policy Navigator AI
          </p>
        )}

      </div>
    </div>
  );
};

export default Saved;