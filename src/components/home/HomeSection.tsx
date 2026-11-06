"use client";

import React, { useState } from "react";
import Image from "next/image";
import { StudentProfile } from "@/types";
import { GradientWrapper } from "@/components/ui/GradientWrapper";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { LayoutEffect } from "@/components/ui/LayoutEffect";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AvatarImage } from "@/components/ui/avatar-image";
import {
  Sparkles,
  ArrowRight,
  Users,
  Rocket,
  ShieldCheck,
  Zap,
  Brain,
  Calendar,
  MessageSquare,
  CheckCircle2,
  ChevronRight,
  Search,
} from "lucide-react";

interface HomeSectionProps {
  students: StudentProfile[];
  currentUser: StudentProfile;
  onOpenSession: (partner: StudentProfile) => void;
  onNavigateTab?: (tab: string) => void;
}

export function HomeSection({
  students,
  currentUser,
  onOpenSession,
  onNavigateTab,
}: HomeSectionProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Filter public featured students (excluding self)
  const featured = students
    .filter((s) => s.isPublic === true && s.id !== currentUser.id)
    .slice(0, 4);

  const featuresList = [
    {
      icon: <Brain className="w-6 h-6 text-purple-400" />,
      title: "AI Bilateral Matchmaking",
      desc: "Our neural matchmaking algorithm computes skill complementarity, mutual knowledge exchange value, and timezone synergy.",
    },
    {
      icon: <Users className="w-6 h-6 text-purple-400" />,
      title: "Dream Team Builder",
      desc: "Assemble balanced multi-disciplinary teams for hackathons, capstone projects, or startups with a single prompt.",
    },
    {
      icon: <Calendar className="w-6 h-6 text-purple-400" />,
      title: "Integrated Peer Sessions",
      desc: "Schedule 1-on-1 mentorship, pair programming, and critique sessions with live Google Meet & Jitsi integrations.",
    },
    {
      icon: <Rocket className="w-6 h-6 text-purple-400" />,
      title: "Project Recruitment Hub",
      desc: "Browse verified student-led repositories and apply directly to open roles requiring your specific tech stack.",
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-purple-400" />,
      title: "Direct Peer Messaging",
      desc: "Real-time chat powered by Supabase channels to coordinate deliverables, share code snippets, and plan roadmaps.",
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-purple-400" />,
      title: "Row-Level Security & Privacy",
      desc: "Enterprise-grade database protection ensuring your contact info and proposals are strictly guarded by Supabase RLS.",
    },
  ];

  const testimonials = [
    {
      avatar: "/testimonial/user1.webp",
      name: "Alex Rivera",
      title: "Computer Science @ Stanford",
      quote:
        "SkillSwap AI paired me with an expert in PyTorch who wanted to learn Next.js. We swapped skills over 3 weeks and ended up winning our regional collegiate hackathon!",
    },
    {
      avatar: "/testimonial/user2.webp",
      name: "Sarah Chen",
      title: "Design & HCI @ UC Berkeley",
      quote:
        "Finding reliable developers who value good UI/UX used to be impossible. The Dream Team Builder matched me with full-stack engineers who shipped our project seamlessly.",
    },
    {
      avatar: "/testimonial/user3.webp",
      name: "Marcus Vance",
      title: "Electrical & Computer Eng @ MIT",
      quote:
        "The bilateral exchange concept is brilliant. No money changes hands — just pure knowledge sharing. The peer scheduling makes staying accountable super easy.",
    },
    {
      avatar: "/testimonial/user4.webp",
      name: "Elena Rostova",
      title: "Software Engineering @ Waterloo",
      quote:
        "The AI gap analysis highlighted exactly which backend role our team was missing. We posted the opening and filled it within 24 hours with an incredible peer.",
    },
    {
      avatar: "/testimonial/user5.webp",
      name: "David Kim",
      title: "Data Science @ Georgia Tech",
      quote:
        "Best collaboration platform for student builders. The dark Mailgo aesthetic is gorgeous, and the real-time Supabase messaging makes coordination effortless.",
    },
    {
      avatar: "/testimonial/user6.webp",
      name: "Priya Sharma",
      title: "AI Researcher @ Carnegie Mellon",
      quote:
        "I was able to mentor younger students in ML foundations while getting hands-on DevOps mentoring in return. High synergy, high impact.",
    },
  ];

  const plans = [
    {
      name: "Student Free",
      desc: "Essential peer skill swapping for college learners",
      price: 0,
      isMostPop: false,
      features: [
        "Unlimited peer search & filters",
        "Up to 5 active swap proposals",
        "Public portfolio & skill radar",
        "Direct peer messaging",
        "Community hackathon listings",
      ],
      ctaText: "Get Started Free",
    },
    {
      name: "Builder Pro",
      desc: "Ideal for hackathon teams & startup founders",
      price: 9,
      isMostPop: true,
      features: [
        "Everything in Student Free",
        "AI Dream Team Generator Studio",
        "Automated Team Gap Analyzer",
        "Unlimited 1-on-1 session scheduling",
        "Priority AI synergy recommendations",
        "Verified Student Builder badge",
      ],
      ctaText: "Launch with Pro",
    },
    {
      name: "Campus Chapter",
      desc: "For university tech clubs and venture labs",
      price: 29,
      isMostPop: false,
      features: [
        "Everything in Builder Pro",
        "Dedicated Campus Organization hub",
        "Custom role & skill taxonomies",
        "Team analytics & hackathon dashboard",
        "Priority Supabase realtime channel",
        "Direct moderator support",
      ],
      ctaText: "Join as Chapter",
    },
  ];

  const faqsList = [
    {
      q: "What is SkillSwap AI?",
      a: "SkillSwap AI is an intelligent peer-to-peer marketplace where university students and creators exchange technical expertise without monetary cost. You teach what you know (e.g. React or UI design) in return for learning what you need (e.g. Machine Learning, Rust, or DevOps).",
    },
    {
      q: "How does the AI Bilateral Matchmaking work?",
      a: "Our algorithm calculates a multi-factor synergy index comparing your offered skills against a peer's learning goals, and vice versa. It factors in technical proficiency, complementary experience levels, and availability.",
    },
    {
      q: "Is SkillSwap AI free for university students?",
      a: "Yes! Core skill exchanges, profile creation, project recruitment, and peer messaging are completely free for all students worldwide.",
    },
    {
      q: "Can I find teammates for hackathons and capstone projects?",
      a: "Absolutely. You can post a project with specific role requirements (e.g. Frontend Engineer, Cloud Architect) or use the AI Dream Team Builder Studio to generate optimal multi-person rosters automatically.",
    },
    {
      q: "How are 1-on-1 sessions conducted?",
      a: "When you agree to swap skills, you can schedule a session directly through the Sessions Manager. It supports custom meeting links (Google Meet, Zoom, Jitsi) and keeps track of completed exchange hours.",
    },
    {
      q: "How is my personal data secured?",
      a: "All user records, projects, and swap requests are secured with PostgreSQL Row Level Security (RLS) on Supabase. Only authenticated users can manage their private data.",
    },
  ];

  return (
    <div className="w-full">
      {/* =========================================================
          HERO SECTION (Mailgo Centered Style with GradientWrapper)
          ========================================================= */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28">
        <div className="custom-screen">
          <LayoutEffect
            className="duration-1000 delay-200"
            isInviewState={{
              trueState: "opacity-100 translate-y-0",
              falseState: "opacity-0 translate-y-6",
            }}
          >
            <div>
              <div className="space-y-6 max-w-3xl mx-auto text-center">
                {/* Hero Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-600/10 text-purple-300 text-xs font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>The AI-Powered Student Skill Exchange</span>
                </div>

                {/* Hero Heading with Mailgo white-fade gradient */}
                <h1
                  className="text-4xl bg-clip-text text-transparent bg-gradient-to-r font-extrabold mx-auto sm:text-6xl tracking-tight leading-[1.15]"
                  style={{
                    backgroundImage:
                      "linear-gradient(179.1deg, #FFFFFF 0.77%, rgba(255, 255, 255, 0.4) 182.09%)",
                  }}
                >
                  Exchange skills and build your dream team with AI
                </h1>

                {/* Subtitle */}
                <p className="max-w-xl mx-auto text-gray-300 text-base sm:text-lg leading-relaxed">
                  Connect with complementary student builders. Trade knowledge, collaborate on hackathons, and accelerate your tech career through bilateral peer learning.
                </p>

                {/* Action CTA Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => onNavigateTab && onNavigateTab("students")}
                    className="flex items-center gap-2 text-white bg-purple-600 hover:bg-purple-500 active:bg-purple-700 px-6 py-3 rounded-full text-sm font-semibold shadow-lg shadow-purple-600/30 transition-all duration-150"
                  >
                    <span>Explore Marketplace</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onNavigateTab && onNavigateTab("ai-studio")}
                    className="flex items-center gap-2 text-gray-200 custom-btn-bg border border-gray-700 hover:border-gray-500 hover:text-white px-6 py-3 rounded-full text-sm font-semibold transition-all duration-150"
                  >
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>AI Match Studio</span>
                  </button>
                </div>
              </div>

              {/* Glowing Hero Showcase Preview */}
              <GradientWrapper
                className="mt-14 sm:mt-24"
                wrapperClassName="max-w-3xl h-[260px] top-12 inset-0 sm:h-[340px] lg:h-[580px]"
              >
                <div className="p-2 sm:p-3 rounded-3xl border border-gray-800 bg-gray-900/60 shadow-2xl backdrop-blur-md">
                  <div className="rounded-2xl overflow-hidden border border-gray-800/80">
                    <Image
                      src="/images/hero.svg"
                      width={1100}
                      height={650}
                      className="w-full h-auto object-cover"
                      alt="SkillSwap AI Platform Preview"
                      priority
                    />
                  </div>
                </div>
              </GradientWrapper>
            </div>
          </LayoutEffect>
        </div>
      </section>

      {/* =========================================================
          VISUAL FEATURES (Mailgo 2-Card Platform Preview)
          ========================================================= */}
      <SectionWrapper>
        <div className="custom-screen text-gray-300">
          <div className="max-w-xl mx-auto text-center space-y-3">
            <h2 className="text-white text-3xl font-bold sm:text-4xl tracking-tight">
              Take your technical collaboration to the next level
            </h2>
            <p className="text-gray-400 text-sm sm:text-base">
              SkillSwap AI unites intelligent matchmaking, verified skill credentials, and live collaborative workspaces in one seamless experience.
            </p>
          </div>

          <div className="mt-14">
            <ul className="space-y-8 gap-x-6 sm:flex sm:space-y-0">
              {/* Card 1 */}
              <li
                className="flex-1 flex flex-col justify-between border border-gray-800 rounded-3xl overflow-hidden"
                style={{
                  background:
                    "radial-gradient(141.61% 141.61% at 29.14% -11.49%, rgba(203, 213, 225, 0.12) 0%, rgba(203, 213, 225, 0) 57.72%)",
                }}
              >
                <div className="p-8 sm:p-10">
                  <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-5">
                    <Brain className="w-5 h-5" />
                  </div>
                  <h3 className="text-white text-2xl font-bold">
                    Discover High-Synergy Teammates
                  </h3>
                  <p className="mt-3 text-gray-400 text-sm leading-relaxed">
                    Filter by technical discipline, campus, and minimum AI match threshold. View bilateral skill radar charts and send structured swap proposals in one click.
                  </p>
                </div>
                <div className="pl-8 pt-2">
                  <Image
                    src="/images/Feature-1.svg"
                    width={600}
                    height={400}
                    className="w-full ml-auto rounded-tl-xl border-t border-l border-gray-800/80"
                    alt="Discover Teammates Feature"
                  />
                </div>
              </li>

              {/* Card 2 */}
              <li
                className="flex-1 flex flex-col justify-between border border-gray-800 rounded-3xl overflow-hidden"
                style={{
                  background:
                    "radial-gradient(141.61% 141.61% at 29.14% -11.49%, rgba(203, 213, 225, 0.12) 0%, rgba(203, 213, 225, 0) 57.72%)",
                }}
              >
                <div className="p-8 sm:p-10">
                  <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-5">
                    <Rocket className="w-5 h-5" />
                  </div>
                  <h3 className="text-white text-2xl font-bold">
                    Assemble Dream Teams with AI
                  </h3>
                  <p className="mt-3 text-gray-400 text-sm leading-relaxed">
                    Input your hackathon idea or startup mission. Our Team Gap Analyzer assesses missing capabilities and invites balanced peers to build with you.
                  </p>
                </div>
                <div className="pl-8 pt-2">
                  <Image
                    src="/images/Feature-2.svg"
                    width={600}
                    height={400}
                    className="w-full ml-auto rounded-tl-xl border-t border-l border-gray-800/80"
                    alt="Assemble Teams Feature"
                  />
                </div>
              </li>
            </ul>
          </div>
        </div>
      </SectionWrapper>

      {/* =========================================================
          FEATURES GRID (Mailgo 6-Item Radial Cards)
          ========================================================= */}
      <SectionWrapper>
        <div id="features" className="custom-screen text-gray-300">
          <LayoutEffect
            className="duration-1000 delay-200"
            isInviewState={{
              trueState: "opacity-100 translate-y-0",
              falseState: "opacity-0 translate-y-6",
            }}
          >
            <div className="max-w-xl mx-auto text-center space-y-3">
              <h2 className="text-white text-3xl font-bold sm:text-4xl tracking-tight">
                Engineered for High-Velocity Skill Sharing
              </h2>
              <p className="text-gray-400 text-sm sm:text-base">
                Everything you need to exchange knowledge, coordinate projects, and level up together.
              </p>
            </div>
          </LayoutEffect>

          <LayoutEffect
            className="duration-1000 delay-300"
            isInviewState={{
              trueState: "opacity-100",
              falseState: "opacity-0",
            }}
          >
            <div className="relative mt-14">
              <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {featuresList.map((item, idx) => (
                  <li
                    key={idx}
                    className="space-y-4 p-6 rounded-2xl border border-gray-800/80 hover:border-purple-500/40 transition-all duration-200 group"
                    style={{
                      background:
                        "radial-gradient(157.73% 157.73% at 50% -29.9%, rgba(203, 213, 225, 0.12) 0%, rgba(203, 213, 225, 0) 100%)",
                    }}
                  >
                    <div className="w-12 h-12 flex items-center justify-center bg-gray-800/90 group-hover:bg-purple-600/20 border border-gray-700/60 group-hover:border-purple-500/40 rounded-xl transition-all duration-150">
                      {item.icon}
                    </div>
                    <h3 className="text-lg text-white font-semibold">
                      {item.title}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {item.desc}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </LayoutEffect>
        </div>
      </SectionWrapper>

      {/* =========================================================
          FEATURED MENTORS & PEERS (Interactive SkillSwap Cards)
          ========================================================= */}
      {featured.length > 0 && (
        <SectionWrapper className="pt-0">
          <div className="custom-screen">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-white text-2xl sm:text-3xl font-bold tracking-tight">
                  Featured Student Mentors
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  Discover verified peers open to 1-on-1 bilateral skill swaps right now.
                </p>
              </div>
              <button
                onClick={() => onNavigateTab && onNavigateTab("students")}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-400 hover:text-purple-300"
              >
                <span>View all students</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featured.map((mentor) => (
                <div
                  key={mentor.id}
                  className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5 flex flex-col justify-between hover:border-purple-500/40 transition-all duration-200 group"
                  style={{
                    background:
                      "radial-gradient(130.39% 130.39% at 51.31% -0.71%, #1F2937 0%, rgba(17, 24, 39, 0.4) 100%)",
                  }}
                >
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <AvatarImage
                        src={mentor.avatarUrl}
                        alt={mentor.fullName}
                        size={48}
                        className="border border-purple-500/40"
                      />
                      <div className="min-w-0">
                        <h3 className="font-semibold text-white text-sm truncate">
                          {mentor.fullName}
                        </h3>
                        <p className="text-[11px] text-gray-400 truncate">
                          {mentor.university}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-gray-300 line-clamp-2 mb-4 leading-relaxed">
                      {mentor.headline}
                    </p>

                    {/* Offered skills preview */}
                    <div className="space-y-1.5 mb-4">
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
                        Teaches:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {mentor.skillsOffered.slice(0, 3).map((sk) => (
                          <span
                            key={sk.name}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-purple-600/20 text-purple-300 border border-purple-500/30"
                          >
                            {sk.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenSession(mentor)}
                    className="w-full mt-2 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-600/20 transition-all duration-150 flex items-center justify-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Request Session</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </SectionWrapper>
      )}

      {/* =========================================================
          CALL TO ACTION (Mailgo Glowing Radial Background & Pattern)
          ========================================================= */}
      <section className="relative my-8">
        <GradientWrapper wrapperClassName="max-w-md h-[16rem] top-12 inset-0">
          <div className="custom-screen py-24 sm:py-32 relative">
            <LayoutEffect
              className="duration-1000 delay-200"
              isInviewState={{
                trueState: "opacity-100 translate-y-0",
                falseState: "opacity-0 translate-y-6",
              }}
            >
              <div className="relative z-10">
                <div className="max-w-xl mx-auto text-center space-y-4">
                  <h2 className="text-white text-3xl font-bold sm:text-4xl tracking-tight">
                    Start Swapping Skills Today
                  </h2>
                  <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                    Join hundreds of collegiate builders exchanging technical expertise, finding hackathon teammates, and shipping real projects together.
                  </p>
                  <div className="pt-2 flex justify-center">
                    <button
                      onClick={() => onNavigateTab && onNavigateTab("students")}
                      className="flex items-center gap-2 text-white bg-purple-600 hover:bg-purple-500 active:bg-purple-700 px-6 py-3 rounded-full text-sm font-semibold shadow-lg shadow-purple-600/30 transition-all duration-150"
                    >
                      <span>Join the Marketplace</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </LayoutEffect>
            <Image
              src="/images/bg-pattern.webp"
              width={1000}
              height={500}
              className="w-full h-full object-cover m-auto absolute inset-0 pointer-events-none opacity-40"
              alt="Background pattern"
            />
          </div>
        </GradientWrapper>
      </section>

      {/* =========================================================
          TESTIMONIALS (Mailgo Testimonial Grid)
          ========================================================= */}
      <SectionWrapper>
        <div id="testimonials" className="custom-screen text-gray-300">
          <div className="max-w-2xl text-center md:mx-auto space-y-3">
            <h2 className="text-white text-3xl font-bold sm:text-4xl tracking-tight">
              Loved by Student Innovators Worldwide
            </h2>
            <p className="text-gray-400 text-sm sm:text-base">
              See how collegiate developers and designers level up their craft on SkillSwap AI.
            </p>
          </div>

          <GradientWrapper
            wrapperClassName="max-w-sm h-40 top-12 inset-x-0"
            className="mt-14"
          >
            <LayoutEffect
              className="duration-1000 delay-300"
              isInviewState={{
                trueState: "opacity-100 translate-y-0",
                falseState: "opacity-0 translate-y-8",
              }}
            >
              <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {testimonials.map((item, idx) => (
                  <li
                    key={idx}
                    className="p-6 rounded-2xl border border-gray-800 flex flex-col justify-between gap-y-6"
                    style={{
                      backgroundImage:
                        "radial-gradient(100% 100% at 50% 50%, rgba(124, 58, 237, 0.08) 0%, rgba(124, 58, 237, 0) 100%)",
                    }}
                  >
                    <blockquote className="text-gray-300 text-sm leading-relaxed">
                      &ldquo;{item.quote}&rdquo;
                    </blockquote>
                    <div className="flex items-center gap-x-3.5 pt-2 border-t border-gray-800/80">
                      <Image
                        src={item.avatar}
                        alt={item.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full object-cover border border-purple-500/30"
                      />
                      <div>
                        <span className="block text-white font-semibold text-sm">
                          {item.name}
                        </span>
                        <span className="block text-xs text-gray-400 mt-0.5">
                          {item.title}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </LayoutEffect>
          </GradientWrapper>
        </div>
      </SectionWrapper>

      {/* =========================================================
          PRICING / MEMBERSHIP TIERS (Mailgo Exact Pricing Layout)
          ========================================================= */}
      <SectionWrapper id="pricing">
        <div className="custom-screen">
          <div className="relative max-w-xl mx-auto text-center space-y-3">
            <h2 className="text-white text-3xl font-bold sm:text-4xl tracking-tight">
              Transparent Membership for Every Builder
            </h2>
            <p className="text-gray-400 text-sm sm:text-base">
              Peer skill swapping is always free. Upgrade for automated AI dream team matching and priority project placement.
            </p>
          </div>

          <LayoutEffect
            className="duration-1000 delay-300"
            isInviewState={{
              trueState: "opacity-100",
              falseState: "opacity-0",
            }}
          >
            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {plans.map((item, idx) => (
                <div
                  key={idx}
                  className={`relative flex flex-col justify-between rounded-2xl border ${
                    item.isMostPop
                      ? "border-purple-500 shadow-xl shadow-purple-600/10"
                      : "border-gray-800"
                  }`}
                  style={{
                    backgroundImage: item.isMostPop
                      ? "radial-gradient(130.39% 130.39% at 51.31% -0.71%, #1F2937 0%, rgba(31, 41, 55, 0.3) 100%)"
                      : "radial-gradient(130.39% 130.39% at 51.31% -0.71%, rgba(31, 41, 55, 0.4) 0%, rgba(17, 24, 39, 0) 100%)",
                  }}
                >
                  <div className="p-8 space-y-4 border-b border-gray-800 text-center">
                    <span className="text-purple-400 font-semibold text-sm uppercase tracking-wider">
                      {item.name}
                    </span>
                    <div className="text-white text-4xl font-extrabold">
                      ${item.price}{" "}
                      <span className="text-base text-gray-400 font-normal">
                        /month
                      </span>
                    </div>
                    <p className="text-gray-400 text-xs sm:text-sm">
                      {item.desc}
                    </p>
                  </div>

                  <div className="p-8 flex flex-col justify-between flex-1">
                    <ul className="space-y-3.5 mb-8">
                      {item.features.map((feat, fIdx) => (
                        <li
                          key={fIdx}
                          className="flex items-center gap-3 text-xs sm:text-sm text-gray-300"
                        >
                          <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => onNavigateTab && onNavigateTab("students")}
                      className={`w-full py-2.5 px-4 rounded-full text-sm font-semibold transition-all duration-150 ${
                        item.isMostPop
                          ? "bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30"
                          : "bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700"
                      }`}
                    >
                      {item.ctaText}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </LayoutEffect>
        </div>
      </SectionWrapper>

      {/* =========================================================
          FAQS ACCORDION (Mailgo Exact FAQ Layout)
          ========================================================= */}
      <SectionWrapper id="faqs">
        <div className="custom-screen text-gray-300">
          <div className="max-w-xl text-center xl:mx-auto space-y-3">
            <h2 className="text-white text-3xl font-bold sm:text-4xl tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-400 text-sm sm:text-base">
              Everything you need to know about peer skill swaps, AI matching, and team building.
            </p>
          </div>

          <div className="mt-14">
            <LayoutEffect
              className="duration-1000 delay-300"
              isInviewState={{
                trueState: "opacity-100 translate-y-0",
                falseState: "opacity-0 translate-y-8",
              }}
            >
              <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {faqsList.map((item, idx) => (
                  <li
                    key={idx}
                    className="p-6 rounded-2xl border border-gray-800/80 bg-gray-900/40 space-y-3"
                  >
                    <h3 className="font-semibold text-white text-base">
                      {item.q}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {item.a}
                    </p>
                  </li>
                ))}
              </ul>
            </LayoutEffect>
          </div>
        </div>
      </SectionWrapper>
    </div>
  );
}

export default HomeSection;
