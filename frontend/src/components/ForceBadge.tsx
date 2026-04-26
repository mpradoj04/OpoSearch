export function ForceBadge({ force }: { force: string }) {
  const isPN = force === "policia_nacional";
  return (
    <span style={{
      fontFamily: "var(--heading)",
      fontSize: "9px",
      fontWeight: 600,
      letterSpacing: "0.15em",
      textTransform: "uppercase",
      padding: "3px 8px",
      borderRadius: "2px",
      border: `1px solid ${isPN ? "rgba(0,90,180,0.5)" : "rgba(0,120,60,0.5)"}`,
      background: isPN ? "rgba(0,90,180,0.12)" : "rgba(0,120,60,0.12)",
      color: isPN ? "#6baee8" : "#5ec98a",
    }}>
      {isPN ? "Policía Nacional" : "Guardia Civil"}
    </span>
  );
}