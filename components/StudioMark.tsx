/**
 * The Lesson Studio mark: two stacked pages, drawn with the same hairline as
 * the rest of the design. It replaces the 📚 emoji, which arrived as a piece of
 * full-colour clip art in a system whose whole point is one blue and a line.
 */
export default function StudioMark({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4H11v14H6.5A2.5 2.5 0 0 0 4 20.5Z" />
      <path d="M20 6.5A2.5 2.5 0 0 0 17.5 4H13v14h4.5a2.5 2.5 0 0 1 2.5 2.5Z" />
      <path d="M12 4v14" />
    </svg>
  )
}
