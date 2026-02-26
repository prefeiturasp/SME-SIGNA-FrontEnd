import React from "react";
import { render } from "@testing-library/react";
import { vi } from "vitest";
import StepperDesignacao from "./StepperDesignacao";

const stepsMock = vi.fn((props: any) => <div data-testid="steps" {...props} />);

vi.mock("antd", () => ({
  Flex: ({ children, className }: any) => (
    <div data-testid="flex" className={className}>
      {children}
    </div>
  ),
  Steps: (props: any) => stepsMock(props),
}));

describe("StepperDesignacao", () => {
  beforeEach(() => {
    stepsMock.mockClear();
  });

  it("renderiza o stepper vertical com itens esperados", () => {
    render(<StepperDesignacao />);

    expect(stepsMock).toHaveBeenCalledTimes(1);
    const calledWith = stepsMock.mock.calls[0][0];

    expect(calledWith.orientation).toBe("vertical");
    expect(calledWith.current).toBe(1);
    expect(calledWith.items).toHaveLength(3);
    expect(calledWith.items.map((i: any) => i.title)).toEqual([
      "Validar dados",
      "Pesquisa de  unidade",
      "Próximos passos",
    ]);
  });
});

