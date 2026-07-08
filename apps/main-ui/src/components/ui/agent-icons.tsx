type IconProps = { className?: string };

/** Nova — Website Sales Agent. A supernova/starburst mark: a bright core with radiating rays. */
export function NovaAgentIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="3.2" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M12 2v3.4" />
        <path d="M12 18.6V22" />
        <path d="M2 12h3.4" />
        <path d="M18.6 12H22" />
        <path d="M4.8 4.8l2.4 2.4" />
        <path d="M16.8 16.8l2.4 2.4" />
        <path d="M19.2 4.8l-2.4 2.4" />
        <path d="M7.2 16.8l-2.4 2.4" />
      </g>
    </svg>
  );
}

/** WhatsApp Sales Agent — a chat bubble carrying message lines, for continued conversations. */
export function MessagingAgentIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4 5.5C4 4.67 4.67 4 5.5 4h13c.83 0 1.5.67 1.5 1.5v9c0 .83-.67 1.5-1.5 1.5H9l-4 3.5v-3.5H5.5C4.67 16 4 15.33 4 14.5v-9Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M8 9.5h8M8 12.5h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/** Lead Follow-Up Agent — a recurring loop with a target dot, for nurture cadence. */
export function FollowUpAgentIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M19 8a7 7 0 1 0 1.5 5.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M20 4v4.4h-4.4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="1.8" fill="currentColor" />
    </svg>
  );
}

/** Customer Support Agent — a shield with a checkmark, for safe, resolved support. */
export function SupportAgentIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 3.5 5 6v5.2c0 4.4 2.9 7.7 7 8.8 4.1-1.1 7-4.4 7-8.8V6l-7-2.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M9 12.2l2 2 4-4.2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Marketing Agent — a megaphone with a broadcast wave, for campaigns and content reach. */
export function MarketingAgentIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3 10v4a1 1 0 0 0 1 1h2l1.5 5h2l-1.2-5H10l8 4V6l-8 4H4a1 1 0 0 0-1 1Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M20 9.5a3 3 0 0 1 0 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/** Operations Summary Agent — a bar-chart pulse, for daily activity summaries. */
export function OpsSummaryAgentIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4 19V10M9 19V5M14 19v-7M19 19V8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path d="M4 19h16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}
