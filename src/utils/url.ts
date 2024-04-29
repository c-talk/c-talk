export const getResourceUrl = (resourceID?: string) =>
  resourceID
    ? `http://100.98.108.126:1002/resources/get/${resourceID}`
    : undefined
