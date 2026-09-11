import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

import Loading from "./loading";

vi.mock("@/components/ui/FullPageLoader", () => ({
    default: () => <div>FullPageLoader</div>,
}));

describe("Loading (pages)", () => {
    it("renderiza o FullPageLoader", () => {
        render(<Loading />);

        expect(screen.getByText("FullPageLoader")).toBeInTheDocument();
    });
});
