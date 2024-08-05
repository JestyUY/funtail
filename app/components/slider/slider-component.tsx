"use client";

import React, { useState, useEffect } from "react";
import "./styles.css";

interface ImageItem {
  url: string;
  name: string;
  description: string;
}

const images: ImageItem[] = [
  {
    url: "https://kxcz1bsfyidjrxeu.public.blob.vercel-storage.com/landing%20slider-1722127779154-gZOOecYJTRgQgY7p9K7HfEf0M20HtD.webp",
    name: "LUNDEV 1",
    description:
      "Tinh ru anh di chay pho, chua kip chay pho thi anhchay mat tieu",
  },
  {
    url: "https://kxcz1bsfyidjrxeu.public.blob.vercel-storage.com/landing%20slider-1722127779245-Wl9VHyaEWIT9NCB52nY8qwteloPwb4.webp",
    name: "LUNDEV 2",
    description:
      "Tinh ru anh di chay pho, chua kip chay pho thi anhchay mat tieu",
  },
  {
    url: "https://kxcz1bsfyidjrxeu.public.blob.vercel-storage.com/landing%20slider-1722127779165-27qctuwTiOyCAtVatVzbsiC2BIhjv0.webp",
    name: "LUNDEV 3",
    description:
      "Tinh ru anh di chay pho, chua kip chay pho thi anhchay mat tieu",
  },
  {
    url: "https://kxcz1bsfyidjrxeu.public.blob.vercel-storage.com/landing%20slider-1722127779277-ghmkY7lu1sZrT4mfxd4qDZS2tRxmCB.webp",
    name: "LUNDEV 4",
    description:
      "Tinh ru anh di chay pho, chua kip chay pho thi anhchay mat tieu",
  },
  {
    url: "https://kxcz1bsfyidjrxeu.public.blob.vercel-storage.com/landing%20slider-1722127779282-cmHCJuztQzlVVhyZQnaCjV8m5jJDNT.webp",
    name: "LUNDEV 5",
    description:
      "Tinh ru anh di chay pho, chua kip chay pho thi anhchay mat tieu",
  },
];

const Slider: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length
    );
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 10000);
    return () => clearInterval(interval);
  }, []);

  const getItemStyle = (index: number) => {
    const diff = (index - currentIndex + images.length) % images.length;
    if (diff === 0) return "active";
    if (diff === 1) return "next";
    if (diff === images.length - 1) return "prev";
    if (diff <= 3) return `next-${diff}`;
    return "";
  };

  return (
    <div className="w-[1000px] h-[600px] ">
      <div id="slide">
        {images.map((item, index) => (
          <div
            key={index}
            className={`item ${getItemStyle(index)}`}
            style={{ backgroundImage: `url(${item.url})` }}
          >
            <div className="content">
              <div className="name">{item.name}</div>
              <div className="des">{item.description}</div>
              <button>See more</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Slider;
