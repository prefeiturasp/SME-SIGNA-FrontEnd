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

type MockMenuItem = {
  key: React.Key;
  className?: string;
  label: React.ReactNode;
  children?: MockMenuItem[];
};

const renderMockMenuItems = (
  items: MockMenuItem[],
  onClick?: (info: { key: string }) => void,
): React.ReactNode =>
  items.map((item) =>
    item.children ? (
      <div key={item.key} data-testid="submenu" data-classname={item.className}>
        <div>{item.label}</div>
        <div>{renderMockMenuItems(item.children, onClick)}</div>
      </div>
    ) : (
      <button
        key={item.key}
        data-testid={`menu-item-${String(item.key)}`}
        data-classname={item.className}
        onClick={() => onClick?.({ key: String(item.key) })}
      >
        {item.label}
      </button>
    ),
  );

vi.mock("antd", () => ({
  Button: ({
    icon,
    onClick,
    className,
    ...rest
  }: {
    icon?: React.ReactNode;
    onClick?: () => void;
    className?: string;
  } & Record<string, unknown>) => (
    <button data-testid="menu-toggle-button" className={className} onClick={onClick} {...rest}>
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
    items,
    openKeys,
    selectedKeys,
    onOpenChange,
    onClick,
  }: {
    items?: MockMenuItem[];
    openKeys?: string[];
    selectedKeys?: string[];
    onOpenChange?: (newOpenKeys: string[]) => void;
    onClick?: (info: { key: string }) => void;
  }) => (
    <div
      data-testid="menu-root"
      data-openkeys={(openKeys ?? []).join(",")}
      data-selectedkeys={(selectedKeys ?? []).join(",")}
    >
      <button data-testid="trigger-open-change" onClick={() => onOpenChange?.(["root-2"])}>
        open-change
      </button>
      {renderMockMenuItems(items ?? [], onClick)}
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

  it("usa o título reduzido quando o menu está retraído", () => {
    const itemsComTituloReduzido: MenuItemSMEProps[] = [
      {
        key: "apoio",
        title: "Apoio administrativo",
        collapsedTitle: "Apoio admin.",
        icon: <span>Icon Apoio</span>,
        children: [{ key: "apoio-filho", title: "Ir para apoio", url: "/apoio" }],
      },
    ];

    const { rerender } = render(<Sider onClick={vi.fn()} items={itemsComTituloReduzido} />);

    expect(screen.getByText("Apoio admin.")).toBeInTheDocument();
    expect(screen.queryByText("Apoio administrativo")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("menu-toggle-button"));
    rerender(<Sider onClick={vi.fn()} items={itemsComTituloReduzido} />);

    expect(screen.queryByText("Apoio admin.")).not.toBeInTheDocument();
    expect(screen.getByText("Apoio administrativo")).toBeInTheDocument();
  });

  it("aplica o título reduzido também em itens sem filhos", () => {
    const itemSemFilhos: MenuItemSMEProps[] = [
      {
        key: "apoio",
        title: "Apoio administrativo",
        collapsedTitle: "Apoio admin.",
        icon: <span>Icon Apoio</span>,
        url: "/apoio",
      },
    ];

    const { rerender } = render(<Sider onClick={vi.fn()} items={itemSemFilhos} />);

    expect(screen.getByText("Apoio admin.")).toBeInTheDocument();
    expect(screen.getByText("Icon Apoio")).toBeInTheDocument();
    expect(screen.queryByText("Apoio administrativo")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("menu-toggle-button"));
    rerender(<Sider onClick={vi.fn()} items={itemSemFilhos} />);

    expect(screen.queryByText("Apoio admin.")).not.toBeInTheDocument();
    expect(screen.getByText("Apoio administrativo")).toBeInTheDocument();
  });

  it("aplica a classe de item raiz nos itens sem filhos e de submenu nos filhos", () => {
    render(<Sider onClick={vi.fn()} items={menuItems} />);

    const itemRaso = screen.getByTestId("menu-item-root-2");
    expect(itemRaso).toHaveAttribute("data-classname", expect.stringContaining("is-root-leaf"));

    const itemInterno = screen.getByTestId("menu-item-leaf");
    expect(itemInterno).toHaveAttribute("data-classname", expect.stringContaining("is-submenu"));
  });

  it("exibe o ícone sanduíche nos itens raiz sem filhos quando retraído", () => {
    const itensFolha: MenuItemSMEProps[] = [
      { key: "protocolo", title: "Protocolo", icon: <span>Icon Protocolo</span>, url: "/pages/protocolo" },
    ];

    render(<Sider onClick={vi.fn()} items={itensFolha} />);

    const item = screen.getByTestId("menu-item-protocolo");
    expect(item.querySelector('[data-testid="bars-icon"]')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("menu-toggle-button"));

    expect(item.querySelector('[data-testid="bars-icon"]')).not.toBeInTheDocument();
  });

  it("mantém o título padrão em itens sem filhos e sem título reduzido", () => {
    render(<Sider onClick={vi.fn()} items={[{ key: "sem-filhos", title: "Item simples" }]} />);

    expect(screen.getByText("Item simples")).toBeInTheDocument();
  });

  it("expõe nome acessível no botão de alternância e o atualiza ao retrair", () => {
    render(<Sider onClick={vi.fn()} items={menuItems} />);

    const botao = screen.getByTestId("menu-toggle-button");
    expect(botao).toHaveAccessibleName("Expandir menu");
    expect(botao).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(botao);

    expect(botao).toHaveAccessibleName("Recolher menu");
    expect(botao).toHaveAttribute("aria-expanded", "true");
  });

  it("expande o sider ao abrir um submenu retraído", () => {
    render(<Sider onClick={vi.fn()} items={menuItems} />);

    const layoutSider = screen.getByTestId("layout-sider");
    expect(layoutSider).toHaveAttribute("data-width", "105");

    fireEvent.click(screen.getByTestId("trigger-open-change"));

    expect(layoutSider).toHaveAttribute("data-width", "232");
    expect(layoutSider).toHaveAttribute("data-classname", expect.stringContaining("is-expanded"));
    expect(screen.getByTestId("menu-root")).toHaveAttribute("data-openkeys", "root-2");
  });

  it("seleciona a folha clicada, limpa submenus abertos e recolhe o sider", () => {
    render(<Sider onClick={vi.fn()} items={menuItems} />);

    fireEvent.click(screen.getByTestId("trigger-open-change"));
    expect(screen.getByTestId("menu-root")).toHaveAttribute("data-openkeys", "root-2");

    fireEvent.click(screen.getByTestId("menu-item-leaf"));

    expect(screen.getByTestId("menu-root")).toHaveAttribute("data-selectedkeys", "leaf");
    expect(screen.getByTestId("menu-root")).toHaveAttribute("data-openkeys", "");
    expect(screen.getByTestId("layout-sider")).toHaveAttribute("data-width", "105");
  });

  it("mantém aceso apenas o último item clicado: abrir um submenu limpa a seleção anterior", () => {
    render(<Sider onClick={vi.fn()} items={menuItems} />);

    fireEvent.click(screen.getByTestId("menu-item-leaf"));

    const menu = screen.getByTestId("menu-root");
    expect(menu).toHaveAttribute("data-selectedkeys", "leaf");

    fireEvent.click(screen.getByTestId("trigger-open-change"));

    expect(menu).toHaveAttribute("data-openkeys", "root-2");
    expect(menu).toHaveAttribute("data-selectedkeys", "");
  });

  it("usa as chaves selecionadas internas quando menuProps.selectedKeys está vazio", () => {
    render(<Sider onClick={vi.fn()} items={menuItems} menuProps={{ selectedKeys: [] }} />);

    expect(screen.getByTestId("menu-root")).toHaveAttribute("data-selectedkeys", "");

    fireEvent.click(screen.getByTestId("menu-item-leaf"));

    expect(screen.getByTestId("menu-root")).toHaveAttribute("data-selectedkeys", "leaf");
  });

  it("distingue submenu raiz de submenu interno pelas classes aplicadas", () => {
    render(<Sider onClick={vi.fn()} items={menuItems} />);

    const [submenuRaiz, submenuInterno] = screen.getAllByTestId("submenu");

    expect(submenuRaiz).toHaveAttribute("data-classname", expect.stringContaining("is-root-submenu"));
    expect(submenuRaiz).toHaveAttribute("data-classname", expect.stringContaining("is-collapsed"));
    expect(submenuInterno).toHaveAttribute("data-classname", expect.stringContaining("is-submenu"));
  });

  it("fecha o submenu aberto ao retrair o sider pelo botão de alternância", () => {
    render(<Sider onClick={vi.fn()} items={menuItems} />);

    fireEvent.click(screen.getByTestId("trigger-open-change"));
    expect(screen.getByTestId("menu-root")).toHaveAttribute("data-openkeys", "root-2");

    fireEvent.click(screen.getByTestId("menu-toggle-button"));

    expect(screen.getByTestId("layout-sider")).toHaveAttribute("data-width", "105");
    expect(screen.getByTestId("menu-root")).toHaveAttribute("data-openkeys", "");
  });

  it("recolhe o sider e limpa submenus ao sair com o mouse", () => {    render(<Sider onClick={vi.fn()} items={menuItems} />);

    fireEvent.click(screen.getByTestId("trigger-open-change"));
    expect(screen.getByTestId("layout-sider")).toHaveAttribute("data-width", "232");

    fireEvent.click(screen.getByTestId("trigger-on-mouse-leave"));

    expect(screen.getByTestId("layout-sider")).toHaveAttribute("data-width", "105");
    expect(screen.getByTestId("menu-root")).toHaveAttribute("data-openkeys", "");
  });

  it("executa fluxos sem callbacks opcionais", () => {
    render(<Sider items={menuItems} />);

    fireEvent.click(screen.getByTestId("menu-toggle-button"));
    fireEvent.click(screen.getByTestId("menu-item-leaf"));
    fireEvent.click(screen.getByTestId("trigger-open-change"));
    fireEvent.click(screen.getByTestId("trigger-on-collapse"));

    expect(screen.getByTestId("layout-sider")).toBeInTheDocument();
  });
});
