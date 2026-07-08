import type { ComponentType } from "react";
import {
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
  plan: "free" | "basic" | "pro";
  icon: ComponentType<{ className?: string }>;
  tint: string;
  /** Which inline workspace panel the unified dashboard shell should render for this agent, if any. */
  panel: "website-sales" | "marketing" | null;
}

export const PLAN_LIMITS = {
  free: { label: "Free", agents: 1, conversations: "500/mo" },
  basic: { label: "Basic", agents: 3, conversations: "5,000/mo" },
  pro: { label: "Pro", agents: 15, conversations: "50,000/mo" },
};

export const AGENT_CATALOG: ProductAgent[] = [
  {
    id: "website-sales",
    name: "Nova",
    category: "Sales",
    description: "Turns website visitors into qualified, scored leads.",
    status: "setup",
    href: "/dashboard/agents/website-sales",
    plan: "free",
    icon: NovaAgentIcon,
    tint: "bg-primary/12 text-primary",
    panel: "website-sales",
  },
  {
    id: "marketing",
    name: "Marketing Agent",
    category: "Marketing",
    description: "Diagnoses marketing gaps and plans campaigns, content, and SEO for your approval.",
    status: "setup",
    href: "/dashboard/agents/marketing",
    plan: "basic",
    icon: MarketingAgentIcon,
    tint: "bg-fuchsia-500/12 text-fuchsia-500",
    panel: "marketing",
  },
  {
    id: "whatsapp-capture",
    name: "WhatsApp Sales Agent",
    category: "Messaging",
    description: "Continues sales conversations and follow-ups on WhatsApp.",
    status: "setup",
    href: "/contact",
    plan: "basic",
    icon: MessagingAgentIcon,
    tint: "bg-emerald-500/12 text-emerald-500",
    panel: null,
  },
  {
    id: "follow-up",
    name: "Lead Follow-Up Agent",
    category: "Sales ops",
    description: "Nurtures warm leads so high-intent buyers don't go cold.",
    status: "setup",
    href: "/contact",
    plan: "basic",
    icon: FollowUpAgentIcon,
    tint: "bg-amber-500/12 text-amber-500",
    panel: null,
  },
  {
    id: "support",
    name: "Customer Support Agent",
    category: "Support",
    description: "Resolves common questions and escalates sensitive cases.",
    status: "locked",
    href: "/contact",
    plan: "pro",
    icon: SupportAgentIcon,
    tint: "bg-sky-500/12 text-sky-500",
    panel: null,
  },
  {
    id: "ops-summary",
    name: "Operations Summary Agent",
    category: "Management",
    description: "Daily activity, hot leads, and recommended improvements.",
    status: "locked",
    href: "/contact",
    plan: "pro",
    icon: OpsSummaryAgentIcon,
    tint: "bg-slate-500/12 text-slate-500",
    panel: null,
  },
];
