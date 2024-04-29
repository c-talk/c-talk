import { useCallback } from 'react'
import { cache, mutate } from 'swr/_internal'

const useGlobalMutation = () => {
  return useCallback((swrKey, ...args) => {
    const matcher = typeof swrKey === 'function' ? swrKey : undefined

    if (matcher) {
      // @ts-expect-error Pass all keys to mutate
      const keys = Array.from(cache.keys()).filter(matcher)
      keys.forEach((key) => mutate(key, ...args))
    } else {
      mutate(swrKey, ...args)
    }
  }, []) as typeof mutate
}

export default useGlobalMutation
