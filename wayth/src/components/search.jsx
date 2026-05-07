import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Send, RotateCcw, User, Bot } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";


const quickQueries = [
  "Tell me about PM Kisan Samman Nidhi",
  "Who is eligible for Ayushman Bharat?",
  "How to apply for PM Awas Yojana?",
  "Schemes for students in India",
  "Government schemes for farmers",
  "Subsidies for startups",
];

const Search = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "👋 Hello! I'm PolicyNav AI.\n\nAsk me anything about Indian government schemes — eligibility, benefits, how to apply, or ask questions about a particular scheme.",
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

    const userMsg = {
      id: Date.now(),
      text,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          message: text,
          history: messages.slice(-6).map((m) => ({
            role: m.sender === "user" ? "user" : "assistant",
            content: m.text,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "API error");
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: data.reply,
          sender: "bot",
        },
      ]);
    } catch (err) {
      console.error(err);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: "⚠️ Unable to reach the server. Please check your backend and try again.",
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
        text: "👋 Hello! I'm PolicyNav AI.\n\nAsk me anything about Indian government schemes — eligibility, benefits, how to apply, or ask questions about a particular scheme.",
        sender: "bot",
      },
    ]);

    setInput("");
  };

  return (
    <div className="min-h-screen bg-[#FDF6EC] text-[#3B2F2F] flex flex-col items-center px-4 py-10 font-['Outfit',sans-serif]">
      <div
        className="w-full max-w-3xl flex flex-col"
        style={{ height: "calc(100vh - 120px)" }}
      >
        <div className="text-center mb-6 shrink-0">
          <div className="inline-flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
              <Sparkles className="text-white" size={20} />
            </div>

            <h1 className="text-2xl font-semibold text-[#3B2F2F]">
              Ask AI
            </h1>
          </div>

          <p className="text-sm text-amber-700/60">
            Answers from saved policy database + Groq AI fallback
          </p>
        </div>

        <div className="flex-1 bg-white rounded-2xl border border-amber-100 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex items-start gap-3 ${
                  m.sender === "user" ? "flex-row-reverse" : ""
                }`}
              >
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

            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
                  <Bot size={14} className="text-amber-600" />
                </div>

                <div className="bg-[#FDF6EC] border border-amber-100 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1.5 items-center h-4">
                    <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" />
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

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
              placeholder="Ask about any scheme..."
              className="flex-1 resize-none bg-[#FDF6EC] border border-amber-200 text-sm text-[#3B2F2F] placeholder-amber-300 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
            />

            <button
              onClick={handleReset}
              title="Clear chat"
              className="p-2.5 rounded-xl border border-amber-200 text-amber-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
            >
              <RotateCcw size={16} />
            </button>

            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-amber-700/30 mt-4 shrink-0">
          Powered by Policy Navigator AI
        </p>
      </div>
    </div>
  );
};

export default Search;