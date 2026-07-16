import type { ComponentType } from "react";
import {
  ContentStudioAgentIcon,
  FollowUpAgentIcon,
  MarketingAgentIcon,
  MessagingAgentIcon,
  NovaAgentIcon,
  OpsSummaryAgentIcon,
  SupportAgentIcon,
} from "@/components/ui/agent-icons";

export type AgentStatus = "live" | "setup" | "locked";

export interface ProductAgent {
  id: string;
  name: string;
  category: string;
  description: string;
  status: AgentStatus;
  href: string;
  plan: "free" | "basic" | "pro" | "enterprise";
  icon: ComponentType<{ className?: string }>;
  /** Illustrated mark under /public/illustrations, preferred over the vector `icon` where rendered. */
  illustrationSrc: string;
  tint: string;
  /** Which inline workspace panel the unified dashboard shell should render for this agent, if any. */
  panel: "website-sales" | "marketing" | "whatsapp" | null;
  /** The functional role, shown as a subtitle under the product name (e.g. "Nova — Website Sales Agent"). */
  role: string;
}

export const PLAN_LIMITS = {
  free: { label: "Free", agents: 1, conversations: "500/mo" },
  basic: { label: "Basic", agents: 3, conversations: "5,000/mo" },
  pro: { label: "Pro", agents: 15, conversations: "50,000/mo" },
  // Matches @workspace/db's SubscriptionPlanId, which already has this
  // fourth tier (see AGENT_MINIMUM_PLAN["content-studio"]) -- this catalog
  // was tracking only 3 tiers and silently had no way to represent the
  // real gate on the newest agent until now.
  enterprise: { label: "Enterprise", agents: 999, conversations: "Unlimited" },
};

export const AGENT_CATALOG: ProductAgent[] = [
  {
    id: "website-sales",
    name: "Nova",
    role: "Website Sales Agent",
    category: "Sales",
    description: "Turns website visitors into qualified, scored leads.",
    status: "setup",
    href: "/dashboard/agents/website-sales",
    plan: "free",
    icon: NovaAgentIcon,
    illustrationSrc: "/illustrations/agent-mark-nova.png",
    tint: "bg-primary/12 text-primary",
    panel: "website-sales",
  },
  {
    id: "marketing",
    name: "Atlas",
    role: "Marketing Agent",
    category: "Marketing",
    description: "Diagnoses marketing gaps and plans campaigns, content, and SEO for your approval.",
    status: "setup",
    href: "/dashboard/agents/marketing",
    plan: "basic",
    icon: MarketingAgentIcon,
    illustrationSrc: "/illustrations/agent-mark-marketing.png",
    tint: "bg-fuchsia-500/12 text-fuchsia-500",
    panel: "marketing",
  },
  {
    id: "whatsapp-capture",
    name: "Relay",
    role: "WhatsApp Sales Agent",
    category: "Messaging",
    description: "Continues sales conversations and follow-ups on WhatsApp.",
    status: "setup",
    href: "/dashboard/agents/whatsapp",
    plan: "basic",
    icon: MessagingAgentIcon,
    illustrationSrc: "/illustrations/agent-mark-whatsapp.png",
    tint: "bg-emerald-500/12 text-emerald-500",
    panel: "whatsapp",
  },
  {
    id: "follow-up",
    name: "Pulse",
    role: "Lead Follow-Up Agent",
    category: "Sales ops",
    description: "Nurtures warm leads so high-intent buyers don't go cold.",
    status: "setup",
    href: "/contact",
    plan: "basic",
    icon: FollowUpAgentIcon,
    illustrationSrc: "/illustrations/agent-mark-follow-up.png",
    tint: "bg-amber-500/12 text-amber-500",
    panel: null,
  },
  {
    id: "support",
    name: "Sage",
    role: "Customer Support Agent",
    category: "Support",
    description: "Resolves common questions and escalates sensitive cases.",
    status: "locked",
    href: "/contact",
    plan: "pro",
    icon: SupportAgentIcon,
    illustrationSrc: "/illustrations/agent-mark-support.png",
    tint: "bg-sky-500/12 text-sky-500",
    panel: null,
  },
  {
    id: "ops-summary",
    name: "Compass",
    role: "Operations Summary Agent",
    category: "Management",
    description: "Daily activity, hot leads, and recommended improvements.",
    status: "locked",
    href: "/contact",
    plan: "pro",
    icon: OpsSummaryAgentIcon,
    illustrationSrc: "/illustrations/agent-mark-ops-summary.png",
    tint: "bg-slate-500/12 text-slate-500",
    panel: null,
  },
  {
    id: "content-studio",
    name: "Muse",
    role: "Content Studio Agent",
    category: "Creative",
    description: "Generates on-brand images and voice content -- self-hosted, no per-call API cost.",
    status: "locked",
    href: "/contact",
    plan: "enterprise",
    icon: ContentStudioAgentIcon,
    illustrationSrc: "/illustrations/agent-mark-content-studio.png",
    tint: "bg-violet-500/12 text-violet-500",
    panel: null,
  },
];
