export default function Header() {
  return (
    <header className="border-b-[3px] border-sun bg-cream">
      <div className="mx-auto flex max-w-[520px] items-start justify-between px-4 pb-3 pt-5">
        <div>
          <h1 className="font-display text-[2rem] font-bold leading-none tracking-tight text-ink">
            The Stops
          </h1>
          <p className="mt-1.5 text-xs text-ink/65">
            A Clifton garden crawl — Hampton Park to the Bridge
          </p>
        </div>
        <Sun />
      </div>
    </header>
  )
}

function Sun() {
  const rays = Array.from({ length: 8 }, (_, i) => {
    const angle = (i * Math.PI) / 4
    return {
      x1: 22 + Math.cos(angle) * 12.5,
      y1: 22 + Math.sin(angle) * 12.5,
      x2: 22 + Math.cos(angle) * 19,
      y2: 22 + Math.sin(angle) * 19,
    }
  })
  return (
    <svg
      width="46"
      height="46"
      viewBox="0 0 44 44"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <circle cx="22" cy="22" r="7.5" stroke="var(--color-sun)" strokeWidth="2.6" />
      {rays.map((r, i) => (
        <line
          key={i}
          x1={r.x1}
          y1={r.y1}
          x2={r.x2}
          y2={r.y2}
          stroke="var(--color-sun)"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
      ))}
    </svg>
  )
}
