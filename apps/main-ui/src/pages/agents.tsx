import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AnimatedHeadline } from "@/components/ui/animated-headline";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { Link } from "wouter";

gsap.registerPlugin(ScrollTrigger);

export default function Agents() {
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

  const agents = [
    {
      title: "Nova",
      kicker: "Website Sales Agent",
      description: "An always-on chat widget for your website that greets visitors, answers FAQs, and captures qualified leads — sorted hot, medium, or low — straight into your dashboard.",
      capabilities: ["FAQ Answers From Your Content", "Lead Capture & Qualification", "Instant Owner Notifications", "Full Conversation History"],
      channels: ["Website"],
      color: "from-primary/20 to-transparent",
      href: "/agents/website-sales",
      action: "Test Nova"
    }
  ];

  return (
    <div className="bg-background min-h-screen pt-32 pb-20" ref={containerRef}>
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="text-center mb-24">
          <h2 className="text-sm text-primary tracking-widest uppercase mb-4 font-semibold">Live Now</h2>
          <AnimatedHeadline text="Autonomous Agents" as="h1" className="text-5xl md:text-7xl text-foreground mb-6 justify-center font-display font-bold tracking-tighter" />
          <p className="text-xl text-foreground/60 max-w-3xl mx-auto reveal-up leading-relaxed">
            We're rolling out autonomous agents one at a time, built and tested before they ship. Here's what's live today.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-12 mb-32">
          {agents.map((agent, idx) => (
            <div key={idx} className={`glass-panel p-8 md:p-12 rounded-3xl relative overflow-hidden reveal-up group border border-border hover:border-border transition-colors bg-card/30`}>
              <div className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl ${agent.color} rounded-full blur-[100px] pointer-events-none group-hover:scale-110 transition-transform duration-1000`} />
              
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-2">{agent.kicker}</p>
                  <h3 className="text-3xl font-display font-bold text-foreground mb-4 tracking-tight">{agent.title}</h3>
                  <p className="text-foreground/60 text-lg leading-relaxed mb-8">{agent.description}</p>
                  
                  <div className="mb-6">
                    <h4 className="text-sm uppercase tracking-widest text-foreground/40 mb-3">Channels</h4>
                    <div className="flex flex-wrap gap-2">
                      {agent.channels.map((channel, cIdx) => (
                        <span key={cIdx} className="px-3 py-1 rounded-full border border-border text-foreground/70 text-sm bg-foreground/5">
                          {channel}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="bg-foreground/[0.04] rounded-2xl p-6 border border-border">
                  <h4 className="text-sm uppercase tracking-widest text-foreground/40 mb-4">Core Capabilities</h4>
                  <ul className="space-y-3">
                    {agent.capabilities.map((cap, cIdx) => (
                      <li key={cIdx} className="flex items-start gap-3 text-foreground/80">
                        <span className="text-primary mt-1">✦</span>
                        <span>{cap}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={agent.href}
                    className="mt-6 inline-flex items-center justify-center rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
                  >
                    {agent.action}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* What's next */}
        <div className="reveal-up text-center mb-24 glass-panel p-12 rounded-3xl relative overflow-hidden border border-border bg-card/30">
           <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAzNHYtNGgtdjRoLTR2NGgtdjRoNHY0aDR2LTRoNHptMC0xMnYtNGgtdjRoLTR2NGgtdjRoNHY0aDR2LTRoNHptLTEyIDB2LTRoLTR2NGgtNHY0aDR2NGg0di00aDR6bTAtMTJ2LTRoLTR2NGgtNHY0aDR2NGg0di00aDR6IiBmaWxsPSIjMTJiOGE2IiBmaWxsLW9wYWNpdHk9IjAuMDgiLz48L2c+PC9zdmc+')] pointer-events-none" />
           <div className="relative z-10">
            <h2 className="text-sm text-secondary tracking-widest uppercase mb-4 font-semibold">Coming Next</h2>
            <h3 className="text-4xl font-display font-bold text-foreground mb-6 tracking-tight">WhatsApp, Support, and Follow-Up Agents</h3>
            <p className="text-foreground/60 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
              Nova is the first of several agents on our roadmap — each one built, tested, and shipped on its own before it's offered to clients.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <span className="px-4 py-2 bg-foreground/5 border border-border rounded-lg text-foreground/80">WhatsApp Business Agent</span>
              <span className="px-4 py-2 bg-foreground/5 border border-border rounded-lg text-foreground/80">Customer Support Agent</span>
              <span className="px-4 py-2 bg-foreground/5 border border-border rounded-lg text-foreground/80">Lead Follow-Up Agent</span>
              <span className="px-4 py-2 bg-foreground/5 border border-border rounded-lg text-foreground/80">Business Operations Agent</span>
              <span className="px-4 py-2 bg-foreground/5 border border-border rounded-lg text-foreground/80">Voice Agent</span>
            </div>
           </div>
        </div>

        <div className="text-center reveal-up">
          <Link href="/contact">
            <MagneticButton variant="primary" className="text-lg">Talk to Sales</MagneticButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
