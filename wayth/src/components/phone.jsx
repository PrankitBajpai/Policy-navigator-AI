import React, { useState, useEffect } from 'react';

const images = [
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQSw4F-X57MT8zYUMur58N94DDM6x6xT2hZw&s",
  "https://cdn.shopify.com/s/files/1/0316/7810/3691/files/fitspo_quote_crossrope.jpg?v=1607524579",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPEnR-L6nqLIPh6eNzFAw6zCHhhQ9nWPHGzQ&s",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQ708uJW-N3kXxTqPkJdj5jYCBi2UFoSkbJQ&s",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQSw4F-X57MT8zYUMur58N94DDM6x6xT2hZw&s",
  "https://cdn.shopify.com/s/files/1/0316/7810/3691/files/fitspo_quote_crossrope.jpg?v=1607524579",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPEnR-L6nqLIPh6eNzFAw6zCHhhQ9nWPHGzQ&s",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQ708uJW-N3kXxTqPkJdj5jYCBi2UFoSkbJQ&s",
  "https://cdn.shopify.com/s/files/1/0316/7810/3691/files/fitspo_quote_crossrope.jpg?v=1607524579",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPEnR-L6nqLIPh6eNzFAw6zCHhhQ9nWPHGzQ&s",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQ708uJW-N3kXxTqPkJdj5jYCBi2UFoSkbJQ&s",
  
];

const SlidingPhoneMockup = () => {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative border-gray-800 bg-gray-800 border-[10px] rounded-[2rem] h-[480px] w-[240px] shadow-xl -ml-6">
      <div className="w-[120px] h-[16px] bg-gray-800 top-0 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute"></div>
      <div className="h-[36px] w-[3px] bg-gray-800 absolute -start-[14px] top-[100px] rounded-s-lg"></div>
      <div className="h-[36px] w-[3px] bg-gray-800 absolute -start-[14px] top-[150px] rounded-s-lg"></div>
      <div className="h-[50px] w-[3px] bg-gray-800 absolute -end-[14px] top-[120px] rounded-e-lg"></div>
      <div className="rounded-[1.5rem] overflow-hidden w-[220px] h-[450px] bg-white flex items-center justify-center">
        <img
          src={images[currentImage]}
          alt="Phone Display"
          className="w-full h-auto transition-all duration-700 ease-in-out object-contain"
        />
      </div>
    </div>
  );
};

export default SlidingPhoneMockup;

