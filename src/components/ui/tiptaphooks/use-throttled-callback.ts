import throttle from "lodash.throttle"
import { useEffect, useMemo, useRef } from "react"

import { useUnmount } from "./use-unmount"

interface ThrottleSettings {
  leading?: boolean | undefined
  trailing?: boolean | undefined
}

const defaultOptions: ThrottleSettings = {
  leading: false,
  trailing: true,
}

const EMPTY_DEPS: React.DependencyList = []

/**
 * A hook that returns a throttled callback function.
 *
 * @param fn The function to throttle
 * @param wait The time in ms to wait before calling the function
 * @param dependencies The dependencies to watch for changes
 * @param options The throttle options
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useThrottledCallback<T extends (...args: any[]) => any>(
  fn: T,
  wait = 250,
  dependencies: React.DependencyList = EMPTY_DEPS,
  options: ThrottleSettings = defaultOptions
): {
  (this: ThisParameterType<T>, ...args: Parameters<T>): ReturnType<T>
  cancel: () => void
  flush: () => void
} {
  const fnRef = useRef(fn)

  useEffect(() => {
    fnRef.current = fn
  }, [fn])

  const handler = useMemo(
    () =>
      throttle(
        ((...args: Parameters<T>) => fnRef.current(...args)) as T,
        wait,
        options
      ),
    // Caller supplies dynamic deps; react-hooks/use-memo requires a literal array.
    // eslint-disable-next-line react-hooks/use-memo, react-hooks/exhaustive-deps
    [wait, options, ...dependencies]
  )

  useUnmount(() => {
    handler.cancel()
  })

  return handler
}

export default useThrottledCallback
