import {
  BookOpen,
  FileText,
  Globe2,
  ShieldCheck,
  Tags,
  type LucideIcon,
} from "lucide-react";
import type { KnowledgeSource } from "./website-sales-agent-api";

export const starterPrompts = [
  "What can you help me with?",
  "Build a 30-day AI sales roadmap",
  "Analyze my website strategy",
  "What data do you need to train this agent?",
];

export const promptMessages: Record<string, string> = {
  "What can you help me with?": "What can you help me with?",
  "Build a 30-day AI sales roadmap":
    "Build a 30-day AI sales roadmap for a B2B company that wants more qualified website leads.",
  "Analyze my website strategy":
    "Analyze our website marketing strategy and give a practical roadmap with KPIs, risks, and next steps.",
  "What data do you need to train this agent?":
    "What business data should we upload so this agent becomes more accurate for our company?",
};

export const modelOptions = [
  {
    id: "jaabilv-2.0",
    label: "Jaabilv 2.0",
    description: "RAG + playbooks + lead capture",
  },
  {
    id: "gemini",
    label: "Gemini",
    description: "Fast provider runtime",
  },
  {
    id: "deterministic",
    label: "Rules",
    description: "Predictable fallback",
  },
  {
    id: "openai",
    label: "OpenAI planned",
    description: "Future provider",
  },
  {
    id: "ollama",
    label: "Ollama planned",
    description: "Private/local runtime",
  },
];

export const agentOptions = [
  "Website Sales Agent",
  "WhatsApp Sales Agent",
  "Support Agent",
  "Follow-up Agent",
];

export const labelOptions = [
  "good-answer",
  "bad-answer",
  "needs-review",
  "pricing",
  "handoff",
  "training-candidate",
];

export const sourceOptions: Array<{
  type: "website" | "document" | "faq" | "pricing" | "policy";
  title: string;
  category: string;
  label: string;
  icon: LucideIcon;
  iconClassName: string;
  sourceType: KnowledgeSource["sourceType"];
}> = [
  {
    type: "website",
    title: "Client website",
    category: "tenant-website",
    label: "Website",
    icon: Globe2,
    iconClassName: "text-[#8ab4ff]",
    sourceType: "website",
  },
  {
    type: "faq",
    title: "Client FAQs",
    category: "tenant-faq",
    label: "FAQs",
    icon: BookOpen,
    iconClassName: "text-[#10b8a6]",
    sourceType: "faq",
  },
  {
    type: "document",
    title: "Client PDF or document",
    category: "tenant-document",
    label: "PDFs/docs",
    icon: FileText,
    iconClassName: "text-[#e0e0e0]",
    sourceType: "document",
  },
  {
    type: "pricing",
    title: "Client pricing",
    category: "tenant-pricing",
    label: "Pricing",
    icon: Tags,
    iconClassName: "text-[#ffb74d]",
    sourceType: "pricing",
  },
  {
    type: "policy",
    title: "Client policies",
    category: "tenant-policy",
    label: "Policies",
    icon: ShieldCheck,
    iconClassName: "text-[#c58cff]",
    sourceType: "policy",
  },
];
