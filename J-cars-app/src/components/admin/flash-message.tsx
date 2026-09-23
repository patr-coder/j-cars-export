export function FlashMessage({ error, saved }: { error?: string; saved?: string }) {
  if (error) {
    return (
      <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
        {error}
      </p>
    );
  }
  if (saved) {
    return (
      <p role="status" className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">
        {saved}
      </p>
    );
  }
  return null;
}
