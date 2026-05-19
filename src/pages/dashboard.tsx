import { useState, useMemo } from "react";
import { Link } from "wouter";
import {
  Sparkles,
  MessageSquare,
  BarChart,
  Workflow,
  Users,
  Settings,
  Bell,
  Search,
  Plus,
  Home,
  Bot,
  LayoutTemplate,
  Send,
  LogOut,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import logo from "@assets/jaabili_logo_clean.png";
import { useAuth } from "@/lib/auth-context";
import { readOnboarding } from "@/lib/onboarding";

type WorkspaceType = "sales" | "support" | "marketing" | "general" | null;

interface Template {
  title: string;
  category: string;
  desc: string;
  image: string;
  gradient: string;
  useCase: string; // matches onboarding useCase id
  channels: string[];
}

const ALL_TEMPLATES: Template[] = [
  {
    title: "Sales Closer",
    category: "Sales",
    desc: "Qualifies leads and books meetings automatically.",
    image: "/assets/images/template-sales.png",
    gradient: "from-primary/20 to-primary/5",
    useCase: "sales",
    channels: ["whatsapp", "web", "email"],
  },
  {
    title: "Support Bot",
    category: "Support",
    desc: "Resolves common tickets instantly with CRM sync.",
    image: "/assets/images/template-support.png",
    gradient: "from-secondary/20 to-secondary/5",
    useCase: "support",
    channels: ["web", "email", "slack"],
  },
  {
    title: "Social Marketer",
    category: "Marketing",
    desc: "Engages with Instagram and Twitter DMs and replies.",
    image: "/assets/images/template-marketing.png",
    gradient: "from-accent/20 to-accent/5",
    useCase: "marketing",
    channels: ["instagram", "whatsapp"],
  },
  {
    title: "Lead Router",
    category: "Operations",
    desc: "Scores and routes inbound leads to the right rep.",
    image: "/assets/images/template-sales.png",
    gradient: "from-primary/20 to-primary/5",
    useCase: "sales",
    channels: ["email", "slack"],
  },
  {
    title: "Internal Copilot",
    category: "Internal",
    desc: "Connects your tools to automate cross-team workflows.",
    image: "/assets/images/template-support.png",
    gradient: "from-secondary/20 to-secondary/5",
    useCase: "internal",
    channels: ["slack", "web"],
  },
  {
    title: "Voice Concierge",
    category: "Support",
    desc: "Inbound voice agent that handles FAQs and routes calls.",
    image: "/assets/images/template-marketing.png",
    gradient: "from-accent/20 to-accent/5",
    useCase: "support",
    channels: ["voice"],
  },
];

const SUGGESTIONS_BY_USECASE: Record<string, string[]> = {
  sales: [
    "A WhatsApp sales agent that qualifies inbound leads",
    "A LinkedIn outreach agent that books discovery calls",
    "A pricing agent that handles quote requests",
  ],
  support: [
    "A support bot that triages L1 tickets",
    "A web widget that answers product questions",
    "A voice agent for after-hours calls",
  ],
  marketing: [
    "An Instagram DM agent that replies on-brand",
    "A campaign agent that drafts and schedules posts",
    "A re-engagement agent for cold leads",
  ],
  internal: [
    "A Slack copilot that summarises threads",
    "An onboarding agent for new hires",
    "An ops agent that connects Linear and Notion",
  ],
  research: [
    "A research agent that compares vendors",
    "A reading-list agent that summarises papers",
    "An RFP-response agent",
  ],
  other: [
    "A WhatsApp sales agent",
    "A customer support bot",
    "A marketing automation flow",
  ],
};

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const onboarding = useMemo(() => readOnboarding(), []);

  const [prompt, setPrompt] = useState("");
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceType>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const fullName =
    user?.displayName?.trim() ||
    user?.email?.split("@")[0] ||
    "there";
  const firstName = fullName.split(" ")[0];
  const initials =
    fullName
      .split(" ")
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "JA";

  const templates = useMemo(() => {
    if (!onboarding) return ALL_TEMPLATES.slice(0, 4);

    const matchingUseCase = ALL_TEMPLATES.filter(
      (t) => t.useCase === onboarding.useCase,
    );
    const matchingChannels = ALL_TEMPLATES.filter(
      (t) =>
        t.useCase !== onboarding.useCase &&
        t.channels.some((c) => onboarding.channels.includes(c)),
    );
    const rest = ALL_TEMPLATES.filter(
      (t) => !matchingUseCase.includes(t) && !matchingChannels.includes(t),
    );
    return [...matchingUseCase, ...matchingChannels, ...rest].slice(0, 4);
  }, [onboarding]);

  const suggestions = useMemo(() => {
    const key = onboarding?.useCase || "other";
    return SUGGESTIONS_BY_USECASE[key] || SUGGESTIONS_BY_USECASE.other;
  }, [onboarding]);

  const planLabel = onboarding ? "Free Plan" : "Free Plan";

  const handleGenerate = (customPrompt?: string) => {
    const text = (customPrompt || prompt).toLowerCase();
    if (!text.trim()) return;

    setIsGenerating(true);
    if (customPrompt) setPrompt(customPrompt);

    setTimeout(() => {
      if (
        text.includes("sales") ||
        text.includes("lead") ||
        text.includes("close")
      ) {
        setActiveWorkspace("sales");
      } else if (
        text.includes("support") ||
        text.includes("ticket") ||
        text.includes("help")
      ) {
        setActiveWorkspace("support");
      } else if (
        text.includes("marketing") ||
        text.includes("campaign") ||
        text.includes("social")
      ) {
        setActiveWorkspace("marketing");
      } else {
        setActiveWorkspace("general");
      }
      setIsGenerating(false);
    }, 1500);
  };

  const navItems = [
    { icon: Home, label: "Home", active: true },
    { icon: Bot, label: "My Agents" },
    { icon: LayoutTemplate, label: "Templates" },
    { icon: MessageSquare, label: "Conversations" },
    { icon: BarChart, label: "Analytics" },
    { icon: Workflow, label: "Integrations" },
    { icon: Settings, label: "Settings" },
  ];

  return (
    <div className="min-h-[100dvh] flex bg-background text-white font-sans overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-white/5 bg-card flex-col hidden md:flex shrink-0">
        <div className="p-6 flex items-center gap-3">
          <Link href="/" className="flex items-center cursor-pointer group">
            <img
              src={logo}
              alt="Jaabili Tech Solutions"
              className="h-12 w-auto drop-shadow-[0_0_12px_rgba(20,184,166,0.4)] group-hover:scale-[1.04] transition-transform"
            />
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4">
          {navItems.map((item, i) => (
            <button
              key={i}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                item.active
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/5",
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-2">
          <div className="flex items-center gap-3 p-2 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-sm font-bold text-white shadow-sm shrink-0">
              {initials}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-white truncate">
                {fullName}
              </p>
              <p className="text-xs text-white/40 truncate">{planLabel}</p>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-white/55 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-[100dvh] overflow-hidden bg-[#0A0D14]">
        {/* TOPBAR */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 shrink-0 bg-background/50 backdrop-blur-md">
          <div className="flex-1 max-w-xl flex items-center gap-2 px-4 py-2 bg-black/20 border border-white/10 rounded-full focus-within:border-primary/50 transition-colors">
            <Search className="w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search agents, templates, or workflows..."
              className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-white/40"
            />
          </div>

          <div className="flex items-center gap-4 ml-4">
            <Link
              href="/pricing"
              className="text-xs font-semibold px-3 py-1.5 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-full shadow-md shadow-primary/20 hover:opacity-90 transition-opacity"
            >
              Upgrade
            </Link>
            <button className="p-2 text-white/60 hover:text-white rounded-full hover:bg-white/5 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-background" />
            </button>
          </div>
        </header>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-5xl mx-auto">
            {/* GREETING & PROMPT */}
            <div className="mb-12 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-display font-semibold mb-6 tracking-tight">
                What do you want to build today, {firstName}?
              </h1>

              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-secondary to-accent rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
                <div className="relative bg-card/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl focus-within:border-white/30 transition-colors">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleGenerate();
                      }
                    }}
                    placeholder="Describe what you want — e.g. 'A WhatsApp sales agent for my interior design studio'..."
                    className="w-full bg-transparent border-none outline-none text-lg text-white placeholder:text-white/30 resize-none min-h-[80px]"
                  />
                  <div className="flex justify-between items-center mt-2 border-t border-white/5 pt-3">
                    <div className="flex gap-2">
                      <button className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                        <Plus className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                        <Sparkles className="w-5 h-5" />
                      </button>
                    </div>
                    <button
                      onClick={() => handleGenerate()}
                      disabled={!prompt.trim() || isGenerating}
                      className="flex items-center gap-2 px-5 py-2 bg-white text-black rounded-lg font-medium hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGenerating ? "Generating..." : "Generate Workspace"}
                      {!isGenerating && <Send className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                {suggestions.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => handleGenerate(chip)}
                    className="px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* DYNAMIC WORKSPACE REVEAL */}
            <AnimatePresence mode="wait">
              {activeWorkspace && (
                <motion.div
                  key={activeWorkspace}
                  initial={{ opacity: 0, y: 20, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -20, height: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="mb-12 overflow-hidden"
                >
                  <WorkspaceLayout type={activeWorkspace} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* TEMPLATES (Hidden if workspace active) */}
            <AnimatePresence>
              {!activeWorkspace && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-8"
                >
                  <div>
                    <h3 className="text-xl font-display font-semibold mb-1">
                      {onboarding
                        ? "Templates picked for your workflow"
                        : "Start with a template"}
                    </h3>
                    {onboarding && (
                      <p className="text-sm text-white/45 mb-4">
                        Based on your onboarding answers — tuned for your team
                        and channels.
                      </p>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-3">
                      {templates.map((tpl, i) => (
                        <div
                          key={i}
                          className="group cursor-pointer rounded-2xl border border-white/5 bg-card hover:border-white/20 transition-all overflow-hidden flex flex-col h-full"
                        >
                          <div
                            className={`h-32 bg-gradient-to-br ${tpl.gradient} relative overflow-hidden`}
                          >
                            {tpl.image && (
                              <img
                                src={tpl.image}
                                alt={tpl.title}
                                className="w-full h-full object-cover opacity-80 mix-blend-screen group-hover:scale-105 transition-transform duration-700"
                              />
                            )}
                          </div>
                          <div className="p-4 flex flex-col flex-1">
                            <span className="text-[10px] uppercase tracking-widest text-white/40 mb-1">
                              {tpl.category}
                            </span>
                            <h4 className="font-semibold mb-2">{tpl.title}</h4>
                            <p className="text-sm text-white/50 mb-4 line-clamp-2">
                              {tpl.desc}
                            </p>
                            <button className="mt-auto w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors">
                              Use template
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-display font-semibold mb-4">
                      Recent activity
                    </h3>
                    <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="w-72 shrink-0 p-4 rounded-2xl border border-white/5 bg-card/50 flex items-center gap-4"
                        >
                          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                            <Bot className="w-5 h-5 text-white/60" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">
                              {firstName}'s Assistant {i}
                            </h4>
                            <p className="text-xs text-white/40">
                              Edited 2 hours ago
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}

// Sub-component for the generated workspace
function WorkspaceLayout({ type }: { type: WorkspaceType }) {
  const configs = {
    sales: {
      title: "Sales Agent Workspace",
      icon: BarChart,
      color: "text-primary",
      bg: "bg-primary/10 border-primary/20",
    },
    support: {
      title: "Support Bot Workspace",
      icon: MessageSquare,
      color: "text-secondary",
      bg: "bg-secondary/10 border-secondary/20",
    },
    marketing: {
      title: "Marketing Automation",
      icon: Users,
      color: "text-accent",
      bg: "bg-accent/10 border-accent/20",
    },
    general: {
      title: "Custom Agent Workspace",
      icon: Workflow,
      color: "text-white",
      bg: "bg-white/5 border-white/10",
    },
  };

  const conf = type ? configs[type] : configs.general;
  const Icon = conf.icon;

  return (
    <div className="bg-card rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg border", conf.bg)}>
            <Icon className={cn("w-6 h-6", conf.color)} />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold">{conf.title}</h2>
            <p className="text-sm text-white/50">
              Generated based on your prompt
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 text-sm font-medium bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10">
            Configure Settings
          </button>
          <button className="px-4 py-2 text-sm font-medium bg-white text-black hover:bg-white/90 rounded-lg transition-colors shadow-lg shadow-white/10">
            Deploy Agent
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-white/5">
        <div className="p-6 col-span-1">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-white/40 mb-6">
            Setup Checklist
          </h3>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold border border-primary/30 shrink-0">
                1
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">
                  Connect Knowledge Base
                </h4>
                <p className="text-xs text-white/40 mb-2">
                  Upload your docs or sync URLs so the agent knows your
                  business.
                </p>
                <button className="text-xs text-primary hover:underline">
                  Upload files &rarr;
                </button>
              </div>
            </div>
            <div className="flex gap-4 opacity-50">
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold border border-white/20 shrink-0">
                2
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Set System Prompt</h4>
                <p className="text-xs text-white/40">
                  Define the personality and strict rules for the agent.
                </p>
              </div>
            </div>
            <div className="flex gap-4 opacity-50">
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold border border-white/20 shrink-0">
                3
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">
                  Configure Channels
                </h4>
                <p className="text-xs text-white/40">
                  Connect to WhatsApp, Web chat, or Instagram.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 col-span-2 bg-black/10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-white/40">
              Simulator
            </h3>
            <div className="flex gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-xs text-white/40">Agent Ready</span>
            </div>
          </div>

          <div className="bg-card border border-white/10 rounded-xl h-[300px] flex flex-col relative overflow-hidden">
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              <div className="flex gap-3 max-w-[80%]">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-white/5 p-3 rounded-2xl rounded-tl-sm text-sm border border-white/5">
                  Hello! I'm your new {type} agent. How can I help you test my
                  capabilities today?
                </div>
              </div>
              <div className="flex gap-3 max-w-[80%] ml-auto justify-end">
                <div className="bg-primary text-primary-foreground p-3 rounded-2xl rounded-tr-sm text-sm">
                  What are you capable of doing?
                </div>
              </div>
            </div>
            <div className="p-3 border-t border-white/5 bg-black/20">
              <div className="bg-white/5 rounded-lg p-2 px-3 text-sm text-white/40 flex items-center justify-between">
                Type a message to test...
                <Send className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
