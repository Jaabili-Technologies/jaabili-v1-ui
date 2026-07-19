import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Check, ChevronDown, Loader2, MessageCircle } from "lucide-react";
import { MessagingAgentIcon } from "@/components/ui/agent-icons";
import {
  connectAgentTenantWhatsApp,
  listMyWorkspaces,
  listWebsiteSalesAgentConversations,
  type AgentTenant,
  type ConversationRecord,
} from "@/lib/website-sales-agent-api";

// Intentionally the same key website-sales-agent.tsx and marketing-agent.tsx
// use: tenant selection is shared across agents, since they all work on the
// same client workspace -- there is one workspace per client, not one per
// agent.
const TENANT_STORAGE_KEY = "jaabili.websiteSales.tenantId";

export default function WhatsAppAgentPage() {
  const [tenants, setTenants] = useState<AgentTenant[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState(
    () => window.localStorage.getItem(TENANT_STORAGE_KEY) ?? "jaabili-default",
  );

  const selectedTenant = tenants.find((tenant) => tenant.id === selectedTenantId) ?? tenants[0] ?? null;

  useEffect(() => {
    listMyWorkspaces().then(setTenants).catch(() => setTenants([]));
  }, []);

  useEffect(() => {
    window.localStorage.setItem(TENANT_STORAGE_KEY, selectedTenantId);
  }, [selectedTenantId]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex h-16 items-center justify-between border-b border-border px-5 sm:px-8">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex size-9 items-center justify-center rounded-full hover:bg-foreground/10"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/12 text-emerald-500">
            <MessagingAgentIcon className="size-4" />
          </div>
          <div>
            <div className="text-sm font-semibold">WhatsApp Sales Agent</div>
            <div className="text-xs text-foreground/45">Same Nova engine, on WhatsApp</div>
          </div>
        </div>
        <TenantSwitcher tenants={tenants} selectedTenant={selectedTenant} onChange={setSelectedTenantId} />
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <WhatsAppWorkspacePanel tenantId={selectedTenantId} tenant={selectedTenant} onTenantUpdated={setTenants} />
      </main>
    </div>
  );
}

/**
 * Self-contained WhatsApp workspace: connection status/setup plus recent
 * WhatsApp conversations for the given tenant, so it can be embedded in the
 * unified dashboard shell the same way NovaWorkspacePanel and
 * MarketingWorkspacePanel are.
 */
export function WhatsAppWorkspacePanel({
  tenantId,
  tenant,
  onTenantUpdated,
}: {
  tenantId: string;
  tenant: AgentTenant | null;
  onTenantUpdated?: (updater: (tenants: AgentTenant[]) => AgentTenant[]) => void;
}) {
  const [phoneNumberIdDraft, setPhoneNumberIdDraft] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ConversationRecord[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);

  const isConnected = Boolean(tenant?.whatsappPhoneNumberId);

  useEffect(() => {
    if (!isConnected) return;
    setIsLoadingConversations(true);
    listWebsiteSalesAgentConversations(tenantId)
      .then((all) => setConversations(all.filter((c) => c.channel === "whatsapp")))
      .catch(() => setConversations([]))
      .finally(() => setIsLoadingConversations(false));
  }, [tenantId, isConnected]);

  const connect = async () => {
    if (!phoneNumberIdDraft.trim()) return;
    setIsConnecting(true);
    setError(null);
    try {
      const updated = await connectAgentTenantWhatsApp(tenantId, phoneNumberIdDraft.trim());
      onTenantUpdated?.((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setPhoneNumberIdDraft("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not connect this WhatsApp number.");
    } finally {
      setIsConnecting(false);
    }
  };

  const webhookUrl =
    (import.meta.env.VITE_API_BASE_URL ?? window.location.origin) + "/api/agents/whatsapp/webhook";

  if (!isConnected) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-border bg-card/85 p-6">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
            <MessageCircle className="size-4 text-emerald-500" />
            Connect a WhatsApp Business number
          </div>
          <p className="mb-4 text-sm leading-6 text-foreground/50">
            This tenant isn't connected to WhatsApp yet. Once connected, inbound WhatsApp messages run through the
            same Nova engine, knowledge base, and lead pipeline as your website widget -- one shared workspace, no
            separate setup.
          </p>

          <ol className="mb-5 space-y-2 text-xs leading-5 text-foreground/45">
            <li>1. In the Meta App dashboard, set the webhook URL to the one below and subscribe to "messages".</li>
            <li>2. Paste the phone_number_id from your WhatsApp Business account below.</li>
          </ol>

          <div className="mb-4 rounded-xl bg-black/20 p-3 font-mono text-xs text-foreground/60">{webhookUrl}</div>

          <div className="flex gap-2">
            <input
              value={phoneNumberIdDraft}
              onChange={(e) => setPhoneNumberIdDraft(e.target.value)}
              placeholder="WhatsApp phone_number_id"
              className="h-10 flex-1 rounded-full border border-border bg-foreground/[0.03] px-4 text-sm outline-none focus:border-primary/50"
            />
            <button
              type="button"
              onClick={connect}
              disabled={isConnecting || !phoneNumberIdDraft.trim()}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              {isConnecting && <Loader2 className="size-4 animate-spin" />}
              Connect
            </button>
          </div>
          {error && <p className="mt-3 text-xs text-destructive">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 rounded-full bg-emerald-500/12 px-4 py-3 text-sm font-medium text-emerald-500">
        <Check className="size-4" /> Connected -- number {tenant?.whatsappPhoneNumberId}
      </div>

      <section>
        <h3 className="mb-2 text-sm font-semibold text-foreground/70">Recent WhatsApp conversations</h3>
        {isLoadingConversations ? (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center text-xs text-foreground/40">
            Loading...
          </div>
        ) : conversations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center text-xs text-foreground/40">
            No WhatsApp conversations yet. They'll show up here as soon as a customer messages your connected
            number.
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conversation) => {
              const lastMessage = conversation.messages[conversation.messages.length - 1];
              return (
                <div key={conversation.id} className="rounded-2xl bg-card/85 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-foreground/85">{conversation.visitorId}</span>
                    <span className="shrink-0 rounded-full bg-foreground/8 px-2 py-1 text-[11px] text-foreground/45">
                      {conversation.status}
                    </span>
                  </div>
                  {lastMessage && (
                    <p className="mt-1 truncate text-xs text-foreground/50">{lastMessage.content}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function TenantSwitcher({
  tenants,
  selectedTenant,
  onChange,
}: {
  tenants: AgentTenant[];
  selectedTenant: AgentTenant | null;
  onChange: (tenantId: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="flex items-center gap-2 rounded-full border border-border bg-foreground/[0.03] px-3 py-2 text-sm text-foreground/75 hover:bg-foreground/8"
      >
        {selectedTenant?.name ?? "Select client"}
        <ChevronDown className="size-3.5" />
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full z-10 mt-2 w-56 rounded-2xl border border-border bg-card p-1.5 shadow-xl">
          {tenants.map((tenant) => (
            <button
              key={tenant.id}
              type="button"
              onClick={() => {
                onChange(tenant.id);
                setIsOpen(false);
              }}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm hover:bg-foreground/8"
            >
              <span className="truncate">{tenant.name}</span>
              {tenant.id === selectedTenant?.id && <Check className="size-3.5 shrink-0 text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
