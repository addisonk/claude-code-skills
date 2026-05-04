import { useState } from "react"

type FeedComposerProps = {
  onPost: (text: string) => void
}

export function FeedComposer({ onPost }: FeedComposerProps) {
  // Local UI state is fine in a presentational component — that's presentation, not data.
  const [text, setText] = useState("")

  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault()
        if (!text.trim()) return
        onPost(text)
        setText("")
      }}
    >
      <input
        className="flex-1 rounded border px-3 py-2"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Share something..."
      />
      <button type="submit" className="rounded bg-primary px-3 py-2 text-primary-foreground">
        Post
      </button>
    </form>
  )
}
