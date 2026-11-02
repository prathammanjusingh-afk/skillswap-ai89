/*
  HomeSection – Premium homepage UI for SkillSwap AI.
  Uses shadcn/ui components and Tailwind dark‑navy theme.
  Props are kept minimal; the parent page passes the required data
  and handler callbacks.
*/

"use client";

import React from "react";
import { StudentProfile } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AvatarImage } from "@/components/ui/avatar-image";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Search } from "lucide-react";

interface HomeSectionProps {
  students: StudentProfile[];
  currentUser: StudentProfile;
  onOpenSession: (partner: StudentProfile) => void;
}

export function HomeSection({ students, currentUser, onOpenSession }: HomeSectionProps) {
  // Only public profiles can be featured mentors (excluding self)
  const featured = students
    .filter((mentor) => mentor.isPublic === true && mentor.id !== currentUser.id)
    .slice(0, 4);

  return (
    <div className="flex flex-col gap-12 py-12">
      {/* Hero */}
      <section className="text-center flex flex-col items-center gap-6">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
          Your Skills Are Worth More When Shared.
        </h1>
        <p className="text-lg text-slate-300 max-w-xl">
          Connect with experts, teach what you know, and learn new capabilities through AI‑matched collaborations.
        </p>
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Search skills, mentors, projects..."
            className="pl-10 bg-navy-900/80 text-slate-200 placeholder-slate-500 focus-visible:ring-cyan-500"
          />
        </div>
        <Button
          variant="glow"
          className="bg-gradient-to-r from-cyan-500 to-indigo-500 text-white hover:shadow-lg"
        >
          Explore Marketplace
        </Button>
      </section>

      {/* Popular Categories – simple placeholder carousel */}
      <section>
        <h2 className="text-2xl font-semibold text-white mb-4">Popular Categories</h2>
        <Carousel className="w-full">
          <CarouselContent className="-ml-4">
            {[
              "Frontend Engineering",
              "Backend Systems",
              "AI & Machine Learning",
              "UI/UX Design",
              "DevOps & Cloud",
            ].map((cat) => (
              <CarouselItem key={cat} className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
                <Card className="bg-navy-900 hover:bg-navy-800 transition-colors p-4 text-center">
                  <Badge variant="secondary" className="mb-2 bg-cyan-500/20 text-cyan-300">
                    {cat}
                  </Badge>
                  <p className="text-slate-300">Explore {cat} mentors & projects</p>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </section>

      {/* Featured Mentors */}
      <section>
        <h2 className="text-2xl font-semibold text-white mb-4">Featured Mentors</h2>
        {featured.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {featured.map((mentor) => (
              <Card key={mentor.id} className="bg-navy-900 hover:bg-navy-800 transition-colors p-4 flex flex-col items-center">
                <AvatarImage src={mentor.avatarUrl} alt={mentor.fullName} className="w-20 h-20 mb-3 rounded-full" />
                <h3 className="text-lg font-medium text-white text-center">{mentor.fullName}</h3>
                <p className="text-sm text-slate-400 text-center mb-2">{mentor.headline}</p>
                <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-300 mb-3">
                  {mentor.university}
                </Badge>
                <Button
                  variant="outline"
                  className="w-full text-sm"
                  onClick={() => onOpenSession(mentor)}
                >
                  Connect
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center rounded-2xl border border-slate-800 bg-navy-900/50 text-slate-400 text-xs">
            No public student mentors available yet. Make your profile public to be featured here!
          </div>
        )}
      </section>
    </div>
  );
}
