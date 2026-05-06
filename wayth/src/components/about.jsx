import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, Send, Github, Linkedin } from 'lucide-react';

const About = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FDF6EC] text-[#3B2F2F] pt-24 pb-12 px-6 relative overflow-hidden">

      {/* Background Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-amber-400/20 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-red-400/20 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 relative z-10">

        {/* LEFT CONTENT */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <div>
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-amber-500 to-red-500 bg-clip-text text-transparent mb-4">
              About PolicyNav
            </h1>
            <p className="text-[#6b5c4b] text-lg">
              PolicyNav is an AI-powered Government Scheme Assistant built using 
              Retrieval-Augmented Generation (RAG). It helps users discover relevant 
              government schemes quickly using natural language queries.
            </p>
          </div>

          {/* FEATURES */}
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border">
              <h3 className="font-semibold">🔍 Semantic Search</h3>
              <p className="text-sm text-gray-600">
                Uses embeddings and FAISS for accurate information retrieval from policy documents.
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border">
              <h3 className="font-semibold">🤖 RAG-Based AI</h3>
              <p className="text-sm text-gray-600">
                Combines LangChain and Transformers to generate context-aware answers.
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border">
              <h3 className="font-semibold">🎯 Personalized Recommendations</h3>
              <p className="text-sm text-gray-600">
                Suggests schemes based on age, income, occupation, and location.
              </p>
            </div>
          </div>

          {/* CONTACT */}
          <div className="space-y-4 pt-6">
            <div className="flex items-center gap-4">
              <Mail className="text-amber-500" />
              <span>support@policynav.com</span>
            </div>

            <div className="flex items-center gap-4">
              <Phone className="text-red-500" />
              <span>+91 XXXXX XXXXX</span>
            </div>
          </div>

          {/* SOCIAL */}
          <div className="flex gap-4 pt-4">
            <a href="#" className="p-3 rounded-full bg-white border hover:bg-amber-100">
              <Github />
            </a>
            <a href="#" className="p-3 rounded-full bg-white border hover:bg-red-100">
              <Linkedin />
            </a>
          </div>
        </motion.div>

        {/* RIGHT FORM */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="bg-white border p-8 rounded-3xl shadow-lg"
        >
          <form className="space-y-6" onSubmit={handleSubmit}>

            <div>
              <label className="text-sm text-gray-600">Full Name</label>
              <input
                type="text"
                className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500"
                placeholder="Your Name"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Query Type</label>
              <select className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500">
                <option>General Inquiry</option>
                <option>Report Issue</option>
                <option>Feature Request</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-600">Message</label>
              <textarea
                rows="4"
                className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500"
                placeholder="Your message..."
              />
            </div>

            <button
              type="submit"
              className={`w-full py-4 rounded-xl font-bold text-lg transition ${
                submitted
                  ? "bg-green-500 text-white"
                  : "bg-gradient-to-r from-amber-500 to-red-500 text-white"
              }`}
            >
              {submitted ? "Submitted ✅" : (
                <>
                  <Send size={18} className="inline mr-2" />
                  Send Message
                </>
              )}
            </button>

          </form>
        </motion.div>

      </div>
    </div>
  );
};

export default About;