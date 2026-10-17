"use client";

import { gsap } from "gsap";
import { useEffect, useRef } from "react";

const words = [
  { red: "BLOCK", black: " CHAIN" },
  { red: "ARTIFICIAL", black: " INTELLIGENCE" },
  { red: "ESCROW", black: " PAYMENT" },
  { red: "SMART", black: " CONTRACT" },
];

export default function HeroSection() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const wordsRef = useRef<(HTMLHeadingElement | null)[]>([]);
  const redRef = useRef<(HTMLSpanElement | null)[]>([]);
  const blackRef = useRef<(HTMLSpanElement | null)[]>([]);
  const lineRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
      intro
        .fromTo(".hero-word-label", { y: 18, opacity: 0, letterSpacing: "0.35em" }, {
          y: 0, opacity: 1, letterSpacing: "0.08em", duration: 0.9,
        })
        .fromTo(lineRef.current, { scaleX: 0, opacity: 0 }, {
          scaleX: 1, opacity: 1, duration: 0.8, transformOrigin: "center",
        }, "-=0.35");

      const wordTimeline = gsap.timeline({ repeat: -1, repeatDelay: 0.15 });
      wordsRef.current.forEach((heading, i) => {
        const red = redRef.current[i];
        const black = blackRef.current[i];
        if (!heading || !red || !black) return;

        gsap.set(heading, { autoAlpha: 0, y: 28, scale: 0.94, filter: "blur(8px)" });
        gsap.set(red, { x: -35 });
        gsap.set(black, { x: 35 });

        wordTimeline
          .to(heading, { autoAlpha: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.55, ease: "power3.out" })
          .to(red, { x: 0, duration: 0.65, ease: "expo.out" }, "<")
          .to(black, { x: 0, duration: 0.8, ease: "expo.out" }, "<0.08")
          .to(heading, { scale: 1.035, duration: 0.45, ease: "power1.inOut" }, "+=0.65")
          .to(heading, { scale: 1, duration: 0.35, ease: "power1.inOut" })
          .to(heading, { autoAlpha: 0, y: -22, filter: "blur(6px)", duration: 0.42, ease: "power2.in" }, "+=0.15");
      });

      gsap.to(".hero-glow", { scale: 1.18, opacity: 0.65, duration: 2.6, yoyo: true, repeat: -1, ease: "sine.inOut" });
      gsap.to(".hero-spark", { y: -8, rotate: 8, duration: 2.2, yoyo: true, repeat: -1, ease: "sine.inOut" });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="relative mx-auto flex h-28 w-full max-w-full items-center justify-center overflow-hidden sm:h-32 md:h-40">
      <div className="hero-glow pointer-events-none absolute left-1/2 top-1/2 h-24 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500/10 blur-3xl sm:h-32 sm:w-[28rem]" />
      <div className="hero-spark pointer-events-none absolute right-[8%] top-2 hidden h-3 w-3 rotate-45 border-2 border-red-500/60 sm:block" />
      <div className="hero-spark pointer-events-none absolute bottom-3 left-[9%] hidden h-2 w-2 rotate-45 bg-red-500/50 sm:block" />
      <div className="relative z-10 w-full">
        <h2 className="hero-word-label mb-1 text-center font-oswald text-[9px] font-bold uppercase tracking-[0.08em] text-black/35 sm:text-[10px]">
          Built for the next generation of work
        </h2>
        {words.map((word, index) => (
          <h3
            key={word.red}
            ref={(el) => { wordsRef.current[index] = el; }}
            className="absolute left-0 top-1/2 flex w-full -translate-y-1/2 items-center justify-center whitespace-nowrap px-1 font-oswald text-[clamp(1.45rem,6.2vw,5.5rem)] font-black uppercase leading-none tracking-tight"
          >
            <span ref={(el) => { redRef.current[index] = el; }} className="text-red-500">{word.red}</span>
            <span ref={(el) => { blackRef.current[index] = el; }}>{word.black}</span>
          </h3>
        ))}
        <div ref={lineRef} className="absolute -bottom-5 left-1/2 h-px w-24 -translate-x-1/2 bg-gradient-to-r from-transparent via-red-500/70 to-transparent sm:w-40" />
      </div>
    </div>
  );
}
