"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  type PanInfo,
  type Variants,
} from "framer-motion";
import { Heart } from "lucide-react";

/* ---------------- Types ---------------- */

export interface Slide {
  id: number;
  img: string;
}

type IconRenderer = (props?: any) => React.ReactNode;

export interface CarouselSliderProps {
  slides?: Slide[];
  favouriteIcon?: IconRenderer;
}

/* ---------------- Defaults ---------------- */

const DEFAULT_SLIDES: Slide[] = [
  {
    id: 1,
    img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: 2,
    img: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: 3,
    img: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: 4,
    img: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: 5,
    img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: 6,
    img: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=600&auto=format&fit=crop",
  },
];

/* ---------------- Animation Variants ---------------- */

const variants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 200 : -200,
    filter: "brightness(2)",
    scale: 0.75,
    opacity: 0,
    rotate: direction > 0 ? 30 : -30,
  }),
  center: {
    x: 0,
    filter: "brightness(1)",
    scale: 1,
    opacity: 1,
    rotate: -3,
    zIndex: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -200 : 200,
    filter: "brightness(2)",
    scale: 0.75,
    opacity: 0,
    rotate: direction > 0 ? -30 : 30,
    zIndex: 0,
  }),
};

/* ---------------- Component ---------------- */

export const CarouselSlider: React.FC<CarouselSliderProps> = ({
  slides = DEFAULT_SLIDES,
  favouriteIcon = (props) => (
    <Heart
      className="w-5 h-5 text-rose-500 fill-rose-500/20"
      strokeWidth={1.5}
      {...props}
    />
  ),
}) => {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isFavorited, setIsFavorited] = useState<Record<number, boolean>>({});

  const dragX = useMotionValue(0);
  const rotate = useTransform(dragX, [-200, 200], [-18, 18]);

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setIndex((prev) => (prev + newDirection + slides.length) % slides.length);
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x < -120) paginate(1);
    else if (info.offset.x > 120) paginate(-1);
  };

  const toggleFavorite = (slideId: number) => {
    setIsFavorited((prev) => ({
      ...prev,
      [slideId]: !prev[slideId],
    }));
  };

  return (
    <div className="flex flex-col items-center justify-center select-none py-4">
      {/* Slider */}
      <div className="relative w-48 sm:w-60 aspect-square flex items-center justify-center -rotate-[6deg]">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={index}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", bounce: 0.2, duration: 0.5 },
              scale: { duration: 0.35 },
              opacity: { duration: 0.25 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            style={{ rotate, x: dragX }}
            onDragEnd={handleDragEnd}
            className="absolute w-full h-full bg-[#FDFDFD] dark:bg-zinc-900 rounded-[40px] p-2 shadow-2xl border-[1.2px] border-[#E6E6EA] dark:border-zinc-800 overflow-hidden cursor-grab active:cursor-grabbing"
          >
            <div className="w-full h-full rounded-[32px] overflow-hidden bg-zinc-100 dark:bg-zinc-800 relative">
              <Image
                src={slides[index].img}
                alt={`Slide ${index + 1}`}
                fill
                unoptimized
                priority={index === 0}
                sizes="(max-width: 768px) 100vw, 400px"
                className="object-cover w-full h-full pointer-events-none"
              />

              {/* Favourite Button */}
              <button
                type="button"
                title="Favourite"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(slides[index].id);
                }}
                className="absolute top-4 right-4 w-10 h-10 bg-[#EDEDED]/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-md border border-white/20 transition-transform active:scale-90 hover:scale-105"
              >
                {favouriteIcon({
                  className: isFavorited[slides[index].id]
                    ? "w-5 h-5 text-rose-500 fill-rose-500 transition-colors"
                    : "w-5 h-5 text-[#2b2b2b] dark:text-white/90 transition-colors",
                })}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Background Card */}
        <div className="absolute -z-10 w-[95%] h-[95%] bg-white dark:bg-zinc-900 rounded-[40px] border-[6px] border-white dark:border-zinc-800 scale-95 opacity-50 shadow-xl" />
      </div>

      {/* Pagination */}
      <div className="flex gap-2.5 mt-8 pl-8 -rotate-[6deg]">
        {slides.map((_, i) => (
          <motion.div
            key={i}
            animate={{
              scale: i === index ? 1.25 : 1,
              opacity: i === index ? 1 : 0.35,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
            }}
            className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-colors ${
              i === index ? "bg-purple-500" : "bg-[#CCC7B8] dark:bg-zinc-600"
            }`}
            onClick={() => {
              setDirection(i > index ? 1 : -1);
              setIndex(i);
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default CarouselSlider;
