import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Navi    from './components/navi';
import Home    from './components/home';
import Browse  from './components/browse';
import Compare from './components/compare';
import News    from './components/news';
import Saved   from './components/saved';
import Search  from './components/search';
import About   from './components/about';

function App() {
  return (
    <div className="relative min-h-screen bg-[#FDF6EC] text-[#3B2F2F]">
      <Navi />
      <main className="pb-20">
        <Routes>
          <Route path="/"        element={<Home />} />
          <Route path="/browse"  element={<Browse />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/news"    element={<News />} />
          <Route path="/saved"   element={<Saved />} />
          <Route path="/search"  element={<Search />} />
          <Route path="/about"   element={<About />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;