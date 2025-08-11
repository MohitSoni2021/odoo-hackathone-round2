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
  ],
  autoPlay = true,
  interval = 4000,
  height = "h-[28rem] md:h-[38rem]",
}) {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const total = items.length;
  const timerRef = useRef(null);

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
      className={`relative w-full ${height} rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900/90 to-black/90 shadow-2xl`}
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
              className="absolute inset-0 w-full h-full object-cover brightness-75"
              initial={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
              transition={{ duration: 1, ease: "easeInOut" }}
            />
          ) : null
        )}
      </AnimatePresence>

      {items[index]?.title && (
        <motion.div
          className="absolute left-6 bottom-6 bg-white/10 backdrop-blur-lg text-white px-6 py-4 rounded-xl shadow-xl max-w-[80%] border border-white/20"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <h3 className="text-lg md:text-2xl font-semibold leading-tight tracking-tight drop-shadow-lg">
            {items[index].title}
          </h3>
        </motion.div>
      )}

      <div className="hidden md:flex absolute inset-y-0 left-0 items-center">
        <motion.button
          onClick={prev}
          className="m-4 p-4 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all border border-white/20 shadow-lg"
          whileHover={{ scale: 1.1, rotate: -5 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </motion.button>
      </div>

      <div className="hidden md:flex absolute inset-y-0 right-0 items-center">
        <motion.button
          onClick={next}
          className="m-4 p-4 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all border border-white/20 shadow-lg"
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.button>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2.5">
        {items.map((_, i) => (
          <motion.button
            key={i}
            onClick={() => setIndex(i)}
            className={`w-3 h-3 rounded-full transition-all border border-white/30 ${
              i === index ? "bg-white/90 scale-125" : "bg-white/30 hover:bg-white/50"
            }`}
            whileHover={{ scale: 1.3 }}
            whileTap={{ scale: 0.9 }}
          />
        ))}
      </div>
    </div>
  );
}