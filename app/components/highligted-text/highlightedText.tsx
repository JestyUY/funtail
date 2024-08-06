"use client";
import { useEffect, useState } from "react";
import "./HighlightedText.css";

export default function HighlightedText() {
  const words = [
    "AI-Powered",
    "Image",
    "Optimization",
    "and",
    "Intelligent",
    "Storage",
  ];
  const highlightColors: { [key: string]: string } = {
    Image: "neon-red",
    Optimization: "neon-green",
    Storage: "neon-blue",
  };
  const highlightWords = Object.keys(highlightColors);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % highlightWords.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [highlightWords.length]);

  return (
    <h1 className="text-5xl lg:text-6xl text-java-50">
      {words.map((word, index) => (
        <span
          key={index}
          className={`neon-transition ${
            highlightWords.includes(word) &&
            highlightWords.indexOf(word) === currentIndex
              ? highlightColors[word]
              : "text-java-50"
          }`}
        >
          {word}{" "}
        </span>
      ))}
    </h1>
  );
}
