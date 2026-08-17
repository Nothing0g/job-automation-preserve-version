import { Button } from "@/components/ui/button";
import { gmailComposeGuidance } from "@/lib/gmailCompose";
import { Mail } from "lucide-react";
import React from "react";

type GmailComposeActionProps = {
  composeUrl: string | null;
  recipient?: string | null;
  onComposeOpen?: (hasRecipient: boolean) => void;
};

/** A manual-only Gmail handoff. It opens a prefilled draft but never invokes Gmail's Send action. */
export function GmailComposeAction({ composeUrl, recipient, onComposeOpen }: GmailComposeActionProps) {
  const hasRecipient = Boolean(recipient?.trim());

  if (!composeUrl) {
    return (
      <Button type="button" size="sm" variant="outline">
        <Mail className="mr-1.5 h-3.5 w-3.5" />Add email draft
      </Button>
    );
  }

  return (
    <div className="space-y-1.5">
      <Button asChild size="sm">
        <a
          href={composeUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => onComposeOpen?.(hasRecipient)}
        >
          <Mail className="mr-1.5 h-3.5 w-3.5" />Compose in Gmail
        </a>
      </Button>
      <p className="max-w-56 text-xs leading-4 text-muted-foreground">{gmailComposeGuidance(recipient)}</p>
    </div>
  );
}
