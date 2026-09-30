"use client"; // Marks this as a Client Component, allowing React hooks and Framer Motion

import Link from "next/link";
import { LogoHorizontal } from "@/components/ui/LogoHorizontal";
import { LogoVertical } from "@/components/ui/LogoVertical";
import { usePathname } from "next/navigation";
import { motion, useScroll, useTransform } from "motion/react";
import { useState, useEffect } from "react";
import { List, X } from "@phosphor-icons/react";

// Array of navigation links for easy mapping and centralized management.
const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export function Navigation() {
  // usePathname hook from Next.js to determine the current active route for link highlighting.
  const pathname = usePathname();
  
  // State to manage the open/close status of the mobile menu overlay.
  const [isOpen, setIsOpen] = useState(false);
  
  // Framer Motion's useScroll hook tracks the window scroll position.
  const { scrollY } = useScroll();
  
  // Create dynamic styles based on scroll position using useTransform.
  // As the user scrolls from 0 to 100px, the navigation background gradually becomes visible (70% opacity white).
  const navBg = useTransform(
    scrollY,
    [0, 100], // Scroll offset range
    ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0.7)"] // Output color range
  );
  
  // As the user scrolls, apply a background blur effect behind the navigation bar.
  const navBackdrop = useTransform(scrollY, [0, 100], ["blur(0px)", "blur(12px)"]);

  const navBorder = useTransform(
    scrollY,
    [0, 100],
    ["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0.08)"]
  );

  // Dynamic detection of dark vs light background beneath the header on mobile
  const [isOverDark, setIsOverDark] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Reset state on route change to prevent stale contrast from previous page
    queueMicrotask(() => {
      setIsOverDark(false);
    });

    const darkElements = Array.from(
      document.querySelectorAll<HTMLElement>(
        '.bg-brand-900, .bg-black, [data-theme="dark"], [class*="bg-[#0A0A0B]"]'
      )
    ).filter((el) => {
      if (el.closest("header")) return false;
      const tag = el.tagName.toUpperCase();
      if (tag === "BUTTON" || tag === "SPAN" || tag === "A" || tag === "INPUT") return false;
      const rect = el.getBoundingClientRect();
      // Only observe substantial sections / containers (>=80px height, >=200px width), ignoring small badges or dots
      return rect.height >= 80 && rect.width >= 200;
    });

    if (darkElements.length === 0) {
      return;
    }

    const intersectingElements = new Set<Element>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            intersectingElements.add(entry.target);
          } else {
            intersectingElements.delete(entry.target);
          }
        }
        setIsOverDark(intersectingElements.size > 0);
      },
      {
        root: null,
        rootMargin: "0px 0px -90% 0px",
        threshold: 0,
      }
    );

    darkElements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [pathname]);

  // useEffect hook to lock body scrolling when the mobile menu is open.
  // This prevents the user from scrolling the background page while navigating the menu.
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"; // Disable scroll
    } else {
      document.body.style.overflow = ""; // Re-enable scroll
    }
  }, [isOpen]);

  return (
    <>
      {/* 
        Main Navigation Header Wrapper
        Uses motion.header for entry animation on page load.
        It is fixed to the top and centered horizontally.
      */}
      <motion.header
        className="fixed top-6 left-0 right-0 z-50 mx-auto px-4 md:px-0 flex justify-center pointer-events-none"
        initial={{ y: -20, opacity: 0 }} // Start slightly above and invisible
        animate={{ y: 0, opacity: 1 }} // Slide down into place and fade in
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} // Custom cubic bezier curve for smooth physical feel
      >
        {/* 
          The pill-shaped navigation container.
          Applies the dynamic background color and blur based on scroll position.
          Pointer events are re-enabled here so links are clickable.
        */}
        <motion.div
          className="pointer-events-auto relative w-full md:w-auto flex items-center justify-between px-4 md:px-6 py-3"
        >
          {/* Frosted Glass Pill Background - Desktop Only */}
          <motion.div
            style={{
              backgroundColor: navBg,
              backdropFilter: navBackdrop,
              WebkitBackdropFilter: navBackdrop,
              borderColor: navBorder,
            }}
            className="hidden md:block absolute inset-0 rounded-full border border-black/5 ring-1 ring-white/20 shadow-sm -z-10 pointer-events-none"
          />

          {/* Logo Link to Home */}
          <Link 
            href="/" 
            aria-label="Infriva Home"
            className={`pr-12 flex items-center justify-center transition-opacity hover:opacity-80 transition-colors duration-300 ${
              !isOpen && isOverDark ? "text-white" : "text-brand-900"
            } md:text-brand-900`} 
            onClick={() => setIsOpen(false)}
          >
            <LogoHorizontal className="h-6 md:h-7 w-auto text-current" />
          </Link>

          {/* Desktop Navigation Links (hidden on mobile via Tailwind 'hidden md:flex') */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              // Check if the current route matches this link's href to highlight it.
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm tracking-tight transition-colors ${
                    isActive ? "text-brand-900 font-medium" : "text-black/60 hover:text-black"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* CTA Button in Desktop Navigation */}
          <div className="hidden md:flex pl-12">
            <Link
              href="/contact"
              className="text-sm font-medium px-4 py-2 rounded-full bg-brand-900 text-white hover:bg-black transition-colors"
            >
              Start a project
            </Link>
          </div>

          {/* Mobile Hamburger/Close Toggle Button */}
          <button
            className={`md:hidden p-3 -mr-3 focus:outline-none z-[60] transition-colors duration-300 ${
              isOpen || !isOverDark ? "text-brand-900" : "text-white"
            }`}
            onClick={() => setIsOpen(!isOpen)} // Toggle mobile menu state
            aria-expanded={isOpen}
            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {/* Animate rotation when opening/closing the menu */}
            <motion.div
              animate={{ rotate: isOpen ? 45 : 0 }}
              transition={{ duration: 0.3 }}
              className="relative w-6 h-6 flex items-center justify-center"
            >
              {/* Swap between Phosphor icons based on state */}
              {isOpen ? <X weight="light" size={24} /> : <List weight="light" size={24} />}
            </motion.div>
          </button>
        </motion.div>
      </motion.header>

      {/* 
        Mobile Menu Full-Screen Overlay 
        Uses Framer Motion to handle open/close states dynamically.
      */}
      <motion.div
        initial={false} // Prevents animation on initial hydration
        animate={{
          opacity: isOpen ? 1 : 0, // Fade in/out
          pointerEvents: isOpen ? "auto" : "none", // Prevent clicks when hidden
        }}
        transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }} // Smooth easing
        className="fixed inset-0 z-40 bg-white/95 backdrop-blur-xl flex flex-col justify-center items-center"
        inert={!isOpen}
        aria-hidden={!isOpen}
      >
        <motion.div
          initial={false}
          animate={{ y: isOpen ? 0 : 20, opacity: isOpen ? 1 : 0 }}
          transition={{ duration: 0.4, delay: isOpen ? 0.1 : 0, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12"
        >
          <LogoVertical className="h-24 w-auto text-brand-900 opacity-20" />
        </motion.div>
        
        <nav className="flex flex-col items-center gap-8">
          {navLinks.map((link, i) => (
            // Staggered entrance animation for each mobile menu link.
            // Links slide up and fade in one after another when the menu opens.
            <motion.div
              key={link.href}
              initial={false}
              animate={{
                y: isOpen ? 0 : 20, // Slide up if open, down if closed
                opacity: isOpen ? 1 : 0, // Fade in if open
              }}
              transition={{
                duration: 0.4,
                delay: isOpen ? i * 0.05 + 0.1 : 0, // Stagger delay based on index (i)
                ease: [0.16, 1, 0.3, 1], // Physical easing
              }}
            >
              <Link
                href={link.href}
                onClick={() => setIsOpen(false)} // Close menu on click
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





