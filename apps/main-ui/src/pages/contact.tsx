import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  Mail,
  MessageSquare,
  Linkedin,
  Instagram,
  CheckCircle2,
  HelpCircle,
  Wrench,
  Briefcase,
  Send,
} from "lucide-react";

const TOPICS = [
  { id: "issue", label: "Report an issue or bug", icon: Wrench },
  { id: "question", label: "Ask a question", icon: HelpCircle },
  { id: "sales", label: "Sales / partnership", icon: Briefcase },
  { id: "other", label: "Something else", icon: MessageSquare },
];

export default function Contact() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [submitted, setSubmitted] = useState(false);
  const [topic, setTopic] = useState<string>("issue");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });

  useGSAP(
    () => {
      gsap.utils.toArray<HTMLElement>(".reveal-up").forEach((elem) => {
        gsap.fromTo(
          elem,
          { y: 28, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: elem,
              start: "top 90%",
              once: true,
            },
          },
        );
      });
    },
    { scope: containerRef },
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Build a mailto link as a reliable fallback so messages actually reach the team.
    const topicLabel =
      TOPICS.find((t) => t.id === topic)?.label || "General inquiry";
    const subject = encodeURIComponent(
      `[${topicLabel}] ${formData.name || "New message"}`,
    );
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\nCompany: ${formData.company || "—"}\nTopic: ${topicLabel}\n\nMessage:\n${formData.message}`,
    );
    window.location.href = `mailto:jaabilitech@gmail.com?subject=${subject}&body=${body}`;

    setTimeout(() => setSubmitted(true), 250);
  };

  return (
    <div
      className="bg-background min-h-screen pt-32 pb-24 font-sans"
      ref={containerRef}
    >
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Heading */}
        <div className="text-center mb-16 reveal-up">
          <h1 className="text-4xl md:text-6xl text-white font-display font-semibold tracking-tight leading-[1.05] mb-5">
            How can we help?
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto leading-relaxed font-light">
            For any issue, question, or partnership opportunity — drop us a
            message and a real human from the Jaabili team will get back to
            you, usually within one working day.
          </p>
        </div>

        {/* Quick contact cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-14 reveal-up">
          <a
            href="mailto:jaabilitech@gmail.com"
            className="rounded-2xl border border-white/10 bg-card/30 hover:bg-card/50 hover:border-white/20 p-6 transition-all group"
          >
            <Mail className="w-5 h-5 text-primary mb-4" strokeWidth={1.6} />
            <div className="text-xs uppercase tracking-[0.18em] text-white/40 font-semibold mb-1">
              Email us
            </div>
            <div className="text-white font-medium group-hover:text-primary transition-colors">
              jaabilitech@gmail.com
            </div>
            <div className="text-xs text-white/45 mt-1">
              Best for issues and detailed questions
            </div>
          </a>

          <a
            href="https://www.linkedin.com/in/jaabili-technologies-420470407/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-2xl border border-white/10 bg-card/30 hover:bg-card/50 hover:border-white/20 p-6 transition-all group"
          >
            <Linkedin
              className="w-5 h-5 text-secondary mb-4"
              strokeWidth={1.6}
            />
            <div className="text-xs uppercase tracking-[0.18em] text-white/40 font-semibold mb-1">
              LinkedIn
            </div>
            <div className="text-white font-medium group-hover:text-secondary transition-colors">
              Jaabili Technologies
            </div>
            <div className="text-xs text-white/45 mt-1">
              Connect with the team and follow along
            </div>
          </a>

          <a
            href="https://www.instagram.com/jaabili.studio/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-2xl border border-white/10 bg-card/30 hover:bg-card/50 hover:border-white/20 p-6 transition-all group"
          >
            <Instagram
              className="w-5 h-5 text-accent mb-4"
              strokeWidth={1.6}
            />
            <div className="text-xs uppercase tracking-[0.18em] text-white/40 font-semibold mb-1">
              Instagram
            </div>
            <div className="text-white font-medium group-hover:text-accent transition-colors">
              @jaabili.studio
            </div>
            <div className="text-xs text-white/45 mt-1">
              Behind-the-scenes and product updates
            </div>
          </a>
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-4 reveal-up">
            <h2 className="text-2xl md:text-3xl text-white font-display font-semibold tracking-tight mb-4">
              Send us a message
            </h2>
            <p className="text-white/55 leading-relaxed font-light mb-6">
              Tell us what's on your mind. The form below opens your email
              client with everything pre-filled — your message lands in the
              same inbox a Jaabili team member checks daily.
            </p>
            <div className="text-xs text-white/40">
              Prefer not to use a form? Email us directly at{" "}
              <a
                className="text-white underline underline-offset-2"
                href="mailto:jaabilitech@gmail.com"
              >
                jaabilitech@gmail.com
              </a>
              .
            </div>
          </div>

          <div className="lg:col-span-8 reveal-up">
            <div className="rounded-3xl border border-white/10 bg-card/40 backdrop-blur-md p-8 md:p-10 relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/8 rounded-full blur-[80px] pointer-events-none" />

              {submitted ? (
                <div className="text-center py-10 relative z-10">
                  <div className="w-14 h-14 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-display font-semibold text-white tracking-tight mb-3">
                    Your email is on its way
                  </h3>
                  <p className="text-white/60 max-w-md mx-auto leading-relaxed mb-6">
                    We've opened your email client with your message ready to
                    send. Once it lands in our inbox we'll reply within one
                    working day.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        name: "",
                        email: "",
                        company: "",
                        message: "",
                      });
                    }}
                    className="text-sm text-white/70 hover:text-white underline underline-offset-4"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="space-y-5 relative z-10"
                >
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-[0.16em] text-white/55 mb-3 block">
                      What's this about?
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {TOPICS.map((t) => {
                        const Icon = t.icon;
                        const selected = topic === t.id;
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setTopic(t.id)}
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-all text-left ${
                              selected
                                ? "border-primary/50 bg-primary/10 text-white"
                                : "border-white/10 bg-white/5 text-white/70 hover:border-white/25 hover:text-white"
                            }`}
                          >
                            <Icon
                              className={`w-4 h-4 shrink-0 ${selected ? "text-primary" : "text-white/50"}`}
                              strokeWidth={1.6}
                            />
                            <span className="truncate">{t.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/70">
                        Your name
                      </label>
                      <input
                        required
                        type="text"
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/25 focus:outline-none focus:border-primary transition-colors text-sm"
                        placeholder="Jane Doe"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/70">
                        Email
                      </label>
                      <input
                        required
                        type="email"
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/25 focus:outline-none focus:border-primary transition-colors text-sm"
                        placeholder="jane@company.com"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70">
                      Company{" "}
                      <span className="text-white/30 font-normal">
                        (optional)
                      </span>
                    </label>
                    <input
                      type="text"
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/25 focus:outline-none focus:border-primary transition-colors text-sm"
                      placeholder="Company name"
                      value={formData.company}
                      onChange={(e) =>
                        setFormData({ ...formData, company: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70">
                      Your message
                    </label>
                    <textarea
                      required
                      rows={5}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/25 focus:outline-none focus:border-primary transition-colors resize-none text-sm leading-relaxed"
                      placeholder="Tell us what you're running into, what you're trying to build, or what you'd like to know…"
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-2 bg-white text-black font-semibold rounded-xl py-3 px-4 hover:bg-white/90 transition-colors"
                  >
                    Send message
                    <Send className="w-4 h-4" />
                  </button>

                  <p className="text-xs text-white/40 text-center pt-1">
                    By sending you agree we may reply to the email you provide.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
