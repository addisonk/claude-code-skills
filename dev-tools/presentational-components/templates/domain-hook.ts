import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"

type UseDomainArgs = {
  slug: string
}

// Domain-focused — name after the data, not the component.
// Returns the shape a presentational component expects:
// values + derived flags + named callbacks (never raw mutations).
export function useDomain({ slug }: UseDomainArgs) {
  const item = useQuery(api.domain.getBySlug, { slug })
  const updateMutation = useMutation(api.domain.update)
  const deleteMutation = useMutation(api.domain.delete)

  return {
    item,
    isLoading: item === undefined,
    canEdit: Boolean(item?.canEdit),
    onUpdate: (patch: Partial<NonNullable<typeof item>>) => updateMutation({ slug, patch }),
    onDelete: () => deleteMutation({ slug }),
  }
}
