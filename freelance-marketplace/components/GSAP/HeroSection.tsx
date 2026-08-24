"use client";

import { gsap } from "gsap";
import { useEffect, useRef } from "react";

export default function HeroSection() {
    const wordsRef = useRef<(HTMLHeadingElement | null)[]>([]);
    const redRef = useRef<(HTMLSpanElement | null)[]>([]);
    const blackRef = useRef<(HTMLSpanElement | null)[]>([]);

    useEffect(() => {
        const tl = gsap.timeline({
            repeat: -1,
        });

        wordsRef.current.forEach((_, i) => {
            const red = redRef.current[i];
            const black = blackRef.current[i];

            if (!red || !black) return;

            // Initial state
            gsap.set(red, {
                opacity: 0,
                x: -20,
            });

            gsap.set(black, {
                opacity: 0,
                x: 20,
            });

            // Red text first
            tl.to(red, {
                opacity: 1,
                x: 0,
                duration: 1,
                ease: "power3.out",
            })

                // Black text after red
                .to(
                    black,
                    {
                        opacity: 1,
                        x: 0,
                        duration: 1.2,
                        ease: "power3.out",
                    },
                    "-=0.15"
                )

                // Hold
                .to({}, {
                    duration: 1.2,
                })

                // Both disappear
                .to(red, {
                    opacity: 0,
                    x: -20,
                    duration: 0.5,
                    ease: "power2.in",
                })
                .to(
                    black,
                    {
                        opacity: 0,
                        x: 20,
                        duration: 0.5,
                        ease: "power2.in",
                    },
                    "-=0.35"
                );
        });

        return () => {
            tl.kill();
        };
    }, []);

    return (
        <div className="relative h-25 w-full -rotate-1">

            <h1
                ref={(el) => {
                    wordsRef.current[0] = el;
                }}
                className="absolute inset-0 flex items-center justify-center font-oswald text-4xl font-black md:text-8xl"
            >
                <span
                    ref={(el) => {
                        redRef.current[0] = el;
                    }}
                    className="text-red-500"
                >
                    Block
                </span>
                <span
                    ref={(el) => {
                        blackRef.current[0] = el;
                    }}
                >
                    chain
                </span>
            </h1>


            <h1
                ref={(el) => {
                    wordsRef.current[1] = el;
                }}
                className="absolute inset-0 flex items-center justify-center font-oswald text-4xl font-black md:text-8xl"
            >
                <span
                    ref={(el) => {
                        redRef.current[1] = el;
                    }}
                    className="text-red-500"
                >
                    Artificial
                </span>
                <span
                    ref={(el) => {
                        blackRef.current[1] = el;
                    }}
                >
                    {" "}Intelligence
                </span>
            </h1>

            <h1
                ref={(el) => {
                    wordsRef.current[2] = el;
                }}
                className="absolute inset-0 flex items-center justify-center font-oswald text-4xl font-black md:text-8xl"
            >
                <span
                    ref={(el) => {
                        redRef.current[2] = el;
                    }}
                    className="text-red-500"
                >
                    Escrow
                </span>
                <span
                    ref={(el) => {
                        blackRef.current[2] = el;
                    }}
                >
                    {" "}Payment
                </span>
            </h1>
            <h1
                ref={(el) => {
                    wordsRef.current[3] = el;
                }}
                className="absolute inset-0 flex items-center justify-center font-oswald text-4xl font-black md:text-7xl"
            >
                <span
                    ref={(el) => {
                        redRef.current[3] = el;
                    }}
                    className="text-red-500"
                >
                    SMART
                </span>
                <span
                    ref={(el) => {
                        blackRef.current[3] = el;
                    }}
                >
                    {" "}CONTRACT 
                </span>
            </h1>
        </div>
    );
}