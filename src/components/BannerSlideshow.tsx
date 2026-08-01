"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import DriveImage from "./DriveImage";

interface BannerSlideshowProps {
    images: string[];
    interval?: number;
}

type TransitionEffect = "fade" | "slideLeft" | "slideRight" | "slideUp" | "zoomIn" | "zoomOut";

export default function BannerSlideshow({ images, interval = 6000 }: BannerSlideshowProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [displayImages, setDisplayImages] = useState<string[]>(images);
    const [effect, setEffect] = useState<TransitionEffect>("fade");

    const effects: TransitionEffect[] = ["fade", "slideLeft", "slideRight", "slideUp", "zoomIn", "zoomOut"];

    useEffect(() => {
        if (images.length > 0) {
            const shuffled = [...images].sort(() => Math.random() - 0.5);
            setDisplayImages(shuffled);
            setCurrentIndex(0);
        }
    }, [images]);

    useEffect(() => {
        if (displayImages.length <= 1) return;

        const timer = setInterval(() => {
            // Pick a random effect for the NEXT transition
            const nextEffect = effects[Math.floor(Math.random() * effects.length)];
            setEffect(nextEffect);
            setCurrentIndex((prev) => (prev + 1) % displayImages.length);
        }, interval);

        return () => clearInterval(timer);
    }, [displayImages, interval]);

    const variants: Variants = useMemo(() => ({
        initial: (eff: TransitionEffect) => {
            switch (eff) {
                case "fade": return { opacity: 0 };
                case "slideLeft": return { x: "100%", opacity: 0 };
                case "slideRight": return { x: "-100%", opacity: 0 };
                case "slideUp": return { y: "100%", opacity: 0 };
                case "zoomIn": return { scale: 1.5, opacity: 0 };
                case "zoomOut": return { scale: 0.5, opacity: 0 };
                default: return { opacity: 0 };
            }
        },
        animate: {
            x: 0,
            y: 0,
            scale: 1,
            opacity: 1,
            transition: {
                opacity: { duration: 1.2 },
                x: { duration: 1, ease: "easeInOut" },
                y: { duration: 1, ease: "easeInOut" },
                scale: { duration: 1.2 }
            }
        },
        exit: (eff: TransitionEffect) => {
            switch (eff) {
                case "fade": return { opacity: 0 };
                case "slideLeft": return { x: "-100%", opacity: 0 };
                case "slideRight": return { x: "100%", opacity: 0 };
                case "slideUp": return { y: "-100%", opacity: 0 };
                case "zoomIn": return { scale: 0.5, opacity: 0 };
                case "zoomOut": return { scale: 1.5, opacity: 0 };
                default: return { opacity: 0 };
            }
        }
    }), []);

    if (!displayImages || displayImages.length === 0) return null;

    return (
        <div className="absolute inset-0 z-0 bg-gray-900 overflow-hidden">
            <AnimatePresence initial={false} custom={effect}>
                <motion.div
                    key={currentIndex}
                    custom={effect}
                    variants={variants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="absolute inset-0 z-0"
                >
                    {/* Ken Burns Effect Container */}
                    <motion.div
                        className="w-full h-full"
                        animate={{
                            scale: [1, 1.15],
                        }}
                        transition={{
                            duration: interval / 1000 + 2,
                            ease: "linear",
                            repeat: Infinity,
                        }}
                    >
                        <DriveImage
                            src={displayImages[currentIndex]}
                            alt={`Slide ${currentIndex + 1}`}
                            className="w-full h-full object-cover"
                            style={{ objectPosition: 'center' }}
                        />
                    </motion.div>

                    {/* Subtle Overlay */}
                    <div className="absolute inset-0 bg-black/10" />
                </motion.div>
            </AnimatePresence>

            {/* Dots Indicator */}
            {displayImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
                    {displayImages.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                setEffect("fade"); // Default to fade when manual click
                                setCurrentIndex(index);
                            }}
                            className={`w-2 h-2 rounded-full transition-all ${index === currentIndex ? "bg-white w-6" : "bg-white/50 hover:bg-white/80"}`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
