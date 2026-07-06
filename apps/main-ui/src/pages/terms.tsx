import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import logo from "@assets/jaabili-logo-dark.png";

const sections = [
  {
    title: "Service Use",
    body: "Jaabili provides AI agent workspaces for business, personal, and team automation. Users are responsible for the accuracy and legality of the data they upload or connect.",
  },
  {
    title: "Agent Output",
    body: "AI responses may require human review before use in sales, legal, medical, financial, or other sensitive decisions. Draft Mode is enabled until users publish agents to live channels.",
  },
  {
    title: "Customer Data",
    body: "Users must have permission to process websites, documents, contacts, conversations, and customer records connected to Jaabili.",
  },
  {
    title: "Subscriptions",
    body: "Plans, limits, trials, renewals, cancellations, and usage-based charges are shown during checkout or billing setup before a paid subscription begins.",
  },
  {
    title: "Acceptable Use",
    body: "Jaabili must not be used for spam, deception, illegal surveillance, credential theft, harassment, or unauthorized scraping of protected systems.",
  },
];

export default function Terms() {
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
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">Terms of Service</h1>
          <p className="mt-4 text-sm leading-6 text-foreground/58">
            Draft operating terms for Jaabili workspaces. Final legal review is required before public launch.
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
