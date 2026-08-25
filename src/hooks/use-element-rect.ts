"use client"

import { useCallback, useEffect, useState } from "react"
import { useThrottledCallback } from "@/hooks/use-throttled-callback"

export type RectState = Omit<DOMRect, "toJSON">

export interface ElementRectOptions {
  /**
   * The element to track. Can be an Element, ref, or selector string.
   * Defaults to document.body if not provided.
   */
  element?: Element | React.RefObject<Element> | string | null
  /**
   * Whether to enable rect tracking
   */
  enabled?: boolean
  /**
   * Throttle delay in milliseconds for rect updates
   */
  throttleMs?: number
  /**
   * Whether to use ResizeObserver for more accurate tracking
   */
  useResizeObserver?: boolean
}

const initialRect: RectState = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
}

const THROTTLE_OPTIONS = {
  leading: true,
  trailing: true,
} as const

const isSSR = typeof window === "undefined"
const hasResizeObserver = !isSSR && typeof ResizeObserver !== "undefined"

const areRectsEqual = (a: RectState, b: RectState) =>
  a.x === b.x &&
  a.y === b.y &&
  a.width === b.width &&
  a.height === b.height &&
  a.top === b.top &&
  a.right === b.right &&
  a.bottom === b.bottom &&
  a.left === b.left

/**
 * Helper function to check if code is running on client side
 */
const isClientSide = (): boolean => !isSSR

/**
 * Custom hook that tracks an element's bounding rectangle and updates on resize, scroll, etc.
 *
 * @param options Configuration options for element rect tracking
 * @returns The current bounding rectangle of the element
 */
export function useElementRect({
  element,
  enabled = true,
  throttleMs = 100,
  useResizeObserver = true,
}: ElementRectOptions = {}): RectState {
  const [rect, setRect] = useState<RectState>(initialRect)

  const getTargetElement = useCallback((): Element | null => {
    if (!enabled || !isClientSide()) return null

    if (!element) {
      return document.body
    }

    if (typeof element === "string") {
      return document.querySelector(element)
    }

    if ("current" in element) {
      return element.current
    }

    return element
  }, [element, enabled])

  const updateRect = useThrottledCallback(
    () => {
      if (!enabled || !isClientSide()) return

      const targetElement = getTargetElement()
      if (!targetElement) {
        setRect((prev) => (areRectsEqual(prev, initialRect) ? prev : initialRect))
        return
      }

      const nextRect = targetElement.getBoundingClientRect()
      const nextState: RectState = {
        x: nextRect.x,
        y: nextRect.y,
        width: nextRect.width,
        height: nextRect.height,
        top: nextRect.top,
        right: nextRect.right,
        bottom: nextRect.bottom,
        left: nextRect.left,
      }

      setRect((prev) => (areRectsEqual(prev, nextState) ? prev : nextState))
    },
    throttleMs,
    [enabled, getTargetElement],
    THROTTLE_OPTIONS
  )

  useEffect(() => {
    if (!enabled || !isClientSide()) {
      return
    }

    const targetElement = getTargetElement()
    if (!targetElement) return

    updateRect()

    const cleanup: (() => void)[] = []

    if (useResizeObserver && hasResizeObserver) {
      const resizeObserver = new ResizeObserver(() => {
        window.requestAnimationFrame(updateRect)
      })
      resizeObserver.observe(targetElement)
      cleanup.push(() => resizeObserver.disconnect())
    }

    const handleUpdate = () => updateRect()

    window.addEventListener("scroll", handleUpdate, true)
    window.addEventListener("resize", handleUpdate, true)

    cleanup.push(() => {
      window.removeEventListener("scroll", handleUpdate, true)
      window.removeEventListener("resize", handleUpdate, true)
    })

    return () => {
      cleanup.forEach((fn) => fn())
    }
  }, [enabled, getTargetElement, updateRect, useResizeObserver])

  return rect
}

/**
 * Convenience hook for tracking document.body rect
 */
export function useBodyRect(
  options: Omit<ElementRectOptions, "element"> = {}
): RectState {
  return useElementRect({
    ...options,
    element: isClientSide() ? document.body : null,
  })
}

/**
 * Convenience hook for tracking a ref element's rect
 */
export function useRefRect<T extends Element>(
  ref: React.RefObject<T>,
  options: Omit<ElementRectOptions, "element"> = {}
): RectState {
  return useElementRect({ ...options, element: ref })
}
