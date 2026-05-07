import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Search, Sparkles, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  return (
    <div className={darkMode ? 'bg-[#0f172a] text-white' : 'bg-[#FDF6EC] text-[#3B2F2F]'}>

      {/* Toggle */}
      <div className="flex justify-end p-4">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-full bg-amber-200/40 hover:scale-110 transition"
        >
          {darkMode ? <Sun /> : <Moon />}
        </button>
      </div>

      {/* HERO */}
      <div className="min-h-screen flex flex-col md:flex-row items-center justify-center px-8 md:px-20 gap-12">

        {/* Illustration */}
        <motion.img
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          src="https://i.pinimg.com/1200x/13/38/a0/1338a014db2ab615c3d9386e21f981bf.jpg"
          alt="AI Policy Assistant"
          className="rounded-2xl w-72 h-72 object-cover shadow-lg"
        />

        {/* Content */}
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 1 }}
          className="text-center md:text-left max-w-xl space-y-5"
        >
          <h1 className="text-5xl sm:text-6xl font-extrabold bg-gradient-to-r from-amber-500 to-red-500 text-transparent bg-clip-text">
            Find the Right Government Schemes — Instantly
          </h1>

          <p className="text-lg md:text-xl font-light">
            PolicyNav is an AI-powered assistant that uses Retrieval-Augmented Generation (RAG)
            to answer your questions and recommend the most relevant government schemes.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <button
              onClick={() => navigate('/browse')}
              className="px-8 py-3 rounded-full font-semibold bg-amber-500 text-white hover:bg-amber-600 transition"
            >
              📂 Browse Schemes
            </button>

            <button
              onClick={() => navigate('/search')}
              className="px-8 py-3 rounded-full font-semibold bg-red-500 text-white hover:bg-red-600 transition"
            >
              🤖 Ask AI
            </button>
          </div>
        </motion.div>
      </div>

      {/* FEATURES */}
      <div className="py-20 px-8 md:px-20 grid md:grid-cols-3 gap-10">

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="p-6 rounded-xl bg-white/60 backdrop-blur shadow-md"
        >
          <Search className="text-amber-500 mb-3" />
          <h3 className="text-xl font-semibold">Semantic Search</h3>
          <p className="text-sm mt-2">
            Uses embeddings and FAISS to retrieve the most relevant government policies instantly.
          </p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="p-6 rounded-xl bg-white/60 backdrop-blur shadow-md"
        >
          <Sparkles className="text-red-500 mb-3" />
          <h3 className="text-xl font-semibold">AI Answers (RAG)</h3>
          <p className="text-sm mt-2">
            Combines LangChain + Transformers to generate accurate answers from policy documents.
          </p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="p-6 rounded-xl bg-white/60 backdrop-blur shadow-md"
        >
          <Database className="text-amber-600 mb-3" />
          <h3 className="text-xl font-semibold">Personalized Recommendations</h3>
          <p className="text-sm mt-2">
            Suggests schemes based on your age, income, and location.
          </p>
        </motion.div>
      </div>

      {/* TECH STACK */}
      <div className="text-center py-12">
        <h2 className="text-3xl font-bold mb-4">Built With</h2>
        <p className="text-lg opacity-80">
          Python • FastAPI • LangChain • FAISS • Hugging Face Transformers • Groq AI
        </p>
      </div>

      {/* FOOTER */}
      <footer className="bg-amber-600 py-6 text-center text-white font-medium text-lg">
        Made with ❤️ by Prankit Bajpai
      </footer>

    </div>
  );
}

export default Home;