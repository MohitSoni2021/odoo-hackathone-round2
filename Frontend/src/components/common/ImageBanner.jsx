import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ImageCarousel({
     items = [
        { src: "https://upload.wikimedia.org/wikipedia/commons/d/da/Taj-Mahal.jpg", title: "Taj Mahal – Agra" },
        { src: "https://upload.wikimedia.org/wikipedia/commons/7/7e/Gateway_of_India_in_Mumbai_03-2016_img3.jpg", title: "Gateway of India – Mumbai" },
        { src: "https://upload.wikimedia.org/wikipedia/commons/5/55/Golden_Temple_nighttime.jpg", title: "Golden Temple – Amritsar" },
        { src: "https://upload.wikimedia.org/wikipedia/commons/1/1c/Red_Fort_in_Delhi_03-2016_img3.jpg", title: "Red Fort – Delhi" },
        { src: "https://upload.wikimedia.org/wikipedia/commons/9/9d/Hawa_Mahal_2011.jpg", title: "Hawa Mahal – Jaipur" },
        { src: "https://upload.wikimedia.org/wikipedia/commons/0/0e/Qutub_Minar_2011.jpg", title: "Qutub Minar – Delhi" },
        { src: "https://upload.wikimedia.org/wikipedia/commons/f/f7/Charminar_Pride_of_Hyderabad.jpg", title: "Charminar – Hyderabad" },
        { src: "https://upload.wikimedia.org/wikipedia/commons/3/33/Meenakshi_Amman_Temple_-_Madurai%2C_India.jpg", title: "Meenakshi Temple – Madurai" },
        { src: "https://upload.wikimedia.org/wikipedia/commons/2/26/Mysore_Palace_Night.jpg", title: "Mysore Palace – Mysuru" },
        { src: "https://upload.wikimedia.org/wikipedia/commons/8/8c/Backwaters_in_Kerala.jpg", title: "Backwaters – Kerala" }
      ]
      ,
  autoPlay = true,
  interval = 4000,
  height = "h-[28rem] md:h-[38rem]",
}) {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const total = items.length;
  const timerRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!autoPlay || isPaused) return;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % total);
    }, interval);
    return () => clearInterval(timerRef.current);
  }, [autoPlay, interval, isPaused, total]);

  const next = () => setIndex((i) => (i + 1) % total);
  const prev = () => setIndex((i) => (i - 1 + total) % total);

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${height} rounded-2xl overflow-hidden bg-black`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence initial={false} mode="wait">
        {items.map((item, i) =>
          i === index ? (
            <motion.img
              key={item.src + i}
              src={item.src}
              alt={item.title || `slide-${i}`}
              className="absolute inset-0 w-full h-full object-cover brightness-90"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            />
          ) : null
        )}
      </AnimatePresence>

      {items[index]?.title && (
        <div className="absolute left-6 bottom-6 bg-black/40 backdrop-blur-md text-white px-5 py-3 rounded-lg shadow-lg max-w-[75%]">
          <h3 className="text-lg md:text-2xl font-bold leading-tight drop-shadow-md">{items[index].title}</h3>
        </div>
      )}

      <div className="hidden md:flex absolute inset-y-0 left-0 items-center">
        <button onClick={prev} className="m-3 p-3 rounded-full bg-white/20 hover:bg-white/30 text-white transition shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <div className="hidden md:flex absolute inset-y-0 right-0 items-center">
        <button onClick={next} className="m-3 p-3 rounded-full bg-white/20 hover:bg-white/30 text-white transition shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`w-3 h-3 rounded-full transition-all ${i === index ? "bg-white scale-110" : "bg-white/50 hover:bg-white/80"}`}
          />
        ))}
      </div>
    </div>
  );
}
