import { cn } from "@/lib/utils";
import { Send } from "lucide-react";

/**
 * Shared, agent-agnostic presentational pieces for the "conversational
 * diagnosis wizard" pattern used by every agent (Nova, Marketing, and
 * future ones). Kept free of any agent-specific report/type coupling so it
 * can be reused as-is — only the data shape below needs to match.
 */
export interface WizardTurnLike {
  id: string;
  role: "agent" | "owner";
  content: string;
}

export function ProgressRing({ percent }: { percent: number }) {
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative flex size-16 shrink-0 items-center justify-center">
      <svg className="size-16 -rotate-90" viewBox="0 0 60 60">
        <circle
          cx="30"
          cy="30"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          className="text-foreground/10"
        />
        <circle
          cx="30"
          cy="30"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-primary transition-all duration-500"
        />
      </svg>
      <span className="absolute text-sm font-semibold text-foreground">{percent}%</span>
    </div>
  );
}

export function WizardTurnBubble({ turn }: { turn: WizardTurnLike }) {
  const isOwner = turn.role === "owner";

  return (
    <div className={cn("flex gap-3", isOwner && "justify-end")}>
      {!isOwner && <div className="mt-2 size-2 shrink-0 rounded-full bg-primary/70" />}
      <div
        className={cn(
          "max-w-[85%] whitespace-pre-wrap rounded-3xl px-5 py-3 text-[14px] leading-6",
          isOwner ? "bg-black/20 text-foreground" : "text-foreground/78",
        )}
      >
        {turn.content}
      </div>
      {isOwner && <div className="mt-2 size-2 shrink-0 rounded-full bg-foreground/45" />}
    </div>
  );
}

export function WizardComposer({
  value,
  disabled,
  skippable,
  onChange,
  onSend,
  onSkip,
}: {
  value: string;
  disabled: boolean;
  skippable: boolean;
  onChange: (value: string) => void;
  onSend: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-end gap-2 rounded-2xl border border-border bg-black/20 px-3 py-2">
        <textarea
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              onSend();
            }
          }}
          rows={2}
          placeholder="Type your answer..."
          className="min-h-9 flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-foreground/35"
        />
        <button
          type="button"
          onClick={onSend}
          disabled={disabled || !value.trim()}
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-40"
          aria-label="Send answer"
        >
          <Send className="size-4" />
        </button>
      </div>
      {skippable && (
        <button
          type="button"
          onClick={onSkip}
          disabled={disabled}
          className="h-8 rounded-full border border-border px-3 text-xs font-medium text-foreground/60 hover:bg-foreground/8"
        >
          Skip for now
        </button>
      )}
    </div>
  );
}

export function WizardYesNoPrompt({
  disabled,
  onYes,
  onNo,
}: {
  disabled: boolean;
  onYes: () => void;
  onNo: () => void;
}) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={onYes}
        disabled={disabled}
        className="h-10 flex-1 rounded-full bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-50"
      >
        Yes, share it
      </button>
      <button
        type="button"
        onClick={onNo}
        disabled={disabled}
        className="h-10 flex-1 rounded-full border border-border text-sm font-medium text-foreground/70 hover:bg-foreground/8"
      >
        No, keep it general
      </button>
    </div>
  );
}

export function ThinkingDots() {
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map((item) => (
        <span
          key={item}
          className="size-2 rounded-full bg-foreground/55 jaabili-thinking-dot"
          style={{ animationDelay: `${item * 140}ms` }}
        />
      ))}
    </div>
  );
}
