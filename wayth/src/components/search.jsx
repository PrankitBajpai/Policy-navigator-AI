import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Send, RotateCcw, User, Bot } from "lucide-react";

const quickQueries = [
  "Schemes for students in India",
  "Government schemes for farmers",
  "Subsidies for startups",
  "Housing schemes for low income",
  "Health schemes for senior citizens",
  "Women empowerment schemes",
];

const Search = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "👋 Hello! I'm PolicyNav AI.\n\nAsk me anything about Indian government schemes — eligibility, benefits, how to apply, or which schemes you qualify for.",
      sender: "bot",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [input]);

  const handleSend = async (overrideText) => {
    const text = overrideText || input;
    if (!text.trim() || isLoading) return;

    const userMsg = { id: Date.now(), text, sender: "user" };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-6).map((m) => ({
            role: m.sender === "user" ? "user" : "assistant",
            content: m.text,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error("API error");

      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, text: data.reply, sender: "bot" },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: "⚠️ Unable to reach the server. Please check your connection and try again.",
          sender: "bot",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: Date.now(),
        text: "👋 Hello! I'm PolicyNav AI.\n\nAsk me anything about Indian government schemes — eligibility, benefits, how to apply, or which schemes you qualify for.",
        sender: "bot",
      },
    ]);
    setInput("");
  };

  return (
    <div className="min-h-screen bg-[#FDF6EC] text-[#3B2F2F] flex flex-col items-center px-4 py-10 font-['Outfit',sans-serif]">
      <div className="w-full max-w-3xl flex flex-col" style={{ height: "calc(100vh - 120px)" }}>

        {/* Header */}
        <div className="text-center mb-6 shrink-0">
          <div className="inline-flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
              <Sparkles className="text-white" size={20} />
            </div>
            <h1 className="text-2xl font-semibold text-[#3B2F2F]">
              Search with AI
            </h1>
          </div>
          <p className="text-sm text-amber-700/60">
            Powered by RAG — LangChain · FAISS · Hugging Face Transformers
          </p>
        </div>

        {/* Chat Container */}
        <div className="flex-1 bg-white rounded-2xl border border-amber-100 flex flex-col overflow-hidden">

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex items-start gap-3 ${
                  m.sender === "user" ? "flex-row-reverse" : ""
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    m.sender === "user"
                      ? "bg-amber-500"
                      : "bg-amber-100 border border-amber-200"
                  }`}
                >
                  {m.sender === "user" ? (
                    <User size={14} className="text-white" />
                  ) : (
                    <Bot size={14} className="text-amber-600" />
                  )}
                </div>

                {/* Bubble */}
                <div
                  className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm whitespace-pre-line leading-relaxed ${
                    m.sender === "user"
                      ? "bg-amber-500 text-white rounded-tr-sm"
                      : "bg-[#FDF6EC] text-[#3B2F2F] border border-amber-100 rounded-tl-sm"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
                  <Bot size={14} className="text-amber-600" />
                </div>
                <div className="bg-[#FDF6EC] border border-amber-100 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1.5 items-center h-4">
                    <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Quick Suggestions */}
          {messages.length <= 1 && (
            <div className="px-5 py-3 border-t border-amber-50">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-700/40 mb-2">
                Try asking
              </p>
              <div className="flex flex-wrap gap-2">
                {quickQueries.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(q)}
                    className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-full hover:bg-amber-100 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="px-4 py-3 border-t border-amber-100 flex gap-2 items-end">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask about schemes, eligibility, benefits..."
              className="flex-1 resize-none bg-[#FDF6EC] border border-amber-200 text-sm text-[#3B2F2F] placeholder-amber-300 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
            />

            {/* Reset */}
            <button
              onClick={handleReset}
              title="Clear chat"
              className="p-2.5 rounded-xl border border-amber-200 text-amber-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
            >
              <RotateCcw size={16} />
            </button>

            {/* Send */}
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-amber-700/30 mt-4 shrink-0">
          Powered by Policy Navigator AI · Results based on official government sources
        </p>
      </div>
    </div>
  );
};

export default Search;