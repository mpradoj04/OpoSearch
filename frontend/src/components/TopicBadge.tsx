export function TopicBadge({ number, force }: { number: number; force: string }) {
  return (
    <span style={{
      fontFamily: "var(--heading)",
      fontSize: "9px",
      fontWeight: 500,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      padding: "3px 8px",
      borderRadius: "2px",
      border: "1px solid var(--accent-border)",
      background: "var(--accent-bg)",
      color: "var(--gold)",
    }}>
      T{number} · {force === "policia_nacional" ? "PN" : "GC"}
    </span>
  );
}