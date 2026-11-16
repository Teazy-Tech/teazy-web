export function OrDivider() {
  return (
    <div
      className="text-muted-foreground flex items-center gap-3 text-xs uppercase"
      role="separator"
    >
      <span className="bg-border h-px flex-1" />
      or
      <span className="bg-border h-px flex-1" />
    </div>
  );
}
