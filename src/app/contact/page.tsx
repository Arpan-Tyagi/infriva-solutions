"use client"; // Marks this as a Client Component, allowing React hooks and Framer Motion

import { Reveal } from "@/components/ui/Reveal"; // Custom component for scroll-based fade-up animations
import { Ticker } from "@/components/ui/Ticker"; // Custom number animation component
import { ArrowUpRight, CaretDown } from "@phosphor-icons/react/dist/ssr"; // Scalable SVG icons from Phosphor
import { motion, AnimatePresence } from "motion/react"; // Framer Motion components
import { useState, useRef, useEffect } from "react"; // React hooks for managing state and effects

interface CustomSelectProps {
  id: string;
  listId: string;
  name: string;
  label: string;
  options: string[];
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
}

// Reusable custom select dropdown component with synced state, outside-click, and escape dismiss
function CustomSelect({ id, listId, name, label, options, placeholder, value, onChange }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="flex flex-col gap-2 relative">
      <label htmlFor={id} className="text-sm font-medium tracking-tight">{label}</label>
      
      <div 
        id={id}
        role="combobox"
        aria-controls={listId}
        aria-expanded={isOpen}
        tabIndex={0}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsOpen(!isOpen); } }}
        className="w-full bg-brand-50 border border-black/10 rounded-xl px-4 py-3 cursor-pointer flex justify-between items-center text-brand-900 transition-colors hover:border-black/30"
      >
        <span className={value ? "text-brand-900 font-medium" : "text-black/30"}>{value || placeholder}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3, ease: [0.76, 0, 0.24, 1] }}>
          <CaretDown size={16} className="opacity-50" />
        </motion.div>
      </div>
      
      <input type="hidden" name={name} value={value} />
      
      <select 
        name={`native_${name}`} 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        tabIndex={-1} 
        aria-hidden="true" 
        className="sr-only"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            id={listId}
            role="listbox"
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2, ease: [0.76, 0, 0.24, 1] }}
            className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl border border-black/5 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] z-50 overflow-hidden origin-top"
          >
            {options.map((opt) => (
              <div 
                key={opt}
                role="option"
                aria-selected={value === opt}
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                className={`px-4 py-3 cursor-pointer text-sm transition-colors ${
                  value === opt ? "bg-brand-50 text-brand-900 font-medium" : "hover:bg-brand-50"
                }`}
              >
                {opt}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Contact() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [service, setService] = useState("");
  const [budget, setBudget] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const form = e.currentTarget;

    if (!service) {
      setStatus("error");
      setErrorMessage("Please select a required service.");
      return;
    }

    const formData = new FormData(form);
    const data = {
      name: formData.get("name"),
      company: formData.get("company"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      service: service || formData.get("Service Required"),
      budget: budget || formData.get("Budget Range"),
      details: formData.get("details"),
      _hp_website: formData.get("_hp_website"),
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus("success");
        form.reset();
        setService("");
        setBudget("");
        setTimeout(() => setStatus("idle"), 5000);
      } else {
        setStatus("error");
        setErrorMessage(result.error || "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Failed to send message. Please try again.");
    }
  };

  return (
    // Main page layout wrapper with padding and min-height
    <div className="w-full pt-32 pb-8 md:pt-40 md:pb-24 px-4 md:px-12 min-h-[calc(100vh-400px)]">
      {/* Responsive layout: column on mobile, row on large screens */}
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-24">
        
        {/* Left Column: Headline and Trust Indicators */}
        <div className="w-full lg:w-[38.2%] flex flex-col justify-between">
          <div>
            {/* Animated Eyebrow tag */}
            <Reveal className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-black/5 mb-8">
              <span className="w-2 h-2 rounded-full bg-brand-900" />
              <span className="text-[10px] tracking-widest-caps font-medium text-brand-900">Initiate</span>
            </Reveal>
            
            {/* Main Headline */}
            <Reveal delay={0.1}>
              <h1 className="text-5xl md:text-7xl tracking-tight-display leading-[1.05] font-medium text-balance mb-8">
                Let&apos;s build <br className="hidden md:block" /> <span className="text-black/40">the</span> exceptional.
              </h1>
            </Reveal>
            
            {/* Subtitle */}
            <Reveal delay={0.2}>
              <p className="text-lg text-black/60 max-w-sm text-pretty mb-16">
                Frictionless lead capture. Tell us about your project requirements and we will orchestrate the digital architecture.
              </p>
            </Reveal>
          </div>
          
          {/* Stats grid section with animated numbers */}
          <Reveal delay={0.3}>
            <div className="grid grid-cols-2 gap-8 border-t border-black/10 pt-8">
              {/* Stat 1 */}
              <div>
                <div className="text-3xl tracking-tight-display font-medium mb-1"><Ticker value={100} suffix="+" /></div>
                <div className="text-sm font-mono text-black/40">Enterprise Deployments</div>
              </div>
              {/* Stat 2 */}
              <div>
                <div className="text-3xl tracking-tight-display font-medium mb-1"><Ticker value={250} suffix="+" /></div>
                <div className="text-sm font-mono text-black/40">Projects Delivered</div>
              </div>
              {/* Stat 3 */}
              <div>
                <div className="text-3xl tracking-tight-display font-medium mb-1"><Ticker value={5} suffix="+" /></div>
                <div className="text-sm font-mono text-black/40">Years Experience</div>
              </div>
              {/* Stat 4 */}
              <div>
                <div className="text-3xl tracking-tight-display font-medium mb-1"><Ticker value={4.9} suffix="/5" /></div>
                <div className="text-sm font-mono text-black/40">Client Rating</div>
              </div>
            </div>
          </Reveal>
        </div>
        
        {/* Right Column: High-end Contact Form */}
        <div className="w-full lg:w-[61.8%] max-w-full overflow-hidden">
          <Reveal delay={0.4} className="bg-brand-50 rounded-none p-2 border border-black/5 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.05)] w-full">
              <div className="bg-white rounded-none p-6 md:p-12 border border-black/5 shadow-[inset_0_1px_1px_rgba(0,0,0,0.02)]">
                {/* Form wrapper */}
                <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
                  {/* Honeypot field for bot deterrence */}
                  <input type="text" name="_hp_website" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />
                  
                  {/* Grid for standard input fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Name Input */}
                    <div className="flex flex-col gap-2">
                      <label htmlFor="name" className="text-sm font-medium tracking-tight">Full Name</label>
                      <input 
                        type="text" 
                        id="name"
                        name="name"
                        required
                        minLength={2}
                        className="w-full bg-brand-50 border border-black/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900 transition-colors text-brand-900 placeholder:text-black/30"
                        placeholder="Aarav Sharma"
                        disabled={status === "loading"}
                      />
                    </div>
                    {/* Company Input */}
                    <div className="flex flex-col gap-2">
                      <label htmlFor="company" className="text-sm font-medium tracking-tight">Company Name</label>
                      <input 
                        type="text" 
                        id="company"
                        name="company"
                        required
                        className="w-full bg-brand-50 border border-black/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900 transition-colors text-brand-900 placeholder:text-black/30"
                        placeholder="Vanguard Retail"
                        disabled={status === "loading"}
                      />
                    </div>
                    {/* Email Input */}
                    <div className="flex flex-col gap-2">
                      <label htmlFor="email" className="text-sm font-medium tracking-tight">Email Address</label>
                      <input 
                        type="email" 
                        id="email"
                        name="email"
                        required
                        className="w-full bg-brand-50 border border-black/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900 transition-colors text-brand-900 placeholder:text-black/30"
                        placeholder="aarav@vanguard.io"
                        disabled={status === "loading"}
                      />
                    </div>
                    {/* Phone Input */}
                    <div className="flex flex-col gap-2">
                      <label htmlFor="phone" className="text-sm font-medium tracking-tight">Phone Number</label>
                      <input 
                        type="tel" 
                        id="phone"
                        name="phone"
                        className="w-full bg-brand-50 border border-black/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900 transition-colors text-brand-900 placeholder:text-black/30"
                        placeholder="+91 00000 00000"
                        disabled={status === "loading"}
                      />
                    </div>
                  </div>
                  
                  {/* Custom Dropdown: Service Required */}
                  <CustomSelect 
                    id="select-service-trigger"
                    listId="select-service-list"
                    name="Service Required"
                    label="Service Required" 
                    placeholder="Select a service..."
                    options={[
                      "Web Dev & UI/UX Design",
                      "Custom CRM Systems",
                      "Full-Stack SEO & GEO",
                      "Paid Advertising Management",
                      "Premium Content Creation",
                      "Social Media Management",
                      "Retention Marketing"
                    ]} 
                    value={service}
                    onChange={setService}
                  />

                  {/* Custom Dropdown: Budget Range */}
                  <CustomSelect 
                    id="select-budget-trigger"
                    listId="select-budget-list"
                    name="Budget Range"
                    label="Budget Range" 
                    placeholder="Select your budget..."
                    options={["Below ₹15,000", "₹15,000 - ₹30,000", "₹30,000 - ₹50,000", "₹50,000 - ₹1,00,000", "Above ₹1,00,000"]} 
                    value={budget}
                    onChange={setBudget}
                  />

                  {/* Textarea for Project Details */}
                  <div className="flex flex-col gap-2">
                    <label htmlFor="details" className="text-sm font-medium tracking-tight">Project Details</label>
                    <textarea 
                      id="details"
                      name="details"
                      rows={4}
                      className="w-full bg-brand-50 border border-black/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900 transition-colors text-brand-900 placeholder:text-black/30 resize-none"
                      placeholder="Tell us about your objectives..."
                      disabled={status === "loading"}
                    />
                  </div>

                  {/* Status Messages */}
                  <AnimatePresence>
                    {status === "success" && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-4 bg-green-50 text-green-800 rounded-xl border border-green-200 text-sm font-medium">
                        Inquiry submitted successfully. We will orchestrate a response shortly.
                      </motion.div>
                    )}
                    {status === "error" && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-4 bg-red-50 text-red-800 rounded-xl border border-red-200 text-sm font-medium">
                        {errorMessage}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* Submit Button with hover effect */}
                  <button
                    type="submit"
                    disabled={status === "loading" || status === "success"}
                    className="pressable group relative flex items-center justify-center gap-4 pl-8 pr-6 py-4 bg-brand-900 text-white rounded-xl hover:bg-black w-full mt-4 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {/* Inner highlight overlay that scales up on click/tap */}
                    <motion.div 
                      className="absolute inset-0 bg-white/10"
                      initial={{ scale: 0, opacity: 0 }}
                      whileTap={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                    <span className="font-medium tracking-tight text-sm relative z-10">
                      {status === "loading" ? "Sending..." : status === "success" ? "Sent" : "Submit Inquiry"}
                    </span>
                    {/* Icon container with group-hover animation */}
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:translate-x-1 group-hover:-translate-y-[1px] group-hover:scale-105 transition-transform duration-300 relative z-10">
                      <ArrowUpRight weight="light" size={16} />
                    </div>
                  </button>
                </form>
              </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}

