type FeedEmptyStateProps = {
  message?: string
}

export function FeedEmptyState({
  message = "No posts yet — be the first to share something.",
}: FeedEmptyStateProps) {
  return (
    <div className="rounded-md border border-dashed p-8 text-center text-muted-foreground">
      {message}
    </div>
  )
}
