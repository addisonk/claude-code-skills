type FeedItemData = {
  id: string
  author: string
  content: string
  likes: number
  createdAt: string
}

type FeedItemProps = {
  item: FeedItemData
  onLike?: () => void
}

export function FeedItem({ item, onLike }: FeedItemProps) {
  return (
    <article className="rounded-md border p-4">
      <header className="text-sm text-muted-foreground">
        {item.author} · {new Date(item.createdAt).toLocaleDateString()}
      </header>
      <p className="mt-2">{item.content}</p>
      <button className="mt-2 text-sm" onClick={onLike}>
        Like · {item.likes}
      </button>
    </article>
  )
}
