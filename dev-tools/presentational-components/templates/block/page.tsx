import data from "./data.json"
import { FeedComposer } from "./components/feed-composer"
import { FeedEmptyState } from "./components/feed-empty-state"
import { FeedItem } from "./components/feed-item"

// Block entry. Only file in the block allowed to call hooks or read data.
// Swap data.json for a real hook (e.g. useFeed) when wiring into an app.
export default function FeedBlockPage() {
  const items = data.items

  if (items.length === 0) return <FeedEmptyState />

  return (
    <div className="flex flex-col gap-4">
      <FeedComposer onPost={(text) => console.log("post", text)} />
      {items.map((item) => (
        <FeedItem
          key={item.id}
          item={item}
          onLike={() => console.log("like", item.id)}
        />
      ))}
    </div>
  )
}
