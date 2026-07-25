import { ArrowRight } from "lucide-react";

import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/layout";

export const metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <Container width="content" className="py-28 text-center sm:py-40">
      <p className="label text-fg-subtle">Error 404</p>
      <h1 className="mt-5 font-display text-display-md font-semibold text-fg">
        We can&rsquo;t find that page.
      </h1>
      <p className="mx-auto mt-5 max-w-md text-lg text-fg-muted">
        The link may be out of date, or the page may have moved. The work index is
        usually the best place to pick things back up.
      </p>
      <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <ButtonLink href="/projects">
          Browse our work
          <ArrowRight size={15} aria-hidden />
        </ButtonLink>
        <ButtonLink href="/" variant="secondary">
          Back to home
        </ButtonLink>
      </div>
    </Container>
  );
}
