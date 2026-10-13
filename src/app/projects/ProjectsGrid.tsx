"use client";

import { Reveal } from "@/components/ui/Reveal";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { PROJECTS_LIST, type ProjectItem } from "@/lib/projects";

interface ProjectCardProps {
  project: ProjectItem;
  index: number;
}

function ProjectCard({ project, index }: ProjectCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], reduceMotion ? ["0%", "0%"] : ["-15%", "15%"]);

  return (
    <Reveal delay={index * 0.08}>
      <Link href={`/projects/${project.id}`} className="group block mb-24 md:mb-32">
        <div
          ref={ref}
          className="relative w-full aspect-[4/3] md:aspect-[16/9] rounded-none overflow-hidden mb-8 border border-black/5 bg-brand-100"
        >
          <motion.div
            style={{ y }}
            className="absolute inset-[-20%] w-[140%] h-[140%] flex items-center justify-center"
          >
            <Image
              src={project.heroImage}
              alt={project.heroImageAlt}
              fill
              className="object-cover transition-transform duration-1000 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:scale-105"
              priority={index === 0}
              loading={index === 0 ? undefined : "lazy"}
              sizes="(max-width: 768px) 100vw, 80vw"
            />
            <div className="absolute inset-0 bg-brand-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-[cubic-bezier(0.76,0,0.24,1)]" />

            <div className="relative z-10 text-4xl md:text-8xl tracking-tight-display font-medium text-white opacity-0 group-hover:opacity-100 group-hover:scale-110 translate-y-4 group-hover:translate-y-0 transition-all duration-700 ease-[cubic-bezier(0.76,0,0.24,1)]">
              {project.title}
            </div>
          </motion.div>
        </div>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl tracking-tight-display font-medium mb-2">
              {project.title}
            </h2>
            <div className="text-sm font-mono text-black/40 mb-4">
              {project.category} &bull; {project.year}
            </div>
            <p className="text-black/70 text-pretty mb-6 leading-relaxed">{project.shortDesc}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-black/10">
              {project.results.map((r) => (
                <div key={r.label}>
                  <div className="text-lg font-medium tracking-tight-display text-brand-900">
                    {r.value}
                  </div>
                  <div className="text-xs text-black/50">{r.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="w-12 h-12 rounded-full border border-black/10 flex items-center justify-center group-hover:bg-brand-900 group-hover:text-white group-hover:-translate-y-1 group-hover:translate-x-1 transition-all duration-300 shrink-0">
            <ArrowUpRight size={20} weight="light" />
          </div>
        </div>
      </Link>
    </Reveal>
  );
}

export function ProjectsGrid() {
  return (
    <div className="flex flex-col">
      {PROJECTS_LIST.map((p, i) => (
        <ProjectCard key={p.id} project={p} index={i} />
      ))}
    </div>
  );
}
