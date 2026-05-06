import React, { useEffect, useState } from "react";
import {
  Newspaper,
  ExternalLink,
  RefreshCw,
  Clock,
  AlertCircle,
  Tag,
  Sparkles,
} from "lucide-react";

const categories = [
  "All",
  "India",
  "Technology",
  "Business",
  "Sports",
  "Health",
  "Entertainment",
];

const categoryQueries = {
  All: [
    "India latest news",
    "India breaking news",
    "India headlines",
  ],

  India: [
    "India politics",
    "India government",
    "India updates",
  ],

  Technology: [
    "India AI",
    "India technology",
    "India startups",
  ],

  Business: [
    "India economy",
    "India stock market",
    "India business",
  ],

  Sports: [
    "India cricket",
    "IPL",
    "Indian sports",
  ],

  Health: [
    "India healthcare",
    "India medical news",
    "fitness India",
  ],

  Entertainment: [
    "Bollywood",
    "India entertainment",
    "OTT India",
  ],
};

const News = () => {
  const [newsItems, setNewsItems] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] =
    useState("");

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError("");

      const apiKey =
        import.meta.env.VITE_GNEWS_API_KEY;

      if (!apiKey) {
        throw new Error(
          "GNews API key missing in .env"
        );
      }

      // RANDOM QUERY
      const queries =
        categoryQueries[filter];

      const randomQuery =
        queries[
          Math.floor(
            Math.random() * queries.length
          )
        ];

      // RANDOM PAGE
      const randomPage =
        Math.floor(Math.random() * 2) + 1;

      const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(
        randomQuery
      )}&lang=en&country=in&max=10&page=${randomPage}&apikey=${apiKey}`;

      console.log("Fetching:", url);

      const response = await fetch(url);

      const data = await response.json();

      console.log(data);

      if (
        data.errors ||
        !data.articles
      ) {
        throw new Error(
          data.errors?.[0] ||
            "Failed to fetch news"
        );
      }

      // FORMAT NEWS
      const formatted = data.articles
        .filter(
          (article) =>
            article.title &&
            article.description
        )
        .map((article, index) => ({
          id:
            article.url ||
            `${index}-${Date.now()}`,

          title: article.title,

          summary:
            article.description,

          image: article.image,

          link: article.url,

          source:
            article.source?.name ||
            "Indian News",

          date: new Date(
            article.publishedAt
          ).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),

          time: new Date(
            article.publishedAt
          ).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          }),

          category:
            filter === "All"
              ? "Trending"
              : filter,

          isUrgent: [
            "breaking",
            "live",
            "urgent",
            "alert",
          ].some((word) =>
            article.title
              .toLowerCase()
              .includes(word)
          ),
        }));

      // SHUFFLE NEWS
      const shuffled =
        formatted.sort(
          () => Math.random() - 0.5
        );

      setNewsItems(shuffled);

      setLastUpdated(
        new Date().toLocaleTimeString(
          "en-IN",
          {
            hour: "2-digit",
            minute: "2-digit",
          }
        )
      );

    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Could not fetch latest news"
      );

    } finally {
      setLoading(false);
    }
  };

  // FETCH ON FILTER CHANGE
  useEffect(() => {
    fetchNews();
  }, [filter]);

  // AUTO REFRESH EVERY 5 MIN
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNews();
    }, 300000);

    return () =>
      clearInterval(interval);
  }, [filter]);

  return (
    <div className="min-h-screen bg-[#FDF6EC] px-4 py-10 text-[#3B2F2F] font-['Outfit',sans-serif]">

      <div className="max-w-4xl mx-auto">

        {/* HEADER */}
        <div className="text-center mb-8">

          <div className="inline-flex items-center gap-3 mb-3">

            <div className="w-11 h-11 rounded-2xl bg-amber-500 flex items-center justify-center shadow-md">

              <Newspaper
                className="text-white"
                size={22}
              />
            </div>

            <div>
              <h1 className="text-3xl font-bold">
                Policy Pulse
              </h1>

              <p className="text-sm text-amber-700/60">
                Live Indian News
              </p>
            </div>
          </div>

          {lastUpdated && (
            <div className="inline-flex items-center gap-2 text-xs text-amber-700/50 bg-white border border-amber-100 px-3 py-1 rounded-full">

              <Sparkles size={12} />

              Updated at {lastUpdated}
            </div>
          )}
        </div>

        {/* FILTERS */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto no-scrollbar">

          <div className="flex gap-2 flex-1">

            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() =>
                  setFilter(cat)
                }
                className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
                  filter === cat
                    ? "bg-amber-500 text-white border-amber-600"
                    : "bg-white text-amber-700 border-amber-200 hover:bg-amber-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* REFRESH */}
          <button
            onClick={fetchNews}
            disabled={loading}
            className="p-2 rounded-full bg-white border border-amber-200 text-amber-500 hover:bg-amber-50"
          >
            <RefreshCw
              size={15}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />
          </button>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">

            <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>

            <p className="text-sm text-amber-700/60">
              Fetching latest news...
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

            <p className="text-sm text-red-500 text-center">
              {error}
            </p>

            <button
              onClick={fetchNews}
              className="text-xs text-amber-600 hover:underline"
            >
              Try Again
            </button>
          </div>
        )}

        {/* EMPTY */}
        {!loading &&
          !error &&
          newsItems.length === 0 && (
            <div className="text-center py-24">

              <p className="text-sm text-amber-700/40">
                No news found
              </p>
            </div>
          )}

        {/* NEWS */}
        {!loading &&
          !error &&
          newsItems.length > 0 && (

            <div className="space-y-5">

              {newsItems.map((news) => (

                <div
                  key={news.id}
                  className="bg-white rounded-3xl border border-amber-100 overflow-hidden hover:shadow-lg hover:border-amber-300 transition-all"
                >

                  {/* IMAGE */}
                  {news.image && (
                    <img
                      src={news.image}
                      alt={news.title}
                      className="w-full h-56 object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display =
                          "none";
                      }}
                    />
                  )}

                  <div className="p-6">

                    {/* TOP */}
                    <div className="flex items-center justify-between flex-wrap gap-3 mb-4">

                      <div className="flex items-center gap-2 flex-wrap">

                        <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold bg-amber-50 text-amber-700 px-2 py-1 rounded-full border border-amber-100">

                          <Tag size={9} />

                          {news.category}
                        </span>

                        <span className="text-[11px] text-amber-700/50">
                          {news.source}
                        </span>

                        <span className="flex items-center gap-1 text-[11px] text-amber-700/40">

                          <Clock size={11} />

                          {news.date}
                        </span>
                      </div>

                      {news.isUrgent && (
                        <span className="text-[10px] font-bold text-red-500 bg-red-50 border border-red-100 px-2 py-1 rounded-full animate-pulse">
                          BREAKING
                        </span>
                      )}
                    </div>

                    {/* TITLE */}
                    <h2 className="text-lg font-semibold leading-snug mb-3 hover:text-amber-600 transition-colors">

                      {news.title}
                    </h2>

                    {/* SUMMARY */}
                    <p className="text-sm text-amber-900/60 leading-relaxed mb-5">

                      {news.summary}
                    </p>

                    {/* FOOTER */}
                    <div className="flex items-center justify-between flex-wrap gap-3 pt-4 border-t border-amber-50">

                      <div className="text-xs text-amber-700/40">
                        Published at {news.time}
                      </div>

                      <a
                        href={news.link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-amber-600 hover:text-red-500 transition-colors"
                      >
                        Read Full Article

                        <ExternalLink
                          size={14}
                        />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        {/* FOOTER */}
        {!loading &&
          newsItems.length > 0 && (
            <p className="text-center text-xs text-amber-700/30 mt-12">
              Powered by GNews API
            </p>
          )}
      </div>
    </div>
  );
};

export default News;