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
      title: "Sales & Conversion Agents",
      description: "Always-on closers that integrate seamlessly via WhatsApp, Web, and Voice. They qualify leads, handle objections, and close deals while you sleep.",
      capabilities: ["Lead Qualification", "Objection Handling", "Appointment Booking", "Follow-up Sequences"],
      channels: ["WhatsApp", "Website", "Instagram DM", "Voice"],
      color: "from-primary/20 to-transparent"
    },
    {
      title: "Customer Support Agents",
      description: "Instant, empathetic issue resolution directly synced with your CRM. Reduce ticket volume and resolution time while increasing customer satisfaction.",
      capabilities: ["Ticket Resolution", "FAQ Handling", "Order Tracking", "Refund Processing"],
      channels: ["Email", "Website", "WhatsApp"],
      color: "from-secondary/20 to-transparent"
    },
    {
      title: "Marketing Automation Agents",
      description: "Intelligent systems that personalize outreach, optimize ad spend, and nurture your audience with perfectly timed content.",
      capabilities: ["Personalized Email Campaigns", "Social Media Engagement", "Ad Spend Optimization", "Content Curation"],
      channels: ["Email", "Instagram", "LinkedIn"],
      color: "from-accent/20 to-transparent"
    }
  ];

  return (
    <div className="bg-background min-h-screen pt-32 pb-20" ref={containerRef}>
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="text-center mb-24">
          <h2 className="text-sm text-primary tracking-widest uppercase mb-4 font-semibold">The Suite</h2>
          <AnimatedHeadline text="Autonomous Agents" as="h1" className="text-5xl md:text-7xl text-white mb-6 justify-center font-display font-bold tracking-tighter" />
          <p className="text-xl text-white/60 max-w-3xl mx-auto reveal-up leading-relaxed">
            Intelligent entities designed to operate autonomously within your business ecosystem. Built on our proprietary orchestration layer.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-12 mb-32">
          {agents.map((agent, idx) => (
            <div key={idx} className={`glass-panel p-8 md:p-12 rounded-3xl relative overflow-hidden reveal-up group border border-white/5 hover:border-white/10 transition-colors bg-card/30`}>
              <div className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl ${agent.color} rounded-full blur-[100px] pointer-events-none group-hover:scale-110 transition-transform duration-1000`} />
              
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-3xl font-display font-bold text-white mb-4 tracking-tight">{agent.title}</h3>
                  <p className="text-white/60 text-lg leading-relaxed mb-8">{agent.description}</p>
                  
                  <div className="mb-6">
                    <h4 className="text-sm uppercase tracking-widest text-white/40 mb-3">Channels</h4>
                    <div className="flex flex-wrap gap-2">
                      {agent.channels.map((channel, cIdx) => (
                        <span key={cIdx} className="px-3 py-1 rounded-full border border-white/10 text-white/70 text-sm bg-white/5">
                          {channel}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="bg-black/20 rounded-2xl p-6 border border-white/5">
                  <h4 className="text-sm uppercase tracking-widest text-white/40 mb-4">Core Capabilities</h4>
                  <ul className="space-y-3">
                    {agent.capabilities.map((cap, cIdx) => (
                      <li key={cIdx} className="flex items-start gap-3 text-white/80">
                        <span className="text-primary mt-1">✦</span>
                        <span>{cap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tech Stack / Orchestration */}
        <div className="reveal-up text-center mb-24 glass-panel p-12 rounded-3xl relative overflow-hidden border border-white/5 bg-card/30">
           <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAzNHYtNGgtdjRoLTR2NGgtdjRoNHY0aDR2LTRoNHptMC0xMnYtNGgtdjRoLTR2NGgtdjRoNHY0aDR2LTRoNHptLTEyIDB2LTRoLTR2NGgtNHY0aDR2NGg0di00aDR6bTAtMTJ2LTRoLTR2NGgtNHY0aDR2NGg0di00aDR6IiBmaWxsPSIjMTJiOGE2IiBmaWxsLW9wYWNpdHk9IjAuMDgiLz48L2c+PC9zdmc+')] pointer-events-none" />
           <div className="relative z-10">
            <h2 className="text-sm text-secondary tracking-widest uppercase mb-4 font-semibold">Infrastructure</h2>
            <h3 className="text-4xl font-display font-bold text-white mb-6 tracking-tight">Multi-LLM Orchestration & Security Cloud</h3>
            <p className="text-white/60 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
              We don't rely on a single model. Our architecture dynamically routes tasks to the optimal LLM (GPT-4, Claude 3.5, Gemini, or open-source Llama) while maintaining strict data sovereignty via our Security Cloud Layer.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/80">Enterprise Encryption</span>
              <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/80">Isolated Vector DBs</span>
              <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/80">Dynamic Model Routing</span>
              <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/80">Compliance Ready</span>
            </div>
           </div>
        </div>

        <div className="text-center reveal-up">
          <Link href="/contact">
            <MagneticButton variant="primary" className="text-lg">Deploy Your Agent</MagneticButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
