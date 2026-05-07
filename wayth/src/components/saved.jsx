import React, { useEffect, useState } from "react";
import {
  Bookmark,
  Trash2,
  ExternalLink,
  Tag,
  Clock,
  Search,
  BookmarkX,
  Heart,
  Loader2,
  X,
} from "lucide-react";

const API_BASE_URL = "http://127.0.0.1:8000";

const Saved = () => {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [savedPolicies, setSavedPolicies] = useState([]);

  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState("");

  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [aiDetails, setAiDetails] = useState("");
  const [detailsLoading, setDetailsLoading] = useState(false);

  const categories = [
    "All",
    "Agriculture",
    "Education",
    "Housing",
    "Health",
    "Business",
    "Employment",
    "Women",
    "Energy",
  ];

  useEffect(() => {
    fetchSavedPolicies();
  }, []);

  const showPopup = (message) => {
    setPopup(message);
    setTimeout(() => setPopup(""), 2000);
  };

  const fetchSavedPolicies = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/saved-policies`);
      const data = await response.json();

      setSavedPolicies(data);
    } catch (error) {
      console.error(error);
      showPopup("Failed to load saved policies");
    } finally {
      setLoading(false);
    }
  };

  const removePolicy = async (schemeId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/saved-policies/${schemeId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (response.ok && data.success !== false) {
        setSavedPolicies((prev) =>
          prev.filter((p) => String(p.scheme_id) !== String(schemeId))
        );
        showPopup("Policy removed from saved");
      } else {
        showPopup(data.message || "Failed to remove policy");
      }
    } catch (error) {
      console.error(error);
      showPopup("Something went wrong");
    }
  };

  const getPolicyDetails = async (policy) => {
    try {
      setSelectedPolicy(policy);
      setDetailsLoading(true);
      setAiDetails("");

      const scheme = {
        id: policy.scheme_id,
        name: policy.name,
        category: policy.category,
        state: policy.state,
        ministry: policy.ministry,
        benefit: policy.benefit,
        eligibility: policy.eligibility,
        deadline: policy.deadline,
        link: policy.link,
        online: Boolean(policy.online),
      };

      const response = await fetch(`${API_BASE_URL}/scheme-details`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scheme,
        }),
      });

      const data = await response.json();

      setAiDetails(data.response || "No AI details available.");
    } catch (error) {
      console.error(error);
      setAiDetails("Unable to fetch detailed information.");
    } finally {
      setDetailsLoading(false);
    }
  };

  const filtered = savedPolicies
    .filter(
      (p) =>
        filter === "all" ||
        p.category?.toLowerCase() === filter.toLowerCase()
    )
    .filter(
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
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
              <Bookmark className="text-white" size={20} />
            </div>

            <h1 className="text-2xl font-semibold text-[#3B2F2F]">
              Saved Policies
            </h1>
          </div>

          <p className="text-sm text-amber-700/60">
            {savedPolicies.length}{" "}
            {savedPolicies.length === 1 ? "policy" : "policies"} saved
          </p>
        </div>

        <div className="relative mb-4">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400"
          />

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
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap border ${
                filter === cat.toLowerCase()
                  ? "bg-amber-500 text-white border-amber-600"
                  : "bg-white text-amber-700 border-amber-200 hover:bg-amber-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 size={40} className="animate-spin text-amber-500" />
            <p className="text-sm text-amber-700/40">
              Loading saved policies...
            </p>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <BookmarkX
              size={40}
              strokeWidth={1.5}
              className="text-amber-300"
            />

            <p className="text-sm text-amber-700/40">
              No saved policies found.
            </p>

            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-xs text-amber-600 hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="space-y-4">
            {filtered.map((policy) => (
              <div
                key={policy.id}
                className="bg-white p-6 rounded-2xl border border-amber-100 hover:border-amber-300 hover:shadow-md transition-all group"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-100">
                      <Tag size={10} />
                      {policy.category}
                    </span>

                    <span className="flex items-center gap-1 text-[11px] text-amber-700/50">
                      <Clock size={12} />
                      Saved
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => removePolicy(policy.scheme_id)}
                      className="text-red-500 transition-colors"
                      title="Unsave policy"
                    >
                      <Heart size={18} className="fill-red-500 text-red-500" />
                    </button>

                    <button
                      onClick={() => removePolicy(policy.scheme_id)}
                      className="text-amber-200 hover:text-red-400 transition-colors"
                      title="Remove"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-semibold text-[#3B2F2F] mb-2 group-hover:text-amber-600 transition-colors">
                  {policy.name}
                </h3>

                <p className="text-sm text-amber-900/50 leading-relaxed mb-4">
                  {policy.benefit || policy.eligibility || "No summary available."}
                </p>

                <div className="flex items-center gap-4 flex-wrap">
                  <button
                    onClick={() => getPolicyDetails(policy)}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-600 hover:text-red-500 transition-colors"
                  >
                    View AI Details
                    <ExternalLink size={13} />
                  </button>

                  {policy.link && (
                    <a
                      href={policy.link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                    >
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

      {selectedPolicy && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedPolicy(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold mb-2">{selectedPolicy.name}</h2>

            <p className="text-sm text-amber-700/60 mb-5">
              AI Powered Policy Explanation
            </p>

            {detailsLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <Loader2 size={36} className="animate-spin text-amber-500" />

                <p className="text-sm text-amber-700/60">
                  Generating AI insights...
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                  {aiDetails}
                </div>

                {selectedPolicy.link && (
                  <a
                    href={selectedPolicy.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    Visit Official Government Website
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Saved;