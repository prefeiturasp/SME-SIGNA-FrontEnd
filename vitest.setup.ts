import "@testing-library/jest-dom/vitest";
import React from "react";
import { vi } from "vitest";
import type { ImageProps } from "next/image";

vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: ImageProps) => {
    const { src, alt, ...rest } = props;

    return React.createElement("img", {
      src: typeof src === "string" ? src : (src as { src: string })?.src,
      alt,
      ...rest,
    });
  },
}));
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), 
    removeListener: vi.fn(), 
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});