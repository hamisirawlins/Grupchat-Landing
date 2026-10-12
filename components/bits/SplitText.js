/**
 * SplitText — the line assembles a word at a time instead of arriving whole.
 *
 * Split by word, not by character: a headline of characters reads as an effect, a headline of
 * words reads as someone saying it. The whole string stays in the accessible tree as one label
 * so a screen reader is never handed loose letters.
 *
 * The rise is CSS (`.gc-word`, D-047), not JavaScript: the server sends the headline already
 * animating, so it shows on the first paint even on a slow phone, before any script loads.
 * Reduced motion is handled by the stylesheet. No client component needed.
 */
export default function SplitText({
  text,
  as: Tag = "span",
  className = "",
  delay = 0,
  stagger = 0.045,
  duration = 0.7,
  highlight,
  highlightClassName = "",
}) {
  const words = String(text).split(" ");
  return (
    <Tag className={className} aria-label={text}>
      <span aria-hidden="true">
        {words.map((w, i) => (
          <span key={i} className="inline-block overflow-hidden align-bottom">
            <span
              className={`gc-word ${highlight?.includes(w) ? highlightClassName : ""}`}
              style={{ "--gc-delay": `${Math.round((delay + i * stagger) * 1000)}ms`, animationDuration: `${Math.round(duration * 1000)}ms` }}
            >
              {w}
              {i < words.length - 1 ? " " : ""}
            </span>
          </span>
        ))}
      </span>
    </Tag>
  );
}
