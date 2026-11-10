"use client";
import { Button, Layout, Menu, MenuProps } from 'antd';
import React, { CSSProperties, useContext } from 'react';

import MenuContextProvider, { MenuContext } from './provider';
import Bars from '@/assets/icons/Bars';
import { X } from 'lucide-react';
import MenuBurger from '@/assets/icons/MenuBurger';

export type MenuItemSMEProps = {
  url?: string;
  title: React.ReactNode;
  /** Título exibido quando o menu está retraído. Usa `title` quando não informado. */
  collapsedTitle?: React.ReactNode;
  key: React.Key;
  icon?: React.ReactNode;
  children?: MenuItemSMEProps[];
};

export const getItemMenu = (
  url: string,
  title: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItemSMEProps[],
): MenuItemSMEProps => {
  return {
    title,
    url,
    key,
    icon,
    children,
  };
};

export type MenuSMEProps = {
  items?: MenuItemSMEProps[];
  menuProps?: MenuProps;
  styleSider?: CSSProperties;
  logoMenu?: React.ReactNode;
  onClick?: (item: MenuItemSMEProps) => void;
  onClickMenuButtonToggle?: (collapsed: boolean) => void;
};

type MenuItemEntry = NonNullable<MenuProps['items']>[number];

/** Larguras do Sider, espelhadas nos estilos de `.app-sider` em `globals.css`. */
const LARGURA_SIDER_RETRAIDO = 105;
const LARGURA_SIDER_EXPANDIDO = 232;

const findMenuItem = (list: MenuItemSMEProps[], key: React.Key): MenuItemSMEProps | undefined => {
  for (const item of list) {
    if (item.key?.toString() === key?.toString()) return item;
    if (item.children) {
      const found = findMenuItem(item.children, key);
      if (found) return found;
    }
  }
  return undefined;
};

/** Caminho (ancestrais + própria chave) até um item, para manter aberto só um ramo do menu. */
const findItemPath = (list: MenuItemSMEProps[], key: React.Key): string[] | null => {
  for (const item of list) {
    if (item.key?.toString() === key?.toString()) return [item.key.toString()];
    if (item.children?.length) {
      const path = findItemPath(item.children, key);
      if (path) return [item.key.toString(), ...path];
    }
  }
  return null;
};

const SiderChildrenProvider: React.FC<MenuSMEProps> = ({
  items,
  menuProps,
  styleSider = {},
  logoMenu,
  onClick,
  onClickMenuButtonToggle,
}) => {
  const { collapsed, setCollapsed, setOpenKeys, openKeys, selectedKeys, setSelectedKeys } =
    useContext(MenuContext);
  const selectedKeysFromProps = menuProps?.selectedKeys?.length ? menuProps.selectedKeys : selectedKeys;
  // Com um submenu aberto, o destaque branco pertence apenas a ele.
  const currentSelectedKeys = openKeys.length ? [] : selectedKeysFromProps;

  const hasSelectedChild = (item: MenuItemSMEProps): boolean => {
    if (currentSelectedKeys?.includes(item?.key?.toString())) return true;
    if (!item?.children?.length) return false;
    return item.children.some((child) => hasSelectedChild(child));
  };

  const isSubMenuHighlighted = (menuItem: MenuItemSMEProps, isSubMenu: boolean): boolean => {
    const itemKey = menuItem?.key?.toString();
    const itemIsSelected = hasSelectedChild(menuItem);
    const isOpen = !!itemKey && openKeys.includes(itemKey);
    return !isSubMenu && !itemIsSelected && !isOpen;
  };

  const obterTituloDoItem = (menuItem: MenuItemSMEProps): React.ReactNode =>
    collapsed ? menuItem?.collapsedTitle ?? menuItem?.title : menuItem?.title;

  const renderMenuLabel = (
    menuItem: MenuItemSMEProps,
    hasRedBackground: boolean,
    exibirIndicadorDeSubmenu = false,
  ) => (
    <div
      className={`app-sider-menu-group relative flex items-center ${
        collapsed ? 'flex-col' : 'flex-row'
      }`}
    >
      <div
        className={`app-sider-icon ${
          collapsed ? 'mb-2' : 'ml-[15px] mr-[10px]'
        } ${hasRedBackground ? 'text-white' : 'text-[#B22B2A]'}`}
      >
        {menuItem?.icon}
      </div>
      <div
        className={`app-sider-menu-title whitespace-normal font-bold leading-3 ${
          collapsed ? 'text-[10px]' : 'text-sm'
        } ${hasRedBackground ? 'text-white' : 'text-[#B22B2A]'}`}
      >
        {obterTituloDoItem(menuItem)}
      </div>
      {collapsed && exibirIndicadorDeSubmenu && (
        <Bars width={16} height={16} opacity={0.5} style={{ top: 0, right: 6, position: 'absolute' }} />
      )}
    </div>
  );

  const buildSubMenuEntry = (menuItem: MenuItemSMEProps, isSubMenu: boolean): MenuItemEntry => {
    const hasRedBackground = isSubMenuHighlighted(menuItem, isSubMenu);

    return {
      key: menuItem.key,
      className: `app-sider-submenu ${
        collapsed ? 'is-collapsed' : 'is-expanded'
      } ${isSubMenu ? 'is-submenu' : 'is-root-submenu'}`,
      label: renderMenuLabel(menuItem, hasRedBackground, true),
      children: montarMenuItems(menuItem.children ?? [], true),
    };
  };

  const buildLeafEntry = (menuItem: MenuItemSMEProps, isSubMenu: boolean): MenuItemEntry => ({
    key: menuItem.key,
    // Sobrescreve o recuo inline do antd com o valor definido pelo CSS do menu.
    style: { paddingLeft: 'var(--app-sider-item-indent, 0px)' },
    className: `app-sider-leaf ${collapsed ? 'is-collapsed' : 'is-expanded'} ${
      isSubMenu ? 'is-submenu' : 'is-root-leaf'
    }`,
    label: isSubMenu
      ? <div className='app-sider-menu-title'>{obterTituloDoItem(menuItem)}</div>
      : renderMenuLabel(menuItem, true, true),
  });

  const montarMenuItems = (list: MenuItemSMEProps[], isSubMenu = false): NonNullable<MenuProps['items']> =>
    list.map((menuItem) =>
      menuItem?.children?.length
        ? buildSubMenuEntry(menuItem, isSubMenu)
        : buildLeafEntry(menuItem, isSubMenu),
    );

  const handleMenuClick: NonNullable<MenuProps['onClick']> = (info) => {
    const item = items && findMenuItem(items, info.key);
    if (!item) return;

    setOpenKeys([]);
    setSelectedKeys([item.key.toString()]);

    // Ao escolher uma folha, o menu retraído evita que o conteúdo fique coberto.
    if (!item.children?.length && !collapsed) setCollapsed(true);

    onClick?.(item);
  };

  if (!items?.length) return null;

  return (
    <Layout.Sider
      className={`app-sider ${collapsed ? 'is-collapsed' : 'is-expanded'}`}
      width={collapsed ? LARGURA_SIDER_RETRAIDO : LARGURA_SIDER_EXPANDIDO}
      style={{ ...styleSider }}
      trigger={null}
      collapsible
      // O estado visual é controlado por classes/width acima; o antd não deve
      // aplicar o modo retraído dele (que fixaria a largura em 80px).
      collapsed={false}
      breakpoint='md'
      onCollapse={() => {
        setCollapsed(true);
        setOpenKeys([]);
        if (onClickMenuButtonToggle) onClickMenuButtonToggle(true);
      }}
      onMouseLeave={() => {
        setOpenKeys([]);
        setCollapsed(true);
      }}
    >
      <div
        className={`app-sider-menu-toggle flex h-[70px] items-center bg-[#B22B2A] px-4 py-[6px] ${
          collapsed ? 'justify-center' : 'justify-between'
        }`}
      >
        {collapsed ? null : logoMenu}
        <Button
          type='text'
          className={`text-white! hover:text-white! ${collapsed ? '' : 'rounded-[24px]!'}`}
          aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
          aria-expanded={!collapsed}
          icon={collapsed ? <MenuBurger width={18} height={12}  />
          : <X width={24} height={24} />}
          onClick={() => {
            // Ao retrair também fecha o ramo aberto: um submenu aberto dentro do
            // sider de 105px espremeria os filhos e criaria rolagem no menu.
            setOpenKeys([]);
            setCollapsed(!collapsed);

            if (onClickMenuButtonToggle) onClickMenuButtonToggle(!collapsed);
          }}
        />
      </div>

      <div
        className={`app-sider-menu secound-child-menu-and-sub-menus h-[calc(100vh-70px)] overflow-auto ${
          collapsed ? 'is-collapsed' : 'is-expanded'
        }`}
      >
        <Menu
          className='app-sider-ant-menu'
          mode='inline'
          {...menuProps}
          inlineIndent={0}
          items={montarMenuItems(items)}
          openKeys={openKeys}
          selectedKeys={currentSelectedKeys}
          onClick={handleMenuClick}
          onOpenChange={(newOpenKeys: string[]) => {
            if (collapsed) setCollapsed(false);

            // Mantém aberto apenas o ramo do último submenu clicado e limpa a
            // seleção anterior, para que só um item tenha fundo branco.
            const lastOpenKey = newOpenKeys[newOpenKeys.length - 1];
            const nextOpenKeys = (lastOpenKey && items && findItemPath(items, lastOpenKey)) || [];

            setOpenKeys(nextOpenKeys);
            if (nextOpenKeys.length) setSelectedKeys([]);

            if (menuProps?.onOpenChange) {
              menuProps.onOpenChange(nextOpenKeys);
            }
          }}
        />
      </div>
    </Layout.Sider>
  );
};

const Sider: React.FC<MenuSMEProps> = (props) => (
  <MenuContextProvider>
    <SiderChildrenProvider {...props} />
  </MenuContextProvider>
);

export default Sider;
