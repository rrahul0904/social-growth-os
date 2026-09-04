export function StatusChip({ status }: { status: string }) {
  const normalized = status.replaceAll("_", " ");
  return <span className={`status-chip status-${status}`}>{normalized}</span>;
}
