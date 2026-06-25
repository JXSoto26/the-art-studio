import { Container } from "../components/ui/Container";
import { Button } from "../components/ui/Button";

export function NotFoundPage() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="font-display text-7xl text-clay/40">404</p>
      <h1 className="mt-4 font-display text-3xl text-ink">This page is a blank canvas</h1>
      <p className="mt-3 max-w-md text-ink-soft">
        We couldn't find what you were looking for — but there's plenty to make
        back at the studio.
      </p>
      <Button to="/" variant="primary" size="lg" className="mt-8">
        Back home
      </Button>
    </Container>
  );
}
