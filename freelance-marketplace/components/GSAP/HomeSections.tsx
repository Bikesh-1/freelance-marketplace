"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ShieldCheck,
  Wallet,
  MessagesSquare,
  Search,
  FileCheck2,
  ArrowUpRight,
  Code2,
  Palette,
  PenTool,
  BarChart3,
  Video,
  Smartphone,
} from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Post a project",
    description: "Describe what you need, set your budget, and find the right independent talent for the job.",
    icon: Search,
  },
  {
    number: "02",
    title: "Agree & get started",
    description: "Review proposals, discuss the details, and align on deliverables before work begins.",
    icon: MessagesSquare,
  },
  {
    number: "03",
    title: "Pay with confidence",
    description: "Use the escrow workflow to keep payment tied to the agreed project milestones.",
    icon: ShieldCheck,
  },
];

const features = [
  {
    title: "Escrow-first payments",
    description: "A clearer payment flow helps both sides understand when funds are committed and when they can be released.",
    icon: Wallet,
    tag: "PAYMENT PROTECTION",
  },
  {
    title: "Milestone-based work",
    description: "Break larger projects into manageable deliverables and keep progress easier to follow.",
    icon: FileCheck2,
    tag: "CLEAR EXPECTATIONS",
  },
  {
    title: "Built-in communication",
    description: "Keep project conversations and important decisions close to the work.",
    icon: MessagesSquare,
    tag: "STAY IN SYNC",
  },
];

const categories = [
  { name: "Development", detail: "Websites, apps & APIs", icon: Code2 },
  { name: "UI/UX Design", detail: "Interfaces & product design", icon: Palette },
  { name: "Branding", detail: "Identity & creative assets", icon: PenTool },
  { name: "Marketing", detail: "Growth & strategy", icon: BarChart3 },
  { name: "Video & Motion", detail: "Editing & animation", icon: Video },
  { name: "Mobile Apps", detail: "iOS & Android products", icon: Smartphone },
];

export default function HomeSections() {
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
        gsap.fromTo(
          element,
          { y: 34, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.75,
            ease: "power3.out",
            scrollTrigger: {
              trigger: element,
              start: "top 88%",
              once: true,
            },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-stagger]").forEach((group) => {
        const children = group.querySelectorAll<HTMLElement>("[data-card]");
        gsap.fromTo(
          children,
          { y: 28, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.65,
            stagger: 0.12,
            ease: "power3.out",
            scrollTrigger: {
              trigger: group,
              start: "top 84%",
              once: true,
            },
          },
        );
      });

      gsap.to(".about-orbit", {
        rotate: 360,
        duration: 32,
        repeat: -1,
        ease: "none",
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} className="bg-[#F7F4EE] text-[#111]">
      <section id="about" className="scroll-mt-20 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2 md:gap-16">
          <div data-reveal>
            <p className="mb-4 font-oswald text-xs font-bold tracking-[0.24em] text-red-500">01 / ABOUT THE PLATFORM</p>
            <h2 className="max-w-xl font-oswald text-4xl font-black uppercase leading-[1.05] sm:text-5xl lg:text-6xl">
              Good work deserves <span className="text-red-500">good protection.</span>
            </h2>
            <p className="mt-6 max-w-xl text-base leading-7 text-black/65 sm:text-lg">
              A project marketplace designed to make working together feel more straightforward—from finding the right person to agreeing on deliverables and handling payments.
            </p>
            <p className="mt-4 max-w-xl text-sm leading-6 text-black/55">
              Clear expectations, project conversations, milestones and an escrow-based payment workflow help clients and freelancers move forward with more confidence.
            </p>
            <Link href="/register" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#111] px-6 py-3 text-sm font-bold text-white transition hover:bg-red-500">
              Get started <ArrowUpRight size={17} />
            </Link>
          </div>
          <div data-reveal className="relative flex min-h-72 items-center justify-center overflow-hidden rounded-[2rem] border border-black/5 bg-[#EDE8DF] p-8 sm:min-h-96">
            <div className="about-orbit absolute h-64 w-64 rounded-full border border-dashed border-red-500/45 sm:h-80 sm:w-80" />
            <div className="absolute h-48 w-48 rounded-full border border-black/10 sm:h-60 sm:w-60" />
            <div className="relative z-10 flex h-40 w-40 flex-col items-center justify-center rounded-[2rem] bg-[#111] text-center text-white shadow-2xl sm:h-48 sm:w-48">
              <ShieldCheck size={42} strokeWidth={1.5} className="mb-3 text-red-500" />
              <span className="font-oswald text-xl font-bold uppercase">Work securely</span>
              <span className="mt-1 text-xs text-white/60">From brief to payout</span>
            </div>
            <div className="absolute left-5 top-8 rounded-full bg-white px-4 py-2 text-xs font-bold shadow-md sm:left-10">CLIENT</div>
            <div className="absolute bottom-8 right-5 rounded-full bg-red-500 px-4 py-2 text-xs font-bold text-white shadow-md sm:right-10">FREELANCER</div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-20 bg-[#111] px-4 py-16 text-white sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div data-reveal className="mb-10 flex flex-col justify-between gap-4 sm:mb-14 md:flex-row md:items-end">
            <div>
              <p className="mb-3 font-oswald text-xs font-bold tracking-[0.24em] text-red-500">02 / THE PROCESS</p>
              <h2 className="font-oswald text-4xl font-black uppercase sm:text-5xl">Simple from <span className="text-red-500">start to finish.</span></h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-white/60">Less uncertainty. Better collaboration. A more transparent way to get projects done.</p>
          </div>
          <div data-stagger className="grid gap-4 md:grid-cols-3">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <article data-card key={step.number} className="group rounded-3xl border border-white/10 bg-white/[0.04] p-6 transition-colors hover:border-red-500/60 hover:bg-white/[0.07] sm:p-8">
                  <div className="mb-10 flex items-center justify-between">
                    <span className="font-oswald text-sm font-bold text-red-500">{step.number} / 03</span>
                    <Icon size={25} strokeWidth={1.6} className="text-white/70 transition-colors group-hover:text-red-500" />
                  </div>
                  <h3 className="font-oswald text-2xl font-bold uppercase">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/60">{step.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="features" className="scroll-mt-20 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div data-reveal className="mx-auto mb-10 max-w-2xl text-center sm:mb-14">
            <p className="mb-3 font-oswald text-xs font-bold tracking-[0.24em] text-red-500">03 / MADE FOR COLLABORATION</p>
            <h2 className="font-oswald text-4xl font-black uppercase sm:text-5xl">More clarity. <span className="text-red-500">Less friction.</span></h2>
            <p className="mt-4 text-sm leading-6 text-black/60 sm:text-base">Useful tools for the important parts of a freelance project.</p>
          </div>
          <div data-stagger className="grid gap-4 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <article data-card key={feature.title} className="rounded-3xl border border-black/10 bg-white/65 p-6 sm:p-8">
                  <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500 text-white"><Icon size={23} /></div>
                  <p className="mb-3 font-oswald text-[10px] font-bold tracking-[0.18em] text-red-500">{feature.tag}</p>
                  <h3 className="font-oswald text-2xl font-bold uppercase">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-black/60">{feature.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="categories" className="scroll-mt-20 border-y border-black/5 bg-[#EEE9E0] px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div data-reveal className="mb-10 flex flex-col gap-4 sm:mb-12 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-3 font-oswald text-xs font-bold tracking-[0.24em] text-red-500">04 / EXPLORE THE POSSIBILITIES</p>
              <h2 className="font-oswald text-4xl font-black uppercase sm:text-5xl">Find your <span className="text-red-500">kind of work.</span></h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-black/60">From the first design draft to a fully deployed product, bring the right skills to your next idea.</p>
          </div>
          <div data-stagger className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <article data-card key={category.name} className="group flex items-center gap-4 rounded-2xl border border-black/10 bg-[#F7F4EE] p-5 transition-all hover:-translate-y-1 hover:border-red-500/50">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#111] text-white transition-colors group-hover:bg-red-500"><Icon size={22} /></div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-oswald text-lg font-bold uppercase">{category.name}</h3>
                    <p className="mt-1 text-xs text-black/55">{category.detail}</p>
                  </div>
                  <span className="font-oswald text-xs text-black/35">0{index + 1}</span>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div data-reveal className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 overflow-hidden rounded-[2rem] bg-red-500 p-7 text-white sm:p-12 md:flex-row md:items-center lg:p-16">
          <div className="max-w-2xl">
            <p className="mb-3 font-oswald text-xs font-bold tracking-[0.24em] text-white/75">YOUR NEXT PROJECT STARTS HERE</p>
            <h2 className="font-oswald text-4xl font-black uppercase leading-tight sm:text-5xl lg:text-6xl">Make good work happen.</h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-white/85 sm:text-base">Join the marketplace and take the next step with your idea, your skills, or your business.</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Link href="/register" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-[#111] transition hover:bg-[#111] hover:text-white">Join now <ArrowUpRight size={17} /></Link>
            <Link href="/login" className="inline-flex items-center rounded-full border border-white/60 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10">Sign in</Link>
          </div>
        </div>
      </section>

      <footer id="contact" className="scroll-mt-20 bg-[#111] px-4 pb-8 pt-12 text-white sm:px-6 sm:pt-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 border-b border-white/10 pb-10 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2">
              <Link href="/" className="inline-flex items-center gap-3" aria-label="Freelance Marketplace home">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500 font-oswald text-xl font-black">F</span>
                <span className="font-oswald text-xl font-bold uppercase">Freelance<span className="text-red-500"> Marketplace</span></span>
              </Link>
              <p className="mt-5 max-w-sm text-sm leading-6 text-white/55">A clearer way for clients and freelancers to connect, collaborate, and move projects forward.</p>
            </div>
            <div>
              <h3 className="mb-4 font-oswald text-sm font-bold uppercase tracking-wider">Explore</h3>
              <ul className="space-y-3 text-sm text-white/60">
                <li><Link className="transition hover:text-red-500" href="/#about">About us</Link></li>
                <li><Link className="transition hover:text-red-500" href="/#how-it-works">How it works</Link></li>
                <li><Link className="transition hover:text-red-500" href="/#features">Platform features</Link></li>
                <li><Link className="transition hover:text-red-500" href="/#categories">Categories</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-oswald text-sm font-bold uppercase tracking-wider">Get started</h3>
              <ul className="space-y-3 text-sm text-white/60">
                <li><Link className="transition hover:text-red-500" href="/register">Create an account</Link></li>
                <li><Link className="transition hover:text-red-500" href="/login">Log in</Link></li>
                <li><Link className="transition hover:text-red-500" href="/dashboard">Dashboard</Link></li>
                <li><Link className="transition hover:text-red-500" href="/message">Messages</Link></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col gap-3 pt-6 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Freelance Marketplace. All rights reserved.</p>
            <a href="#top" className="inline-flex items-center gap-2 transition hover:text-red-500">Back to top <ArrowUpRight size={14} /></a>
          </div>
        </div>
      </footer>
    </section>
  );
}
