import React, { useRef, useState, useEffect } from "react";
import { motion, useSpring } from "framer-motion";

export default function CardCarousel({ heading, children }) {
  const carouselRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  
  // Smooth scroll with spring physics
  const scrollX = useSpring(0, { stiffness: 120, damping: 25 });

  // Update container width on mount and resize
  useEffect(() => {
    const updateWidth = () => {
      if (carouselRef.current) {
        setContainerWidth(carouselRef.current.scrollWidth - carouselRef.current.clientWidth);
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const handleDragEnd = (event, info) => {
    const container = carouselRef.current;
    if (!container) return;
    const maxScrollLeft = container.scrollWidth - container.clientWidth;
    const newScrollLeft = container.scrollLeft - info.offset.x;
    const boundedScroll = Math.max(0, Math.min(maxScrollLeft, newScrollLeft));
    scrollX.set(-boundedScroll);
    container.scrollLeft = boundedScroll;
  };

  return (
    <div className="w-full relative bg-gradient-to-r from-gray-100 to-gray-100 rounded-xl p-8  overflow-hidden">
      {/* Heading with professional styling */}
      {heading && (
        <motion.h2
          className="text-3xl md:text-4xl font-semibold text-gray-800 tracking-tight mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {heading}
          <span className="block w-12 h-0.5 bg-gray-400 mt-2" />
        </motion.h2>
      )}

      {/* Carousel with refined drag and professional styling */}
      <motion.div
        ref={carouselRef}
        className="flex gap-4 scrollbar-hidden overflow-x-scroll py-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent cursor-grab active:cursor-grabbing"
        drag="x"
        dragConstraints={{ left: -containerWidth, right: 0 }}
        dragElastic={0.2}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        style={{ x: scrollX }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {children}
      </motion.div>

      {/* Subtle bottom gradient for depth */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-gray-100/50 to-transparent" />
    </div>
  );
}