import React, { useRef } from "react";
import { motion } from "framer-motion";

export default function CardCarousel({ heading, children }) {
  const carouselRef = useRef(null);

  const handleDragEnd = (event, info) => {
    const container = carouselRef.current;
    if (!container) return;
    const maxScrollLeft = container.scrollWidth - container.clientWidth;
    const newScrollLeft = container.scrollLeft - info.offset.x;
    container.scrollLeft = Math.max(0, Math.min(maxScrollLeft, newScrollLeft));
  };

  return (
    <div className="w-full px-6 py-8">
      {heading && <h2 className="text-2xl font-bold mb-4">{heading}</h2>}
      <motion.div
        ref={carouselRef}
        className="flex gap-4 overflow-x-scroll scrollbar-hide cursor-grab active:cursor-grabbing"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
      >
        {children}
      </motion.div>
    </div>
  );
}
