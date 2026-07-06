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
      title: "Custom AI Agents",
      desc: "Bespoke intelligent agents trained exclusively on your business logic, data, and brand voice.",
      tag: "Flagship"
    },
    {
      title: "Business Automation Consulting",
      desc: "Deep-dive analysis of your operational bottlenecks, architecting a comprehensive automation roadmap.",
      tag: "Strategy"
    },
    {
      title: "CRM Integrations",
      desc: "Connecting our intelligent systems with your existing tech stack (Salesforce, HubSpot, custom DBs) for unified data flow.",
      tag: "Engineering"
    },
    {
      title: "AI Dashboards",
      desc: "Real-time analytics interfaces to monitor agent performance, conversation quality, and ROI metrics.",
      tag: "Analytics"
    },
    {
      title: "Templates Marketplace",
      desc: "Pre-configured, quick-deploy agent templates tailored for Interior Design, Real Estate, and E-commerce.",
      tag: "Scalable"
    }
  ];

  return (
    <div className="bg-background min-h-screen pt-32 pb-20" ref={containerRef}>
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="text-center mb-24">
          <h2 className="text-sm text-primary tracking-widest uppercase mb-4 font-semibold">Expertise</h2>
          <AnimatedHeadline text="Done-For-You Solutions" as="h1" className="text-5xl md:text-7xl text-foreground mb-6 justify-center font-display font-bold tracking-tighter" />
          <p className="text-xl text-foreground/60 max-w-3xl mx-auto reveal-up leading-relaxed">
            We don't just hand you software. We architect, build, and deploy the entire autonomous system for you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          {services.map((service, idx) => (
            <div key={idx} className={`glass-panel p-10 rounded-3xl reveal-up border border-border hover:border-primary/30 transition-colors bg-card/30 ${idx === 4 ? 'md:col-span-2' : ''}`}>
              <span className="text-xs uppercase tracking-widest text-primary mb-4 block font-bold">{service.tag}</span>
              <h3 className="text-2xl font-display font-bold text-foreground mb-4 tracking-tight">{service.title}</h3>
              <p className="text-foreground/60 text-lg leading-relaxed">{service.desc}</p>
            </div>
          ))}
        </div>

        <div className="glass-panel p-12 rounded-3xl text-center reveal-up border border-primary/20 bg-primary/5">
          <h3 className="text-3xl font-display font-bold text-foreground mb-4 tracking-tight">Need a custom architecture?</h3>
          <p className="text-foreground/60 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
            Complex workflows require sophisticated engineering. Let's discuss your unique operational challenges and architect a tailored AI solution.
          </p>
          <Link href="/contact">
            <MagneticButton variant="primary" className="text-lg">Talk to Engineering</MagneticButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
