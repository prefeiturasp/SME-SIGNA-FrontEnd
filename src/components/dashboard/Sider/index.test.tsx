import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, vi } from "vitest";

import Sider, { MenuItemSMEProps, getItemMenu } from ".";

vi.mock("@/assets/icons/Bars", () => ({
  default: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="bars-icon" {...props} />,
}));

vi.mock("@/assets/icons/MenuBurger", () => ({
  default: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="menu-burger-icon" {...props} />,
}));

vi.mock("lucide-react", () => ({
  X: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="close-icon" {...props} />,
}));

vi.mock("antd", () => ({
  Button: ({
    icon,
    onClick,
    className,
  }: {
    icon?: React.ReactNode;
    onClick?: () => void;
    className?: string;
  }) => (
    <button data-testid="menu-toggle-button" className={className} onClick={onClick}>
      {icon}
    </button>
  ),
  Layout: {
    Sider: ({
      className,
      width,
      style,
      onCollapse,
      onMouseLeave,
      children,
    }: {
      className?: string;
      width?: number;
      style?: React.CSSProperties;
      onCollapse?: () => void;
      onMouseLeave?: () => void;
      children: React.ReactNode;
    }) => (
      <div
        data-testid="layout-sider"
        data-classname={className}
        data-width={String(width)}
        data-zindex={String(style?.zIndex ?? "")}
      >
        <button data-testid="trigger-on-collapse" onClick={onCollapse}>
          collapse
        </button>
        <button data-testid="trigger-on-mouse-leave" onClick={onMouseLeave}>
          mouse-leave
        </button>
        {children}
      </div>
    ),
  },
  Menu: ({
    openKeys,
    selectedKeys,
    onOpenChange,
    children,
  }: {
    openKeys?: string[];
    selectedKeys?: string[];
    onOpenChange?: (newOpenKeys: string[]) => void;
    children: React.ReactNode;
  }) => (
    <div
      data-testid="menu-root"
      data-openkeys={(openKeys ?? []).join(",")}
      data-selectedkeys={(selectedKeys ?? []).join(",")}
    >
      <button data-testid="trigger-open-change" onClick={() => onOpenChange?.(["root-2"])}>
        open-change
      </button>
      {children}
    </div>
  ),
}));

vi.mock("antd/es/menu/MenuItem", () => ({
  default: ({
    id,
    onClick,
    children,
  }: {
    id?: string;
    onClick?: () => void;
    children: React.ReactNode;
  }) => (
    <button data-testid={`menu-item-${id ?? "unknown"}`} onClick={onClick}>
      {children}
    </button>
  ),
}));

vi.mock("antd/es/menu/SubMenu", () => ({
  default: ({
    className,
    title,
    children,
  }: {
    className?: string;
    title: React.ReactNode;
    children: React.ReactNode;
  }) => (
    <div data-testid="submenu" data-classname={className}>
      <div>{title}</div>
      <div>{children}</div>
    </div>
  ),
}));

const menuItems: MenuItemSMEProps[] = [
  {
    key: "root-1",
    title: "Root 1",
    icon: <span>Icon Root 1</span>,
    children: [
      {
        key: "child-parent",
        title: "Child Parent",
        icon: <span>Icon Child Parent</span>,
        children: [
          {
            key: "grandchild",
            title: "Grandchild",
            url: "/grandchild",
          },
        ],
      },
      {
        key: "leaf",
        title: "Leaf",
        url: "/leaf",
      },
    ],
  },
  {
    key: "root-2",
    title: "Root 2",
    icon: <span>Icon Root 2</span>,
  },
];

describe("Sider", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("retorna objeto esperado no helper getItemMenu", () => {
    const child: MenuItemSMEProps = {
      key: "child",
      title: "Child",
      url: "/child",
    };

    expect(getItemMenu("/path", "Title", "main", "icon", [child])).toEqual({
      url: "/path",
      title: "Title",
      key: "main",
      icon: "icon",
      children: [child],
    });
  });

  it("não renderiza sider quando não há itens", () => {
    render(<Sider onClick={vi.fn()} />);

    expect(screen.queryByTestId("layout-sider")).not.toBeInTheDocument();
  });

  it("renderiza menu, usa selectedKeys de menuProps e executa callbacks de controle", () => {
    const onClick = vi.fn();
    const onClickMenuButtonToggle = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <Sider
        onClick={onClick}
        items={menuItems}
        styleSider={{ zIndex: 12 }}
        logoMenu={<span>Logo Menu</span>}
        menuProps={{ selectedKeys: ["grandchild"], onOpenChange }}
        onClickMenuButtonToggle={onClickMenuButtonToggle}
      />,
    );

    const layoutSider = screen.getByTestId("layout-sider");
    expect(layoutSider).toHaveAttribute("data-width", "105");
    expect(layoutSider).toHaveAttribute("data-zindex", "12");
    expect(screen.getByTestId("menu-root")).toHaveAttribute("data-selectedkeys", "grandchild");
    expect(screen.getAllByTestId("bars-icon").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByTestId("menu-item-leaf"));
    expect(onClick).toHaveBeenCalledWith(
      expect.objectContaining({
        key: "leaf",
        url: "/leaf",
      }),
    );

    fireEvent.click(screen.getByTestId("trigger-open-change"));
    expect(onOpenChange).toHaveBeenCalledWith(["root-2"]);
    expect(screen.getByTestId("menu-root")).toHaveAttribute("data-openkeys", "root-2");
    expect(screen.queryByTestId("menu-burger-icon")).not.toBeInTheDocument();
    expect(screen.getByTestId("close-icon")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("trigger-open-change"));
    expect(onOpenChange).toHaveBeenLastCalledWith(["root-2"]);

    fireEvent.click(screen.getByTestId("menu-toggle-button"));
    expect(onClickMenuButtonToggle).toHaveBeenLastCalledWith(true);

    fireEvent.click(screen.getByTestId("menu-toggle-button"));
    expect(onClickMenuButtonToggle).toHaveBeenLastCalledWith(false);

    fireEvent.click(screen.getByTestId("menu-item-leaf"));
    expect(onClick).toHaveBeenCalledWith(
      expect.objectContaining({
        key: "leaf",
        url: "/leaf",
      }),
    );

    fireEvent.click(screen.getByTestId("trigger-on-collapse"));
    expect(onClickMenuButtonToggle).toHaveBeenLastCalledWith(true);

    fireEvent.click(screen.getByTestId("trigger-on-mouse-leave"));
    expect(screen.getByTestId("menu-root")).toHaveAttribute("data-openkeys", "");
  });

  it("executa fluxos sem callbacks opcionais", () => {
    render(<Sider onClick={undefined as unknown as (item: MenuItemSMEProps) => void} items={menuItems} />);

    fireEvent.click(screen.getByTestId("menu-toggle-button"));
    fireEvent.click(screen.getByTestId("menu-item-leaf"));
    fireEvent.click(screen.getByTestId("trigger-open-change"));
    fireEvent.click(screen.getByTestId("trigger-on-collapse"));

    expect(screen.getByTestId("layout-sider")).toBeInTheDocument();
  });
});
