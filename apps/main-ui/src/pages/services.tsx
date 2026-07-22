import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AnimatedHeadline } from "@/components/ui/animated-headline";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { Link } from "wouter";

gsap.registerPlugin(ScrollTrigger);

export default function Services() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.utils.toArray('.reveal-up').forEach((elem: any) => {
      gsap.fromTo(elem, 
        { y: 50, opacity: 0, filter: "blur(10px)" },
        {
          y: 0, opacity: 1, filter: "blur(0px)",
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: elem,
            start: "top 85%",
          }
        }
      );
    });
  }, { scope: containerRef });

  const services = [
    {
      title: "Nova, your website sales agent",
      desc: "Set it up yourself in a short conversation — what you sell, who you sell to. It reads your content, answers visitors, and qualifies leads. Free to start.",
      tag: "Live now"
    },
    {
      title: "Onboarding help, if you want it",
      desc: "Most people set up Nova alone in minutes. If your business is more complex, we'll walk through setup with you directly.",
      tag: "Included"
    },
    {
      title: "A model trained for your business",
      desc: "Once you're on a paid plan, your agent's replies come from a version of our model tuned specifically for how you sell — not a generic assistant repurposed for the job.",
      tag: "Paid plans"
    },
    {
      title: "Something we haven't built yet?",
      desc: "If your business needs something our current agents don't cover, tell us. We'd rather hear it and say honestly whether we can build it than sell you a feature that doesn't exist.",
      tag: "Talk to us"
    }
  ];

  return (
    <div className="bg-background min-h-screen pt-32 pb-20" ref={containerRef}>
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="text-center mb-24">
          <h2 className="text-sm text-primary tracking-widest uppercase mb-4 font-semibold">How it works</h2>
          <AnimatedHeadline text="What you actually get" as="h1" className="text-5xl md:text-7xl text-foreground mb-6 justify-center font-display font-bold tracking-tighter" />
          <p className="text-xl text-foreground/60 max-w-3xl mx-auto reveal-up leading-relaxed">
            No agency package, no scoping call required to start. Set up an agent, see what it does, decide if it's worth paying for.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          {services.map((service, idx) => (
            <div key={idx} className="glass-panel p-10 rounded-3xl reveal-up border border-border hover:border-primary/30 transition-colors bg-card/30">
              <span className="text-xs uppercase tracking-widest text-primary mb-4 block font-bold">{service.tag}</span>
              <h3 className="text-2xl font-display font-bold text-foreground mb-4 tracking-tight">{service.title}</h3>
              <p className="text-foreground/60 text-lg leading-relaxed">{service.desc}</p>
            </div>
          ))}
        </div>

        <div className="glass-panel p-12 rounded-3xl text-center reveal-up border border-primary/20 bg-primary/5">
          <h3 className="text-3xl font-display font-bold text-foreground mb-4 tracking-tight">Not sure what you need?</h3>
          <p className="text-foreground/60 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
            Tell us what your business does and where things get stuck. We'll tell you plainly whether an agent can help.
          </p>
          <Link href="/contact">
            <MagneticButton variant="primary" className="text-lg">Talk to us</MagneticButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
