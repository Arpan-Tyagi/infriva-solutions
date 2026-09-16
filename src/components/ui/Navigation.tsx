"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useScroll, useTransform } from "motion/react";
import { useState, useEffect } from "react";
import { List, X } from "@phosphor-icons/react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { scrollY } = useScroll();
  
  // Transform the pill width/background slightly on scroll
  const navWidth = useTransform(scrollY, [0, 100], ["100%", "auto"]);
  const navBg = useTransform(
    scrollY,
    [0, 100],
    ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0.7)"]
  );
  const navBackdrop = useTransform(scrollY, [0, 100], ["blur(0px)", "blur(12px)"]);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  return (
    <>
      <motion.header
        className="fixed top-6 left-0 right-0 z-50 mx-auto px-4 md:px-0 flex justify-center pointer-events-none"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          style={{ 
            backgroundColor: navBg,
            backdropFilter: navBackdrop,
            WebkitBackdropFilter: navBackdrop
          }}
          className="pointer-events-auto flex items-center justify-between px-6 py-3 rounded-full border border-black/5 ring-1 ring-white/20 shadow-sm"
        >
          <Link href="/" className="font-medium tracking-tight pr-12 flex items-center gap-2" onClick={() => setIsOpen(false)}>
            <img src="/logo.png" alt="Infriva Solutions Logo" className="w-6 h-6 object-contain" />
            <span>Infriva</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm tracking-wide transition-colors ${
                    isActive ? "text-brand-900 font-medium" : "text-black/60 hover:text-black"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:flex pl-12">
            <Link
              href="/contact"
              className="text-sm font-medium px-4 py-2 rounded-full bg-brand-900 text-white hover:bg-black transition-colors"
            >
              Start a project
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden p-2 -mr-2 text-brand-900 focus:outline-none z-[60]"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <motion.div
              animate={{ rotate: isOpen ? 45 : 0 }}
              transition={{ duration: 0.3 }}
              className="relative w-6 h-6 flex items-center justify-center"
            >
              {isOpen ? <X weight="light" size={24} /> : <List weight="light" size={24} />}
            </motion.div>
          </button>
        </motion.div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <motion.div
        initial={false}
        animate={{
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
        }}
        transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
        className="fixed inset-0 z-40 bg-white/95 backdrop-blur-xl flex flex-col justify-center items-center"
      >
        <nav className="flex flex-col items-center gap-8">
          {navLinks.map((link, i) => (
            <motion.div
              key={link.href}
              initial={false}
              animate={{
                y: isOpen ? 0 : 20,
                opacity: isOpen ? 1 : 0,
              }}
              transition={{
                duration: 0.4,
                delay: isOpen ? i * 0.05 + 0.1 : 0,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <Link
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-3xl font-medium tracking-tight text-brand-900"
              >
                {link.label}
              </Link>
            </motion.div>
          ))}
        </nav>
      </motion.div>
    </>
  );
}
