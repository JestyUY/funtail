"use client";
import React, { useState, useEffect } from "react";
import { exportedImages } from "../../types/album";
import { Span } from "next/dist/trace";

const ImageSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [images, setImages] = useState<exportedImages[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const exportId = "23d56ccb-3050-4756-b4df-3a5738a73c1a";
    fetch(
      `https://funtail.vercel.app/api/get-album?secretId=${encodeURIComponent(
        exportId
      )}`
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok");
        }
        return res.json();
      })
      .then((data: exportedImages[]) => {
        console.log("Fetched data:", data);
        setImages(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching album images:", error);
        setError("Error fetching album images");
        setLoading(false);
      });
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  useEffect(() => {
    if (images.length > 0) {
      const interval = setInterval(nextSlide, 5000);
      return () => clearInterval(interval);
    }
  }, [images.length]);

  if (loading) {
    return (
      <div className="relative w-full h-full overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gray-800 bg-opacity-30">
          <div className="w-1/2 h-1/2 bg-gray-900 animate-pulse rounded-lg bg-opacity-25"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-white">{error}</div>;
  }

  if (images.length === 0) {
    return <div className="text-white">No images found.</div>;
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      {images.map((image, index) => (
        <div
          key={index}
          className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }
            
          `}
        >
          <img
            src={image.optimizedUrl}
            alt={image.altText || "Image"}
            className="w-full h-full object-cover "
          />
          <div className=" absolute left-0 top-0 bg-gradient-to-br h-28 w-28 flex justify-end p-3 ">
            <span className="border rounded-full  text-lg h-20 w-20  text-java-200 bg-green-600 shadow-md   text-center block content-center self-end ">
              {image.size && Math.floor(image.size / 1000)}
              kb
            </span>
          </div>
          <div className="absolute bottom-3 left-4 text-white flex gap-3 ">
            {image.tags.split(",").map((tag, index) => (
              <span
                key={index}
                className="border rounded-md px-1 backdrop-blur-md bg-gray-800 bg-opacity-50 "
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ImageSlider;
