import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, X, ShieldCheck, Home, Search, Sparkles, 
  LayoutGrid, Info, Bookmark, Newspaper, GitCompare
} from 'lucide-react';

const links = [
  { to: '/',        label: 'Home',    Icon: Home },
  { to: '/browse',  label: 'Browse',  Icon: LayoutGrid },
  { to: '/news',    label: 'News',    Icon: Newspaper },
  { to: '/compare', label: 'Compare', Icon: GitCompare },
  { to: '/saved',   label: 'Saved',   Icon: Bookmark },
  { to: '/about',   label: 'About',   Icon: Info },
  // NO separate /ask route — Search with AI button handles it
];

export default function Navi() {
  const [isOpen, setIsOpen] = useState(false);
  const { pathname } = useLocation();
  const active = (to) => to === '/' ? pathname === '/' : pathname.startsWith(to);

  return (
    <nav
      className="sticky top-0 z-50 bg-[#FDF6EC] font-['Outfit',sans-serif]"
      style={{
        borderBottom: '1px solid',
        borderImage: 'linear-gradient(90deg,transparent,#f59e0b 30%,#dc2626 70%,transparent) 1'
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-[10px] bg-[#FFF1DA] border border-amber-400/40 flex items-center justify-center">
            <ShieldCheck className="w-[17px] h-[17px] text-amber-500" />
          </div>
          <div>
            <div className="text-[16px] font-semibold tracking-tight text-[#3B2F2F] leading-none">
              PolicyNav
            </div>
            <div className="text-[10px] text-amber-600/70 uppercase tracking-widest mt-0.5 leading-none">
              Gov Schemes · AI
            </div>
          </div>
        </Link>

        {/* Mobile toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="sm:hidden p-2 rounded-md text-[#7c6a58] hover:text-black hover:bg-amber-200/40 transition-colors"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Links & CTA */}
        <div className={`
          ${isOpen ? 'flex' : 'hidden'} sm:flex
          flex-col sm:flex-row items-start sm:items-center gap-1
          absolute sm:static top-full left-0 w-full sm:w-auto
          bg-[#FDF6EC] sm:bg-transparent
          px-4 py-3 sm:p-0
          border-t sm:border-0 border-amber-300/30
        `}>
          {links.map(({ to, label, Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setIsOpen(false)}
              className={`
                w-full sm:w-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150
                ${active(to)
                  ? 'text-amber-700 bg-amber-200/40'
                  : 'text-[#6b5c4b] hover:text-black hover:bg-amber-100/50'}
              `}
            >
              <Icon size={14} className="opacity-75" />
              {label}
              {active(to) && (
                <span className="w-1 h-1 rounded-full bg-amber-500 ml-0.5" />
              )}
            </Link>
          ))}

          <div className="hidden sm:block w-px h-5 bg-amber-300/40 mx-2" />

          {/* AI Search CTA */}
          <Link
            to="/search"
            onClick={() => setIsOpen(false)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-[9px] text-[13px] font-semibold text-white shadow-sm hover:opacity-90 transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg,#f59e0b,#dc2626)' }}
          >
            <Sparkles size={14} className="animate-pulse" />
            <span>Search with AI</span>
          </Link>
        </div>

      </div>
    </nav>
  );
}