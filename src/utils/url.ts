export const getResourceUrl = (resourceID?: string) =>
  resourceID
    ? new URL(
        `/resources/get/${resourceID}`,
        import.meta.env.VITE_HTTP_ENDPOINT
      ).toString()
    : undefined
