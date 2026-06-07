import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const HIDDEN_PREFIXES = ["/get-started", "/sign-up", "/onboarding", "/dashboard"];

export function BackToTop() {
  const [visible, setVisible] = useState(false);
  const [nearFooter, setNearFooter] = useState(false);
  const [location] = useLocation();
  const hide = HIDDEN_PREFIXES.some((p) => location.startsWith(p));

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const footer = document.querySelector("[data-site-footer]");

    if (!footer) {
      setNearFooter(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setNearFooter(Boolean(entry?.isIntersecting)),
      { threshold: 0.01 },
    );

    observer.observe(footer);
    return () => observer.disconnect();
  }, [location]);

  if (hide) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          key="back-to-top"
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          onClick={() =>
            window.scrollTo({ top: 0, left: 0, behavior: "smooth" })
          }
          aria-label="Back to top"
          className={cn(
            "fixed right-6 z-40 w-12 h-12 rounded-full bg-white text-black shadow-[0_0_30px_rgba(20,184,166,0.35)] hover:scale-110 active:scale-95 transition-all flex items-center justify-center border border-white/20",
            nearFooter ? "bottom-24 md:bottom-28" : "bottom-6",
          )}
        >
          <ArrowUp className="w-5 h-5" strokeWidth={2.4} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
