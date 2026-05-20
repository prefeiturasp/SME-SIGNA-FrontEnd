"use client";
import { Button, Layout, Menu, MenuProps } from 'antd';
import React, { CSSProperties, useContext } from 'react';


import MenuItem from 'antd/es/menu/MenuItem';
import SubMenu from 'antd/es/menu/SubMenu';
import MenuContextProvider, { MenuContext } from './provider';
import Bars from '@/assets/icons/Bars';
import { X } from 'lucide-react';
import MenuBurger from '@/assets/icons/MenuBurger';

export type SiderMenuStylePros = {
  collapsed: boolean;
  $isSelected?: boolean;
  $hasRedBackground?: boolean;
  children?: React.ReactNode;
  className?: string;
};

export type SiderSubMenuStylePros = {
  collapsed: boolean;
  isSubMenu: boolean;
};

export type MenuItemSMEProps = {
  url?: string;
  title: React.ReactNode;
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
  styleSider?: CSSProperties | undefined;
  logoMenu?: React.ReactNode;
  onClick: (item: MenuItemSMEProps) => void;
  onClickMenuButtonToggle?: (collapsed: boolean) => void;
  routePathname?: string;
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
  const currentSelectedKeys = menuProps?.selectedKeys?.length ? menuProps?.selectedKeys : selectedKeys;

  const hasSelectedChild = (item: MenuItemSMEProps): boolean => {
    if (currentSelectedKeys?.includes(item?.key?.toString())) return true;
    if (!item?.children?.length) return false;
    return item.children.some((child) => hasSelectedChild(child));
  };

  const montarMenuItem = (item: MenuItemSMEProps) => {
    return (
      <MenuItem
        key={item.key}
        id={item?.key?.toString()}
        onClick={() => {
          setOpenKeys([]);
          setSelectedKeys([item?.key?.toString()]);

          if (!item?.children?.length && !collapsed) setCollapsed(!collapsed);

          if (onClick) onClick(item);
        }}
      >
        {item?.title}
      </MenuItem>
    );
  };

  const montarSubMenu = (menuItem: MenuItemSMEProps, isSubMenu = false) => (
    (() => {
      const itemKey = menuItem?.key?.toString();
      const itemIsSelected = hasSelectedChild(menuItem);
      const isOpen = !!itemKey && openKeys.includes(itemKey);
      const hasRedBackground = !isSubMenu && !itemIsSelected && !isOpen;

      return (
        <SubMenu
          key={menuItem?.key}
          className={`app-sider-submenu ${
            collapsed ? 'is-collapsed' : 'is-expanded'
          } ${isSubMenu ? 'is-submenu' : 'is-root-submenu'}`}
          title={
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
                {menuItem?.title}
              </div>
              {collapsed && (
                <Bars width={16} height={16} opacity={0.5} style={{ top: 12, right: 6, position: 'absolute' }} />
              )}
            </div>
          }
        >
          <>
            {menuItem?.children?.map((item: MenuItemSMEProps) => {
              if (item?.children?.length) return montarSubMenu(item, true);
              return montarMenuItem(item);
            })}
          </>
        </SubMenu>
      );
    })()
  );

  if (!items?.length) return <></>;

  return (
    <Layout.Sider
      className={`app-sider ${collapsed ? 'is-collapsed' : 'is-expanded'}`}
      width={collapsed ? 105 : 232}
      style={{ ...styleSider }}
      trigger={null}
      collapsible
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
          className={`!text-white hover:!text-white ${collapsed ? '' : '!rounded-[24px]'}`}
          icon={collapsed ? <MenuBurger width={18} height={12}  />
          : <X width={24} height={24} />}
          onClick={() => {
            const newValue = !collapsed;
            setCollapsed(newValue);

            if (newValue) setOpenKeys([]);

            if (onClickMenuButtonToggle) onClickMenuButtonToggle(newValue);
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
          openKeys={openKeys}
          selectedKeys={currentSelectedKeys}
          onOpenChange={(newOpenKeys: string[]) => {
            if (collapsed) {
              const newValue = !collapsed;
              setCollapsed(newValue);
            }

            setOpenKeys(newOpenKeys);

            if (menuProps?.onOpenChange) {
              menuProps.onOpenChange(newOpenKeys);
            }
          }}
        >
          <>{items?.map((menuItem: MenuItemSMEProps) => montarSubMenu(menuItem))}</>
        </Menu>
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
