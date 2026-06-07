import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

interface AnimatedHeadlineProps {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  delay?: number;
}

export function AnimatedHeadline({ text, className, as: Component = "h1", delay = 0 }: AnimatedHeadlineProps) {
  const containerRef = useRef<HTMLHeadingElement>(null);

  useGSAP(() => {
    if (!containerRef.current) return;

    const chars = containerRef.current.querySelectorAll('.char');
    
    gsap.fromTo(
      chars,
      {
        y: 100,
        opacity: 0,
        rotateX: -90,
        transformOrigin: "0% 50% -50",
      },
      {
        y: 0,
        opacity: 1,
        rotateX: 0,
        stagger: 0.02,
        duration: 1,
        ease: "power4.out",
        delay,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 85%",
        }
      }
    );
  }, { scope: containerRef });

  return (
    <Component
      ref={containerRef}
      className={cn("flex flex-wrap overflow-hidden perspective-1000", className)}
    >
      {text.split(" ").map((word, wordIndex) => (
        <span key={wordIndex} className="inline-flex mr-[0.25em] overflow-hidden">
          {word.split("").map((char, charIndex) => (
            <span
              key={charIndex}
              className="char inline-block"
              style={{ willChange: "transform, opacity" }}
            >
              {char}
            </span>
          ))}
        </span>
      ))}
    </Component>
  );
}
