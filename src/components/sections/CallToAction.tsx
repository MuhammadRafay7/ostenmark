import { ArrowRight } from "lucide-react";

import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/layout";
import type { ContactInfo } from "@/lib/types";

/**
 * Closing call to action.
 *
 * Sets expectations rather than urging — "tell us what you're building, we'll
 * reply with a view on scope" is a lower-commitment ask than "book a call", and
 * converts better from an audience that hasn't met you and is several time zones
 * away.
 */
export default function CallToAction({ contact }: { contact: ContactInfo }) {
  return (
    <section className="border-t border-line bg-surface">
      <Container className="py-20 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-display-md font-semibold text-fg">
            Have something you need built?
          </h2>

          <p className="mt-5 text-lg text-fg-muted">
            Send us the outline — the problem, roughly what you have in mind, and
            when you need it. We&rsquo;ll come back with an honest view on scope,
            cost and whether we&rsquo;re the right studio for it.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <ButtonLink href="/inquiry" size="lg">
              Start a project
              <ArrowRight size={16} aria-hidden />
            </ButtonLink>
            <ButtonLink
              href={`mailto:${contact.email}`}
              size="lg"
              variant="secondary"
            >
              {contact.email}
            </ButtonLink>
          </div>

          <p className="mt-6 text-sm text-fg-subtle">{contact.responseTime}</p>
        </div>
      </Container>
    </section>
  );
}
