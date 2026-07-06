import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import iconDark from "@assets/jaabili-icon-dark.png";
import iconLight from "@assets/jaabili-icon-light.png";

export function BrandPreloader({ show }: { show: boolean }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const icon = mounted && resolvedTheme === "light" ? iconLight : iconDark;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="brand-preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.45, ease: "easeOut" } }}
          className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-background"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(20,184,166,0.18),transparent_34%),radial-gradient(circle_at_60%_70%,rgba(139,92,246,0.14),transparent_32%)]" />
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="relative flex flex-col items-center"
          >
            <div className="relative flex h-32 w-32 items-center justify-center sm:h-36 sm:w-36">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3.6, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border border-transparent border-t-primary/80 border-r-secondary/50"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 5.2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-3 rounded-full border border-transparent border-b-accent/70 border-l-foreground/20"
              />
              <motion.img
                src={icon}
                alt="Jaabili Tech Solutions"
                className="relative z-10 h-20 w-auto object-contain drop-shadow-[0_0_28px_rgba(20,184,166,0.55)] sm:h-24"
                animate={{
                  scale: [1, 1.05, 1],
                  filter: [
                    "drop-shadow(0 0 20px rgba(20,184,166,0.45))",
                    "drop-shadow(0 0 32px rgba(250,204,21,0.35))",
                    "drop-shadow(0 0 20px rgba(20,184,166,0.45))",
                  ],
                }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
            <div className="mt-8 h-1 w-40 overflow-hidden rounded-full bg-foreground/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary via-secondary to-accent"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 1.15, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
