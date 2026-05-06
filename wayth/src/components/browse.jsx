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
} from "lucide-react";

const states = [
  "All States",
  "Central (All India)",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu & Kashmir",
  "Ladakh",
];

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

const Browse = () => {
  const [schemes, setSchemes] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [activeCategory, setActiveCategory] = useState("All");
  const [activeState, setActiveState] = useState("All States");
  const [searchQuery, setSearchQuery] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedScheme, setSelectedScheme] = useState(null);
  const [aiDetails, setAiDetails] = useState("");
  const [detailsLoading, setDetailsLoading] = useState(false);

  // FETCH SCHEMES FROM BACKEND
  useEffect(() => {
    fetchSchemes();
  }, []);

  const fetchSchemes = async () => {
    try {
      setLoading(true);
      setError("");

      // BACKEND API
      const response = await fetch(
        "http://localhost:5000/api/schemes"
      );

      const data = await response.json();

      setSchemes(data);
      setFiltered(data);

    } catch (err) {
      console.error(err);

      setError("Failed to fetch government schemes.");
    } finally {
      setLoading(false);
    }
  };

  // FILTERING
  useEffect(() => {
    let updated = [...schemes];

    // CATEGORY FILTER
    if (activeCategory !== "All") {
      updated = updated.filter(
        (s) =>
          s.category?.toLowerCase() ===
          activeCategory.toLowerCase()
      );
    }

    // STATE FILTER
    if (activeState !== "All States") {
      updated = updated.filter(
        (s) =>
          s.state?.toLowerCase() ===
          activeState.toLowerCase()
      );
    }

    // SEARCH FILTER
    if (searchQuery.trim() !== "") {
      updated = updated.filter(
        (s) =>
          s.name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||

          s.benefit
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||

          s.eligibility
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    setFiltered(updated);

  }, [
    schemes,
    activeCategory,
    activeState,
    searchQuery,
  ]);

  // FETCH AI DETAILS FROM BACKEND
  const getSchemeDetails = async (scheme) => {
    try {
      setSelectedScheme(scheme);
      setDetailsLoading(true);
      setAiDetails("");

      const response = await fetch(
        "http://localhost:5000/api/scheme-details",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            scheme,
          }),
        }
      );

      const data = await response.json();

      setAiDetails(data.response);

    } catch (error) {
      console.error(error);

      setAiDetails(
        "Unable to fetch detailed information."
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  const clearFilters = () => {
    setActiveCategory("All");
    setActiveState("All States");
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-[#FDF6EC] text-[#3B2F2F] px-4 py-10 font-['Outfit',sans-serif]">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="text-center mb-8">

          <div className="inline-flex items-center gap-3 mb-2">

            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
              <LayoutGrid
                className="text-white"
                size={20}
              />
            </div>

            <h1 className="text-2xl font-semibold">
              Browse Government Schemes
            </h1>
          </div>

          <p className="text-sm text-amber-700/60">
            {filtered.length} scheme
            {filtered.length !== 1 ? "s" : ""} found
          </p>
        </div>

        {/* SEARCH */}
        <div className="relative mb-5">

          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400"
          />

          <input
            type="text"
            placeholder="Search schemes, eligibility, benefits..."
            value={searchQuery}
            onChange={(e) =>
              setSearchQuery(e.target.value)
            }
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-amber-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        {/* FILTERS */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">

          {/* CATEGORY */}
          <div className="flex-1">

            <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-700/50 mb-2">
              Category
            </p>

            <div className="flex gap-2 flex-wrap">

              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() =>
                    setActiveCategory(cat)
                  }
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

          {/* STATE FILTER */}
          <div className="lg:w-64">

            <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-700/50 mb-2 flex items-center gap-1">
              <MapPin size={10} />
              State / UT
            </p>

            <select
              value={activeState}
              onChange={(e) =>
                setActiveState(e.target.value)
              }
              className="w-full px-3 py-3 rounded-xl border border-amber-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              {states.map((state) => (
                <option
                  key={state}
                  value={state}
                >
                  {state}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">

            <Loader2
              size={40}
              className="animate-spin text-amber-500"
            />

            <p className="text-sm text-amber-700/60">
              Loading schemes...
            </p>
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">

            <AlertCircle
              size={40}
              className="text-red-400"
            />

            <p className="text-sm text-red-500">
              {error}
            </p>

            <button
              onClick={fetchSchemes}
              className="text-xs text-amber-600 hover:underline"
            >
              Try Again
            </button>
          </div>
        )}

        {/* EMPTY */}
        {!loading &&
          !error &&
          filtered.length === 0 && (
            <div className="text-center py-24">

              <LayoutGrid
                size={48}
                strokeWidth={1}
                className="mx-auto mb-3 text-amber-300"
              />

              <p className="text-sm text-amber-700/40">
                No schemes found.
              </p>

              <button
                onClick={clearFilters}
                className="mt-3 text-xs text-amber-600 hover:underline"
              >
                Clear Filters
              </button>
            </div>
          )}

        {/* SCHEME CARDS */}
        {!loading &&
          !error &&
          filtered.length > 0 && (

            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">

              {filtered.map((scheme) => (

                <div
                  key={scheme.id}
                  className="bg-white rounded-2xl border border-amber-100 hover:border-amber-300 hover:shadow-lg transition-all p-5 flex flex-col gap-3"
                >

                  {/* TOP */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">

                    <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-100">

                      <Tag size={9} />

                      {scheme.category}
                    </span>

                    <span className="flex items-center gap-1 text-[10px] text-amber-600/70 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">

                      <MapPin size={9} />

                      {scheme.state}
                    </span>
                  </div>

                  {/* TITLE */}
                  <h3 className="text-sm font-semibold leading-snug">
                    {scheme.name}
                  </h3>

                  {/* MINISTRY */}
                  <div className="flex items-center gap-1.5 text-xs text-amber-700/50">

                    <Building2 size={11} />

                    {scheme.ministry}
                  </div>

                  {/* DETAILS */}
                  <div className="space-y-2 text-xs text-gray-600 border-t border-amber-50 pt-3">

                    <p>
                      <span className="font-semibold text-[#3B2F2F]">
                        Benefit:
                      </span>{" "}

                      {scheme.benefit}
                    </p>

                    <p>
                      <span className="font-semibold text-[#3B2F2F]">
                        Eligibility:
                      </span>{" "}

                      {scheme.eligibility}
                    </p>

                    <p>
                      <span className="font-semibold text-[#3B2F2F]">
                        Deadline:
                      </span>{" "}

                      {scheme.deadline}
                    </p>
                  </div>

                  {/* FOOTER */}
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-amber-50">

                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        scheme.online
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                          : "bg-gray-50 text-gray-400 border border-gray-100"
                      }`}
                    >
                      {scheme.online
                        ? "✓ Apply Online"
                        : "Offline Only"}
                    </span>

                    <div className="flex items-center gap-3">

                      {/* OFFICIAL LINK */}
                      {scheme.link && (
                        <a
                          href={scheme.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          Official Site
                        </a>
                      )}

                      {/* AI DETAILS */}
                      <button
                        onClick={() =>
                          getSchemeDetails(scheme)
                        }
                        className="flex items-center gap-1 text-xs font-medium text-amber-600 hover:text-red-500 transition-colors"
                      >
                        View Details

                        <ExternalLink size={11} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        {/* AI DETAILS MODAL */}
        {selectedScheme && (

          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">

            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">

              {/* CLOSE */}
              <button
                onClick={() =>
                  setSelectedScheme(null)
                }
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
              >
                <X size={20} />
              </button>

              {/* TITLE */}
              <h2 className="text-xl font-bold mb-2">
                {selectedScheme.name}
              </h2>

              <p className="text-sm text-amber-700/60 mb-5">
                AI Powered Policy Explanation
              </p>

              {/* LOADING */}
              {detailsLoading ? (

                <div className="flex flex-col items-center justify-center py-16 gap-4">

                  <Loader2
                    size={36}
                    className="animate-spin text-amber-500"
                  />

                  <p className="text-sm text-amber-700/60">
                    Generating AI insights...
                  </p>
                </div>

              ) : (

                <div className="space-y-4">

                  <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">

                    {aiDetails}
                  </div>

                  {/* OFFICIAL LINK */}
                  {selectedScheme.link && (
                    <a
                      href={selectedScheme.link}
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

        {/* FOOTER */}
        <p className="text-center text-xs text-amber-700/30 mt-12">
          Powered by Groq AI · Policy Navigator AI
        </p>

      </div>
    </div>
  );
};

export default Browse;