import "@testing-library/jest-dom/vitest";
import React from "react";
import { vi } from "vitest";

vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    const { src, alt, ...rest } = props;

    return React.createElement("img", {
      src: typeof src === "string" ? src : src?.src,
      alt,
      ...rest,
    });
  },
}));
