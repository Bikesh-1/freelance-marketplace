"use client";

import { gsap } from "gsap";
import { useEffect, useRef } from "react";

const words = [
  { red: "BLOCK", black: "CHAIN" },
  { red: "ARTIFICIAL", black: "INTELLIGENCE" },
  { red: "ESCROW", black: "PAYMENT" },
  { red: "SMART", black: "CONTRACT" },
];

export default function HeroSection() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const wordsRef = useRef<(HTMLHeadingElement | null)[]>([]);
  const redRef = useRef<(HTMLSpanElement | null)[]>([]);
  const blackRef = useRef<(HTMLSpanElement | null)[]>([]);
  const lineRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".hero-word-label",
        { y: 12, opacity: 0, letterSpacing: "0.24em" },
        { y: 0, opacity: 1, letterSpacing: "0.12em", duration: 0.7, ease: "power3.out" },
      );
      gsap.fromTo(
        lineRef.current,
        { scaleX: 0, opacity: 0 },
        { scaleX: 1, opacity: 1, duration: 0.75, delay: 0.25, transformOrigin: "center", ease: "power3.out" },
      );

      const timeline = gsap.timeline({ repeat: -1, repeatDelay: 0.18 });
      wordsRef.current.forEach((heading, index) => {
        const red = redRef.current[index];
        const black = blackRef.current[index];
        if (!heading || !red || !black) return;

        gsap.set(heading, { autoAlpha: 0, y: 20, scale: 0.97, filter: "blur(5px)" });
        gsap.set(red, { x: -22 });
        gsap.set(black, { x: 22 });

        timeline
          .to(heading, { autoAlpha: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.55, ease: "power3.out" })
          .to(red, { x: 0, duration: 0.6, ease: "expo.out" }, "<")
          .to(black, { x: 0, duration: 0.65, ease: "expo.out" }, "<0.05")
          .to(heading, { scale: 1.025, duration: 0.35, ease: "power1.inOut" }, "+=0.8")
          .to(heading, { scale: 1, duration: 0.3, ease: "power1.inOut" })
          .to(heading, { autoAlpha: 0, y: -16, filter: "blur(4px)", duration: 0.38, ease: "power2.in" }, "+=0.12");
      });

      gsap.to(".hero-glow", { scale: 1.12, opacity: 0.55, duration: 2.5, yoyo: true, repeat: -1, ease: "sine.inOut" });
      gsap.to(".hero-spark", { y: -7, rotate: 8, duration: 2.2, yoyo: true, repeat: -1, ease: "sine.inOut" });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={rootRef}
      className="relative mx-auto h-32 w-full max-w-full overflow-hidden sm:h-36 md:h-40"
    >
      <div className="hero-glow pointer-events-none absolute left-1/2 top-[52%] h-20 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500/10 blur-3xl sm:h-28 sm:w-[28rem]" />
      <div className="hero-spark pointer-events-none absolute right-[8%] top-5 hidden h-3 w-3 rotate-45 border-2 border-red-500/60 sm:block" />
      <div className="hero-spark pointer-events-none absolute bottom-5 left-[9%] hidden h-2 w-2 rotate-45 bg-red-500/50 sm:block" />

      <p className="hero-word-label absolute inset-x-0 top-1 z-20 text-center font-oswald text-[9px] font-bold uppercase tracking-[0.12em] text-black/40 sm:top-2 sm:text-[10px]">
        Built for the next generation of work
      </p>

      <div className="absolute inset-x-0 top-[52%] h-[68%] -translate-y-1/2">
        {words.map((word, index) => (
          <h3
            key={word.red}
            ref={(el) => { wordsRef.current[index] = el; }}
            className="absolute inset-0 flex items-center justify-center gap-[0.08em] whitespace-nowrap px-1 text-center font-oswald text-[clamp(1.35rem,5.6vw,5.25rem)] font-black uppercase leading-none tracking-tight"
          >
            <span ref={(el) => { redRef.current[index] = el; }} className="text-red-500">{word.red}</span>
            <span ref={(el) => { blackRef.current[index] = el; }}>{word.black}</span>
          </h3>
        ))}
      </div>

      <div ref={lineRef} className="absolute bottom-1 left-1/2 h-px w-20 -translate-x-1/2 bg-gradient-to-r from-transparent via-red-500/60 to-transparent sm:bottom-0 sm:w-36" />
    </div>
  );
}
