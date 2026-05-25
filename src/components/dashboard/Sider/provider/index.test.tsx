import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";

import MenuContextProvider, { MenuContext } from ".";

const Consumer = () => {
  const {
    collapsed,
    setCollapsed,
    openKeys,
    setOpenKeys,
    selectedKeys,
    setSelectedKeys,
  } = React.useContext(MenuContext);

  return (
    <div>
      <span data-testid="collapsed-value">{String(collapsed)}</span>
      <span data-testid="open-keys-value">{openKeys.join(",")}</span>
      <span data-testid="selected-keys-value">{selectedKeys.join(",")}</span>
      <button onClick={() => setCollapsed(false)}>expand</button>
      <button onClick={() => setOpenKeys(["menu-a", "menu-b"])}>set-open-keys</button>
      <button onClick={() => setSelectedKeys(["menu-selected"])}>set-selected-keys</button>
    </div>
  );
};

describe("MenuContextProvider", () => {
  it("expõe os valores padrão fora do provider", () => {
    render(<Consumer />);

    expect(screen.getByTestId("collapsed-value")).toHaveTextContent("true");
    expect(screen.getByTestId("open-keys-value")).toHaveTextContent("");
    expect(screen.getByTestId("selected-keys-value")).toHaveTextContent("");

    fireEvent.click(screen.getByRole("button", { name: "expand" }));
    fireEvent.click(screen.getByRole("button", { name: "set-open-keys" }));
    fireEvent.click(screen.getByRole("button", { name: "set-selected-keys" }));
  });

  it("permite atualizar collapsed, openKeys e selectedKeys", () => {
    render(
      <MenuContextProvider>
        <Consumer />
      </MenuContextProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "expand" }));
    fireEvent.click(screen.getByRole("button", { name: "set-open-keys" }));
    fireEvent.click(screen.getByRole("button", { name: "set-selected-keys" }));

    expect(screen.getByTestId("collapsed-value")).toHaveTextContent("false");
    expect(screen.getByTestId("open-keys-value")).toHaveTextContent("menu-a,menu-b");
    expect(screen.getByTestId("selected-keys-value")).toHaveTextContent("menu-selected");
  });
});
