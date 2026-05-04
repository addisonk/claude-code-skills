import type { ReactNode } from "react"

type ComponentNameProps = {
  data: {
    id: string
    title: string
  }
  variant?: "default" | "compact"
  onSelect?: (id: string) => void
  children?: ReactNode
}

// Presentational: no data fetching, no auth, no routing. Props in, callbacks out.
export function ComponentName({
  data,
  variant = "default",
  onSelect,
  children,
}: ComponentNameProps) {
  return (
    <article data-variant={variant}>
      <h3>{data.title}</h3>
      {children}
      {onSelect ? <button onClick={() => onSelect(data.id)}>Select</button> : null}
    </article>
  )
}
