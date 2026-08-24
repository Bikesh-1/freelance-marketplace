"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

const images = [
    "https://cdn.dribbble.com/userupload/48805551/file/cb64f11dbab4c734968b8c2d9382c196.jpg?format=webp&resize=1200x900&vertical=center",
    "https://cdn.dribbble.com/userupload/48805110/file/9dfcaac884bb3f6bb4d01df292561b1f.png?format=webp&resize=400x300&vertical=center",
    "https://cdn.dribbble.com/userupload/48659821/file/bd5ae5dcb512e73d9807de93d3aec720.png?format=webp&resize=400x300&vertical=center",
    "https://cdn.dribbble.com/userupload/48805956/file/805772bba91b5be3f95e3e7c1f048e02.jpg?crop=0x0-1600x1200&format=webp&resize=400x300&vertical=center",
    "https://cdn.dribbble.com/userupload/48805143/file/a0c5ecd7ec2ea04e8e332e879678b8c0.png?format=webp&resize=400x300&vertical=center",
    "https://cdn.dribbble.com/userupload/48804488/file/212caf46a3afe0396178f0a6d2c74273.png?crop=0x161-3200x2561&format=webp&resize=400x300&vertical=center",
    "https://cdn.dribbble.com/userupload/48805551/file/cb64f11dbab4c734968b8c2d9382c196.jpg?format=webp&resize=1200x900&vertical=center",
    "https://cdn.dribbble.com/userupload/48805110/file/9dfcaac884bb3f6bb4d01df292561b1f.png?format=webp&resize=400x300&vertical=center",
    "https://cdn.dribbble.com/userupload/48659821/file/bd5ae5dcb512e73d9807de93d3aec720.png?format=webp&resize=400x300&vertical=center",
    "https://cdn.dribbble.com/userupload/48805956/file/805772bba91b5be3f95e3e7c1f048e02.jpg?crop=0x0-1600x1200&format=webp&resize=400x300&vertical=center",
    "https://cdn.dribbble.com/userupload/48805143/file/a0c5ecd7ec2ea04e8e332e879678b8c0.png?format=webp&resize=400x300&vertical=center",
    "https://cdn.dribbble.com/userupload/48804488/file/212caf46a3afe0396178f0a6d2c74273.png?crop=0x161-3200x2561&format=webp&resize=400x300&vertical=center",
    "https://cdn.dribbble.com/userupload/48805551/file/cb64f11dbab4c734968b8c2d9382c196.jpg?format=webp&resize=1200x900&vertical=center",
    "https://cdn.dribbble.com/userupload/48805110/file/9dfcaac884bb3f6bb4d01df292561b1f.png?format=webp&resize=400x300&vertical=center",
    "https://cdn.dribbble.com/userupload/48659821/file/bd5ae5dcb512e73d9807de93d3aec720.png?format=webp&resize=400x300&vertical=center",
    "https://cdn.dribbble.com/userupload/48805956/file/805772bba91b5be3f95e3e7c1f048e02.jpg?crop=0x0-1600x1200&format=webp&resize=400x300&vertical=center",
    "https://cdn.dribbble.com/userupload/48805143/file/a0c5ecd7ec2ea04e8e332e879678b8c0.png?format=webp&resize=400x300&vertical=center",
    "https://cdn.dribbble.com/userupload/48804488/file/212caf46a3afe0396178f0a6d2c74273.png?crop=0x161-3200x2561&format=webp&resize=400x300&vertical=center",
    "https://cdn.dribbble.com/userupload/48805551/file/cb64f11dbab4c734968b8c2d9382c196.jpg?format=webp&resize=1200x900&vertical=center",
    "https://cdn.dribbble.com/userupload/48805110/file/9dfcaac884bb3f6bb4d01df292561b1f.png?format=webp&resize=400x300&vertical=center",
    "https://cdn.dribbble.com/userupload/48659821/file/bd5ae5dcb512e73d9807de93d3aec720.png?format=webp&resize=400x300&vertical=center",
    "https://cdn.dribbble.com/userupload/48805956/file/805772bba91b5be3f95e3e7c1f048e02.jpg?crop=0x0-1600x1200&format=webp&resize=400x300&vertical=center",
    "https://cdn.dribbble.com/userupload/48805143/file/a0c5ecd7ec2ea04e8e332e879678b8c0.png?format=webp&resize=400x300&vertical=center",
    "https://cdn.dribbble.com/userupload/48804488/file/212caf46a3afe0396178f0a6d2c74273.png?crop=0x161-3200x2561&format=webp&resize=400x300&vertical=center",
];

export default function InfinityCard() {
    const containerRef = useRef(null);
    const trackRef = useRef(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const track = trackRef.current;
            const cards = gsap.utils.toArray<HTMLElement>(".infinity-card");

            let setWidth = 0;

            const calculateWidth = () => {
                const firstCardSet = track.querySelector(".card-set");

                if (!firstCardSet) return;

                setWidth = firstCardSet.offsetWidth;
            };

            calculateWidth();

            // -----------------------------
            // INFINITE MOVEMENT
            // -----------------------------

            const loop = gsap.to(track, {
                x: () => -setWidth,
                duration: 40,
                ease: "none",
                repeat: -1,
                modifiers: {
                    x: (value) => {
                        return `${parseFloat(value) % setWidth}px`;
                    },
                },
            });

            // -----------------------------
            // CARD DEPTH EFFECT
            // -----------------------------

            const updateCards = () => {
                const viewportCenter = window.innerWidth / 2;

                cards.forEach((card) => {
                    const rect = card.getBoundingClientRect();

                    const cardCenter = rect.left + rect.width / 2;

                    const distance =
                        (cardCenter - viewportCenter) /
                        (window.innerWidth / 2);

                    const absDistance = Math.min(
                        Math.abs(distance),
                        1
                    );

                    const scale = 1.08 - absDistance * 0.12;

                    const rotateY = distance * -12;

                    const y = absDistance * 18;

                    const opacity = 1 - absDistance * 0.25;

                    gsap.set(card, {
                        scale,
                        rotateY,
                        y,
                        opacity,
                        zIndex: Math.round(100 - absDistance * 50),
                    });
                });
            };

            gsap.ticker.add(updateCards);

            // -----------------------------
            // HOVER EFFECT
            // -----------------------------

            const cardsElements = cards;

            cardsElements.forEach((card) => {
                const image = card.querySelector("img");

                card.addEventListener("mouseenter", () => {
                    gsap.to(loop, {
                        timeScale: 0.25,
                        duration: 0.5,
                        ease: "power2.out",
                    });

                    gsap.to(card, {
                        scale: 1.12,
                        y: -5,
                        duration: 0.5,
                        ease: "power3.out",
                    });

                    gsap.to(image, {
                        scale: 1.12,
                        duration: 0.7,
                        ease: "power3.out",
                    });
                });

                card.addEventListener("mouseleave", () => {
                    gsap.to(loop, {
                        timeScale: 1,
                        duration: 0.8,
                        ease: "power2.out",
                    });

                    gsap.to(image, {
                        scale: 1,
                        duration: 0.7,
                        ease: "power3.out",
                    });
                });
            });

            const handleResize = () => {
                calculateWidth();
            };

            window.addEventListener("resize", handleResize);

            return () => {
                gsap.ticker.remove(updateCards);
                window.removeEventListener("resize", handleResize);
                loop.kill();
            };
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={containerRef}
            className="relative w-full overflow-x-hidden py-16"
            style={{
                perspective: "1200px",
            }}
        >
            <div
                ref={trackRef}
                className="flex w-max will-change-transform"
            >
                {/* FIRST SET */}
                <div className="card-set flex shrink-0 gap-8 pr-8">
                    {images.map((image, index) => (
                        <div
                            key={`first-${index}`}
                            className="
                                infinity-card
                                group
                                relative
                                h-60
                                w-80
                                shrink-0
                                overflow-hidden
                                rounded-2xl
                                border-8
                                border-white
                                bg-black
                                shadow-2xl
                                will-change-transform
                            "
                            style={{
                                transformStyle: "preserve-3d",
                            }}
                        >
                            <img
                                src={image}
                                alt=""
                                className="
                                    h-full
                                    w-full
                                    object-cover
                                    will-change-transform
                                "
                            />

                            {/* Overlay */}
                            <div
                                className="
                                    absolute
                                    inset-0
                                    bg-black/0
                                    transition-colors
                                    duration-500
                                    group-hover:bg-black/10
                                "
                            />

                            {/* Shine */}
                            <div
                                className="
                                    pointer-events-none
                                    absolute
                                    inset-0
                                    -translate-x-full
                                    bg-gradient-to-r
                                    from-transparent
                                    via-white/20
                                    to-transparent
                                    transition-transform
                                    duration-700
                                    group-hover:translate-x-full
                                "
                            />
                        </div>
                    ))}
                </div>

                {/* SECOND SET */}
                <div className="card-set flex shrink-0 gap-8">
                    {images.map((image, index) => (
                        <div
                            key={`second-${index}`}
                            className="
                                infinity-card
                                group
                                relative
                                h-60
                                w-80
                                shrink-0
                                overflow-hidden
                                rounded-2xl
                                border-8
                                border-white
                                bg-black
                                shadow-2xl
                                will-change-transform
                            "
                            style={{
                                transformStyle: "preserve-3d",
                            }}
                        >
                            <img
                                src={image}
                                alt=""
                                className="
                                    h-full
                                    w-full
                                    object-cover
                                    will-change-transform
                                "
                            />

                            <div
                                className="
                                    absolute
                                    inset-0
                                    bg-black/0
                                    transition-colors
                                    duration-500
                                    group-hover:bg-black/10
                                "
                            />

                            <div
                                className="
                                    pointer-events-none
                                    absolute
                                    inset-0
                                    -translate-x-full
                                    bg-gradient-to-r
                                    from-transparent
                                    via-white/20
                                    to-transparent
                                    transition-transform
                                    duration-700
                                    group-hover:translate-x-full
                                "
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}