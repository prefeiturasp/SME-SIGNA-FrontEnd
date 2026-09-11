import React from "react";
import { render } from "@testing-library/react";
import { vi } from "vitest";
import StepperDesignacao from "./StepperDesignacao";

type StepsProps = {
  orientation: string;
  current: number;
  items: { title: string }[];
};

const stepsMock = vi.fn((_props: StepsProps) => <div data-testid="steps" />);

vi.mock("antd", () => ({
  Flex: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="flex" className={className}>
      {children}
    </div>
  ),
  Steps: (props: StepsProps) => stepsMock(props),
}));

describe("StepperDesignacao", () => {
  beforeEach(() => {
    stepsMock.mockClear();
  });

  it("renderiza o stepper vertical com itens esperados", () => {
    render(<StepperDesignacao />);

    expect(stepsMock).toHaveBeenCalledTimes(1);
    const calledWith = stepsMock.mock.calls[0][0];
    

    expect(calledWith.orientation).toBe("horizontal");
    expect(calledWith.current).toBe(1);
    expect(calledWith.items).toHaveLength(3);
    expect(calledWith.items.map((i: { title: string }) => i.title)).toEqual([
      "Servidor indicado",
      "Designação",
      "Portaria",
    ]);
  });
});

