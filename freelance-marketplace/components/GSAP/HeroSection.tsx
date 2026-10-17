"use client";

import { gsap } from "gsap";
import { useEffect, useRef } from "react";

export default function HeroSection() {
  const wordsRef = useRef<(HTMLHeadingElement | null)[]>([]);
  const redRef = useRef<(HTMLSpanElement | null)[]>([]);
  const blackRef = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const tl = gsap.timeline({ repeat: -1 });

    wordsRef.current.forEach((_, i) => {
      const red = redRef.current[i];
      const black = blackRef.current[i];
      if (!red || !black) return;

      gsap.set(red, { opacity: 0, x: -20 });
      gsap.set(black, { opacity: 0, x: 20 });

      tl.to(red, { opacity: 1, x: 0, duration: 1, ease: "power3.out" })
        .to(black, { opacity: 1, x: 0, duration: 1.2, ease: "power3.out" }, "-=0.15")
        .to({}, { duration: 1.2 })
        .to(red, { opacity: 0, x: -20, duration: 0.5, ease: "power2.in" })
        .to(black, { opacity: 0, x: 20, duration: 0.5, ease: "power2.in" }, "-=0.35");
    });

    return () => { tl.kill(); };
  }, []);

  const words = [
    { red: "Block", black: "chain" },
    { red: "Artificial", black: " Intelligence" },
    { red: "Escrow", black: " Payment" },
    { red: "SMART", black: " CONTRACT" },
  ];

  return (
    <div className="relative mx-auto h-20 w-full max-w-full -rotate-1 sm:h-24 md:h-32">
      {words.map((word, index) => (
        <h2
          key={word.red}
          ref={(el) => { wordsRef.current[index] = el; }}
          className="absolute inset-0 flex items-center justify-center whitespace-nowrap px-1 font-oswald text-[clamp(1.35rem,6.2vw,5.5rem)] font-black leading-tight sm:text-6xl md:text-8xl"
        >
          <span
            ref={(el) => { redRef.current[index] = el; }}
            className="text-red-500"
          >
            {word.red}
          </span>
          <span ref={(el) => { blackRef.current[index] = el }}>
            {word.black}
          </span>
        </h2>
      ))}
    </div>
  );
}
