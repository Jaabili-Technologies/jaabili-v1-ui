import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import logo from "@assets/jaabili-logo-dark.png";

const sections = [
  {
    title: "Data We Process",
    body: "Account profile, workspace details, websites, uploaded documents, FAQs, pricing, policies, conversation labels, leads, and integration metadata.",
  },
  {
    title: "Why We Process Data",
    body: "To create knowledge bases, retrieve trusted context, configure agents, score leads, route handoffs, improve quality, and show analytics.",
  },
  {
    title: "Access Control",
    body: "Workspace data should be scoped by tenant. Admin users may view operational records needed for support, billing, quality, and compliance.",
  },
  {
    title: "Retention",
    body: "Users should be able to delete uploaded sources, leads, and conversation records subject to legal, billing, or security retention requirements.",
  },
  {
    title: "Third-Party Services",
    body: "Jaabili may use cloud hosting, databases, email, messaging, analytics, payment, and AI model providers to operate the product.",
  },
];

export default function Privacy() {
  return (
    <main className="min-h-[100dvh] bg-background px-5 py-8 text-foreground">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <img src={logo} alt="Jaabili Tech Solutions" className="h-12 w-auto" />
          <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-foreground/72 hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </div>
        <section className="mt-10 rounded-[28px] border border-border bg-card p-6 sm:p-8">
          <p className="text-sm font-semibold text-primary">Legal</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">Privacy Policy</h1>
          <p className="mt-4 text-sm leading-6 text-foreground/58">
            Draft privacy policy for Jaabili workspaces. Final legal review is required before public launch.
          </p>
          <div className="mt-8 space-y-5">
            {sections.map((section) => (
              <div key={section.title} className="rounded-2xl border border-border bg-foreground/[0.035] p-5">
                <h2 className="font-semibold">{section.title}</h2>
                <p className="mt-2 text-sm leading-6 text-foreground/58">{section.body}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
